import type { Metadata } from "next";
import { BlogList } from "./BlogList";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Insights and ideas on machine learning, AI implementation, and building intelligent systems that ship to production.",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogList />;
}
