import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { DEFAULT_OG_IMAGE, SITE_URL, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { CaseStudyContent } from "./CaseStudyContent";

const getCaseStudy = cache((slug: string) =>
  convexServer.query(api.caseStudies.getBySlug, { slug }),
);

// Content is CMS-backed in Convex; render fresh so metadata reflects the
// current published state instead of a stale Next.js Data Cache entry.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const path = `/case-studies/${params.slug}`;

  try {
    const cs = await getCaseStudy(params.slug);

    if (!cs || !cs.published) {
      return {
        title: "Case Study Not Found",
        description: "The case study you are looking for does not exist.",
        alternates: { canonical: path },
      };
    }

    // Keep titles under ~60 chars; the client name lives in the description/page.
    const title = cs.title;
    const description = cs.description;

    // Use the case study's own cover for link previews when it has one.
    // Covers are 1600x1000; site-relative paths are made absolute for crawlers.
    const ogImage = cs.imageUrl
      ? {
          url: cs.imageUrl.startsWith("/")
            ? `${SITE_URL}${cs.imageUrl}`
            : cs.imageUrl,
          width: 1600,
          height: 1000,
          alt: `${cs.title} — ${cs.client}`,
        }
      : DEFAULT_OG_IMAGE;

    return {
      title,
      description,
      alternates: { canonical: path },
      openGraph: {
        type: "article",
        title,
        description,
        url: path,
        siteName: "SIRA",
        locale: "en_US",
        images: [ogImage],
        tags: cs.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage.url],
      },
    };
  } catch {
    return { alternates: { canonical: path } };
  }
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const path = `/case-studies/${params.slug}`;
  let cs: Awaited<ReturnType<typeof getCaseStudy>> | undefined;
  try {
    cs = await getCaseStudy(params.slug);
  } catch {
    cs = undefined;
  }

  if (cs === null || (cs && !cs.published)) notFound();

  return (
    <>
      {cs && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Case Studies", path: "/case-studies" },
            { name: cs.title, path },
          ])}
        />
      )}
      <CaseStudyContent slug={params.slug} initialCaseStudy={cs} />
    </>
  );
}
