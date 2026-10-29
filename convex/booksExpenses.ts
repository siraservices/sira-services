// Quick expense entry (and refunds) paid from a bank or card account,
// with optional receipt files kept in Convex storage.

import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { insertEntry } from "./booksLedger";
import { isIsoDate } from "./booksLib";
import { cashPostingLines } from "./booksOpsLib";

const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

type Ctx = MutationCtx;

async function addReceipts(
  ctx: Ctx,
  actor: string,
  entryId: Id<"booksEntries">,
  receipts: { storageId: Id<"_storage">; fileName: string }[],
) {
  for (const r of receipts) {
    const meta = await ctx.db.system.get(r.storageId);
    if (!meta) throw new ConvexError("A receipt upload didn't finish. Try again.");
    if (meta.size > MAX_RECEIPT_BYTES) throw new ConvexError("Receipts must be 10 MB or smaller.");
    const already = await ctx.db.query("booksReceipts").withIndex("by_storage", (q) => q.eq("storageId", r.storageId)).first();
    if (already) throw new ConvexError("That file is already attached.");
    await ctx.db.insert("booksReceipts", {
      storageId: r.storageId,
      fileName: r.fileName.slice(0, 200),
      contentType: meta.contentType,
      entryId,
      uploadedBy: actor,
      createdAt: Date.now(),
    });
  }
}

/** Short-lived upload URL for a receipt file (members only). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    date: v.string(),
    payee: v.optional(v.string()),
    contactId: v.optional(v.id("booksContacts")),
    amount: v.number(), // cents, positive
    isRefund: v.optional(v.boolean()),
    paidFromAccountId: v.id("booksAccounts"), // bank or card
    categoryAccountId: v.id("booksAccounts"),
    memo: v.optional(v.string()),
    receipts: v.optional(v.array(v.object({ storageId: v.id("_storage"), fileName: v.string() }))),
  },
  handler: async (ctx, a) => {
    const me = await requireBooksMember(ctx);
    if (!isIsoDate(a.date)) throw new ConvexError("Pick a valid date.");
    if (!Number.isInteger(a.amount) || a.amount <= 0) throw new ConvexError("Amount must be above zero.");
    const paidFrom = await ctx.db.get(a.paidFromAccountId);
    if (!paidFrom || !(paidFrom.type === "asset" || paidFrom.type === "liability")) {
      throw new ConvexError("Paid-from must be a bank or card account.");
    }
    if (a.paidFromAccountId === a.categoryAccountId) throw new ConvexError("Pick a different category.");
    let payee = a.payee?.trim();
    if (a.contactId && !payee) payee = (await ctx.db.get(a.contactId))?.name;
    const memo = [payee, a.memo?.trim()].filter(Boolean).join(" – ") || undefined;
    const signed = a.isRefund ? a.amount : -a.amount;
    const entryId = await insertEntry(ctx, me.email, {
      date: a.date,
      memo,
      source: "expense",
      txnType: a.isRefund ? "Refund" : "Expense",
      lines: cashPostingLines(a.paidFromAccountId, a.categoryAccountId, signed).map((l) => ({
        ...l,
        contactId: a.contactId,
      })),
    });
    await addReceipts(ctx, me.email, entryId, a.receipts ?? []);
    await audit(ctx, me.email, "expense.create", `${entryId} ${a.amount}`);
    return entryId;
  },
});

/** Attach more receipts to any existing entry. */
export const attachReceipts = mutation({
  args: {
    entryId: v.id("booksEntries"),
    receipts: v.array(v.object({ storageId: v.id("_storage"), fileName: v.string() })),
  },
  handler: async (ctx, { entryId, receipts }) => {
    const me = await requireBooksMember(ctx);
    if (!(await ctx.db.get(entryId))) throw new ConvexError("Entry not found.");
    await addReceipts(ctx, me.email, entryId, receipts);
    await audit(ctx, me.email, "receipt.attach", `${entryId} ${receipts.length}`);
  },
});

/** Delete uploads that never got attached (e.g. the expense failed to save). */
export const discardUploads = mutation({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, { storageIds }) => {
    await requireBooksMember(ctx);
    for (const id of storageIds.slice(0, 20)) {
      const used = await ctx.db.query("booksReceipts").withIndex("by_storage", (q) => q.eq("storageId", id)).first();
      if (!used && (await ctx.db.system.get(id))) await ctx.storage.delete(id);
    }
  },
});

export const removeReceipt = mutation({
  args: { id: v.id("booksReceipts") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    const r = await ctx.db.get(id);
    if (!r) return;
    await ctx.storage.delete(r.storageId);
    await ctx.db.delete(id);
    await audit(ctx, me.email, "receipt.remove", r.fileName);
  },
});

/**
 * Recent expense entries with their receipts. Receipt links are Convex
 * storage URLs: unguessable, but anyone holding a link can open the file,
 * so don't forward them.
 */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireBooksMember(ctx);
    const entries = (await ctx.db.query("booksEntries").withIndex("by_date").order("desc").take(400))
      .filter((e) => e.source === "expense" || e.source === "bank")
      .slice(0, Math.min(limit ?? 50, 200));
    return await Promise.all(
      entries.map(async (e) => {
        const receipts = await ctx.db
          .query("booksReceipts")
          .withIndex("by_entry", (q) => q.eq("entryId", e._id))
          .collect();
        return {
          ...e,
          receipts: await Promise.all(
            receipts.map(async (r) => ({ _id: r._id, fileName: r.fileName, url: await ctx.storage.getUrl(r.storageId) })),
          ),
        };
      }),
    );
  },
});

/** Receipts for one entry (used by the journal). */
export const receiptsFor = query({
  args: { entryId: v.id("booksEntries") },
  handler: async (ctx, { entryId }) => {
    await requireBooksMember(ctx);
    const receipts = await ctx.db
      .query("booksReceipts")
      .withIndex("by_entry", (q) => q.eq("entryId", entryId as Id<"booksEntries">))
      .collect();
    return await Promise.all(
      receipts.map(async (r) => ({ _id: r._id, fileName: r.fileName, url: await ctx.storage.getUrl(r.storageId) })),
    );
  },
});
