import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all published case studies (for public listing)
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const caseStudies = await ctx.db
      .query("caseStudies")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
    return caseStudies;
  },
});

// Get a single case study by slug (for public detail page)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const caseStudy = await ctx.db
      .query("caseStudies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return caseStudy;
  },
});

// Get all case studies including drafts (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const caseStudies = await ctx.db
      .query("caseStudies")
      .order("desc")
      .collect();
    return caseStudies;
  },
});

// Create a new case study
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    client: v.string(),
    description: v.string(),
    challenge: v.string(),
    solution: v.string(),
    results: v.string(),
    tags: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Unauthorized");

    const now = Date.now();
    const id = await ctx.db.insert("caseStudies", {
      ...args,
      publishedAt: args.published ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

// Update an existing case study
export const update = mutation({
  args: {
    id: v.id("caseStudies"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    client: v.optional(v.string()),
    description: v.optional(v.string()),
    challenge: v.optional(v.string()),
    solution: v.optional(v.string()),
    results: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Unauthorized");

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Case study not found");

    const publishedAt =
      updates.published && !existing.published
        ? Date.now()
        : existing.publishedAt;

    await ctx.db.patch(id, {
      ...updates,
      publishedAt,
      updatedAt: Date.now(),
    });
  },
});

// Delete a case study
export const remove = mutation({
  args: { id: v.id("caseStudies") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
