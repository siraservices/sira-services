import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
