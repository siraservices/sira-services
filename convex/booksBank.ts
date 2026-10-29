// Bank feed: CSV rows from Chase (or any bank) go into a review queue.
// Each row is then posted to a category, matched to an entry that's already
// in the ledger (e.g. from the QuickBooks import or an invoice payment), or
// excluded. Rules suggest the category from the description.

import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { audit, requireBooksMember } from "./booksAuth";
import { insertEntry } from "./booksLedger";
import { isIsoDate, reversalLines } from "./booksLib";
import { cashPostingLines, findMatches, lineCashAmount, matchRule, type LedgerCandidate } from "./booksOpsLib";
import { assertNotReconciled } from "./booksReconcile";

async function cashAccount(ctx: MutationCtx, id: Id<"booksAccounts">) {
  const a = await ctx.db.get(id);
  if (!a || !(a.type === "asset" || a.type === "liability")) throw new ConvexError("Pick a bank or card account.");
  return a;
}

export const importRows = mutation({
  args: {
    accountId: v.id("booksAccounts"),
    rows: v.array(v.object({ date: v.string(), description: v.string(), amount: v.number(), hash: v.string() })),
  },
  handler: async (ctx, { accountId, rows }) => {
    const me = await requireBooksMember(ctx);
    await cashAccount(ctx, accountId);
    if (rows.length > 500) throw new ConvexError("Send at most 500 rows per batch.");
    const batch = `b${Date.now()}`;
    let added = 0;
    let skipped = 0;
    for (const r of rows) {
      if (!isIsoDate(r.date) || !Number.isInteger(r.amount) || r.amount === 0) {
        skipped++;
        continue;
      }
      const dupe = await ctx.db
        .query("booksBankTxns")
        .withIndex("by_account_hash", (q) => q.eq("accountId", accountId).eq("hash", r.hash))
        .first();
      if (dupe) {
        skipped++;
        continue;
      }
      await ctx.db.insert("booksBankTxns", {
        accountId,
        date: r.date,
        description: r.description.slice(0, 300),
        amount: r.amount,
        hash: r.hash,
        status: "pending",
        batch,
        importedAt: Date.now(),
      });
      added++;
    }
    await audit(ctx, me.email, "bank.import", `${accountId} ${added} added ${skipped} skipped`);
    return { added, skipped };
  },
});

