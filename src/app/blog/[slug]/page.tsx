"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const post = useQuery(api.posts.getBySlug, { slug });

  if (post === undefined) {
    return (
      <div className="pt-32 pb-20 px-6 bg-surface-alt min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-surface-hover rounded mb-10" />
            <div className="flex gap-2 mb-5">
              <div className="h-5 w-16 bg-surface-hover rounded" />
              <div className="h-5 w-20 bg-surface-hover rounded" />
            </div>
            <div className="h-10 w-3/4 bg-surface-hover rounded mb-4" />
            <div className="h-4 w-32 bg-surface-hover rounded mb-12" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-surface-hover rounded" />
              <div className="h-4 w-full bg-surface-hover rounded" />
              <div className="h-4 w-5/6 bg-surface-hover rounded" />
              <div className="h-4 w-full bg-surface-hover rounded" />
              <div className="h-4 w-2/3 bg-surface-hover rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="pt-32 pb-20 px-6 bg-surface-alt min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-display font-bold text-text mb-4">
            Post Not Found
          </h1>
          <p className="text-text-muted font-body mb-6">
            The post you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold text-primary hover:text-primary-light transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="pt-32 pb-20 px-6 bg-surface-alt min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="group inline-flex items-center text-sm font-display text-text-muted hover:text-primary transition-colors duration-200 mb-10 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Blog
        </Link>

        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary-50 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-text mb-4">
            {post.title}
          </h1>
          <time className="text-sm text-text-dim font-display">
            {post.publishedAt
              ? format(new Date(post.publishedAt), "MMMM d, yyyy")
              : "Draft"}
          </time>
        </header>

        <div
          className="prose prose-lg max-w-none font-body text-text prose-headings:font-display prose-headings:text-text prose-a:text-primary hover:prose-a:text-primary-light prose-strong:text-text prose-code:text-primary prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
