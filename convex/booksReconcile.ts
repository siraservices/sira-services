// Reconcile a bank or card account to its statement: check off the ledger
// lines that appear on the statement until the cleared balance equals the
// statement's ending balance, then finish. Balances use the account's normal
// direction (checking = money you have, card = money owed).

import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { isIsoDate, normalBalance, type AccountType } from "./booksLib";

async function cashAccount(ctx: QueryCtx | MutationCtx, id: Id<"booksAccounts">) {
  const a = await ctx.db.get(id);
  if (!a || !(a.type === "asset" || a.type === "liability")) throw new ConvexError("Pick a bank or card account.");
  return a;
}

async function recsFor(ctx: QueryCtx | MutationCtx, accountId: Id<"booksAccounts">) {
  return await ctx.db
    .query("booksRecs")
    .withIndex("by_account_date", (q) => q.eq("accountId", accountId))
    .order("desc")
    .collect();
}

/** Cleared total of one reconciliation's lines, in the account's normal direction. */
async function clearedSum(ctx: QueryCtx | MutationCtx, rec: Doc<"booksRecs">, type: AccountType) {
  const lines = await ctx.db.query("booksLines").withIndex("by_rec", (q) => q.eq("recId", rec._id)).collect();
  return lines.reduce((s, l) => s + normalBalance(type, l.debit, l.credit), 0);
}

export const list = query({
  args: { accountId: v.id("booksAccounts") },
  handler: async (ctx, { accountId }) => {
    await requireBooksMember(ctx);
    const acct = await cashAccount(ctx, accountId);
    const recs = await recsFor(ctx, accountId);
    return await Promise.all(
      recs.map(async (r) => {
        const cleared = r.beginningBalance + (await clearedSum(ctx, r, acct.type));
        return { ...r, cleared, difference: r.statementBalance - cleared };
      }),
    );
  },
});

/** The open reconciliation for an account, with every line it can check off. */
export const current = query({
  args: { accountId: v.id("booksAccounts") },
  handler: async (ctx, { accountId }) => {
    await requireBooksMember(ctx);
    const acct = await cashAccount(ctx, accountId);
    const rec = (await recsFor(ctx, accountId)).find((r) => r.status === "open");
    if (!rec) return null;
    const lines = await ctx.db
      .query("booksLines")
      .withIndex("by_account_date", (q) => q.eq("accountId", accountId).lte("date", rec.statementDate))
      .collect();
    const rows = [];
    let cleared = rec.beginningBalance;
    for (const l of lines) {
      if (l.recId && l.recId !== rec._id) continue; // cleared on an earlier statement
      const amount = normalBalance(acct.type, l.debit, l.credit);
      if (amount === 0) continue;
      const e = await ctx.db.get(l.entryId);
      const isCleared = l.recId === rec._id;
      if (isCleared) cleared += amount;
      rows.push({ lineId: l._id, date: l.date, memo: e?.memo ?? l.memo ?? "", txnType: e?.txnType, amount, cleared: isCleared });
    }
    rows.sort((a, b) => a.date.localeCompare(b.date));
    return { rec, accountType: acct.type, rows, cleared, difference: rec.statementBalance - cleared };
  },
});

export const start = mutation({
  args: { accountId: v.id("booksAccounts"), statementDate: v.string(), statementBalance: v.number() },
  handler: async (ctx, { accountId, statementDate, statementBalance }) => {
    const me = await requireBooksMember(ctx);
    await cashAccount(ctx, accountId);
    if (!isIsoDate(statementDate)) throw new ConvexError("Enter the statement's ending date.");
    if (!Number.isInteger(statementBalance)) throw new ConvexError("Balance must be in cents.");
    const recs = await recsFor(ctx, accountId);
    if (recs.some((r) => r.status === "open")) throw new ConvexError("Finish or cancel the open reconciliation first.");
    const last = recs.find((r) => r.status === "done");
    if (last && statementDate <= last.statementDate) {
      throw new ConvexError(`The last statement reconciled ended ${last.statementDate}. Pick a later date.`);
    }
    const id = await ctx.db.insert("booksRecs", {
      accountId,
      statementDate,
      statementBalance,
      beginningBalance: last?.statementBalance ?? 0,
      status: "open",
      createdAt: Date.now(),
    });
    await audit(ctx, me.email, "rec.start", `${accountId} ${statementDate} ${statementBalance}`);
    return id;
  },
});

