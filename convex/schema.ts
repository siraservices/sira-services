import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Blog posts
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    coverImage: v.optional(v.string()),
    tags: v.array(v.string()),
    published: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["published", "publishedAt"]),

  // Contact form submissions / leads
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    message: v.string(),
    source: v.optional(v.string()), // which page they came from
    status: v.string(), // "new", "contacted", "qualified", "closed"
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"]),
});
