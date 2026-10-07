import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import type { Doc } from "../../../convex/_generated/dataModel";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";

/**
 * Selected work: the newest published case studies, fetched on the server so
 * the cards are in the initial HTML. Shows up to four with a cover image.
 */
export async function WorkSection() {
  let studies: Doc<"caseStudies">[] = [];
  try {
    studies = await convexServer.query(api.caseStudies.listPublished);
  } catch {
    studies = [];
  }
  const picks = studies.filter((s) => s.imageUrl).slice(0, 4);
  if (picks.length === 0) return null;

  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Selected work"
            title="Real results,"
            flourish="real clients."
            description="Computer vision, AI image detection, LLM automation, and the websites we build and maintain, with the numbers from each build."
          />
          <Link data-reveal href="/case-studies" className="lift-on-hover inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-dark hover:text-primary">
            All case studies
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </Reveal>

        <Reveal className="mt-14 grid gap-6 sm:grid-cols-2" stagger={0.12}>
          {picks.map((cs, i) => (
            <Link
              key={cs._id}
              data-reveal
              href={`/case-studies/${cs.slug}`}
              className={`group flex flex-col overflow-hidden rounded-3xl border border-divider bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated ${
                i === 0 ? "sm:col-span-2 lg:grid lg:grid-cols-2" : ""
              }`}
            >
              <div className={`overflow-hidden ${i === 0 ? "aspect-[16/10] lg:aspect-auto lg:h-full" : "aspect-[16/10]"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cs.imageUrl}
                  alt={cs.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <div className="flex flex-wrap gap-1.5">
                  {cs.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-dark">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className={`mt-4 font-display font-bold tracking-tight text-ink transition-colors group-hover:text-primary-dark ${i === 0 ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                  {cs.title}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-text-dim">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {cs.client}
                </p>
                <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{cs.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-dark">
                  Read case study <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
