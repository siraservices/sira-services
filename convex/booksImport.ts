// One-time migration from QuickBooks Online. The browser parses the CSV
// exports (convex/booksImportLib.ts) and sends them here in small batches.
// Re-running is safe: accounts match by name, entries de-dupe by sourceRef.

import { ConvexError, v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import { contactKindFromTxns, type ContactKind } from "./booksImportLib";
import type { Doc, Id } from "./_generated/dataModel";
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
            name: v.optional(v.string()), // QuickBooks "Name" column: customer, vendor, employee
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

    const contacts = new ContactResolver(ctx);
    let posted = 0;
    let skipped = 0;
    let linked = 0;
    const errors: string[] = [];
    for (const e of entries) {
      const dupe = await ctx.db
        .query("booksEntries")
        .withIndex("by_sourceRef", (q) => q.eq("sourceRef", e.sourceRef))
        .first();
      if (dupe) {
        // Already imported: just attach the customer/vendor names to its lines.
        linked += await linkNames(ctx, contacts, dupe._id, e.txnType, e.lines, accountId);
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
        const contactId = l.name ? await contacts.resolve(l.name, e.txnType) : undefined;
        if (contactId) linked++;
        lines.push({ accountId: id, debit: l.debit, credit: l.credit, memo: l.memo, contactId });
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
    await contacts.flush();
    await audit(ctx, me.email, "import.entries", `${posted} posted, ${skipped} skipped, ${linked} lines linked, ${errors.length} errors`);
    return { posted, skipped, linked, created: contacts.created, errors };
  },
});

/**
 * Finds or creates the contact for a QuickBooks name. Kind is guessed from the
 * transaction types the name appears on (an invoice makes it a customer).
 */
class ContactResolver {
  private cache = new Map<string, Id<"booksContacts">>();
  private txns = new Map<Id<"booksContacts">, Set<string>>();
  created = 0;
  constructor(private ctx: MutationCtx) {}

  async resolve(rawName: string, txnType: string): Promise<Id<"booksContacts"> | undefined> {
    const name = rawName.trim();
    if (!name) return undefined;
    let id = this.cache.get(name.toLowerCase());
    if (!id) {
      const found = await findContact(this.ctx, name);
      id = found?._id ?? (await this.ctx.db.insert("booksContacts", {
        name,
        kind: contactKindFromTxns([txnType]),
        source: "qbo",
        active: true,
        createdAt: Date.now(),
      }));
      if (!found) this.created++;
      this.cache.set(name.toLowerCase(), id);
    }
    if (!this.txns.has(id)) this.txns.set(id, new Set());
    this.txns.get(id)!.add(txnType);
    return id;
  }

  /** Re-derive imported contacts' kind from every transaction type seen so far. */
  async flush() {
    for (const [id, types] of Array.from(this.txns.entries())) {
      const c: Doc<"booksContacts"> | null = await this.ctx.db.get(id);
      if (!c || c.source !== "qbo") continue;
      const all = Array.from(new Set([...(c.qboTxnTypes ?? []), ...Array.from(types)])).sort();
      const kind = contactKindFromTxns(all);
      await this.ctx.db.patch(id, { qboTxnTypes: all, kind });
    }
  }
}

export async function findContact(ctx: MutationCtx, name: string) {
  const exact = await ctx.db.query("booksContacts").withIndex("by_name", (q) => q.eq("name", name)).first();
  if (exact) return exact;
  const lower = name.toLowerCase();
  return (await ctx.db.query("booksContacts").collect()).find((c) => c.name.toLowerCase() === lower) ?? null;
}

/** Attach names to the matching lines (same account and amount) of an already-imported entry. */
async function linkNames(
  ctx: MutationCtx,
  contacts: ContactResolver,
  entryId: Id<"booksEntries">,
  txnType: string,
  incoming: { accountName: string; debit: number; credit: number; name?: string }[],
  accountId: (name: string) => Promise<Id<"booksAccounts"> | null>,
) {
  if (!incoming.some((l) => l.name)) return 0;
  const lines = await ctx.db.query("booksLines").withIndex("by_entry", (q) => q.eq("entryId", entryId)).collect();
  const used = new Set<string>();
  let n = 0;
  for (const l of incoming) {
    if (!l.name) continue;
    const acct = await accountId(l.accountName);
    const hit = lines.find((x) => !used.has(x._id) && x.accountId === acct && x.debit === l.debit && x.credit === l.credit);
    if (!hit) continue;
    used.add(hit._id);
    const contactId = await contacts.resolve(l.name, txnType);
    if (!hit.contactId && contactId) {
      await ctx.db.patch(hit._id, { contactId });
      n++;
    }
  }
  return n;
}

const contactKind = v.union(v.literal("customer"), v.literal("vendor"), v.literal("contractor"), v.literal("other"));

/** QuickBooks customer/vendor contact lists: add new contacts, fill in blanks on existing ones. */
export const importContacts = mutation({
  args: {
    contacts: v.array(
      v.object({
        name: v.string(),
        kind: contactKind,
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        company: v.optional(v.string()),
        address: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { contacts }) => {
    const me = await requireBooksMember(ctx, { owner: true });
    if (contacts.length > 500) throw new ConvexError("Send at most 500 contacts per batch.");
    let created = 0;
    let updated = 0;
    for (const c of contacts) {
      const name = c.name.trim();
      if (!name) continue;
      const existing = await findContact(ctx, name);
      if (!existing) {
        await ctx.db.insert("booksContacts", {
          name,
          kind: c.kind,
          email: c.email,
          phone: c.phone,
          company: c.company,
          address: c.address,
          source: "qbo",
          active: true,
          createdAt: Date.now(),
        });
        created++;
        continue;
      }
      const patch: Partial<Record<"email" | "phone" | "company" | "address", string>> & { kind?: ContactKind } = {};
      for (const k of ["email", "phone", "company", "address"] as const) if (!existing[k] && c[k]) patch[k] = c[k];
      // QuickBooks' customer list is authoritative for "is a customer".
      if (existing.source === "qbo" && c.kind === "customer" && existing.kind !== "customer") patch.kind = "customer";
      if (Object.keys(patch).length) {
        await ctx.db.patch(existing._id, patch);
        updated++;
      }
    }
    await audit(ctx, me.email, "import.contacts", `${created} new, ${updated} updated`);
    return { created, updated };
  },
});
