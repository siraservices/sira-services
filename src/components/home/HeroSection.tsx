import { QualificationIntake } from "@/components/home/QualificationIntake";
import { BOOKING_URL } from "@/lib/seo";

/**
 * Hero. The visual is an inline SVG "inspection frame" — the thing a
 * computer-vision system actually produces — instead of a stock video.
 * Zero network weight, so the headline paints immediately (better LCP).
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-32 md:pt-40 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-12 lg:pb-28">
        <div className="max-w-xl">
          <h1 className="text-balance font-display text-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-text sm:text-6xl xl:text-7xl">
            Computer vision and AI, engineered for production.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-text-body">
            SIRA designs and ships machine learning, computer vision, and AI
            automation for teams that need it to work on real, messy data, not
            just in a demo.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-full bg-cta px-7 font-display text-base font-semibold text-cta-text transition-colors duration-200 hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Book a free 30-min call
            </a>
            <QualificationIntake variant="secondary" buttonText="Check project fit" />
          </div>
          <p className="mt-5 text-sm text-text-muted">
            No prep needed. Bring the problem; leave with a clear next step.
          </p>
        </div>

        <InspectionFrame />
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
      <div className="overflow-hidden rounded-2xl border border-surface-border bg-surface-alt">
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

          {/* sensor grid */}
          <defs>
            <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.9" fill="#0A0A0A" opacity="0.09" />
            </pattern>
          </defs>
          <rect width="480" height="330" fill="url(#grid)" />

          {/* parts, drawn as line work */}
          <g fill="none" stroke="#0A0A0A" strokeWidth="1.6" strokeLinejoin="round" opacity="0.78">
            {/* hex nut */}
            <polygon points="123,78 170,105 170,149 123,176 76,149 76,105" />
            <circle cx="123" cy="127" r="22" />
            {/* bracket (L profile with holes) */}
            <path d="M268 62 H428 V96 H330 V146 H268 Z" />
            <circle cx="298" cy="82" r="8" />
            <circle cx="398" cy="79" r="8" />
            <circle cx="299" cy="124" r="7" />
            {/* bolt */}
            <rect x="92" y="240" width="40" height="34" rx="4" />
            <path d="M132 249 H226 M132 265 H226" />
            <path d="M146 249 v16 M160 249 v16 M174 249 v16 M188 249 v16 M202 249 v16 M216 249 v16" opacity="0.55" />
            {/* plate with scratch */}
            <rect x="326" y="220" width="80" height="48" rx="3" />
          </g>
          <path
            d="M340 256 l14 -9 l9 4 l16 -13 l10 3"
            fill="none"
            stroke="#0A0A0A"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* detections */}
          {DETECTIONS.map((d, i) => (
            <g key={d.label} className="det" style={{ animationDelay: `${0.25 + i * 0.22}s` }}>
              <rect
                x={d.x}
                y={d.y}
                width={d.w}
                height={d.h}
                fill="none"
                stroke="#0A0A0A"
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
                fill={d.flagged ? "#FAFAF7" : "#0A0A0A"}
                stroke="#0A0A0A"
                strokeWidth={d.flagged ? 1.4 : 0}
              />
              <text
                x={d.x + 5.5}
                y={d.y - 5}
                fontSize="10.5"
                fontFamily="var(--font-inter), system-ui, sans-serif"
                fontWeight={600}
                fill={d.flagged ? "#0A0A0A" : "#FAFAF7"}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {d.label}
              </text>
            </g>
          ))}
        </svg>

        <figcaption className="flex items-center justify-between border-t border-surface-border px-4 py-3 text-xs text-text-muted [font-variant-numeric:tabular-nums]">
          <span>Line 2, frame 0412</span>
          <span className="text-text">4 parts found, 1 flagged for review</span>
        </figcaption>
      </div>
    </figure>
  );
}
