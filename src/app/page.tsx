import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ConversionSection } from "@/components/home/ConversionSection";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "AI & Machine Learning Engineering for Business",
  description:
    "SIRA builds custom machine learning, computer vision, and AI automation systems that ship to production. Turn your data into reliable, measurable results.",
  path: "/",
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
