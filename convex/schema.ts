import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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

  // Case studies / portfolio
  caseStudies: defineTable({
    title: v.string(),
    slug: v.string(),
    client: v.string(),
    description: v.string(),
    challenge: v.string(),
    solution: v.string(),
    results: v.string(),
    tags: v.array(v.string()),
    // Cover image: absolute URL or a site-relative path like /images/case-studies/x.jpg
    imageUrl: v.optional(v.string()),
    // Public URL of the delivered site/app, shown as a "Visit live site" link
    liveUrl: v.optional(v.string()),
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
    source: v.optional(v.string()),
    serviceInterest: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    // Qualification intake fields
    projectMaturity: v.optional(v.string()),
    successCriteria: v.optional(v.string()),
    biggestRisk: v.optional(v.string()),
    decisionRole: v.optional(v.string()),
    // Computed on submit: "qualified" | "nurture"
    qualificationTier: v.optional(v.string()),
    // Lead-magnet fields (e.g. Sira Clips toolkit download)
    teamSize: v.optional(v.string()),
    videoVolume: v.optional(v.string()),
    wantsInstall: v.optional(v.string()),
    downloadToken: v.optional(v.string()),
    downloadCount: v.optional(v.number()),
    lastDownloadAt: v.optional(v.number()),
    status: v.string(), // "new", "contacted", "qualified", "closed"
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_downloadToken", ["downloadToken"]),

  // ── Sira Books (private bookkeeping, /admin/books) ──────────────────────
  // Every Books function checks the caller against booksMembers first
  // (convex/booksAuth.ts). Money is integer cents.

  // Who may open Books. Seeded with the owner; others only by his invite.
  booksMembers: defineTable({
    email: v.string(), // lowercase
    role: v.union(v.literal("owner"), v.literal("member")),
    // WorkOS user ID, bound on first verified sign-in.
    userId: v.optional(v.string()),
    active: v.boolean(),
    invitedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),

  booksAccounts: defineTable({
    name: v.string(), // full name, e.g. "Office expenses:Software & apps"
    type: v.union(
      v.literal("asset"),
      v.literal("liability"),
      v.literal("equity"),
      v.literal("income"),
      v.literal("expense"),
    ),
    code: v.optional(v.string()),
    detailType: v.optional(v.string()),
    // Shown on the dashboard as cash (bank / credit card).
    isCash: v.optional(v.boolean()),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"]),

  booksContacts: defineTable({
    name: v.string(),
    kind: v.union(v.literal("customer"), v.literal("vendor"), v.literal("contractor"), v.literal("other")),
    email: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Journal entries are append-only: corrections are reversals, never edits.
  booksEntries: defineTable({
    date: v.string(), // YYYY-MM-DD
    memo: v.optional(v.string()),
    source: v.union(v.literal("manual"), v.literal("import"), v.literal("bank"), v.literal("invoice")),
    sourceRef: v.optional(v.string()), // de-dupe key for imports
    txnType: v.optional(v.string()), // e.g. "Expense", "Invoice" (from QBO)
    num: v.optional(v.string()),
    total: v.number(), // cents (sum of debits)
    reversesId: v.optional(v.id("booksEntries")),
    reversedById: v.optional(v.id("booksEntries")),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_sourceRef", ["sourceRef"]),

  booksLines: defineTable({
    entryId: v.id("booksEntries"),
    accountId: v.id("booksAccounts"),
    contactId: v.optional(v.id("booksContacts")),
    date: v.string(), // copied from the entry for range queries
    debit: v.number(), // cents
    credit: v.number(), // cents
    memo: v.optional(v.string()),
  })
    .index("by_entry", ["entryId"])
    .index("by_date", ["date"])
    .index("by_account_date", ["accountId", "date"]),

  booksAudit: defineTable({
    at: v.number(),
    actor: v.string(),
    action: v.string(),
    detail: v.optional(v.string()),
  }).index("by_at", ["at"]),
});
