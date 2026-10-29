// One-time migration from QuickBooks Online. The browser parses the CSV
// exports (convex/booksImportLib.ts) and sends them here in small batches.
// Re-running is safe: accounts match by name, entries de-dupe by sourceRef.

import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { insertEntry } from "./booksLedger";

const accountType = v.union(
  v.literal("asset"),
  v.literal("liability"),
  v.literal("equity"),
  v.literal("income"),
  v.literal("expense"),
);

export const importAccounts = mutation({
  args: {
    accounts: v.array(
      v.object({
        name: v.string(),
        type: accountType,
        qboType: v.string(),
        detailType: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { accounts }) => {
    const me = await requireBooksMember(ctx, { owner: true });
    let created = 0;
    for (const a of accounts) {
      const name = a.name.trim();
      const exists = await ctx.db
        .query("booksAccounts")
        .withIndex("by_name", (q) => q.eq("name", name))
        .unique();
      if (exists) continue;
      const qt = a.qboType.toLowerCase();
      await ctx.db.insert("booksAccounts", {
        name,
        type: a.type,
        detailType: a.detailType ?? a.qboType,
        isCash: qt === "bank" || qt === "credit card",
        active: true,
        createdAt: Date.now(),
      });
      created++;
    }
    await audit(ctx, me.email, "import.accounts", `${created} created of ${accounts.length}`);
    return { created };
  },
});

export const importEntries = mutation({
  args: {
    entries: v.array(
      v.object({
        date: v.string(),
        txnType: v.string(),
        num: v.optional(v.string()),
        memo: v.optional(v.string()),
        sourceRef: v.string(),
        lines: v.array(
          v.object({
            accountName: v.string(),
            debit: v.number(),
            credit: v.number(),
            memo: v.optional(v.string()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, { entries }) => {
    const me = await requireBooksMember(ctx, { owner: true });
    if (entries.length > 100) throw new ConvexError("Send at most 100 entries per batch.");
    const cache = new Map<string, Id<"booksAccounts"> | null>();
    const accountId = async (name: string) => {
      if (!cache.has(name)) {
        const a = await ctx.db
          .query("booksAccounts")
          .withIndex("by_name", (q) => q.eq("name", name.trim()))
          .unique();
        cache.set(name, a?._id ?? null);
      }
      return cache.get(name)!;
    };

    let posted = 0;
    let skipped = 0;
    const errors: string[] = [];
    for (const e of entries) {
      const dupe = await ctx.db
        .query("booksEntries")
        .withIndex("by_sourceRef", (q) => q.eq("sourceRef", e.sourceRef))
        .first();
      if (dupe) {
        skipped++;
        continue;
      }
      const lines = [];
      let missing: string | null = null;
      for (const l of e.lines) {
        const id = await accountId(l.accountName);
        if (!id) {
          missing = l.accountName;
          break;
        }
        lines.push({ accountId: id, debit: l.debit, credit: l.credit, memo: l.memo });
      }
      if (missing) {
        errors.push(`${e.date} ${e.txnType}: no account named "${missing}".`);
        continue;
      }
      try {
        await insertEntry(ctx, me.email, {
          date: e.date,
          memo: e.memo,
          txnType: e.txnType,
          num: e.num,
          source: "import",
          sourceRef: e.sourceRef,
          lines,
        });
        posted++;
      } catch (err) {
        errors.push(`${e.date} ${e.txnType}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    await audit(ctx, me.email, "import.entries", `${posted} posted, ${skipped} skipped, ${errors.length} errors`);
    return { posted, skipped, errors };
  },
});
