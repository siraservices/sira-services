"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

export default function BlogPage() {
  const posts = useQuery(api.posts.listPublished);

  return (
    <div className="pt-32 pb-20 px-6 bg-surface-muted dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-primary-light mb-3 block">
            Blog
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-text dark:text-white mb-6">
            Insights &amp; ideas
          </h1>
          <p className="text-lg font-body text-text-muted dark:text-gray-400 leading-relaxed">
            Thoughts on machine learning, AI implementation, and building
            intelligent systems.
          </p>
        </div>

        {posts === undefined ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl border border-surface-border dark:border-gray-700 p-6 shadow-soft"
              >
                <div className="animate-pulse">
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-16 bg-surface-hover dark:bg-gray-700 rounded" />
                    <div className="h-5 w-20 bg-surface-hover dark:bg-gray-700 rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-surface-hover dark:bg-gray-700 rounded mb-3" />
                  <div className="h-4 w-full bg-surface-hover dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-surface-hover dark:bg-gray-700 rounded mb-4" />
                  <div className="h-3 w-24 bg-surface-hover dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-text-muted dark:text-gray-400 font-body text-lg">
              No posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post._id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block bg-white dark:bg-gray-800 rounded-xl border border-surface-border dark:border-gray-700 p-6 shadow-soft hover:shadow-card transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary-50 text-primary dark:bg-amber-900/30 dark:text-amber-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-lg font-display font-bold text-text dark:text-white group-hover:text-primary transition-colors duration-200 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-sm font-body text-text-muted dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 md:flex-col md:items-end md:gap-3 shrink-0">
                      <time className="text-xs text-text-dim dark:text-gray-500 font-display">
                        {post.publishedAt
                          ? format(new Date(post.publishedAt), "MMM d, yyyy")
                          : "Draft"}
                      </time>
                      <span className="text-primary text-xs font-display font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        Read <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
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
