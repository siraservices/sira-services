// Recurring invoices: a schedule (customer, lines, every N months on a day)
// turns into a real, posted invoice on its date, and is optionally emailed.
// A daily cron (convex/crons.ts) runs it at 9am Eastern.

import { ConvexError, v } from "convex/values";
import { internalAction, internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { nextNumberFor, postInvoice } from "./booksInvoices";
import { isIsoDate } from "./booksLib";
import { addDaysIso, invoiceTotal, nextRecurringDate, validateInvoiceLines } from "./booksOpsLib";

const lineArg = v.object({ description: v.string(), quantity: v.number(), rate: v.number(), accountId: v.id("booksAccounts") });

async function checkTemplate(
  ctx: MutationCtx,
  a: { contactId: Id<"booksContacts">; lines: { description: string; quantity: number; rate: number; accountId: Id<"booksAccounts"> }[]; everyMonths: number; dayOfMonth: number; termsDays: number },
) {
  const err = validateInvoiceLines(a.lines);
  if (err) throw new ConvexError(err);
  for (const l of a.lines) {
    const acct = await ctx.db.get(l.accountId);
    if (!acct || acct.type !== "income") throw new ConvexError("Each line needs an income account.");
  }
  if (!(await ctx.db.get(a.contactId))) throw new ConvexError("Pick a customer.");
  if (![1, 2, 3, 6, 12].includes(a.everyMonths)) throw new ConvexError("Repeat every 1, 2, 3, 6 or 12 months.");
  if (!Number.isInteger(a.dayOfMonth) || a.dayOfMonth < 1 || a.dayOfMonth > 31) throw new ConvexError("Day of month must be 1–31.");
  if (!Number.isInteger(a.termsDays) || a.termsDays < 0 || a.termsDays > 120) throw new ConvexError("Payment terms must be 0–120 days.");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx);
    const all = await ctx.db.query("booksRecurring").collect();
    return await Promise.all(
      all.map(async (r) => {
        const c = await ctx.db.get(r.contactId);
        const last = r.lastInvoiceId ? await ctx.db.get(r.lastInvoiceId) : null;
        return {
          ...r,
          contactName: c?.name ?? "?",
          contactEmail: c?.email ?? null,
          total: invoiceTotal(r.lines),
          lastInvoice: last ? { _id: last._id, number: last.number, issueDate: last.issueDate, status: last.status } : null,
        };
      }),
    ).then((rows) => rows.sort((a, b) => Number(b.active) - Number(a.active) || a.nextDate.localeCompare(b.nextDate)));
  },
});

export const create = mutation({
  args: {
    contactId: v.id("booksContacts"),
    lines: v.array(lineArg),
    memo: v.optional(v.string()),
    everyMonths: v.number(),
    dayOfMonth: v.number(),
    termsDays: v.number(),
    startDate: v.string(), // first invoice date
    endDate: v.optional(v.string()),
    autoEmail: v.boolean(),
  },
  handler: async (ctx, { startDate, ...a }) => {
    const me = await requireBooksMember(ctx);
    if (!isIsoDate(startDate)) throw new ConvexError("Pick the first invoice date.");
    if (a.endDate && (!isIsoDate(a.endDate) || a.endDate < startDate)) throw new ConvexError("The end date is before the start.");
    await checkTemplate(ctx, a);
    const id = await ctx.db.insert("booksRecurring", {
      ...a,
      memo: a.memo?.trim() || undefined,
      nextDate: startDate,
      active: true,
      createdAt: Date.now(),
    });
    await audit(ctx, me.email, "recurring.create", `${id} from ${startDate}`);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("booksRecurring"),
    active: v.optional(v.boolean()),
    autoEmail: v.optional(v.boolean()),
    nextDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    clearEndDate: v.optional(v.boolean()),
    lines: v.optional(v.array(lineArg)),
    memo: v.optional(v.string()),
    termsDays: v.optional(v.number()),
  },
  handler: async (ctx, { id, clearEndDate, ...patch }) => {
    const me = await requireBooksMember(ctx);
    const r = await ctx.db.get(id);
    if (!r) throw new ConvexError("Schedule not found.");
    if (patch.nextDate !== undefined && !isIsoDate(patch.nextDate)) throw new ConvexError("Pick a valid date.");
    if (patch.endDate !== undefined && !isIsoDate(patch.endDate)) throw new ConvexError("Pick a valid end date.");
    const next = { ...r, ...patch };
    await checkTemplate(ctx, next);
    await ctx.db.patch(id, { ...patch, ...(clearEndDate ? { endDate: undefined } : {}), lastError: undefined });
    await audit(ctx, me.email, "recurring.update", id);
  },
});

