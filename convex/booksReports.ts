import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import { requireBooksMember } from "./booksAuth";
import {
  balanceSheet,
  profitAndLoss,
  trialBalance,
  type AccountInfo,
  type PostedLine,
} from "./booksLib";

async function load(ctx: QueryCtx, from: string, to: string) {
  const accounts = (await ctx.db.query("booksAccounts").collect()).map(
    (a): AccountInfo => ({ id: a._id, name: a.name, type: a.type, code: a.code }),
  );
  const lines = (
    await ctx.db
      .query("booksLines")
      .withIndex("by_date", (q) => q.gte("date", from).lte("date", to))
      .collect()
  ).map((l): PostedLine => ({ accountId: l.accountId, debit: l.debit, credit: l.credit, date: l.date }));
  return { accounts, lines };
}

export const profitAndLossReport = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    await requireBooksMember(ctx);
    const { accounts, lines } = await load(ctx, from, to);
    return profitAndLoss(accounts, lines);
  },
});

export const balanceSheetReport = query({
  args: { asOf: v.string() },
  handler: async (ctx, { asOf }) => {
    await requireBooksMember(ctx);
    const { accounts, lines } = await load(ctx, "0000-00-00", asOf);
    return balanceSheet(accounts, lines);
  },
});

export const trialBalanceReport = query({
  args: { asOf: v.string() },
  handler: async (ctx, { asOf }) => {
    await requireBooksMember(ctx);
    const { accounts, lines } = await load(ctx, "0000-00-00", asOf);
    return trialBalance(accounts, lines);
  },
});

/** Dashboard numbers: cash balances today and year-to-date P&L. */
export const dashboard = query({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    await requireBooksMember(ctx);
    const year = today.slice(0, 4);
    const all = await load(ctx, "0000-00-00", today);
    const bs = balanceSheet(all.accounts, all.lines);
    const cashIds = new Set(
      (await ctx.db.query("booksAccounts").collect()).filter((a) => a.isCash).map((a) => a._id as string),
    );
    const cash = [...bs.assets, ...bs.liabilities].filter((r) => cashIds.has(r.id));
    const ytd = profitAndLoss(
      all.accounts,
      all.lines.filter((l) => l.date >= `${year}-01-01`),
    );
    const entryCount = (await ctx.db.query("booksEntries").collect()).length;
    return {
      cash,
      ytd: { income: ytd.totalIncome, expenses: ytd.totalExpenses, net: ytd.netIncome },
      topExpenses: [...ytd.expenses].sort((a, b) => b.balance - a.balance).slice(0, 6),
      balanced: bs.balanced,
      entryCount,
    };
  },
});
