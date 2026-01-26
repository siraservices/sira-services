import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users (synced from WorkOS)
  users: defineTable({
    workosId: v.string(), // WorkOS user ID
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    profilePictureUrl: v.optional(v.string()),
    role: v.string(), // "admin" or "user"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workos_id", ["workosId"])
    .index("by_email", ["email"]),

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