/** Check or uncheck lines on the open reconciliation. */
export const setCleared = mutation({
  args: { recId: v.id("booksRecs"), lineIds: v.array(v.id("booksLines")), cleared: v.boolean() },
  handler: async (ctx, { recId, lineIds, cleared }) => {
    await requireBooksMember(ctx);
    const rec = await ctx.db.get(recId);
    if (!rec || rec.status !== "open") throw new ConvexError("This reconciliation isn't open.");
    if (lineIds.length > 1000) throw new ConvexError("Too many lines at once.");
    for (const id of lineIds) {
      const l = await ctx.db.get(id);
      if (!l || l.accountId !== rec.accountId) throw new ConvexError("That line isn't in this account.");
      if (l.date > rec.statementDate) throw new ConvexError("That line is after the statement date.");
      if (l.recId && l.recId !== recId) throw new ConvexError("That line was cleared on another statement.");
      await ctx.db.patch(id, { recId: cleared ? recId : undefined });
    }
  },
});

export const finish = mutation({
  args: { recId: v.id("booksRecs") },
  handler: async (ctx, { recId }) => {
    const me = await requireBooksMember(ctx);
    const rec = await ctx.db.get(recId);
    if (!rec || rec.status !== "open") throw new ConvexError("This reconciliation isn't open.");
    const acct = await cashAccount(ctx, rec.accountId);
    const diff = rec.statementBalance - rec.beginningBalance - (await clearedSum(ctx, rec, acct.type));
    if (diff !== 0) throw new ConvexError("The difference has to be $0.00 before you finish.");
    await ctx.db.patch(recId, { status: "done", completedAt: Date.now() });
    await audit(ctx, me.email, "rec.finish", `${rec.accountId} ${rec.statementDate}`);
  },
});

/** Throw away an open reconciliation (its checkmarks are cleared). */
export const cancel = mutation({
  args: { recId: v.id("booksRecs") },
  handler: async (ctx, { recId }) => {
    const me = await requireBooksMember(ctx);
    const rec = await ctx.db.get(recId);
    if (!rec || rec.status !== "open") throw new ConvexError("Only an open reconciliation can be cancelled.");
    const lines = await ctx.db.query("booksLines").withIndex("by_rec", (q) => q.eq("recId", recId)).collect();
    for (const l of lines) await ctx.db.patch(l._id, { recId: undefined });
    await ctx.db.delete(recId);
    await audit(ctx, me.email, "rec.cancel", `${rec.accountId} ${rec.statementDate}`);
  },
});

/** Reopen the most recent finished statement to fix it. */
export const reopen = mutation({
  args: { recId: v.id("booksRecs") },
  handler: async (ctx, { recId }) => {
    const me = await requireBooksMember(ctx);
    const rec = await ctx.db.get(recId);
    if (!rec || rec.status !== "done") throw new ConvexError("That statement isn't finished.");
    const recs = await recsFor(ctx, rec.accountId);
    if (recs.some((r) => r.status === "open")) throw new ConvexError("Finish or cancel the open reconciliation first.");
    if (recs[0]?._id !== recId) throw new ConvexError("Only the latest statement can be reopened.");
    await ctx.db.patch(recId, { status: "open", completedAt: undefined });
    await audit(ctx, me.email, "rec.reopen", `${rec.accountId} ${rec.statementDate}`);
  },
});

/** Refuse to reverse an entry whose lines are checked off on a statement. */
export async function assertNotReconciled(ctx: MutationCtx, entryId: Id<"booksEntries">) {
  const lines = await ctx.db.query("booksLines").withIndex("by_entry", (q) => q.eq("entryId", entryId)).collect();
  if (lines.some((l) => l.recId)) {
    throw new ConvexError("This is checked off on a reconciled statement. Reopen or cancel that reconciliation first.");
  }
}
