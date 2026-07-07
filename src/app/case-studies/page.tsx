import type { Metadata } from "next";
import { CaseStudiesList } from "./CaseStudiesList";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Case Studies",
  description:
    "See how SIRA helps organizations ship AI that works in production — from demand forecasting to computer vision and intelligent automation.",
  path: "/case-studies",
});

export default function CaseStudiesPage() {
  return <CaseStudiesList />;
}
