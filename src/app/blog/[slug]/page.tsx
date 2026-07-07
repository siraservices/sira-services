import type { Metadata } from "next";
import { api } from "../../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { BlogPostContent } from "./BlogPostContent";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const path = `/blog/${params.slug}`;

  try {
    const post = await convexServer.query(api.posts.getBySlug, {
      slug: params.slug,
    });

    if (!post) {
      return {
        title: "Post Not Found",
        description: "The post you are looking for does not exist.",
        alternates: { canonical: path },
      };
    }

    const description = post.excerpt;
    const publishedTime = post.publishedAt
      ? new Date(post.publishedAt).toISOString()
      : undefined;

    return {
      title: post.title,
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
        authors: ["SIRA"],
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

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  return <BlogPostContent slug={params.slug} />;
}
