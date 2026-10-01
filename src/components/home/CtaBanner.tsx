import { QualificationIntake } from "@/components/home/QualificationIntake";

export function CtaBanner() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-5 font-display text-3xl font-bold tracking-tight text-text md:text-5xl">
          Not sure your project is a fit?
        </h2>
        <p className="mb-10 text-lg text-text-muted">
          Answer six short questions about your data, timeline, and goals. You
          get an honest read on fit before anyone schedules a call.
        </p>
        <QualificationIntake variant="banner" buttonText="Check project fit" />
      </div>
    </section>
  );
}
