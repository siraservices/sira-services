import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { normalBalance } from "./booksLib";
import { audit, requireBooksMember } from "./booksAuth";

const kind = v.union(v.literal("customer"), v.literal("vendor"), v.literal("contractor"), v.literal("other"));

export const list = query({
  args: { kind: v.optional(kind), includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, { kind: k, includeInactive }) => {
    await requireBooksMember(ctx);
    const all = await ctx.db.query("booksContacts").collect();
    return all
      .filter((c) => (includeInactive || c.active) && (!k || c.kind === k))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    kind,
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await requireBooksMember(ctx);
    const name = args.name.trim();
    if (!name) throw new ConvexError("Name is required.");
    const id = await ctx.db.insert("booksContacts", {
      ...args,
      name,
      email: args.email?.trim() || undefined,
      active: true,
      createdAt: Date.now(),
    });
    await audit(ctx, me.email, "contact.create", name);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("booksContacts"),
    name: v.optional(v.string()),
    kind: v.optional(kind),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const me = await requireBooksMember(ctx);
    const c = await ctx.db.get(id);
    if (!c) throw new ConvexError("Contact not found.");
    if (patch.name !== undefined && !patch.name.trim()) throw new ConvexError("Name is required.");
    await ctx.db.patch(id, patch);
    await audit(ctx, me.email, "contact.update", c.name);
  },
});

/** Every contact with lifetime totals, for the Contacts page. */
export const summary = query({
  args: {},
  handler: async (ctx) => {
    await requireBooksMember(ctx);
    const [contacts, accounts] = await Promise.all([
      ctx.db.query("booksContacts").collect(),
      ctx.db.query("booksAccounts").collect(),
    ]);
    const acct = new Map(accounts.map((a) => [a._id as string, a]));
    const out = [];
    for (const c of contacts) {
      const lines = await ctx.db
        .query("booksLines")
        .withIndex("by_contact_date", (q) => q.eq("contactId", c._id))
        .collect();
      let earned = 0; // income from this customer
      let spent = 0; // expenses paid to this vendor
      let owed = 0; // what they still owe you (A/R)
      const entries = new Set<string>();
      for (const l of lines) {
        const a = acct.get(l.accountId);
        if (!a) continue;
        entries.add(l.entryId);
        if (a.type === "income") earned += normalBalance("income", l.debit, l.credit);
        else if (a.type === "expense") spent += normalBalance("expense", l.debit, l.credit);
        else if (a.type === "asset" && /receivable/i.test(a.name)) owed += l.debit - l.credit;
      }
      out.push({
        ...c,
        earned,
        spent,
        owed,
        transactions: entries.size,
        firstDate: lines[0]?.date ?? null,
        lastDate: lines.length ? lines[lines.length - 1].date : null,
      });
    }
    return out.sort((a, b) => (b.lastDate ?? "").localeCompare(a.lastDate ?? "") || a.name.localeCompare(b.name));
  },
});

/** A contact's transactions, newest first. */
export const activity = query({
  args: { id: v.id("booksContacts") },
  handler: async (ctx, { id }) => {
    await requireBooksMember(ctx);
    const lines = await ctx.db
      .query("booksLines")
      .withIndex("by_contact_date", (q) => q.eq("contactId", id))
      .order("desc")
      .take(500);
    const seen = new Set<string>();
    const rows = [];
    for (const l of lines) {
      if (seen.has(l.entryId)) continue;
      seen.add(l.entryId);
      const e = await ctx.db.get(l.entryId);
      if (!e) continue;
      const all = await ctx.db.query("booksLines").withIndex("by_entry", (q) => q.eq("entryId", l.entryId)).collect();
      rows.push({
        entryId: e._id,
        date: e.date,
        txnType: e.txnType ?? null,
        num: e.num ?? null,
        memo: e.memo ?? null,
        amount: all.reduce((s, x) => s + x.debit, 0),
        reversed: !!e.reversedById || !!e.reversesId,
      });
      if (rows.length >= 100) break;
    }
    const invoices = (await ctx.db.query("booksInvoices").withIndex("by_contact", (q) => q.eq("contactId", id)).collect())
      .filter((i) => i.status !== "draft" && i.status !== "void")
      .map((i) => ({ _id: i._id, number: i.number, issueDate: i.issueDate, dueDate: i.dueDate, status: i.status, total: i.total, amountPaid: i.amountPaid }));
    return { rows, invoices };
  },
});
