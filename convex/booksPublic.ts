// What a customer sees at /invoice/<token>. No sign-in: the long random token
// in the link is the only key, and only this invoice's own details come back.

import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireBooksMember } from "./booksAuth";
import { applyPayment, newToken } from "./booksInvoices";
import { insertEntry } from "./booksLedger";
import { lineAmount } from "./booksOpsLib";

export const BUSINESS = { name: "Aira Development LLC", brand: "SIRA", site: "sira.services" };

async function byToken(ctx: QueryCtx, token: string) {
  if (!/^[0-9a-f]{48}$/.test(token)) return null;
  return await ctx.db.query("booksInvoices").withIndex("by_token", (q) => q.eq("publicToken", token)).unique();
}

export const invoice = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const inv = await byToken(ctx, token);
    if (!inv || inv.status === "draft") return null;
    const c = await ctx.db.get(inv.contactId);
    return {
      business: BUSINESS,
      number: inv.number,
      issueDate: inv.issueDate,
      dueDate: inv.dueDate,
      status: inv.status,
      memo: inv.memo ?? null,
      lines: inv.lines.map((l) => ({ description: l.description, quantity: l.quantity, rate: l.rate, amount: lineAmount(l.quantity, l.rate) })),
      total: inv.total,
      amountPaid: inv.amountPaid,
      balance: inv.status === "void" ? 0 : inv.total - inv.amountPaid,
      customer: { name: c?.name ?? "", company: c?.company ?? null, address: c?.address ?? null },
      payOnline: !!process.env.STRIPE_SECRET_KEY && (inv.status === "sent" || inv.status === "partial"),
    };
  },
});

/** For the Stripe checkout action. */
export const forCheckout = internalQuery({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const inv = await byToken(ctx, token);
    if (!inv || !(inv.status === "sent" || inv.status === "partial")) return null;
    const c = await ctx.db.get(inv.contactId);
    return { id: inv._id, number: inv.number, balance: inv.total - inv.amountPaid, email: c?.email ?? null, sessionId: inv.stripeSessionId ?? null };
  },
});

/** For the email action: checks the caller is a Books member. */
export const forEmail = internalQuery({
  args: { id: v.id("booksInvoices") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    const inv = await ctx.db.get(id);
    if (!inv) throw new ConvexError("Invoice not found.");
    const c = await ctx.db.get(inv.contactId);
    return { actor: me.email, inv, contact: c };
  },
});

/** Same as forEmail, for the scheduled job (no signed-in user). */
export const forEmailAuto = internalQuery({
  args: { id: v.id("booksInvoices") },
  handler: async (ctx, { id }) => {
    const inv = await ctx.db.get(id);
    if (!inv) throw new ConvexError("Invoice not found.");
    const c = await ctx.db.get(inv.contactId);
    return { actor: "recurring", inv, contact: c };
  },
});

export const ensureToken = internalMutation({
  args: { id: v.id("booksInvoices") },
  handler: async (ctx, { id }) => {
    const inv = await ctx.db.get(id);
    if (!inv) throw new ConvexError("Invoice not found.");
    if (inv.publicToken) return inv.publicToken;
    const token = newToken();
    await ctx.db.patch(id, { publicToken: token });
    return token;
  },
});

export const markEmailed = internalMutation({
  args: { id: v.id("booksInvoices"), to: v.string(), actor: v.string() },
  handler: async (ctx, { id, to, actor }) => {
    await ctx.db.patch(id, { emailedTo: to, emailedAt: Date.now() });
    await ctx.db.insert("booksAudit", { at: Date.now(), actor, action: "invoice.email", detail: `${id} -> ${to}` });
  },
});

async function accountNamed(ctx: Parameters<typeof applyPayment>[0], name: string, type: "asset" | "expense" | "liability", extra: { isCash?: boolean } = {}) {
  const found = await ctx.db.query("booksAccounts").withIndex("by_name", (q) => q.eq("name", name)).unique();
  if (found) return found._id;
  return await ctx.db.insert("booksAccounts", { name, type, active: true, createdAt: Date.now(), ...extra });
}

export const UNAPPLIED = "Customer credits (unapplied)";

