import type { Metadata } from "next";
import { api } from "../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { BlogList } from "./BlogList";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "AI & Machine Learning Blog",
  description:
    "Practical guides on machine learning, computer vision, AI agents, and automation — how to scope, build, and ship AI systems that hold up in production.",
  path: "/blog",
});

export default async function BlogPage() {
  // Server-fetch so post titles and links are in the initial HTML for crawlers.
  const initialPosts = await convexServer
    .query(api.posts.listPublished)
    .catch(() => undefined);

  return <BlogList initialPosts={initialPosts} />;
}
