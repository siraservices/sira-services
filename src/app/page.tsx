import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ConversionSection } from "@/components/home/ConversionSection";

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
