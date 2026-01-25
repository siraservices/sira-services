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

// Seed initial blog post data
export const seedBlogPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPost = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) =>
        q.eq("slug", "computer-vision-transforming-quality-control-manufacturing")
      )
      .first();

    if (existingPost) {
      return { message: "Blog post already exists", postId: existingPost._id };
    }

    const now = Date.now();
    const postId = await ctx.db.insert("posts", {
      title: "How Computer Vision is Transforming Quality Control in Manufacturing",
      slug: "computer-vision-transforming-quality-control-manufacturing",
      excerpt:
        "Discover how computer vision technology is revolutionizing manufacturing quality control through automated defect detection, real-time monitoring systems, and significant cost savings.",
      content: `<p>Manufacturing has always been driven by the pursuit of perfection. Today, computer vision is leading a new revolution in quality control, enabling manufacturers to detect defects with unprecedented accuracy, monitor production in real-time, and achieve substantial cost savings. Let's explore how this transformative technology is reshaping the industry.</p>

<h2>Defect Detection: Seeing What the Human Eye Cannot</h2>

<p>Traditional quality control relied heavily on human inspectors, whose effectiveness could be limited by fatigue, inconsistency, and the sheer volume of products requiring inspection. Computer vision systems have changed this paradigm entirely.</p>

<p>Modern computer vision systems use high-resolution cameras and sophisticated deep learning algorithms to analyze products at speeds and accuracy levels impossible for human inspectors. These systems can detect microscopic cracks, surface imperfections, color variations, and dimensional inaccuracies in milliseconds.</p>

<p>For example, in semiconductor manufacturing, computer vision systems inspect silicon wafers for defects as small as a few nanometers. In automotive manufacturing, they verify paint quality, weld integrity, and component alignment with sub-millimeter precision. The result is a dramatic reduction in defective products reaching customers.</p>

<p>What makes these systems particularly powerful is their ability to learn and improve over time. Machine learning models trained on thousands of defect examples become increasingly accurate at identifying even subtle anomalies that might escape initial detection parameters.</p>

<h2>Real-Time Monitoring: Continuous Vigilance on the Production Line</h2>

<p>Beyond individual product inspection, computer vision enables comprehensive real-time monitoring of entire production processes. This continuous oversight provides manufacturers with unprecedented visibility into their operations.</p>

<p>Smart cameras positioned throughout the production line capture and analyze video feeds continuously. These systems can track production flow, identify bottlenecks, monitor equipment performance, and even predict maintenance needs before failures occur.</p>

<p>Real-time monitoring also enables immediate response to quality issues. When a defect pattern emerges, the system can alert operators instantly, allowing them to address the root cause before it affects additional products. This proactive approach minimizes waste and prevents larger quality incidents.</p>

<p>Integration with Industrial Internet of Things (IIoT) platforms amplifies these capabilities. Computer vision data combined with sensor readings, machine parameters, and environmental conditions creates a comprehensive picture of production health, enabling data-driven decision-making at every level.</p>

<h2>Cost Savings: The Business Case for Computer Vision</h2>

<p>The financial benefits of implementing computer vision in quality control are compelling and measurable. Manufacturers across industries report significant returns on their investments.</p>

<p><strong>Reduced Inspection Costs:</strong> Automated inspection systems can operate 24/7 without breaks, vacations, or training time. A single computer vision system can often replace multiple human inspectors while providing more consistent results.</p>

<p><strong>Lower Defect Rates:</strong> By catching defects earlier in the production process, manufacturers avoid the compounding costs of processing defective materials through subsequent production stages. Early detection can reduce scrap rates by 50% or more.</p>

<p><strong>Decreased Warranty Claims:</strong> Higher quality products mean fewer returns and warranty claims. For manufacturers of high-value goods, even a small improvement in outgoing quality can translate to millions in avoided warranty costs.</p>

<p><strong>Improved Yield:</strong> Real-time process monitoring enables continuous optimization, improving overall production yield. Manufacturers commonly report yield improvements of 10-20% after implementing comprehensive computer vision systems.</p>

<p><strong>Enhanced Brand Value:</strong> Consistent quality builds customer trust and brand reputation. In competitive markets, a reputation for quality can command premium pricing and customer loyalty.</p>

<h2>Looking Forward</h2>

<p>The integration of computer vision into manufacturing quality control is still evolving. Advances in edge computing enable faster, more distributed processing. New sensor technologies expand what computer vision systems can perceive. And continued improvements in AI algorithms make these systems ever more capable and adaptable.</p>

<p>For manufacturers considering computer vision adoption, the question is no longer whether to implement these technologies, but how quickly they can begin reaping the benefits. Those who embrace this transformation are positioning themselves at the forefront of manufacturing excellence.</p>`,
      tags: ["computer-vision", "manufacturing"],
      published: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { message: "Blog post created and published", postId };
  },
});
