"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Target,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { BOOKING_URL } from "@/lib/seo";

export function CaseStudyContent({
  slug,
  initialCaseStudy,
}: {
  slug: string;
  /** Server-fetched case study so the content is in the initial HTML. */
  initialCaseStudy?: Doc<"caseStudies"> | null;
}) {
  const live = useQuery(api.caseStudies.getBySlug, { slug });
  const cs = live === undefined ? initialCaseStudy : live;

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
            {cs.tags.map((tag: string) => (
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
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="flex items-center gap-2 text-sm text-text-dim font-display">
              <Building2 className="h-4 w-4 shrink-0" />
              {cs.client}
            </p>
            {cs.liveUrl && (
              <a
                href={cs.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-display font-semibold text-primary hover:text-primary-light transition-colors duration-200"
              >
                Visit live site
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>
        </header>

        {/* Cover image */}
        {cs.imageUrl && (
          <figure className="mb-12 -mx-2 sm:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cs.imageUrl}
              alt={`${cs.title} — ${cs.client}`}
              className="w-full aspect-[16/10] object-cover rounded-xl border border-surface-border shadow-card"
            />
          </figure>
        )}

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
          <p className="font-display font-semibold text-xl text-text mb-2">
            Have a similar problem?
          </p>
          <p className="text-text-muted font-body mb-6">
            Talk it through on a free 30-minute call, or send a short note first.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-cta text-cta-text font-display font-semibold text-sm hover:bg-charcoal transition-colors duration-200"
            >
              Book a free call
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-text/20 text-text font-display font-semibold text-sm hover:border-text/50 transition-colors duration-200"
            >
              Send a message
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
