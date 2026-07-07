import type { Metadata } from "next";
import { api } from "../../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { CaseStudyContent } from "./CaseStudyContent";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const path = `/case-studies/${params.slug}`;

  try {
    const cs = await convexServer.query(api.caseStudies.getBySlug, {
      slug: params.slug,
    });

    if (!cs) {
      return {
        title: "Case Study Not Found",
        description: "The case study you are looking for does not exist.",
        alternates: { canonical: path },
      };
    }

    const title = `${cs.title} — ${cs.client}`;
    const description = cs.description;

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
        images: [DEFAULT_OG_IMAGE],
        tags: cs.tags,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [DEFAULT_OG_IMAGE.url],
      },
    };
  } catch {
    return { alternates: { canonical: path } };
  }
}

export default function CaseStudyDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return <CaseStudyContent slug={params.slug} />;
}
