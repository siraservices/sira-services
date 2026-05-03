"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Target, Lightbulb, TrendingUp } from "lucide-react";

export default function CaseStudyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const cs = useQuery(api.caseStudies.getBySlug, { slug });

  if (cs === undefined) {
    return (
      <div className="pt-32 pb-20 px-6 bg-surface-alt min-h-screen">
        <div className="max-w-3xl mx-auto animate-pulse">
          <div className="h-4 w-24 bg-surface-hover rounded mb-10" />
          <div className="flex gap-2 mb-5">
            <div className="h-5 w-16 bg-surface-hover rounded" />
            <div className="h-5 w-20 bg-surface-hover rounded" />
          </div>
          <div className="h-10 w-3/4 bg-surface-hover rounded mb-3" />
          <div className="h-4 w-40 bg-surface-hover rounded mb-12" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (cs === null) {
    return (
      <div className="pt-32 pb-20 px-6 bg-surface-alt min-h-screen">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-display font-bold text-text mb-4">
            Case Study Not Found
          </h1>
          <p className="text-text-muted font-body mb-6">
            The case study you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm font-display font-semibold text-primary hover:text-primary-light transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Case Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="pt-32 pb-20 px-6 bg-surface-alt min-h-screen">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/case-studies"
          className="group inline-flex items-center text-sm font-display text-text-muted hover:text-primary transition-colors duration-200 mb-10 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Case Studies
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-5">
            {cs.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary-50 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-text mb-4">
            {cs.title}
          </h1>
          <p className="flex items-center gap-2 text-sm text-text-dim font-display">
            <Building2 className="h-4 w-4 shrink-0" />
            {cs.client}
          </p>
        </header>

        {/* Summary */}
        <p className="text-lg font-body text-text-muted leading-relaxed mb-12 border-l-4 border-primary/30 pl-5">
          {cs.description}
        </p>

        {/* Challenge → Solution → Results */}
        <div className="space-y-8">
          <section className="bg-surface-alt rounded-xl border border-surface-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-red-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-text">
                The Challenge
              </h2>
            </div>
            <p className="font-body text-text-muted leading-relaxed">
              {cs.challenge}
            </p>
          </section>

          <section className="bg-surface-alt rounded-xl border border-surface-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold text-text">
                Our Solution
              </h2>
            </div>
            <p className="font-body text-text-muted leading-relaxed">
              {cs.solution}
            </p>
          </section>

          <section className="bg-surface-alt rounded-xl border border-surface-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-display font-bold text-text">
                Results
              </h2>
            </div>
            <p className="font-body text-text-muted leading-relaxed">
              {cs.results}
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 pt-10 border-t border-surface-border text-center">
          <p className="text-text-muted font-body mb-5">
            Ready to get results like these?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cta text-black font-display font-semibold rounded-xl hover:bg-cta-dark transition-all duration-200 text-sm cursor-pointer"
          >
            Start a conversation
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </article>
  );
}
