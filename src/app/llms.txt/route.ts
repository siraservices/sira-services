import { CONTACT_EMAIL, BOOKING_URL, SITE_URL } from "@/lib/seo";
import { services } from "@/lib/services";
import { getSiteSections } from "@/lib/site-urls";

// Same cadence as sitemap.xml so new posts and case studies show up here too.
export const revalidate = 3600;

/**
 * /llms.txt (https://llmstxt.org): a plain-markdown map of the site for AI
 * answer engines. Built from the same URL source as the sitemap so the two
 * never drift apart.
 */
export async function GET() {
  const sections = await getSiteSections();
  const servicePaths = new Set(services.map((s) => `/services/${s.slug}`));

  const lines: string[] = [
    "# SIRA",
    "",
    "> SIRA (Aira Development LLC) is an engineer-led AI automation agency based in Charlotte, NC, serving clients across the US. It builds custom AI and machine learning models, computer vision systems, AI document processing and business process automation, AI agents, and small business websites with ongoing maintenance.",
    "",
    `Founder: Julio Aira, licensed Professional Engineer and AI engineer. Contact: ${CONTACT_EMAIL}. Book a free 30-minute call: ${BOOKING_URL}. Languages: English and Spanish.`,
    "",
    "## Services",
    "",
    ...services.map(
      (s) => `- [${s.seoTitle}](${SITE_URL}/services/${s.slug}): ${s.metaDescription}`,
    ),
  ];

  for (const section of sections) {
    const urls = section.urls.filter(
      (u) => !servicePaths.has(u.path) && !["/privacy", "/terms"].includes(u.path),
    );
    if (!urls.length) continue;
    lines.push("", `## ${section.title}`, "", ...urls.map((u) => `- [${u.label}](${SITE_URL}${u.path})`));
  }

  lines.push("", "## Optional", "", `- [Privacy](${SITE_URL}/privacy)`, `- [Terms](${SITE_URL}/terms)`, "");

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
