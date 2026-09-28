import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ConversionSection } from "@/components/home/ConversionSection";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "SIRA | Computer Vision & AI Engineering Consultancy",
  description:
    "SIRA designs and ships custom computer vision, machine learning, and AI automation systems that work on real data. Book a free 30-minute call.",
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <CtaBanner />
      <ConversionSection />
    </div>
  );
}
