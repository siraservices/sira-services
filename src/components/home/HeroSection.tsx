import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className={cn("min-h-[80vh] flex items-center py-24 px-6 bg-surface")}>
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display font-bold text-5xl md:text-7xl text-text leading-tight mb-6">
          Build AI Systems That{" "}
          <span className="text-gradient">Drive Real Business Results</span>
        </h1>
        <p className="text-text-body font-body text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          We help growth-stage companies and enterprises turn their data into
          competitive advantage — with AI strategy, reliable pipelines, and
          custom computer vision solutions.
        </p>
        <a
          href="#booking"
          className="inline-flex items-center justify-center gap-2 bg-cta text-cta-text font-display font-semibold px-8 py-4 rounded-lg hover:-translate-y-1 hover:shadow-cta-glow transition-all duration-200 cursor-pointer"
        >
          Book a Consultation
        </a>
      </div>
    </section>
  );
}
