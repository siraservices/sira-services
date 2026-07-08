import type { MetadataRoute } from "next";
import { api } from "../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { services } from "@/lib/services";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export interface SiteUrl {
  /** Root-relative path, e.g. "/about". */
  path: string;
  /** Human-readable label for the HTML sitemap. */
  label: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  lastModified?: Date;
}

export interface SiteSection {
  title: string;
  urls: SiteUrl[];
}

const companyUrls: SiteUrl[] = [
  { path: "/", label: "Home", changeFrequency: "monthly", priority: 1.0 },
  { path: "/about", label: "About", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services", label: "Services", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", label: "Contact", changeFrequency: "monthly", priority: 0.8 },
];

const serviceUrls: SiteUrl[] = services.map((service) => ({
  path: `/services/${service.slug}`,
  label: service.title,
  changeFrequency: "monthly",
  priority: 0.7,
}));

/**
 * Single source of truth for every public URL on the site, grouped by section.
 * Consumed by both `sitemap.ts` (machine-readable sitemap.xml) and
 * `sitemap/page.tsx` (human-readable /sitemap). Dynamic Convex-backed slugs
 * (blog posts, case studies) are fetched at request time; if Convex is
 * unreachable the section falls back to its static landing page only.
 */
export async function getSiteSections(): Promise<SiteSection[]> {
  let blogPostUrls: SiteUrl[] = [];
  let caseStudyUrls: SiteUrl[] = [];

  try {
    const [posts, caseStudies] = await Promise.all([
      convexServer.query(api.posts.listPublished),
      convexServer.query(api.caseStudies.listPublished),
    ]);

    blogPostUrls = posts.map((post) => ({
      path: `/blog/${post.slug}`,
      label: post.title,
      changeFrequency: "yearly",
      priority: 0.6,
      lastModified: new Date(post.updatedAt ?? post.publishedAt ?? post.createdAt),
    }));

    caseStudyUrls = caseStudies.map((cs) => ({
      path: `/case-studies/${cs.slug}`,
      label: cs.title,
      changeFrequency: "yearly",
      priority: 0.6,
      lastModified: new Date(cs.updatedAt ?? cs.publishedAt ?? cs.createdAt),
    }));
  } catch {
    // Convex unreachable at build time — fall back to static landing pages only.
  }

  return [
    { title: "Company", urls: companyUrls },
    { title: "Services", urls: serviceUrls },
    {
      title: "Blog",
      urls: [
        { path: "/blog", label: "Blog", changeFrequency: "weekly", priority: 0.8 },
        ...blogPostUrls,
      ],
    },
    {
      title: "Case Studies",
      urls: [
        { path: "/case-studies", label: "Case Studies", changeFrequency: "weekly", priority: 0.8 },
        ...caseStudyUrls,
      ],
    },
  ];
}