/** Pending rows for one account, each with a suggested category and possible matches. */
export const review = query({
  args: { accountId: v.id("booksAccounts"), status: v.optional(v.string()) },
  handler: async (ctx, { accountId, status }) => {
    await requireBooksMember(ctx);
    const st = (status ?? "pending") as Doc<"booksBankTxns">["status"];
    const rows = (
      await ctx.db
        .query("booksBankTxns")
        .withIndex("by_account_status", (q) => q.eq("accountId", accountId).eq("status", st))
        .collect()
    ).sort((a, b) => b.date.localeCompare(a.date));
    const rules = await ctx.db.query("booksRules").collect();

    const candidates: LedgerCandidate[] = [];
    const linked = new Set<string>();
    if (st === "pending" && rows.length > 0) {
      const dates = rows.map((r) => r.date).sort();
      const pad = (d: string, days: number) => new Date(Date.parse(`${d}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
      const lines = await ctx.db
        .query("booksLines")
        .withIndex("by_account_date", (q) =>
          q.eq("accountId", accountId).gte("date", pad(dates[0], -6)).lte("date", pad(dates[dates.length - 1], 6)),
        )
        .collect();
      for (const l of lines) {
        const e = await ctx.db.get(l.entryId);
        if (!e || e.reversedById || e.reversesId) continue;
        candidates.push({ entryId: l.entryId, date: l.date, amount: lineCashAmount(l), memo: e.memo });
        // Taken only if a row in THIS account already uses it (a transfer has one
        // row in checking and one in the card, both pointing at the same entry).
        const used = await ctx.db.query("booksBankTxns").withIndex("by_entry", (q) => q.eq("entryId", l.entryId)).collect();
        if (used.some((u) => u.accountId === accountId)) linked.add(l.entryId);
      }
    }
    const claimed = new Set(linked);
    return rows.map((r) => {
      const rule = matchRule(r.description, rules);
      const matches = st === "pending" ? findMatches(r, candidates, claimed).slice(0, 3) : [];
      if (matches[0]) claimed.add(matches[0].entryId); // one bank row per ledger entry
      return { ...r, suggestedAccountId: rule?.accountId ?? null, suggestedContactId: rule?.contactId ?? null, matches };
    });
  },
});

/** Pending counts per bank/card account, for the account picker. */
export const counts = query({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx);
    const pending = await ctx.db.query("booksBankTxns").withIndex("by_status", (q) => q.eq("status", "pending")).collect();
    const out: Record<string, number> = {};
    for (const p of pending) out[p.accountId] = (out[p.accountId] ?? 0) + 1;
    return out;
  },
});

async function postOne(
  ctx: MutationCtx,
  actor: string,
  id: Id<"booksBankTxns">,
  categoryAccountId: Id<"booksAccounts">,
  contactId?: Id<"booksContacts">,
  memo?: string,
) {
  const t = await ctx.db.get(id);
  if (!t) throw new ConvexError("Row not found.");
  if (t.status !== "pending") throw new ConvexError("That row was already handled.");
  if (t.accountId === categoryAccountId) throw new ConvexError("Pick a different category.");
  const entryId = await insertEntry(ctx, actor, {
    date: t.date,
    memo: memo?.trim() || t.description,
    source: "bank",
    sourceRef: `bank:${id}:${Date.now()}`, // unique per attempt, so a row can be re-posted after undo
    txnType: t.amount > 0 ? "Deposit" : "Expense",
    lines: cashPostingLines(t.accountId, categoryAccountId, t.amount).map((l) => ({ ...l, contactId })),
  });
  await ctx.db.patch(id, { status: "posted", entryId });
  return entryId;
}

export const post = mutation({
  args: {
    id: v.id("booksBankTxns"),
    categoryAccountId: v.id("booksAccounts"),
    contactId: v.optional(v.id("booksContacts")),
    memo: v.optional(v.string()),
    ruleText: v.optional(v.string()), // also save "contains → category" for next time
  },
  handler: async (ctx, a) => {
    const me = await requireBooksMember(ctx);
    const entryId = await postOne(ctx, me.email, a.id, a.categoryAccountId, a.contactId, a.memo);
    const text = a.ruleText?.trim();
    if (text) {
      await ctx.db.insert("booksRules", {
        contains: text.toLowerCase(),
        accountId: a.categoryAccountId,
        contactId: a.contactId,
        active: true,
        createdAt: Date.now(),
      });
    }
    await audit(ctx, me.email, "bank.post", `${a.id} -> ${entryId}`);
    return entryId;
  },
});

export const postMany = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("booksBankTxns"),
        categoryAccountId: v.id("booksAccounts"),
        contactId: v.optional(v.id("booksContacts")),
      }),
    ),
  },
  handler: async (ctx, { items }) => {
    const me = await requireBooksMember(ctx);
    if (items.length > 100) throw new ConvexError("Post at most 100 at a time.");
    for (const it of items) await postOne(ctx, me.email, it.id, it.categoryAccountId, it.contactId);
    await audit(ctx, me.email, "bank.postMany", String(items.length));
    return items.length;
  },
});

/** Link a bank row to an entry that's already in the ledger (no new posting). */
export const match = mutation({
  args: { id: v.id("booksBankTxns"), entryId: v.id("booksEntries") },
  handler: async (ctx, { id, entryId }) => {
    const me = await requireBooksMember(ctx);
    const t = await ctx.db.get(id);
    if (!t || t.status !== "pending") throw new ConvexError("That row was already handled.");
    const entry = await ctx.db.get(entryId);
    if (!entry || entry.reversedById || entry.reversesId) throw new ConvexError("That entry was reversed; pick another.");
    const lines = await ctx.db.query("booksLines").withIndex("by_entry", (q) => q.eq("entryId", entryId)).collect();
    const hit = lines.find((l) => l.accountId === t.accountId && lineCashAmount(l) === t.amount);
    if (!hit) throw new ConvexError("That entry doesn't have the same amount in this account.");
    const taken = await ctx.db.query("booksBankTxns").withIndex("by_entry", (q) => q.eq("entryId", entryId)).collect();
    if (taken.some((x) => x.accountId === t.accountId)) throw new ConvexError("That entry is already matched to another row in this account.");
    await ctx.db.patch(id, { status: "matched", entryId });
    await audit(ctx, me.email, "bank.match", `${id} = ${entryId}`);
  },
});

export const exclude = mutation({
  args: { id: v.id("booksBankTxns") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    const t = await ctx.db.get(id);
    if (!t || t.status !== "pending") throw new ConvexError("That row was already handled.");
    await ctx.db.patch(id, { status: "excluded" });
    await audit(ctx, me.email, "bank.exclude", id);
  },
});

/** Send a row back to review. A posted row's entry is reversed (never deleted). */
export const undo = mutation({
  args: { id: v.id("booksBankTxns"), date: v.string() },
  handler: async (ctx, { id, date }) => {
    const me = await requireBooksMember(ctx);
    const t = await ctx.db.get(id);
    if (!t) throw new ConvexError("Row not found.");
    if (t.status === "posted" && t.entryId) {
      await assertNotReconciled(ctx, t.entryId);
      const e = await ctx.db.get(t.entryId);
      if (e && !e.reversedById) {
        const lines = await ctx.db.query("booksLines").withIndex("by_entry", (q) => q.eq("entryId", t.entryId!)).collect();
        const rid = await insertEntry(ctx, me.email, {
          date: isIsoDate(date) ? date : t.date,
          memo: `Undo: ${e.memo ?? t.description}`,
          source: "bank",
          reversesId: t.entryId,
          lines: reversalLines(
            lines.map((l) => ({ accountId: l.accountId, debit: l.debit, credit: l.credit, contactId: l.contactId })),
          ) as {
            accountId: Id<"booksAccounts">;
            debit: number;
            credit: number;
            contactId?: Id<"booksContacts">;
          }[],
        });
        await ctx.db.patch(t.entryId, { reversedById: rid });
      }
    }
    await ctx.db.patch(id, { status: "pending", entryId: undefined });
    await audit(ctx, me.email, "bank.undo", id);
  },
});

export const listRules = query({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx);
    return (await ctx.db.query("booksRules").collect()).sort((a, b) => a.contains.localeCompare(b.contains));
  },
});

export const createRule = mutation({
  args: { contains: v.string(), accountId: v.id("booksAccounts"), contactId: v.optional(v.id("booksContacts")) },
  handler: async (ctx, a) => {
    const me = await requireBooksMember(ctx);
    const contains = a.contains.trim().toLowerCase();
    if (contains.length < 2) throw new ConvexError("Use at least 2 characters.");
    await ctx.db.insert("booksRules", { ...a, contains, active: true, createdAt: Date.now() });
    await audit(ctx, me.email, "rule.create", contains);
  },
});

export const deleteRule = mutation({
  args: { id: v.id("booksRules") },
  handler: async (ctx, { id }) => {
    const me = await requireBooksMember(ctx);
    const r = await ctx.db.get(id);
    if (!r) return;
    await ctx.db.delete(id);
    await audit(ctx, me.email, "rule.delete", r.contains);
  },
});
