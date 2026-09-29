import type { Metadata } from "next";

/**
 * Canonical origin. Vercel serves the site on www and redirects the apex
 * domain to it, so canonicals, the sitemap and structured data must all use
 * www — otherwise every canonical points at a URL that redirects.
 */
export const SITE_URL = "https://www.sira.services";

/** Where "Book a call" buttons go. Override per environment if needed. */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL || "https://calendly.com/airadev/work";

export const CONTACT_EMAIL = "hello@sira.services";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/siradev",
  github: "https://github.com/siraservices",
};

export const FOUNDER_NAME = "Julio Aira";

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
 *
 * Pass `absoluteTitle: true` when the title already contains the brand so the
 * root "%s | SIRA" template is not appended twice.
 */
export function buildMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
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

/* ------------------------------------------------------------------ */
/* Structured data (JSON-LD)                                           */
/* ------------------------------------------------------------------ */

const ORG_ID = `${SITE_URL}/#organization`;
const FOUNDER_ID = `${SITE_URL}/about#founder`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: "SIRA",
        legalName: "Aira Development LLC",
        url: SITE_URL,
        logo: `${SITE_URL}/sira-mark.png`,
        image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
        email: CONTACT_EMAIL,
        description:
          "Engineer-led studio building machine learning, computer vision, and AI automation systems that run in production.",
        areaServed: "Worldwide",
        knowsAbout: [
          "Machine learning",
          "Computer vision",
          "AI process automation",
          "Retrieval-augmented generation",
          "Multi-agent AI systems",
          "MLOps",
        ],
        founder: { "@id": FOUNDER_ID },
        sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.github],
        potentialAction: {
          "@type": "ScheduleAction",
          target: BOOKING_URL,
          name: "Book a free 30-minute call",
        },
      },
      {
        "@type": "Person",
        "@id": FOUNDER_ID,
        name: FOUNDER_NAME,
        jobTitle: "Founder & AI Engineer",
        worksFor: { "@id": ORG_ID },
        url: `${SITE_URL}/about`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "SIRA",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function serviceJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${path}`,
    serviceType: name,
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
  };
}

export function articleJsonLd({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
  tags,
}: {
  title: string;
  description: string;
  path: string;
  publishedAt?: number;
  updatedAt?: number;
  tags?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    mainEntityOfPage: `${SITE_URL}${path}`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
    ...(publishedAt ? { datePublished: new Date(publishedAt).toISOString() } : {}),
    ...(updatedAt || publishedAt
      ? { dateModified: new Date(updatedAt ?? publishedAt!).toISOString() }
      : {}),
    ...(tags?.length ? { keywords: tags.join(", ") } : {}),
    author: { "@id": FOUNDER_ID, "@type": "Person", name: FOUNDER_NAME },
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
