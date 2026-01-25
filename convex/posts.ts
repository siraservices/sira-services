import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all published posts (for public blog listing)
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
    return posts;
  },
});

// Get a single post by slug (for public blog post page)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return post;
  },
});

// Get all posts including drafts (for admin)
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    return posts;
  },
});

// Create a new post
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    coverImage: v.optional(v.string()),
    tags: v.array(v.string()),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const postId = await ctx.db.insert("posts", {
      ...args,
      publishedAt: args.published ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
    return postId;
  },
});

// Update an existing post
export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Post not found");

    // If publishing for the first time, set publishedAt
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

// Delete a post
export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
