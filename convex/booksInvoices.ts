// Invoices. Drafts don't touch the ledger. Sending posts A/R and income;
// each payment posts cash (and any processor fee) against A/R. Voiding
// reverses whatever was posted. Nothing is ever edited after posting.

import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { insertEntry } from "./booksLedger";
import { isIsoDate, reversalLines } from "./booksLib";
import {
  invoicePostingLines,
  invoiceStatusAfterPayment,
  invoiceTotal,
  nextInvoiceNumber,
  paymentPostingLines,
  validateInvoiceLines,
} from "./booksOpsLib";

const lineArg = v.object({
  description: v.string(),
  quantity: v.number(),
  rate: v.number(),
  accountId: v.id("booksAccounts"),
});

/** The A/R account: QBO's name first, else any asset with "receivable"; created if missing. */
export async function receivableAccount(ctx: MutationCtx): Promise<Id<"booksAccounts">> {
  const all = await ctx.db.query("booksAccounts").withIndex("by_type", (q) => q.eq("type", "asset")).collect();
  const ar =
    all.find((a) => a.name === "Accounts Receivable (A/R)") ??
    all.find((a) => a.name.toLowerCase().includes("receivable"));
  if (ar) return ar._id;
  return await ctx.db.insert("booksAccounts", {
    name: "Accounts Receivable (A/R)",
    type: "asset",
    active: true,
    createdAt: Date.now(),
  });
}

async function reverseEntry(ctx: MutationCtx, actor: string, entryId: Id<"booksEntries">, date: string, memo: string) {
  const original = await ctx.db.get(entryId);
  if (!original || original.reversedById) return null;
  const lines = await ctx.db.query("booksLines").withIndex("by_entry", (q) => q.eq("entryId", entryId)).collect();
  const id = await insertEntry(ctx, actor, {
    date,
    memo,
    source: original.source,
    reversesId: entryId,
    lines: reversalLines(lines.map((l) => ({ accountId: l.accountId, debit: l.debit, credit: l.credit, memo: l.memo }))) as {
      accountId: Id<"booksAccounts">;
      debit: number;
      credit: number;
      memo?: string;
    }[],
  });
  await ctx.db.patch(entryId, { reversedById: id });
  return id;
}

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    await requireBooksMember(ctx);
    const all = await ctx.db.query("booksInvoices").collect();
    const contacts = new Map((await ctx.db.query("booksContacts").collect()).map((c) => [c._id as string, c.name]));
    return all
      .filter((i) => !status || i.status === status)
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.number.localeCompare(a.number))
      .map((i) => ({ ...i, contactName: contacts.get(i.contactId) ?? "?" }));
  },
});

export const get = query({
  args: { id: v.id("booksInvoices") },
  handler: async (ctx, { id }) => {
    await requireBooksMember(ctx);
    const inv = await ctx.db.get(id);
    if (!inv) return null;
    const contact = await ctx.db.get(inv.contactId);
    const payments = await ctx.db.query("booksPayments").withIndex("by_invoice", (q) => q.eq("invoiceId", id)).collect();
    return { ...inv, contact, payments };
  },
});

export const nextNumber = query({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx);
    const all = await ctx.db.query("booksInvoices").collect();
    // QBO's invoice numbers live in the imported entries' num field.
    const imported = (await ctx.db.query("booksEntries").collect()).filter((e) => e.txnType === "Invoice" && e.num);
    return nextInvoiceNumber([...all.map((i) => i.number), ...imported.map((e) => e.num!)]);
  },
});

function checkDates(issueDate: string, dueDate: string) {
  if (!isIsoDate(issueDate) || !isIsoDate(dueDate)) throw new ConvexError("Pick valid dates.");
  if (dueDate < issueDate) throw new ConvexError("The due date is before the invoice date.");
}

