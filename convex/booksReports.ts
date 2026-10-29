import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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

/** "Needs attention" list for the Overview. */
export const todo = query({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    await requireBooksMember(ctx);
    const items: { level: "warn" | "info"; text: string; href: string }[] = [];
    const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
    const accounts = await ctx.db.query("booksAccounts").collect();
    const cash = accounts.filter((a) => a.isCash && a.active && (a.type === "asset" || a.type === "liability"));

    for (const a of cash) {
      const lines = await ctx.db.query("booksLines").withIndex("by_account_date", (q) => q.eq("accountId", a._id)).order("desc").take(1);
      if (lines.length === 0) continue; // unused account (e.g. petty cash)
      const recs = await ctx.db.query("booksRecs").withIndex("by_account_date", (q) => q.eq("accountId", a._id)).order("desc").collect();
      const open = recs.find((r) => r.status === "open");
      const done = recs.find((r) => r.status === "done");
      if (open) items.push({ level: "info", text: `${a.name}: finish the open reconciliation (statement ending ${open.statementDate}).`, href: "/admin/books/reconcile" });
      else if (!done) items.push({ level: "info", text: `${a.name}: not reconciled in Books yet.`, href: "/admin/books/reconcile" });
      else if (daysBetween(done.statementDate, today) > 40) {
        items.push({ level: "warn", text: `${a.name}: last reconciled through ${done.statementDate}. Reconcile the newer statements.`, href: "/admin/books/reconcile" });
      }
      const lastImport = await ctx.db.query("booksBankTxns").withIndex("by_account_hash", (q) => q.eq("accountId", a._id)).collect();
      const newest = lastImport.reduce((m, t) => (t.date > m ? t.date : m), "");
      if (lastImport.length > 0 && daysBetween(newest, today) > 21) {
        items.push({ level: "info", text: `${a.name}: newest bank activity imported is ${newest}. Download a fresh CSV from Chase.`, href: "/admin/books/bank" });
      }
    }

    // Estimated tax: next federal due date.
    const y = Number(today.slice(0, 4));
    const dues = [`${y}-01-15`, `${y}-04-15`, `${y}-06-15`, `${y}-09-15`, `${y + 1}-01-15`];
    const next = dues.find((d) => d >= today)!;
    const left = daysBetween(today, next);
    if (left <= 30) items.push({ level: left <= 7 ? "warn" : "info", text: `Estimated tax payment due ${next} (${left} days).`, href: "/admin/books/tax" });

    // Recurring invoices in the next 7 days, and any errors.
    const recurring = await ctx.db.query("booksRecurring").collect();
    for (const r of recurring) {
      if (r.lastError) items.push({ level: "warn", text: `Recurring invoice problem: ${r.lastError}`, href: "/admin/books/invoices/recurring" });
      else if (r.active && daysBetween(today, r.nextDate) >= 0 && daysBetween(today, r.nextDate) <= 7) {
        const c = await ctx.db.get(r.contactId);
        items.push({ level: "info", text: `Recurring invoice for ${c?.name ?? "a customer"} goes out ${r.nextDate}.`, href: "/admin/books/invoices/recurring" });
      }
    }

    // Expenses of $75+ in the last 90 days with no receipt attached.
    const since = new Date(Date.parse(today) - 90 * 86400000).toISOString().slice(0, 10);
    const expenseIds = new Set(accounts.filter((a) => a.type === "expense").map((a) => a._id as string));
    const recent = await ctx.db.query("booksLines").withIndex("by_date", (q) => q.gte("date", since).lte("date", today)).collect();
    const big = new Map<string, Id<"booksEntries">>();
    for (const l of recent) if (expenseIds.has(l.accountId) && l.debit >= 7500) big.set(l.entryId, l.entryId);
    let missing = 0;
    for (const id of Array.from(big.values())) {
      const e = await ctx.db.get(id);
      if (!e || e.reversedById || e.reversesId) continue;
      const r = await ctx.db.query("booksReceipts").withIndex("by_entry", (q) => q.eq("entryId", id)).first();
      if (!r) missing++;
    }
    if (missing > 0) items.push({ level: "info", text: `${missing} expense${missing === 1 ? "" : "s"} of $75+ from the last 90 days ${missing === 1 ? "has" : "have"} no receipt.`, href: "/admin/books/expenses" });

    // Money a customer paid that isn't applied to an invoice (e.g. paid twice on Stripe).
    const credits = accounts.find((a) => a.name === "Customer credits (unapplied)");
    if (credits) {
      const cl = await ctx.db.query("booksLines").withIndex("by_account_date", (q) => q.eq("accountId", credits._id)).collect();
      const owed = cl.reduce((s, l) => s + l.credit - l.debit, 0);
      if (owed !== 0) {
        items.push({ level: "warn", text: `$${(owed / 100).toFixed(2)} of customer payments isn't applied to an invoice. Refund it in Stripe or apply it.`, href: "/admin/books/accounts" });
      }
    }

    if (today.slice(5, 7) === "01") {
      items.push({ level: "warn", text: "January: send 1099-NECs to contractors by Jan 31, and give your CPA the year-end downloads.", href: "/admin/books/tax" });
    }
    return items.sort((a, b) => (a.level === b.level ? 0 : a.level === "warn" ? -1 : 1));
  },
});
