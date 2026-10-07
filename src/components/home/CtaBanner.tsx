import { QualificationIntake } from "@/components/home/QualificationIntake";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";

export function CtaBanner() {
  return (
    <section className="px-6 pb-8 sm:px-10 lg:px-16">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-5xl border border-divider bg-surface px-6 py-16 text-center shadow-card sm:px-12 sm:py-20">
        <div aria-hidden="true" className="grid-bg absolute inset-0" />
        <div aria-hidden="true" className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <SectionHeading
            align="center"
            eyebrow="Two minutes"
            title="Not sure your project is a fit?"
            flourish="Get an honest read first."
            description="Answer six short questions about your data, timeline, and goals. You get a straight answer on fit before anyone schedules a call."
          />
          <div data-reveal className="mt-10 flex justify-center">
            <QualificationIntake variant="banner" buttonText="Check project fit" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
