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
  title: "SIRA | Computer Vision, AI Engineering & Websites",
  description:
    "SIRA designs and ships custom computer vision, machine learning, and AI automation systems that work on real data, and builds and maintains websites for small businesses. Book a free 30-minute call.",
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
