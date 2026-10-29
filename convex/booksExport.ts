// Exports for the CPA and a full backup of the books.

import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireBooksMember } from "./booksAuth";
import { normalBalance } from "./booksLib";

/** Every posted line in a date range, with its entry, account and contact. */
export const generalLedger = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    await requireBooksMember(ctx);
    const [accounts, contacts, lines] = await Promise.all([
      ctx.db.query("booksAccounts").collect(),
      ctx.db.query("booksContacts").collect(),
      ctx.db.query("booksLines").withIndex("by_date", (q) => q.gte("date", from).lte("date", to)).collect(),
    ]);
    const acct = new Map(accounts.map((a) => [a._id as string, a]));
    const who = new Map(contacts.map((c) => [c._id as string, c.name]));
    const entries = new Map<string, { txnType?: string; num?: string; memo?: string; reversed: boolean }>();
    for (const l of lines) {
      if (entries.has(l.entryId)) continue;
      const e = await ctx.db.get(l.entryId);
      entries.set(l.entryId, { txnType: e?.txnType, num: e?.num, memo: e?.memo, reversed: !!(e?.reversedById || e?.reversesId) });
    }
    return lines
      .sort((a, b) => a.date.localeCompare(b.date) || a._creationTime - b._creationTime)
      .map((l) => {
        const e = entries.get(l.entryId)!;
        const a = acct.get(l.accountId);
        return {
          date: l.date,
          entryId: l.entryId,
          txnType: e.txnType ?? "",
          num: e.num ?? "",
          memo: l.memo ?? e.memo ?? "",
          account: a?.name ?? "?",
          accountType: a?.type ?? "",
          contact: l.contactId ? who.get(l.contactId) ?? "" : "",
          debit: l.debit,
          credit: l.credit,
          reversal: e.reversed,
        };
      });
  },
});

/** Income and expense accounts by month for a year (normal-direction amounts). */
export const profitAndLossByMonth = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    await requireBooksMember(ctx);
    const accounts = await ctx.db.query("booksAccounts").collect();
    const lines = await ctx.db
      .query("booksLines")
      .withIndex("by_date", (q) => q.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`))
      .collect();
    const rows = new Map<string, { name: string; type: "income" | "expense"; months: number[] }>();
    for (const l of lines) {
      const a = accounts.find((x) => x._id === l.accountId);
      if (!a || (a.type !== "income" && a.type !== "expense")) continue;
      const r = rows.get(a._id) ?? { name: a.name, type: a.type, months: Array(12).fill(0) };
      r.months[Number(l.date.slice(5, 7)) - 1] += normalBalance(a.type, l.debit, l.credit);
      rows.set(a._id, r);
    }
    const list = Array.from(rows.values()).filter((r) => r.months.some((m) => m !== 0));
    const sum = (type: string) => Array.from({ length: 12 }, (_, i) => list.filter((r) => r.type === type).reduce((s, r) => s + r.months[i], 0));
    const income = sum("income");
    const expenses = sum("expense");
    return {
      income: list.filter((r) => r.type === "income").sort((a, b) => a.name.localeCompare(b.name)),
      expenses: list.filter((r) => r.type === "expense").sort((a, b) => a.name.localeCompare(b.name)),
      totals: { income, expenses, net: income.map((x, i) => x - expenses[i]) },
    };
  },
});

/** Everything in the books, for safekeeping. Owner only. */
export const backup = query({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx, { owner: true });
    const all = async <T extends Parameters<typeof ctx.db.query>[0]>(t: T) => await ctx.db.query(t).collect();
    return {
      exportedAt: new Date().toISOString(),
      format: "sira-books-backup-v1",
      accounts: await all("booksAccounts"),
      contacts: await all("booksContacts"),
      entries: await all("booksEntries"),
      lines: await all("booksLines"),
      invoices: await all("booksInvoices"),
      payments: await all("booksPayments"),
      recurring: await all("booksRecurring"),
      receipts: await all("booksReceipts"),
      bankTxns: await all("booksBankTxns"),
      rules: await all("booksRules"),
      reconciliations: await all("booksRecs"),
      mileage: await all("booksMileage"),
      members: (await all("booksMembers")).map((m) => ({ email: m.email, role: m.role, active: m.active })),
    };
  },
});
