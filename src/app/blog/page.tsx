"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

export default function BlogPage() {
  const posts = useQuery(api.posts.listPublished);

  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-gray-600">
            Insights on machine learning, AI implementation, and building
            intelligent systems.
          </p>
        </div>

        {posts === undefined ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-400">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p>No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post._id}
                className="border-b border-gray-100 pb-8 last:border-0"
              >
                <Link href={`/blog/${post.slug}`} className="group">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <time className="text-sm text-gray-500">
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                        : "Draft"}
                    </time>
                    <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
