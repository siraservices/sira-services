"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion, Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    n: "01",
    eyebrow: "Discovery",
    title: "A 30-minute call and a written read on fit.",
    body: "You bring the problem and whatever data exists. We ask the awkward questions early: what the output has to look like, who uses it, and what 'good enough' means. You leave with a next step, even if that step is 'don't build this'.",
    points: ["Free, no obligation", "Honest go / no-go", "Scope and price for a first milestone"],
    image: "/images/case-studies/ai-generated-image-detection-insurance-claims.jpg",
    alt: "AI image detection score panel from a delivered proof of concept",
  },
  {
    n: "02",
    eyebrow: "Build",
    title: "A first milestone on your real data, in weeks.",
    body: "A prototype on your footage, one automated workflow, or a site you can click through. Progress lands in your inbox weekly with the numbers, not just screenshots.",
    points: ["Weekly written updates", "Evaluation on held-out data", "You keep the code and the repo"],
    image: "/images/case-studies/real-time-poker-computer-vision.jpg",
    alt: "Real-time poker capture pipeline running at 67 FPS",
  },
  {
    n: "03",
    eyebrow: "Deploy",
    title: "Shipped, monitored, and handed over.",
    body: "Deployed as a service your team can run: Docker, cloud, monitoring, a runbook, and a session to walk through it. For websites, this is where the monthly care plan starts.",
    points: ["Runbook and handover docs", "Monitoring and alerts", "Optional care plan after launch"],
    image: "/images/case-studies/ai-email-classification-industrial-manufacturer.jpg",
    alt: "Email classification system in production, 10 categories with confidence scores",
  },
];

export function ProtocolSection() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    // The stacked scrub only runs on desktop; on phones the cards just stack.
    if (typeof window.matchMedia !== "function" || !window.matchMedia("(min-width: 1024px)").matches) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    const last = cards[cards.length - 1];
    const ctx = gsap.context(() => {
      cards.slice(0, -1).forEach((card) => {
        gsap.to(card, {
          scrollTrigger: {
            trigger: card,
            start: "top top+=100",
            endTrigger: last,
            end: "top top+=120",
            scrub: 1,
          },
          scale: 0.92,
          filter: "blur(6px) saturate(0.7)",
          opacity: 0.5,
          ease: "none",
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="The protocol"
            title="Three steps."
            flourish="No surprises."
            description="The same path whether the project is a vision model, an inbox automation, or a Shopify store."
          />
        </Reveal>

        <div ref={root} className="mt-16 space-y-8">
          {STEPS.map((s) => (
            <article
              key={s.n}
              data-step
              className="grid gap-8 lg:sticky lg:top-24 overflow-hidden rounded-4xl border border-divider bg-surface p-6 shadow-card sm:p-10 lg:grid-cols-5 lg:gap-12"
            >
              <div className="lg:col-span-3">
                <p className="font-display text-5xl font-bold tracking-tighter text-primary/25 sm:text-6xl">{s.n}</p>
                <p className="eyebrow mt-4 text-primary-dark">╱ {s.eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{s.body}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="rounded-full border border-divider bg-background px-3 py-1.5 font-mono text-[11px] text-text-body"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  className="aspect-[16/10] w-full rounded-2xl border border-divider object-cover"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
