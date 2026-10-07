import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { services } from "@/lib/services";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { BOOKING_URL } from "@/lib/seo";

/** Dark services grid: every service line, one tile each, from lib/services. */
export function ServicesSection() {
  return (
    <section className="relative bg-deep px-6 py-24 text-white sm:px-10 sm:py-32 lg:px-16 lg:py-40">
      <div className="grid-bg-dark absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <Reveal className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            tone="dark"
            eyebrow="What SIRA builds"
            title="From a first prototype"
            flourish="to a system your team runs."
            description="Five service lines, one engineer-led team. Pick the one that matches the problem, or book a call and we'll tell you which fits."
          />
          <Link
            data-reveal
            href="/services"
            className="lift-on-hover inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-light hover:text-white"
          >
            See all services
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </Reveal>

        <Reveal className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
          {services.map(({ slug, icon: Icon, title, shortDescription, eyebrow }) => (
            <Link
              key={slug}
              data-reveal
              href={`/services/${slug}`}
              className="group relative flex flex-col bg-deep p-8 transition-colors duration-300 hover:bg-white/[0.03] sm:p-10"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary-light transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{eyebrow}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">{shortDescription}</p>
              <span className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-light opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn more <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}

          {/* 6th tile: CTA */}
          <a
            data-reveal
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between bg-primary p-8 text-white transition-colors duration-300 hover:bg-primary-dark sm:p-10"
          >
            <p className="eyebrow text-white/70">╱ Not sure which</p>
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight">
                Book a free 30-minute call.
                <br />
                <span className="font-serif font-medium italic tracking-normal text-white/85">
                  We&apos;ll point you to the right one.
                </span>
              </h3>
              <span className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold">
                Pick a time <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
