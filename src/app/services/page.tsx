import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { BOOKING_URL, buildMetadata } from "@/lib/seo";
import { services } from "@/lib/services";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading, btn } from "@/components/ui/section-heading";

export const metadata: Metadata = buildMetadata({
  title: "AI, Computer Vision & Website Services",
  description:
    "Machine learning development, computer vision, AI process automation, agent orchestration, and website build and maintenance — scoped, built, and deployed for your business.",
  path: "/services",
});

const PROCESS = [
  { step: "01", title: "Discovery", desc: "A 30-minute call and a written read on fit, scope and price." },
  { step: "02", title: "Strategy", desc: "The approach, timeline, and the numbers that define success." },
  { step: "03", title: "Build", desc: "A first milestone on your real data, with weekly updates." },
  { step: "04", title: "Deploy", desc: "Shipped, monitored, documented, and handed over." },
];

export default function ServicesPage() {
  return (
    <div className="pb-24 pt-36 sm:pt-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal>
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow="Services"
            title="Five ways to work"
            flourish="with SIRA."
            description="AI and computer vision systems built for production, plus websites built and maintained for the small businesses that run on them."
          />
        </Reveal>

        <div className="mt-20 space-y-16 sm:space-y-24">
          {services.map((service, index) => {
            const Icon = service.icon;
            const flip = index % 2 === 1;
            return (
              <Reveal
                key={service.slug}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
                stagger={0.1}
              >
                <div data-reveal className={flip ? "lg:order-2" : ""}>
                  <p className="eyebrow flex items-center gap-2 text-primary-dark">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                    {service.eyebrow}
                  </p>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tighter text-ink sm:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{service.shortDescription}</p>
                  <ul className="mt-6 space-y-2.5">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-text-body">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.4} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/services/${service.slug}`} className={`${btn.link} mt-7`}>
                    Learn more
                    <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                  </Link>
                </div>
                <Link
                  data-reveal
                  href={`/services/${service.slug}`}
                  className={`group block overflow-hidden rounded-4xl border border-divider bg-surface shadow-card ${flip ? "lg:order-1" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Process */}
        <Reveal className="mt-28 border-t border-divider pt-20 sm:mt-36">
          <SectionHeading
            align="center"
            eyebrow="How it runs"
            title="Four steps."
            flourish="Same for every project."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((phase) => (
              <div key={phase.step} data-reveal className="rounded-3xl border border-divider bg-surface p-6 shadow-soft">
                <p className="font-display text-4xl font-bold tracking-tighter text-primary/30">{phase.step}</p>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{phase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{phase.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal className="mt-16 flex flex-wrap justify-center gap-3">
          <a data-reveal href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={btn.primary}>
            Book a free call
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
          </a>
          <Link data-reveal href="/contact" className={btn.secondary}>
            Send a message
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
