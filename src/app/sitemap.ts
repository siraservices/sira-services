import type { MetadataRoute } from "next";
import { api } from "../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/case-studies`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const [posts, caseStudies] = await Promise.all([
      convexServer.query(api.posts.listPublished),
      convexServer.query(api.caseStudies.listPublished),
    ]);

    for (const post of posts) {
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt ?? post.createdAt),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }

    for (const cs of caseStudies) {
      entries.push({
        url: `${SITE_URL}/case-studies/${cs.slug}`,
        lastModified: new Date(cs.updatedAt ?? cs.publishedAt ?? cs.createdAt),
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }
  } catch {
    // If Convex is unreachable at build time, fall back to static routes only.
  }

  return entries;
}
