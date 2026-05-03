import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Submit a new lead (public - from contact form)
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    message: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });

    // Fire email notifications asynchronously — lead is saved regardless of email outcome
    await ctx.scheduler.runAfter(0, internal.email.sendLeadNotifications, {
      name: args.name,
      email: args.email,
      company: args.company,
      message: args.message,
    });

    return leadId;
  },
});

// List all leads (for admin dashboard)
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("leads").order("desc").collect();
  },
});

// Update lead status
export const updateStatus = mutation({
  args: {
    id: v.id("leads"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Delete a lead
export const remove = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
