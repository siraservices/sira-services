"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowUpRight, Hexagon, ScanLine, Cpu } from "lucide-react";
import { QualificationIntake } from "@/components/home/QualificationIntake";
import { BOOKING_URL } from "@/lib/seo";
import { prefersReducedMotion } from "@/components/ui/motion";
import { btn } from "@/components/ui/section-heading";

/**
 * Hero: a deep, full-height section. The visual is an inline SVG
 * "inspection frame" (what a vision system actually produces) instead of a
 * stock photo, so the headline paints with zero network weight.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-line-1", { y: 40, opacity: 0, duration: 1, delay: 0.3, ease: "power3.out" });
      gsap.from(".hero-line-2", { y: 60, opacity: 0, duration: 1.2, delay: 0.5, ease: "power3.out" });
      gsap.from(".hero-cta, .hero-meta", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        delay: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
      gsap.from(".hero-visual", { y: 40, opacity: 0, duration: 1.2, delay: 0.6, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative isolate min-h-[100dvh] overflow-hidden bg-deep text-white"
    >
      {/* Backdrop: grid, glow pools, bottom fade */}
      <div className="grid-bg-dark absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_80%_10%,rgba(31,122,77,0.35),transparent_60%),radial-gradient(40rem_30rem_at_10%_90%,rgba(20,184,166,0.16),transparent_60%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-deep to-transparent" />

      {/* Themed particles */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-28 hidden text-primary-light/70 lg:block">
        <Hexagon className="animate-float h-8 w-8" strokeWidth={1.6} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute right-[22%] top-44 hidden text-accent/70 lg:block">
        <ScanLine className="animate-float h-6 w-6 [animation-delay:1.2s]" strokeWidth={1.6} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute right-[14%] top-72 hidden text-white/40 lg:block">
        <Cpu className="animate-float h-7 w-7 [animation-delay:2.4s]" strokeWidth={1.6} />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-36 sm:px-10 lg:min-h-[100dvh] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-16 lg:pb-28 lg:pt-40">
        <div className="max-w-2xl">
          <p className="hero-line-1 eyebrow text-primary-light">
            ╱ Computer vision · machine learning · automation · websites
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[0.98] tracking-tighter text-balance sm:text-7xl lg:text-8xl">
            <span className="hero-line-1 block">Computer vision and AI,</span>
            <span className="hero-line-2 block font-serif font-medium italic tracking-normal text-primary-light">
              engineered for production.
            </span>
          </h1>
          <p className="hero-meta mt-7 max-w-lg text-base leading-relaxed text-white/70 sm:text-lg">
            SIRA designs and ships machine learning, computer vision, and AI
            automation for teams that need it to work on real, messy data, not
            just in a demo. And we build the websites that bring small
            businesses their customers.
          </p>

          <div className="hero-cta mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={btn.primary}>
              Book a free 30-min call
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </a>
            <QualificationIntake variant="secondary" tone="dark" buttonText="Check project fit" />
          </div>
          <p className="hero-meta mt-5 text-sm text-white/50">
            No prep needed. Bring the problem; leave with a clear next step.
          </p>
        </div>

        <div className="hero-visual">
          <InspectionFrame />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden="true"
        className="hero-meta absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40 lg:flex"
      >
        <span className="h-px w-10 bg-white/30" />
        scroll
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

type Detection = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  flagged?: boolean;
};

const DETECTIONS: Detection[] = [
  { x: 64, y: 68, w: 118, h: 118, label: "hex nut 0.99" },
  { x: 258, y: 52, w: 180, h: 104, label: "bracket 0.97" },
  { x: 318, y: 212, w: 96, h: 64, label: "scratch 0.91", flagged: true },
  { x: 82, y: 230, w: 154, h: 54, label: "bolt 0.98" },
];

function InspectionFrame() {
  return (
    <figure className="relative w-full">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(20,184,166,0.25)]" />
            Live inspection
          </span>
          <span>cam 02 · 60 fps</span>
        </div>
        <svg
          viewBox="0 0 480 330"
          className="block h-auto w-full"
          role="img"
          aria-labelledby="inspection-title inspection-desc"
        >
          <title id="inspection-title">Computer vision inspection frame</title>
          <desc id="inspection-desc">
            Machined parts outlined with bounding boxes and confidence scores. A
            scratch on a plate is flagged for human review.
          </desc>

          <defs>
            <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.9" fill="#FFFFFF" opacity="0.14" />
            </pattern>
          </defs>
          <rect width="480" height="330" fill="url(#grid)" />

          <g fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" opacity="0.7">
            <polygon points="123,78 170,105 170,149 123,176 76,149 76,105" />
            <circle cx="123" cy="127" r="22" />
            <path d="M268 62 H428 V96 H330 V146 H268 Z" />
            <circle cx="298" cy="82" r="8" />
            <circle cx="398" cy="79" r="8" />
            <circle cx="299" cy="124" r="7" />
            <rect x="92" y="240" width="40" height="34" rx="4" />
            <path d="M132 249 H226 M132 265 H226" />
            <path d="M146 249 v16 M160 249 v16 M174 249 v16 M188 249 v16 M202 249 v16 M216 249 v16" opacity="0.55" />
            <rect x="326" y="220" width="80" height="48" rx="3" />
          </g>
          <path
            d="M340 256 l14 -9 l9 4 l16 -13 l10 3"
            fill="none"
            stroke="#C2410C"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {DETECTIONS.map((d, i) => (
            <g key={d.label} className="det" style={{ animationDelay: `${0.25 + i * 0.22}s` }}>
              <rect
                x={d.x}
                y={d.y}
                width={d.w}
                height={d.h}
                fill="none"
                stroke={d.flagged ? "#C2410C" : "#2FA866"}
                strokeWidth={d.flagged ? 2 : 1.4}
                strokeDasharray={d.flagged ? "6 4" : undefined}
                pathLength={100}
                className={d.flagged ? undefined : "det-box"}
              />
              <rect
                x={d.x - 0.7}
                y={d.y - 17}
                width={d.label.length * 6.2 + 12}
                height={17}
                rx={3}
                fill={d.flagged ? "#C2410C" : "#1F7A4D"}
              />
              <text
                x={d.x + 5.5}
                y={d.y - 5}
                fontSize="10.5"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontWeight={600}
                fill={d.flagged ? "#0F1419" : "#FFFFFF"}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {d.label}
              </text>
            </g>
          ))}
        </svg>

        <figcaption className="flex items-center justify-between border-t border-white/10 px-4 py-3 font-mono text-[11px] text-white/55 [font-variant-numeric:tabular-nums]">
          <span>Line 2 · frame 0412</span>
          <span className="text-white/85">4 parts found · 1 flagged for review</span>
        </figcaption>
      </div>
    </figure>
  );
}