/**
 * Stripe webhook: a Checkout session was paid. Money Stripe collected is
 * always recorded in full. The part that pays the invoice reduces A/R; any
 * part that can't (invoice already paid or void, or paid twice) goes to the
 * "Customer credits (unapplied)" liability so it shows up to refund or apply.
 * Cash lands in "Stripe balance" (the payout to checking is matched by the
 * bank feed) and Stripe's fee goes to "Stripe fees". Idempotent per session.
 */
export const recordStripePayment = internalMutation({
  args: {
    invoiceId: v.string(),
    sessionId: v.string(),
    amount: v.number(),
    fee: v.number(),
    date: v.string(),
  },
  handler: async (ctx, a) => {
    const dup =
      (await ctx.db.query("booksPayments").withIndex("by_external", (q) => q.eq("externalId", a.sessionId)).first()) ??
      (await ctx.db.query("booksEntries").withIndex("by_sourceRef", (q) => q.eq("sourceRef", `stripe-unapplied:${a.sessionId}`)).first());
    if (dup) return { recorded: false, applied: 0, unapplied: 0, reason: "already recorded" };
    if (!Number.isInteger(a.amount) || a.amount <= 0) return { recorded: false, applied: 0, unapplied: 0, reason: "no amount" };
    const fee = Number.isInteger(a.fee) && a.fee > 0 && a.fee < a.amount ? a.fee : 0;
    const id = ctx.db.normalizeId("booksInvoices", a.invoiceId);
    const inv = id ? await ctx.db.get(id) : null;
    const open = !!inv && (inv.status === "sent" || inv.status === "partial");
    const applied = open ? Math.min(a.amount, inv!.total - inv!.amountPaid) : 0;
    const unapplied = a.amount - applied;
    // Put Stripe's fee on the unapplied part if it's big enough, else on the invoice payment.
    const feeOnUnapplied = unapplied > fee ? fee : 0;
    const feeOnApplied = fee - feeOnUnapplied;

    const deposit = await accountNamed(ctx, "Stripe balance", "asset");
    const feeAccount = await accountNamed(ctx, "Stripe fees", "expense");
    const rules = await ctx.db.query("booksRules").collect();
    if (!rules.some((r) => r.contains === "stripe")) {
      // Payouts show up in checking as "STRIPE ... TRANSFER": post them against Stripe balance.
      await ctx.db.insert("booksRules", { contains: "stripe", accountId: deposit, active: true, createdAt: Date.now() });
    }
    if (applied > 0) {
      const feeHere = feeOnApplied < applied ? feeOnApplied : 0;
      await applyPayment(ctx, "stripe-webhook", {
        invoiceId: id!,
        date: a.date,
        amount: applied,
        fee: feeHere || undefined,
        feeAccountId: feeHere ? feeAccount : undefined,
        depositAccountId: deposit,
        method: "Stripe",
        externalId: a.sessionId,
      });
    }
    if (unapplied > 0) {
      const credits = await accountNamed(ctx, UNAPPLIED, "liability");
      const lines: { accountId: Id<"booksAccounts">; debit: number; credit: number; contactId?: Id<"booksContacts"> }[] = [
        { accountId: deposit, debit: unapplied - feeOnUnapplied, credit: 0 },
        { accountId: credits, debit: 0, credit: unapplied, contactId: inv?.contactId },
      ];
      if (feeOnUnapplied) lines.push({ accountId: feeAccount, debit: feeOnUnapplied, credit: 0 });
      await insertEntry(ctx, "stripe-webhook", {
        date: a.date,
        memo: `Stripe payment not applied (invoice ${inv ? `#${inv.number} is ${inv.status}` : "not found"}). Refund it or apply it to another invoice.`,
        source: "manual",
        sourceRef: `stripe-unapplied:${a.sessionId}`,
        txnType: "Unapplied payment",
        num: inv?.number,
        lines,
      });
      await ctx.db.insert("booksAudit", {
        at: Date.now(),
        actor: "stripe-webhook",
        action: "stripe.unapplied",
        detail: `${a.sessionId} ${unapplied} on ${inv ? `#${inv.number}` : a.invoiceId}`,
      });
    }
    return { recorded: true, applied, unapplied };
  },
});

/** Remember the customer's open Checkout session so a second click reuses it. */
export const setCheckoutSession = internalMutation({
  args: { id: v.id("booksInvoices"), sessionId: v.optional(v.string()) },
  handler: async (ctx, { id, sessionId }) => {
    await ctx.db.patch(id, { stripeSessionId: sessionId });
  },
});
