import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getSiteSections } from "@/lib/site-urls";

// Refresh hourly so newly published Convex posts/case studies enter the
// sitemap without waiting for a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sections = await getSiteSections();

  return sections.flatMap((section) =>
    section.urls.map((entry) => ({
      url: `${SITE_URL}${entry.path}`,
      // Only send lastmod when it's real; a fake "now" on every request
      // teaches Google to ignore the field site-wide.
      ...(entry.lastModified ? { lastModified: entry.lastModified } : {}),
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    })),
  );
}
