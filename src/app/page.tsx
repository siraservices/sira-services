import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PillarsSection } from "@/components/home/PillarsSection";
import { ProtocolSection } from "@/components/home/ProtocolSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WorkSection } from "@/components/home/WorkSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ConversionSection } from "@/components/home/ConversionSection";
import { ScrollTriggerRefresh } from "@/components/ui/motion";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "SIRA | AI Automation Agency & Computer Vision Development",
  description:
    "AI automation agency in the Charlotte, NC area: custom AI, computer vision and document processing that work on real data, plus small business websites.",
  path: "/",
  absoluteTitle: true,
});

// The "Selected work" section reads published case studies from Convex.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div>
      <ScrollTriggerRefresh />
      <HeroSection />
      <FeaturesSection />
      <PillarsSection />
      <ProtocolSection />
      <ServicesSection />
      <WorkSection />
      <TestimonialsSection />
      <CtaBanner />
      <ConversionSection />
    </div>
  );
}
