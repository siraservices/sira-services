// What a customer sees at /invoice/<token>. No sign-in: the long random token
// in the link is the only key, and only this invoice's own details come back.

import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireBooksMember } from "./booksAuth";
import { applyPayment } from "./booksInvoices";
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
    return { id: inv._id, number: inv.number, balance: inv.total - inv.amountPaid, email: c?.email ?? null };
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

export const markEmailed = internalMutation({
  args: { id: v.id("booksInvoices"), to: v.string(), actor: v.string() },
  handler: async (ctx, { id, to, actor }) => {
    await ctx.db.patch(id, { emailedTo: to, emailedAt: Date.now() });
    await ctx.db.insert("booksAudit", { at: Date.now(), actor, action: "invoice.email", detail: `${id} -> ${to}` });
  },
});

async function accountNamed(ctx: Parameters<typeof applyPayment>[0], name: string, type: "asset" | "expense", extra: { isCash?: boolean } = {}) {
  const found = await ctx.db.query("booksAccounts").withIndex("by_name", (q) => q.eq("name", name)).unique();
  if (found) return found._id;
  return await ctx.db.insert("booksAccounts", { name, type, active: true, createdAt: Date.now(), ...extra });
}

/**
 * Stripe webhook: a Checkout session was paid. The money lands in "Stripe
 * balance" (moved to checking by the payout, which the bank feed matches),
 * and Stripe's fee goes to "Stripe fees". Idempotent on the session id.
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
    const dup = await ctx.db.query("booksPayments").withIndex("by_external", (q) => q.eq("externalId", a.sessionId)).first();
    if (dup) return { recorded: false, reason: "already recorded" };
    const id = ctx.db.normalizeId("booksInvoices", a.invoiceId);
    if (!id) return { recorded: false, reason: "unknown invoice" };
    const inv = await ctx.db.get(id);
    if (!inv || !(inv.status === "sent" || inv.status === "partial")) return { recorded: false, reason: `invoice is ${inv?.status ?? "missing"}` };
    const amount = Math.min(a.amount, inv.total - inv.amountPaid);
    if (amount <= 0) return { recorded: false, reason: "nothing due" };
    const deposit = await accountNamed(ctx, "Stripe balance", "asset");
    const feeAccount = await accountNamed(ctx, "Stripe fees", "expense");
    const rule = await ctx.db.query("booksRules").collect();
    if (!rule.some((r) => r.contains === "stripe")) {
      // Payouts show up in checking as "STRIPE ... TRANSFER": post them against Stripe balance.
      await ctx.db.insert("booksRules", { contains: "stripe", accountId: deposit as Id<"booksAccounts">, active: true, createdAt: Date.now() });
    }
    await applyPayment(ctx, "stripe-webhook", {
      invoiceId: id,
      date: a.date,
      amount,
      fee: a.fee > 0 && a.fee < amount ? a.fee : undefined,
      feeAccountId: a.fee > 0 && a.fee < amount ? feeAccount : undefined,
      depositAccountId: deposit,
      method: "Stripe",
      externalId: a.sessionId,
    });
    return { recorded: true };
  },
});
