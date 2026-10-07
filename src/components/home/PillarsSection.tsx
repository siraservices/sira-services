import { CountUp, Reveal } from "@/components/ui/motion";

/**
 * Three real numbers from delivered work. Keep these honest: each one
 * traces to a published case study or a client's own words.
 */
const PILLARS = [
  {
    eyebrow: "Real-time vision",
    value: 67,
    suffix: " FPS",
    text: "Sustained capture rate of the poker game-state pipeline, at 14 ms mean latency on a compact Intel NUC.",
    source: "Poker computer-vision case study",
  },
  {
    eyebrow: "In production",
    value: 93,
    suffix: "%",
    prefix: "~",
    text: "Where the email classifier for an industrial tools manufacturer stabilized, in the client's own words, across 10 business categories.",
    source: "Elliott Tool Technologies, client feedback",
  },
  {
    eyebrow: "Documented work",
    value: 7,
    suffix: "",
    text: "Published case studies across computer vision, AI image detection, LLM automation, and small-business websites.",
    source: "sira.services/case-studies",
  },
];

export function PillarsSection() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      {/* blurred colour pools */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <Reveal className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-divider" stagger={0.15}>
        {PILLARS.map((p) => (
          <div key={p.eyebrow} data-reveal className="lg:px-10 first:lg:pl-0 last:lg:pr-0">
            <p className="eyebrow text-primary-dark">╱ {p.eyebrow}</p>
            <p className="mt-4 font-display text-6xl font-bold tracking-tighter text-ink sm:text-7xl">
              <CountUp end={p.value} suffix={p.suffix} prefix={p.prefix} />
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted sm:text-base">{p.text}</p>
            <p className="mt-3 font-mono text-[11px] text-text-dim">{p.source}</p>
            <div className="relative mt-6 h-px overflow-hidden bg-divider">
              <span
                className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{ animation: "pillar-sweep 3s ease-in-out infinite" }}
              />
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
