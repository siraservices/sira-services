import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { isIsoDate, reversalLines, validateLines } from "./booksLib";
import { assertNotReconciled } from "./booksReconcile";

const lineArg = v.object({
  accountId: v.id("booksAccounts"),
  debit: v.number(),
  credit: v.number(),
  memo: v.optional(v.string()),
  contactId: v.optional(v.id("booksContacts")),
});

type NewLine = {
  accountId: Id<"booksAccounts">;
  debit: number;
  credit: number;
  memo?: string;
  contactId?: Id<"booksContacts">;
};

/** The only code path that writes journal entries. Validates everything. */
export async function insertEntry(
  ctx: MutationCtx,
  actor: string,
  entry: {
    date: string;
    memo?: string;
    source: Doc<"booksEntries">["source"];
    sourceRef?: string;
    txnType?: string;
    num?: string;
    reversesId?: Id<"booksEntries">;
    lines: NewLine[];
  },
): Promise<Id<"booksEntries">> {
  if (!isIsoDate(entry.date)) throw new ConvexError(`Bad date: ${entry.date}`);
  const err = validateLines(entry.lines);
  if (err) throw new ConvexError(err);
  for (const l of entry.lines) {
    const acct = await ctx.db.get(l.accountId);
    if (!acct) throw new ConvexError("Unknown account.");
    if (!acct.active && entry.source === "manual") {
      throw new ConvexError(`"${acct.name}" is inactive.`);
    }
  }
  if (entry.sourceRef) {
    const dupe = await ctx.db
      .query("booksEntries")
      .withIndex("by_sourceRef", (q) => q.eq("sourceRef", entry.sourceRef))
      .first();
    if (dupe) throw new ConvexError(`Already posted (${entry.sourceRef}).`);
  }
  const total = entry.lines.reduce((s, l) => s + l.debit, 0);
  const { lines, ...head } = entry;
  const entryId = await ctx.db.insert("booksEntries", {
    ...head,
    total,
    createdBy: actor,
    createdAt: Date.now(),
  });
  for (const l of lines) {
    await ctx.db.insert("booksLines", { ...l, entryId, date: entry.date });
  }
  return entryId;
}

export const post = mutation({
  args: {
    date: v.string(),
    memo: v.optional(v.string()),
    lines: v.array(lineArg),
  },
  handler: async (ctx, args) => {
    const me = await requireBooksMember(ctx);
    const id = await insertEntry(ctx, me.email, { ...args, source: "manual" });
    await audit(ctx, me.email, "entry.post", id);
    return id;
  },
});

/** Corrections never edit history: post the mirror image and link the two. */
export const reverse = mutation({
  args: { entryId: v.id("booksEntries"), date: v.string(), memo: v.optional(v.string()) },
  handler: async (ctx, { entryId, date, memo }) => {
    const me = await requireBooksMember(ctx);
    const original = await ctx.db.get(entryId);
    if (!original) throw new ConvexError("Entry not found.");
    if (original.reversedById) throw new ConvexError("This entry was already reversed.");
    if (original.reversesId) throw new ConvexError("This entry is itself a reversal.");
    if (original.source === "invoice" || original.source === "payment") {
      throw new ConvexError("Void it from the Invoices page so the invoice stays in sync.");
    }
    const bankRow = await ctx.db.query("booksBankTxns").withIndex("by_entry", (q) => q.eq("entryId", entryId)).first();
    if (bankRow) throw new ConvexError("This came from the bank feed. Use “Back to review” on the Bank page instead.");
    await assertNotReconciled(ctx, entryId);
    const lines = await ctx.db
      .query("booksLines")
      .withIndex("by_entry", (q) => q.eq("entryId", entryId))
      .collect();
    const mirrored = reversalLines(
      lines.map((l) => ({
        accountId: l.accountId,
        debit: l.debit,
        credit: l.credit,
        memo: l.memo,
        contactId: l.contactId,
      })),
    ) as NewLine[];
    const id = await insertEntry(ctx, me.email, {
      date,
      memo: memo ?? `Reversal of ${original.date} ${original.memo ?? ""}`.trim(),
      source: "manual",
      reversesId: entryId,
      lines: mirrored,
    });
    await ctx.db.patch(entryId, { reversedById: id });
    await audit(ctx, me.email, "entry.reverse", `${entryId} -> ${id}`);
    return id;
  },
});

/** Entries in a date range, newest first, with their lines. */
export const listEntries = query({
  args: { from: v.optional(v.string()), to: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { from, to, limit }) => {
    await requireBooksMember(ctx);
    const entries = await ctx.db
      .query("booksEntries")
      .withIndex("by_date", (q) => q.gte("date", from ?? "0000-00-00").lte("date", to ?? "9999-12-31"))
      .order("desc")
      .take(Math.min(limit ?? 100, 500));
    return await Promise.all(
      entries.map(async (e) => ({
        ...e,
        lines: await ctx.db
          .query("booksLines")
          .withIndex("by_entry", (q) => q.eq("entryId", e._id))
          .collect(),
      })),
    );
  },
});

/** One account's lines with a running balance (debit minus credit). */
export const register = query({
  args: { accountId: v.id("booksAccounts"), from: v.optional(v.string()), to: v.optional(v.string()) },
  handler: async (ctx, { accountId, from, to }) => {
    await requireBooksMember(ctx);
    const account = await ctx.db.get(accountId);
    if (!account) throw new ConvexError("Account not found.");
    const all = await ctx.db
      .query("booksLines")
      .withIndex("by_account_date", (q) => q.eq("accountId", accountId))
      .collect();
    all.sort((a, b) => a.date.localeCompare(b.date) || a._creationTime - b._creationTime);
    let running = 0;
    const rows = [];
    for (const l of all) {
      running += l.debit - l.credit;
      if ((from && l.date < from) || (to && l.date > to)) continue;
      const entry = await ctx.db.get(l.entryId);
      rows.push({ ...l, running, entryMemo: entry?.memo, txnType: entry?.txnType });
    }
    return { account, rows };
  },
});