export const remove = mutation({
  args: { id: v.id("booksRecurring") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    await ctx.db.delete(id); // invoices already created stay as they are
    await audit(ctx, me.email, "recurring.remove", id);
  },
});

/** Create every invoice that's due on or before `today`. Returns the ones to email. */
export const createDue = internalMutation({
  args: { today: v.string() },
  handler: async (ctx, { today }) => {
    const due = await ctx.db
      .query("booksRecurring")
      .withIndex("by_active_next", (q) => q.eq("active", true).lte("nextDate", today))
      .collect();
    const toEmail: Id<"booksInvoices">[] = [];
    for (const r of due) {
      let next = r.nextDate;
      let guard = 0;
      try {
        while (next <= today && (!r.endDate || next <= r.endDate) && guard++ < 12) {
          await checkTemplate(ctx, r);
          const number = await nextNumberFor(ctx);
          const invoiceId = await ctx.db.insert("booksInvoices", {
            number,
            contactId: r.contactId,
            issueDate: next,
            dueDate: addDaysIso(next, r.termsDays),
            status: "draft",
            lines: r.lines,
            total: invoiceTotal(r.lines),
            amountPaid: 0,
            memo: r.memo,
            recurringId: r._id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          await postInvoice(ctx, "recurring", invoiceId);
          if (r.autoEmail) toEmail.push(invoiceId);
          await ctx.db.patch(r._id, { lastInvoiceId: invoiceId });
          next = nextRecurringDate(next, r.everyMonths, r.dayOfMonth);
        }
        const ended = !!r.endDate && next > r.endDate;
        await ctx.db.patch(r._id, { nextDate: next, lastRunAt: Date.now(), lastError: undefined, ...(ended ? { active: false } : {}) });
      } catch (err) {
        await ctx.db.patch(r._id, { lastError: err instanceof Error ? err.message : String(err), lastRunAt: Date.now() });
      }
    }
    return toEmail;
  },
});

export const noteError = internalMutation({
  args: { invoiceId: v.id("booksInvoices"), error: v.string() },
  handler: async (ctx, { invoiceId, error }) => {
    const inv = await ctx.db.get(invoiceId);
    if (inv?.recurringId) await ctx.db.patch(inv.recurringId, { lastError: `Invoice #${inv.number} not emailed: ${error}` });
  },
});

const todayEastern = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());

export const run = internalAction({
  args: {},
  handler: async (ctx): Promise<{ created: number; emailed: number }> => {
    const ids: Id<"booksInvoices">[] = await ctx.runMutation(internal.booksRecurring.createDue, { today: todayEastern() });
    let emailed = 0;
    for (const id of ids) {
      try {
        await ctx.runAction(internal.booksInvoiceEmail.sendAuto, { id });
        emailed++;
      } catch (err) {
        await ctx.runMutation(internal.booksRecurring.noteError, { invoiceId: id, error: err instanceof Error ? err.message : String(err) });
      }
    }
    return { created: ids.length, emailed };
  },
});

/** "Run now" button: same as the daily job. */
export const runNow = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await requireBooksMember(ctx);
    await ctx.scheduler.runAfter(0, internal.booksRecurring.run, {});
    await audit(ctx, me.email, "recurring.runNow");
  },
});
