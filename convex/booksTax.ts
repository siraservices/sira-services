// Tax page: Schedule C by line, mileage log, self-employment tax and
// quarterly estimates, and 1099 totals per payee. Planning numbers only.

import { ConvexError, v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { isIsoDate } from "./booksLib";
import {
  SCHEDULE_C_LINES,
  estimateDueDates,
  form1099Threshold,
  guessScheduleCLine,
  mileageDeduction,
  scheduleC,
  selfEmploymentTax,
} from "./booksTaxLib";

const yearRange = (year: number, to?: string) => ({ from: `${year}-01-01`, to: to && to < `${year}-12-31` ? to : `${year}-12-31` });

async function linesIn(ctx: QueryCtx, from: string, to: string) {
  return await ctx.db.query("booksLines").withIndex("by_date", (q) => q.gte("date", from).lte("date", to)).collect();
}

async function mileageIn(ctx: QueryCtx, from: string, to: string) {
  return await ctx.db.query("booksMileage").withIndex("by_date", (q) => q.gte("date", from).lte("date", to)).collect();
}

async function scheduleCFor(ctx: QueryCtx, year: number, to?: string) {
  const r = yearRange(year, to);
  const [accounts, lines, trips] = await Promise.all([
    ctx.db.query("booksAccounts").collect(),
    linesIn(ctx, r.from, r.to),
    mileageIn(ctx, r.from, r.to),
  ]);
  const mileageCents = trips.reduce((s, t) => s + mileageDeduction(t.miles, t.date), 0);
  const report = scheduleC(
    accounts.map((a) => ({ id: a._id, name: a.name, type: a.type, scheduleCLine: a.scheduleCLine })),
    lines,
    mileageCents,
  );
  return { report, accounts, mileageCents, miles: trips.reduce((s, t) => s + t.miles, 0) };
}

export const scheduleCReport = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    await requireBooksMember(ctx);
    const { report, accounts, mileageCents, miles } = await scheduleCFor(ctx, year);
    const mapping = accounts
      .filter((a) => a.type === "income" || a.type === "expense")
      .map((a) => ({
        _id: a._id,
        name: a.name,
        type: a.type,
        line: a.scheduleCLine || guessScheduleCLine(a.name, a.type),
        guessed: !a.scheduleCLine,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const carIsActual = report.lines.some((l) => l.code === "9" && l.accounts.some((x) => x.id !== "mileage"));
    return { ...report, mapping, mileageCents, miles, warnings: carIsActual && mileageCents ? ["You have both mileage and actual vehicle expenses on line 9. Use one method per vehicle."] : [] };
  },
});

export const setScheduleCLine = mutation({
  args: { accountId: v.id("booksAccounts"), line: v.optional(v.string()) },
  handler: async (ctx, { accountId, line }) => {
    const me = await requireBooksMember(ctx);
    const a = await ctx.db.get(accountId);
    if (!a) throw new ConvexError("Account not found.");
    if (line !== undefined && !SCHEDULE_C_LINES.some((l) => l.code === line)) throw new ConvexError("Unknown Schedule C line.");
    await ctx.db.patch(accountId, { scheduleCLine: line });
    await audit(ctx, me.email, "tax.mapLine", `${a.name} -> ${line ?? "auto"}`);
  },
});

// ── Mileage ────────────────────────────────────────────────────────────────

export const listMileage = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    await requireBooksMember(ctx);
    const r = yearRange(year);
    const trips = (await mileageIn(ctx, r.from, r.to)).sort((a, b) => b.date.localeCompare(a.date));
    return trips.map((t) => ({ ...t, deduction: mileageDeduction(t.miles, t.date) }));
  },
});

export const addMileage = mutation({
  args: {
    date: v.string(),
    miles: v.number(),
    purpose: v.string(),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
    contactId: v.optional(v.id("booksContacts")),
  },
  handler: async (ctx, a) => {
    const me = await requireBooksMember(ctx);
    if (!isIsoDate(a.date)) throw new ConvexError("Pick a date.");
    if (!(a.miles > 0) || a.miles > 2000) throw new ConvexError("Miles must be between 0 and 2,000.");
    if (!a.purpose.trim()) throw new ConvexError("Add the business purpose (the IRS requires it).");
    const id = await ctx.db.insert("booksMileage", {
      ...a,
      miles: Math.round(a.miles * 10) / 10,
      purpose: a.purpose.trim(),
      from: a.from?.trim() || undefined,
      to: a.to?.trim() || undefined,
      createdAt: Date.now(),
    });
    await audit(ctx, me.email, "mileage.add", `${a.date} ${a.miles}`);
    return id;
  },
});

