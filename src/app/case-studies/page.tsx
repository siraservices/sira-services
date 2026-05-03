"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

export default function CaseStudiesPage() {
  const caseStudies = useQuery(api.caseStudies.listPublished);

  return (
    <div className="pt-32 pb-20 px-6 bg-surface-muted min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-display font-semibold uppercase tracking-[0.2em] text-primary-light mb-3 block">
            Case Studies
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-text mb-6">
            Real results, real clients
          </h1>
          <p className="text-lg font-body text-text-muted leading-relaxed">
            From demand forecasting to computer vision, see how we've helped
            organizations ship AI that actually works in production.
          </p>
        </div>

        {caseStudies === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-alt rounded-xl border border-surface-border p-6 shadow-soft"
              >
                <div className="animate-pulse">
                  <div className="h-40 bg-surface-hover rounded-lg mb-5" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-5 w-16 bg-surface-hover rounded" />
                    <div className="h-5 w-20 bg-surface-hover rounded" />
                  </div>
                  <div className="h-6 w-3/4 bg-surface-hover rounded mb-2" />
                  <div className="h-4 w-1/2 bg-surface-hover rounded mb-3" />
                  <div className="h-4 w-full bg-surface-hover rounded mb-2" />
                  <div className="h-4 w-2/3 bg-surface-hover rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : caseStudies.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-text-muted font-body text-lg">
              No case studies yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((cs) => (
              <Link
                key={cs._id}
                href={`/case-studies/${cs.slug}`}
                className="group flex flex-col bg-surface-alt rounded-xl border border-surface-border shadow-soft hover:shadow-card transition-all duration-200 overflow-hidden cursor-pointer"
              >
                {/* Image or placeholder */}
                <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
                  {cs.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cs.imageUrl}
                      alt={cs.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary/40">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary/60" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cs.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary-50 text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-base font-display font-bold text-text group-hover:text-primary transition-colors duration-200 mb-1.5 leading-snug">
                    {cs.title}
                  </h2>

                  <p className="text-xs font-display text-text-dim mb-3 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {cs.client}
                  </p>

                  <p className="text-sm font-body text-text-muted line-clamp-3 leading-relaxed flex-1">
                    {cs.description}
                  </p>

                  <span className="mt-4 text-primary text-xs font-display font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Read case study <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
