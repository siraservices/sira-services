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
      <div className="py-16 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="py-16 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-amber-500 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="py-16 px-4 bg-gray-900">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-400 hover:text-amber-500 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm bg-amber-900/30 text-amber-500 px-3 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
          <time className="text-gray-500">
            {post.publishedAt
              ? format(new Date(post.publishedAt), "MMMM d, yyyy")
              : "Draft"}
          </time>
        </header>

        <div
          className="prose text-gray-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
