import type { Metadata } from "next";
import { api } from "../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { CaseStudiesList } from "./CaseStudiesList";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "AI & Computer Vision Case Studies",
  description:
    "How SIRA ships AI that works in production — email classification, computer vision inspection, forecasting, and LLM automation projects with measured results.",
  path: "/case-studies",
});

export default async function CaseStudiesPage() {
  const initialCaseStudies = await convexServer
    .query(api.caseStudies.listPublished)
    .catch(() => undefined);

  return <CaseStudiesList initialCaseStudies={initialCaseStudies} />;
}
