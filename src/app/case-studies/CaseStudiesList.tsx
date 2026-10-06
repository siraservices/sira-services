"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";

/** Case studies tagged "website" are web build/maintenance work; the rest are AI/ML. */
const WEBSITE_TAG = "website";

type Filter = "all" | "ai" | "website";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI & computer vision" },
  { id: "website", label: "Websites" },
];

function isWebsite(cs: Doc<"caseStudies">) {
  return cs.tags.some((t) => t.toLowerCase() === WEBSITE_TAG);
}

export function CaseStudiesList({
  initialCaseStudies,
}: {
  initialCaseStudies?: Doc<"caseStudies">[];
}) {
  const live = useQuery(api.caseStudies.listPublished);
  const caseStudies = live === undefined ? initialCaseStudies : live;
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (!caseStudies) return caseStudies;
    if (filter === "website") return caseStudies.filter(isWebsite);
    if (filter === "ai") return caseStudies.filter((cs) => !isWebsite(cs));
    return caseStudies;
  }, [caseStudies, filter]);

  // Only show the filter once both kinds of work exist.
  const showFilter =
    !!caseStudies &&
    caseStudies.some(isWebsite) &&
    caseStudies.some((cs) => !isWebsite(cs));

  return (
    <div className="pb-24 pt-36 sm:pt-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <p className="eyebrow mb-5 text-primary-dark">╱ Case studies</p>
          <h1 className="font-display text-4xl font-bold leading-[0.98] tracking-tighter text-ink sm:text-6xl lg:text-7xl">
            Real results,
            <br />
            <span className="font-serif font-medium italic tracking-normal text-primary-dark">real clients.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Computer vision, AI image detection, and LLM automation projects,
            plus the websites we build and maintain for small businesses, with
            the numbers from each build.
          </p>
        </div>

        {showFilter && (
          <div
            role="tablist"
            aria-label="Filter case studies"
            className="flex flex-wrap gap-2 mb-10"
          >
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f.id)}
                  className={`lift-on-hover h-9 rounded-full border px-4 font-display text-xs font-semibold tracking-wide transition-colors duration-200 cursor-pointer ${
                    active
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                      : "border-divider bg-surface text-muted hover:border-primary/40 hover:text-ink"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {visible === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-alt rounded-3xl border border-divider p-6 shadow-soft"
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
        ) : visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-text-muted font-body text-lg">
              No case studies yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((cs) => (
              <Link
                key={cs._id}
                href={`/case-studies/${cs.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-divider bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated cursor-pointer"
              >
                {/* Image or placeholder */}
                <div className="flex aspect-[16/10] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  {cs.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cs.imageUrl}
                      alt={cs.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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
                        className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-dark"
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
