import type { Metadata } from "next";
import { api } from "../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { CaseStudiesList } from "./CaseStudiesList";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "AI, Computer Vision & Website Case Studies",
  description:
    "Real SIRA projects: a 67 FPS poker vision pipeline, AI-generated image detection for insurance claims, an LLM email classifier and small business websites.",
  path: "/case-studies",
});

export default async function CaseStudiesPage() {
  const initialCaseStudies = await convexServer
    .query(api.caseStudies.listPublished)
    .catch(() => undefined);

  return <CaseStudiesList initialCaseStudies={initialCaseStudies} />;
}
