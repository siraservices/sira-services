import { cn } from "@/lib/utils";

export function CtaBanner() {
  return (
    <section className={cn("py-24 px-6 bg-surface-alt")}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-5xl text-text font-bold mb-6">
          Ready to Transform Your Business with AI?
        </h2>
        <p className="text-text-muted font-body text-lg mb-10">
          Book a free consultation and let&apos;s map out what&apos;s possible
          for your business.
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
