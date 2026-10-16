import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import {
  DEFAULT_OG_IMAGE,
  FOUNDER_NAME,
  articleJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { BlogPostContent } from "./BlogPostContent";

// One Convex round-trip per request, shared by generateMetadata and the page.
const getPost = cache((slug: string) =>
  convexServer.query(api.posts.getBySlug, { slug }),
);

// Content is CMS-backed in Convex; render fresh so metadata reflects the
// current published state instead of a stale Next.js Data Cache entry.
export const dynamic = "force-dynamic";

/** Longest post title that still fits in results with the " | SIRA" suffix. */
const MAX_TITLE_WITH_BRAND = 52;
const MAX_DESCRIPTION = 155;

/** Truncates to 155 chars at a word boundary, adding an ellipsis if cut. */
function truncateDescription(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_DESCRIPTION) return trimmed;
  const slice = trimmed.slice(0, MAX_DESCRIPTION - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  return `${cut.replace(/[\s,;:.-]+$/, "")}…`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const path = `/blog/${params.slug}`;

  try {
    const post = await getPost(params.slug);

    if (!post || !post.published) {
      return {
        title: "Post Not Found",
        description: "The post you are looking for does not exist.",
        alternates: { canonical: path },
      };
    }

    const description = truncateDescription(post.excerpt);
    const publishedTime = post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined;

    return {
      // The root layout appends " | SIRA"; long titles would get cut off in
      // results, so drop the brand suffix once the title alone is long enough.
      title:
        post.title.length > MAX_TITLE_WITH_BRAND
          ? { absolute: post.title }
          : post.title,
      description,
      alternates: { canonical: path },
      openGraph: {
        type: "article",
        title: post.title,
        description,
        url: path,
        siteName: "SIRA",
        locale: "en_US",
        images: [DEFAULT_OG_IMAGE],
        authors: [FOUNDER_NAME],
        ...(publishedTime ? { publishedTime } : {}),
        tags: post.tags,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        images: [DEFAULT_OG_IMAGE.url],
      },
    };
  } catch {
    return { alternates: { canonical: path } };
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const path = `/blog/${params.slug}`;
  let post: Awaited<ReturnType<typeof getPost>> | undefined;
  try {
    post = await getPost(params.slug);
  } catch {
    // Convex unreachable — fall back to client-side loading.
    post = undefined;
  }

  // Real 404 status for missing/unpublished posts instead of a soft 404.
  if (post === null || (post && !post.published)) notFound();

  return (
    <>
      {post && (
        <>
          <JsonLd
            data={articleJsonLd({
              title: post.title,
              description: post.excerpt,
              path,
              publishedAt: post.publishedAt,
              updatedAt: post.updatedAt,
              tags: post.tags,
            })}
          />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: post.title, path },
            ])}
          />
        </>
      )}
      <BlogPostContent slug={params.slug} initialPost={post} />
    </>
  );
}
