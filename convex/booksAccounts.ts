import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { audit, requireBooksMember } from "./booksAuth";

const accountType = v.union(
  v.literal("asset"),
  v.literal("liability"),
  v.literal("equity"),
  v.literal("income"),
  v.literal("expense"),
);

/** Starter chart for a single-member LLC (Schedule C), named like QBO's. */
const STARTER_CHART: { name: string; type: "asset" | "liability" | "equity" | "income" | "expense"; isCash?: boolean }[] = [
  { name: "Chase Business Checking Account", type: "asset", isCash: true },
  { name: "Accounts Receivable (A/R)", type: "asset" },
  { name: "Business Chase Credit Card", type: "liability", isCash: true },
  { name: "Owner draws", type: "equity" },
  { name: "Owner investments", type: "equity" },
  { name: "Opening balance equity", type: "equity" },
  { name: "Services", type: "income" },
  { name: "Other income", type: "income" },
  { name: "Advertising & marketing", type: "expense" },
  { name: "Office expenses:Software & apps", type: "expense" },
  { name: "Office expenses:Office supplies", type: "expense" },
  { name: "Business licences", type: "expense" },
  { name: "Contract labor", type: "expense" },
  { name: "Legal & accounting services", type: "expense" },
  { name: "General business expenses:Bank fees & service charges", type: "expense" },
  { name: "General business expenses:Continuing education", type: "expense" },
  { name: "Travel", type: "expense" },
  { name: "Meals", type: "expense" },
];

export const list = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, { includeInactive }) => {
    await requireBooksMember(ctx);
    const all = await ctx.db.query("booksAccounts").collect();
    return all
      .filter((a) => includeInactive || a.active)
      .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: accountType,
    code: v.optional(v.string()),
    detailType: v.optional(v.string()),
    isCash: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const me = await requireBooksMember(ctx);
    const name = args.name.trim();
    if (!name) throw new ConvexError("Name is required.");
    const dupe = await ctx.db
      .query("booksAccounts")
      .withIndex("by_name", (q) => q.eq("name", name))
      .unique();
    if (dupe) throw new ConvexError(`"${name}" already exists.`);
    const id = await ctx.db.insert("booksAccounts", { ...args, name, active: true, createdAt: Date.now() });
    await audit(ctx, me.email, "account.create", name);
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("booksAccounts"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    isCash: v.optional(v.boolean()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const me = await requireBooksMember(ctx);
    const acct = await ctx.db.get(id);
    if (!acct) throw new ConvexError("Account not found.");
    if (patch.name !== undefined) {
      const name = patch.name.trim();
      if (!name) throw new ConvexError("Name is required.");
      const dupe = await ctx.db
        .query("booksAccounts")
        .withIndex("by_name", (q) => q.eq("name", name))
        .unique();
      if (dupe && dupe._id !== id) throw new ConvexError(`"${name}" already exists.`);
      patch.name = name;
    }
    // Type is fixed after creation: changing it would silently move history
    // between the P&L and the balance sheet.
    await ctx.db.patch(id, patch);
    await audit(ctx, me.email, "account.update", `${acct.name} ${JSON.stringify(patch)}`);
  },
});

/** Create the starter chart. Skips names that already exist. */
export const seedStarterChart = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await requireBooksMember(ctx, { owner: true });
    let created = 0;
    for (const a of STARTER_CHART) {
      const exists = await ctx.db
        .query("booksAccounts")
        .withIndex("by_name", (q) => q.eq("name", a.name))
        .unique();
      if (exists) continue;
      await ctx.db.insert("booksAccounts", { ...a, active: true, createdAt: Date.now() });
      created++;
    }
    await audit(ctx, me.email, "account.seed", `${created} created`);
    return created;
  },
});
