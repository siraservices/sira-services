import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin, Languages, Wrench, Cpu } from "lucide-react";
import { BOOKING_URL, FOUNDER_NAME, buildMetadata } from "@/lib/seo";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading, btn } from "@/components/ui/section-heading";

export const metadata: Metadata = buildMetadata({
  title: "About: Engineer-Led AI, Computer Vision & Web Studio",
  description:
    "SIRA is led by Julio Aira, a mechanical engineer turned AI practitioner, building machine learning and computer vision systems grounded in real-world constraints, and websites for small businesses.",
  path: "/about",
});

const SECTIONS = [
  {
    eyebrow: "Background",
    title: "Systems first, algorithms second.",
    body: "With a foundation in mechanical engineering and experience in healthcare HVAC systems, I developed a systematic approach to problem-solving that translates directly to AI/ML development. My engineering background means I think in terms of systems, constraints, and practical implementation, not just algorithms.",
  },
  {
    eyebrow: "What I bring",
    title: "Context from the physical world.",
    body: "The intersection of traditional engineering and modern AI creates opportunities that pure software backgrounds often miss. I understand physical systems, sensors, manufacturing processes, and operational constraints: context that matters when building ML solutions for real-world applications.",
  },
  {
    eyebrow: "Technical focus",
    title: "Vision, models, automation, and the web.",
    body: "My work spans machine learning model development, computer vision systems, and AI-powered automation. Recent projects include real-time video capture pipelines, AI-generated image detection, automated email triage, and the Shopify, WordPress and Next.js sites that keep small businesses in front of their customers.",
  },
  {
    eyebrow: "Approach",
    title: "Build things that ship.",
    body: "I believe in building AI solutions that actually ship. That means starting with clear business objectives, validating approaches quickly, and delivering systems that work reliably in production, not just in notebooks.",
  },
];

const FACTS = [
  { icon: Wrench, label: "Mechanical engineer turned AI practitioner" },
  { icon: Cpu, label: "Computer vision, ML, LLM automation, websites" },
  { icon: MapPin, label: "Charlotte, NC · remote worldwide" },
  { icon: Languages, label: "English and Spanish" },
];

export default function AboutPage() {
  return (
    <div className="pb-24 pt-36 sm:pt-40">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal>
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow="About SIRA"
            title="The engineer"
            flourish="behind the work."
            description={`I'm ${FOUNDER_NAME}, the engineer behind SIRA: a mechanical engineer turned AI practitioner, bringing a systems view to machine learning, computer vision, and the websites small businesses run on.`}
          />
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Facts card */}
          <Reveal className="lg:col-span-4">
            <div data-reveal className="sticky top-28 rounded-4xl border border-divider bg-surface p-6 shadow-card sm:p-8">
              <p className="eyebrow text-primary-dark">╱ At a glance</p>
              <ul className="mt-5 space-y-4">
                {FACTS.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-start gap-3 text-sm text-text-body">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                      <Icon className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <span className="pt-2">{label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-divider pt-6">
                <p className="font-serif text-xl italic leading-snug text-ink">
                  &ldquo;Clear objectives, fast validation, systems that run in production.&rdquo;
                </p>
              </div>
              <div className="mt-7 flex flex-col gap-2">
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={btn.primary}>
                  Book a free call
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                </a>
                <Link href="/case-studies" className={btn.secondary}>
                  See the work
                  <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Prose */}
          <div className="space-y-14 lg:col-span-8">
            {SECTIONS.map((s) => (
              <Reveal key={s.eyebrow} as="section">
                <p data-reveal className="eyebrow text-primary-dark">╱ {s.eyebrow}</p>
                <h2 data-reveal className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {s.title}
                </h2>
                <p data-reveal className="mt-4 max-w-2xl text-base leading-relaxed text-text-body sm:text-lg">
                  {s.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
