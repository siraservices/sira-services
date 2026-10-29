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
    company: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Journal entries are append-only: corrections are reversals, never edits.
  booksEntries: defineTable({
    date: v.string(), // YYYY-MM-DD
    memo: v.optional(v.string()),
    source: v.union(
      v.literal("manual"),
      v.literal("import"),
      v.literal("bank"),
      v.literal("invoice"),
      v.literal("payment"),
      v.literal("expense"),
    ),
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
    .index("by_sourceRef", ["sourceRef"])
    .index("by_txnType_num", ["txnType", "num"]),

  booksLines: defineTable({
    entryId: v.id("booksEntries"),
    accountId: v.id("booksAccounts"),
    contactId: v.optional(v.id("booksContacts")),
    date: v.string(), // copied from the entry for range queries
    debit: v.number(), // cents
    credit: v.number(), // cents
    memo: v.optional(v.string()),
    recId: v.optional(v.id("booksRecs")), // set when checked off on a bank/card statement
  })
    .index("by_entry", ["entryId"])
    .index("by_date", ["date"])
    .index("by_account_date", ["accountId", "date"])
    .index("by_rec", ["recId"]),

  // One row per bank or card statement reconciled. Balances are in the
  // account's normal direction (checking: money you have; card: money owed).
  booksRecs: defineTable({
    accountId: v.id("booksAccounts"),
    statementDate: v.string(),
    statementBalance: v.number(), // cents
    beginningBalance: v.number(), // cents, the previous statement's ending balance
    status: v.union(v.literal("open"), v.literal("done")),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_account_date", ["accountId", "statementDate"]),

  booksInvoices: defineTable({
    number: v.string(),
    contactId: v.id("booksContacts"),
    issueDate: v.string(), // YYYY-MM-DD
    dueDate: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("partial"),
      v.literal("paid"),
      v.literal("void"),
    ),
    lines: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        rate: v.number(), // cents
        accountId: v.id("booksAccounts"),
      }),
    ),
    total: v.number(), // cents
    amountPaid: v.number(), // cents
    memo: v.optional(v.string()), // shown on the invoice
    entryId: v.optional(v.id("booksEntries")), // posted when sent
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_number", ["number"])
    .index("by_status", ["status"])
    .index("by_contact", ["contactId"]),

  booksPayments: defineTable({
    invoiceId: v.id("booksInvoices"),
    date: v.string(),
    amount: v.number(), // cents received from the customer
    fee: v.optional(v.number()), // cents kept by the processor
    depositAccountId: v.id("booksAccounts"),
    method: v.optional(v.string()),
    entryId: v.id("booksEntries"),
    reversedEntryId: v.optional(v.id("booksEntries")),
    createdAt: v.number(),
  }).index("by_invoice", ["invoiceId"]),

  // Receipt files (Convex storage), attached to journal entries.
  booksReceipts: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.optional(v.string()),
    entryId: v.optional(v.id("booksEntries")),
    uploadedBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_entry", ["entryId"])
    .index("by_storage", ["storageId"]),

  // Bank feed: rows from bank/card CSV files waiting for review.
  // amount is signed cents: + money in, - money out (see booksOpsLib.ts).
  booksBankTxns: defineTable({
    accountId: v.id("booksAccounts"), // the bank or card account
    date: v.string(),
    description: v.string(),
    amount: v.number(),
    hash: v.string(),
    status: v.union(v.literal("pending"), v.literal("posted"), v.literal("matched"), v.literal("excluded")),
    entryId: v.optional(v.id("booksEntries")),
    batch: v.string(),
    importedAt: v.number(),
  })
    .index("by_account_hash", ["accountId", "hash"])
    .index("by_account_status", ["accountId", "status"])
    .index("by_status", ["status"])
    .index("by_entry", ["entryId"]),

  // "Description contains X → category Y" rules for the bank feed.
  booksRules: defineTable({
    contains: v.string(),
    accountId: v.id("booksAccounts"),
    contactId: v.optional(v.id("booksContacts")),
    active: v.boolean(),
    createdAt: v.number(),
  }),

  booksAudit: defineTable({
    at: v.number(),
    actor: v.string(),
    action: v.string(),
    detail: v.optional(v.string()),
  }).index("by_at", ["at"]),
});
