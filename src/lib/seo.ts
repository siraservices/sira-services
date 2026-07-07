import type { Metadata } from "next";

export const SITE_URL = "https://sira.services";

export const DEFAULT_OG_IMAGE = {
  url: "/og/default.png",
  width: 1200,
  height: 630,
  alt: "SIRA — AI & ML Engineering",
};

/**
 * Builds `Metadata` for a standard (website) page: title, description, canonical,
 * OpenGraph and a matching Twitter card. Article pages build metadata inline so
 * they can set OpenGraph `type: "article"` with publishedTime/authors.
 */
export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "SIRA",
      type: "website",
      locale: "en_US",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