export const saveDraft = mutation({
  args: {
    id: v.optional(v.id("booksInvoices")),
    number: v.string(),
    contactId: v.id("booksContacts"),
    issueDate: v.string(),
    dueDate: v.string(),
    lines: v.array(lineArg),
    memo: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...args }) => {
    const me = await requireBooksMember(ctx);
    checkDates(args.issueDate, args.dueDate);
    const err = validateInvoiceLines(args.lines);
    if (err) throw new ConvexError(err);
    const number = args.number.trim();
    if (!number) throw new ConvexError("Invoice number is required.");
    const clash = await ctx.db.query("booksInvoices").withIndex("by_number", (q) => q.eq("number", number)).first();
    if (clash && clash._id !== id) throw new ConvexError(`Invoice #${number} already exists.`);
    const total = invoiceTotal(args.lines);
    const now = Date.now();
    if (id) {
      const inv = await ctx.db.get(id);
      if (!inv) throw new ConvexError("Invoice not found.");
      if (inv.status !== "draft") throw new ConvexError("Only drafts can be edited. Void it and create a new one.");
      await ctx.db.patch(id, { ...args, number, total, updatedAt: now });
      await audit(ctx, me.email, "invoice.update", number);
      return id;
    }
    const newId = await ctx.db.insert("booksInvoices", {
      ...args,
      number,
      total,
      amountPaid: 0,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    await audit(ctx, me.email, "invoice.create", number);
    return newId;
  },
});

export const deleteDraft = mutation({
  args: { id: v.id("booksInvoices") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    const inv = await ctx.db.get(id);
    if (!inv) return;
    if (inv.status !== "draft") throw new ConvexError("Only drafts can be deleted. Void a sent invoice instead.");
    await ctx.db.delete(id);
    await audit(ctx, me.email, "invoice.deleteDraft", inv.number);
  },
});

/** Mark as sent: posts the invoice to the ledger (A/R ↑, income ↑). */
export const send = mutation({
  args: { id: v.id("booksInvoices") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    const inv = await ctx.db.get(id);
    if (!inv) throw new ConvexError("Invoice not found.");
    if (inv.status !== "draft") throw new ConvexError("This invoice was already sent.");
    const contact = await ctx.db.get(inv.contactId);
    const ar = await receivableAccount(ctx);
    const entryId = await insertEntry(ctx, me.email, {
      date: inv.issueDate,
      memo: `Invoice #${inv.number} – ${contact?.name ?? ""}`.trim(),
      source: "invoice",
      sourceRef: `invoice:${id}`,
      txnType: "Invoice",
      num: inv.number,
      lines: invoicePostingLines(ar, inv.lines).map((l) => ({ ...l, contactId: inv.contactId })),
    });
    await ctx.db.patch(id, { status: "sent", entryId, updatedAt: Date.now() });
    await audit(ctx, me.email, "invoice.send", inv.number);
    return entryId;
  },
});

export const recordPayment = mutation({
  args: {
    invoiceId: v.id("booksInvoices"),
    date: v.string(),
    amount: v.number(), // cents the customer paid
    fee: v.optional(v.number()), // cents the processor kept
    feeAccountId: v.optional(v.id("booksAccounts")),
    depositAccountId: v.id("booksAccounts"),
    method: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const me = await requireBooksMember(ctx);
    if (!isIsoDate(a.date)) throw new ConvexError("Pick a valid date.");
    if (!Number.isInteger(a.amount) || a.amount <= 0) throw new ConvexError("Amount must be above zero.");
    const inv = await ctx.db.get(a.invoiceId);
    if (!inv) throw new ConvexError("Invoice not found.");
    if (inv.status === "draft") throw new ConvexError("Send the invoice before recording a payment.");
    if (inv.status === "void") throw new ConvexError("This invoice is void.");
    const balance = inv.total - inv.amountPaid;
    if (a.amount > balance) throw new ConvexError("That's more than the balance due.");
    const fee = a.fee ?? 0;
    if (!Number.isInteger(fee) || fee < 0 || fee >= a.amount) throw new ConvexError("The fee doesn't look right.");
    if (fee > 0 && !a.feeAccountId) throw new ConvexError("Pick an account for the fee.");
    const ar = await receivableAccount(ctx);
    const entryId = await insertEntry(ctx, me.email, {
      date: a.date,
      memo: `Payment for invoice #${inv.number}`,
      source: "payment",
      txnType: "Payment",
      num: inv.number,
      lines: paymentPostingLines(
        ar,
        a.depositAccountId,
        a.amount,
        fee > 0 && a.feeAccountId ? { accountId: a.feeAccountId, amount: fee } : undefined,
      ).map((l) => ({ ...l, contactId: inv.contactId })),
    });
    await ctx.db.insert("booksPayments", {
      invoiceId: a.invoiceId,
      date: a.date,
      amount: a.amount,
      fee: fee || undefined,
      depositAccountId: a.depositAccountId,
      method: a.method,
      entryId,
      createdAt: Date.now(),
    });
    const paid = inv.amountPaid + a.amount;
    await ctx.db.patch(a.invoiceId, {
      amountPaid: paid,
      status: invoiceStatusAfterPayment(inv.total, paid),
      updatedAt: Date.now(),
    });
    await audit(ctx, me.email, "invoice.payment", `${inv.number} ${a.amount}`);
    return entryId;
  },
});

/** Void: reverse the invoice and any payments, dated today. */
export const voidInvoice = mutation({
  args: { id: v.id("booksInvoices"), date: v.string() },
  handler: async (ctx, { id, date }) => {
    const me = await requireBooksMember(ctx);
    if (!isIsoDate(date)) throw new ConvexError("Pick a valid date.");
    const inv = await ctx.db.get(id);
    if (!inv) throw new ConvexError("Invoice not found.");
    if (inv.status === "void") return;
    if (inv.status === "draft") throw new ConvexError("Delete the draft instead.");
    const payments = await ctx.db.query("booksPayments").withIndex("by_invoice", (q) => q.eq("invoiceId", id)).collect();
    for (const p of payments) {
      if (p.reversedEntryId) continue;
      const rid = await reverseEntry(ctx, me.email, p.entryId, date, `Void payment for invoice #${inv.number}`);
      if (rid) await ctx.db.patch(p._id, { reversedEntryId: rid });
    }
    if (inv.entryId) await reverseEntry(ctx, me.email, inv.entryId, date, `Void invoice #${inv.number}`);
    await ctx.db.patch(id, { status: "void", updatedAt: Date.now() });
    await audit(ctx, me.email, "invoice.void", inv.number);
  },
});

/** Open A/R grouped by age, for the dashboard and the invoices page. */
export const agingSummary = query({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    await requireBooksMember(ctx);
    const open = (await ctx.db.query("booksInvoices").collect()).filter((i) => i.status === "sent" || i.status === "partial");
    const buckets = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90plus: 0 };
    const t = Date.parse(`${today}T00:00:00Z`);
    for (const i of open) {
      const due = i.total - i.amountPaid;
      const late = Math.floor((t - Date.parse(`${i.dueDate}T00:00:00Z`)) / 86400000);
      if (late <= 0) buckets.current += due;
      else if (late <= 30) buckets.d1_30 += due;
      else if (late <= 60) buckets.d31_60 += due;
      else if (late <= 90) buckets.d61_90 += due;
      else buckets.d90plus += due;
    }
    return { ...buckets, total: Object.values(buckets).reduce((s, x) => s + x, 0), count: open.length };
  },
});