export const removeMileage = mutation({
  args: { id: v.id("booksMileage") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    const t = await ctx.db.get(id);
    if (!t) return;
    await ctx.db.delete(id);
    await audit(ctx, me.email, "mileage.remove", `${t.date} ${t.miles}`);
  },
});

// ── Estimates ──────────────────────────────────────────────────────────────

export const estimates = query({
  args: { year: v.number(), asOf: v.string() },
  handler: async (ctx, { year, asOf }) => {
    await requireBooksMember(ctx);
    const { report } = await scheduleCFor(ctx, year, asOf);
    const se = selfEmploymentTax(report.netProfit, year);
    // Payments for this tax year booked to the estimated-tax equity accounts:
    // Jan 16 of the year (after last year's Q4) through Jan 15 of the next.
    const accounts = await ctx.db.query("booksAccounts").collect();
    const fed = new Set(accounts.filter((a) => /federal estimated/i.test(a.name)).map((a) => a._id as string));
    const state = new Set(accounts.filter((a) => /state estimated/i.test(a.name)).map((a) => a._id as string));
    const lines = await linesIn(ctx, `${year}-01-16`, `${year + 1}-01-15`);
    const paid = (ids: Set<string>) => lines.filter((l) => ids.has(l.accountId)).reduce((s, l) => s + l.debit - l.credit, 0);
    return {
      netProfit: report.netProfit,
      grossIncome: report.grossIncome,
      totalExpenses: report.totalExpenses,
      selfEmployment: se,
      federalPaid: paid(fed),
      statePaid: paid(state),
      due: estimateDueDates(year),
    };
  },
});

// ── 1099s ──────────────────────────────────────────────────────────────────

export const form1099 = query({
  args: { year: v.number() },
  handler: async (ctx, { year }) => {
    await requireBooksMember(ctx);
    const [contacts, accounts, lines] = await Promise.all([
      ctx.db.query("booksContacts").collect(),
      ctx.db.query("booksAccounts").collect(),
      linesIn(ctx, `${year}-01-01`, `${year}-12-31`),
    ]);
    const acct = new Map(accounts.map((a) => [a._id as string, a]));
    const byEntry = new Map<string, Doc<"booksLines">[]>();
    for (const l of lines) {
      const list = byEntry.get(l.entryId) ?? [];
      list.push(l);
      byEntry.set(l.entryId, list);
    }
    const totals = new Map<string, { bank: number; card: number; other: number }>();
    byEntry.forEach((ls) => {
      const paidByCard = ls.some((l) => acct.get(l.accountId)?.type === "liability" && acct.get(l.accountId)?.isCash);
      const paidFromBank = ls.some((l) => acct.get(l.accountId)?.type === "asset" && acct.get(l.accountId)?.isCash);
      for (const l of ls) {
        if (!l.contactId || acct.get(l.accountId)?.type !== "expense") continue;
        const t = totals.get(l.contactId) ?? { bank: 0, card: 0, other: 0 };
        const amt = l.debit - l.credit;
        if (paidByCard) t.card += amt;
        else if (paidFromBank) t.bank += amt;
        else t.other += amt; // e.g. accrued via a bill
        totals.set(l.contactId, t);
      }
    });
    const threshold = form1099Threshold(year);
    return {
      threshold,
      rows: contacts
        .filter((c) => c.kind === "vendor" || c.kind === "contractor" || c.track1099)
        .map((c) => {
          const t = totals.get(c._id) ?? { bank: 0, card: 0, other: 0 };
          const reportable = t.bank + t.other; // card and PayPal payments are reported on 1099-K by the processor
          return {
            _id: c._id as Id<"booksContacts">,
            name: c.name,
            kind: c.kind,
            track1099: !!c.track1099,
            hasAddress: !!c.address,
            ...t,
            total: t.bank + t.card + t.other,
            reportable,
            needs1099: (c.track1099 || c.kind === "contractor") && reportable >= threshold,
          };
        })
        .filter((r) => r.total !== 0 || r.track1099)
        .sort((a, b) => Number(b.needs1099) - Number(a.needs1099) || b.total - a.total),
    };
  },
});

export const setTrack1099 = mutation({
  args: { id: v.id("booksContacts"), track1099: v.boolean() },
  handler: async (ctx, { id, track1099 }) => {
    const me = await requireBooksMember(ctx);
    const c = await ctx.db.get(id);
    if (!c) throw new ConvexError("Contact not found.");
    await ctx.db.patch(id, { track1099 });
    await audit(ctx, me.email, "contact.track1099", `${c.name} ${track1099}`);
  },
});
