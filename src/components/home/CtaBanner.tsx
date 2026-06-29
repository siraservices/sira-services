"use client";

import { cn } from "@/lib/utils";
import { QualificationIntake } from "@/components/home/QualificationIntake";

export function CtaBanner() {
  return (
    <section className={cn("py-24 px-6 bg-surface-alt")}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl md:text-5xl text-text font-bold mb-6">
          Ready to Transform Your Business with AI?
        </h2>
        <p className="text-text-muted font-body text-lg mb-10">
          Answer 6 quick questions and we&apos;ll tell you if we&apos;re a
          fit — no sales call required.
        </p>
        <QualificationIntake variant="banner" />
      </div>
    </section>
  );
}
