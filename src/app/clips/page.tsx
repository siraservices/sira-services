import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowUpRight,
  AudioLines,
  Captions,
  CheckCircle2,
  Crop,
  FolderInput,
  MessageSquareText,
  Palette,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { BOOKING_URL, buildMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading, btn } from "@/components/ui/section-heading";
import { ToolkitForm } from "./ToolkitForm";

export const metadata: Metadata = buildMetadata({
  title: "Free Sira Clips Toolkit: Long Videos to Short Clips",
  description:
    "Free Windows toolkit that turns one long video into vertical, captioned, on-brand short clips. Describe them in plain English and Claude does the editing.",
  path: "/clips",
});

const STEPS = [
  { icon: FolderInput, title: "Drop in a long video", desc: "Podcast, interview, webinar, Q&A or livestream. Any length." },
  { icon: MessageSquareText, title: "Ask in plain English", desc: "“5 clips about our catering, 30–45 seconds, punchy hooks.”" },
  { icon: Sparkles, title: "Claude does the editing", desc: "Transcribes, picks the moments, crops to vertical, adds captions and your branding." },
  { icon: ShieldCheck, title: "Checked before you see it", desc: "Automatic QC on framing, audio, cuts and captions. Then post." },
];

const FEATURES = [
  { icon: ScanFace, title: "Follows the speaker", desc: "The vertical crop tracks the speaker's face. Slides and screen shares get a clean full-frame layout instead." },
  { icon: Captions, title: "Word-by-word captions", desc: "Bold captions that highlight each word as it's spoken. Most people watch on mute." },
  { icon: Palette, title: "Your brand on every clip", desc: "Your fonts, colors and logo, saved once in a brand file. Several brands are supported." },
  { icon: Crop, title: "Hook titles", desc: "A short on-screen hook for the first three seconds, written from what's actually said." },
  { icon: AudioLines, title: "Social-ready audio", desc: "Leveled to platform loudness, so clips don't play too quiet next to everything else." },
  { icon: ShieldCheck, title: "Built-in quality checks", desc: "Catches mid-word cuts, dead air, bad framing and the wrong size before anything ships." },
];

const REQUIREMENTS = [
  "Windows 10 or 11 PC with 16 GB RAM",
  "NVIDIA GPU recommended (it also runs on CPU, just slower)",
  "A paid Claude plan (Pro or Max) with Claude Code",
  "About 10 minutes for the one-time setup",
];

const FAQ = [
  {
    q: "Is it really free?",
    a: "Yes. The toolkit is free to use for your own business. We make money when businesses would rather have us install it or run it for them.",
  },
  {
    q: "Do my videos get uploaded anywhere?",
    a: "No. Transcription, cropping, captions and rendering all run on your own PC. Only the transcript text goes to Claude so it can choose the clips.",
  },
  {
    q: "Does it work on a Mac?",
    a: "This version is built and tested for Windows. If you're on a Mac, book a call and we'll set you up.",
  },
  {
    q: "Can I use it to make clips for my clients?",
    a: "The free license covers your own business. If you want to use it for client work, email aira4development@gmail.com about a commercial license.",
  },
];

function PhoneMock({
  hook,
  words,
  active,
  className,
}: {
  hook: string;
  words: string[];
  active: number;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-[9/16] w-40 overflow-hidden rounded-[1.75rem] border-4 border-deep bg-gradient-to-b from-[#1d2a24] via-[#14201b] to-deep shadow-2xl sm:w-48 ${className ?? ""}`}
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 top-[33%] mx-auto h-16 w-16 rounded-full bg-gradient-to-b from-[#c7a487] to-[#8a6a52] opacity-80 sm:h-20 sm:w-20" />
      <div className="absolute inset-x-0 top-[52%] mx-auto h-40 w-32 rounded-t-[4rem] bg-[#26332d] sm:w-40" />
      <span className="absolute right-2.5 top-3 rounded-md bg-white/90 px-1.5 py-0.5 font-display text-[8px] font-extrabold tracking-wide text-primary-dark">
        LOGO
      </span>
      <div className="absolute inset-x-3 top-9 text-center">
        <span className="inline bg-black px-1.5 py-0.5 font-display text-[10px] font-bold leading-relaxed text-white [box-decoration-break:clone] sm:text-[11px]">
          {hook}
        </span>
      </div>
      <p className="absolute inset-x-2 bottom-[11%] text-center font-display text-[13px] font-extrabold uppercase tracking-tight text-white [text-shadow:0_0_3px_#000,0_0_3px_#000,0_0_3px_#000] sm:text-[15px]">
        {words.map((w, i) => (
          <span key={w + i} className={i === active ? "text-[#FFD400]" : undefined}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function ClipsPage() {
  return (
    <div className="pb-24 pt-36 sm:pt-40">
      <JsonLd data={faqJsonLd(FAQ)} />
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 sm:px-10 lg:grid-cols-12 lg:px-16">
        <Reveal className="lg:col-span-7">
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow="Free toolkit · Windows"
            title="One long video. A week of clips."
            flourish="Edited by Claude, on your PC."
            description="Sira Clips turns your podcast, interview or webinar into vertical, captioned, on-brand shorts. Tell it what you want in plain English. It finds the moments, cuts them, adds captions and your branding, and checks every clip before you post."
          />
          <div data-reveal className="mt-9 flex flex-wrap gap-3">
            <a href="#get" className={btn.primary}>
              Get the free toolkit
              <ArrowDown className="h-4 w-4" strokeWidth={2.4} />
            </a>
            <a href="#install" className={btn.secondary}>
              Have us set it up
            </a>
          </div>
          <p data-reveal className="mt-5 text-xs text-text-dim">
            Free for your own business · No credit card · Your videos stay on your computer
          </p>
        </Reveal>
        <Reveal className="lg:col-span-5">
          <div data-reveal className="flex items-end justify-center gap-3 sm:gap-4">
            <PhoneMock
              className="hidden translate-y-6 sm:block"
              hook="Your catering leads go to voicemail"
              words={["NOBODY", "ANSWERS", "THE PHONE"]}
              active={1}
            />
            <PhoneMock hook="1 video = 7 days of posts" words={["REUSE", "EVERY", "VIDEO"]} active={2} />
            <PhoneMock
              className="translate-y-6"
              hook="3 mistakes we see every week"
              words={["ANSWER", "EVERY", "LEAD"]}
              active={0}
            />
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-28 max-w-7xl px-6 sm:mt-36 sm:px-10 lg:px-16">
        <Reveal>
          <SectionHeading eyebrow="How it works" title="You describe it." flourish="Claude edits it." />
        </Reveal>
        <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {STEPS.map((s, i) => (
            <div key={s.title} data-reveal className="rounded-4xl border border-divider bg-surface p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                  <s.icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <span className="font-mono text-xs text-text-dim">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Features */}
      <section className="mt-28 bg-deep py-24 sm:mt-36">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow="What's inside"
              title="The editing pipeline,"
              flourish="minus the editor's hours."
            />
          </Reveal>
          <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {FEATURES.map((f) => (
              <div key={f.title} data-reveal className="glass-dark rounded-4xl border border-white/10 p-6">
                <f.icon className="h-5 w-5 text-primary-light" strokeWidth={2.2} />
                <h3 className="mt-4 font-display text-base font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{f.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Form + requirements */}
      <section id="get" className="mx-auto mt-28 grid max-w-7xl scroll-mt-28 gap-12 px-6 sm:mt-36 sm:px-10 lg:grid-cols-12 lg:px-16">
        <Reveal className="lg:col-span-5">
          <SectionHeading
            eyebrow="Get the toolkit"
            title="Free download,"
            flourish="sent to your inbox."
            description="Full toolkit and setup guide: the pipeline scripts, a one-click installer, brand templates and the Claude workflow."
          />
          <div data-reveal className="mt-8 rounded-4xl border border-divider bg-surface p-6">
            <p className="eyebrow text-primary-dark">╱ What you'll need</p>
            <ul className="mt-4 space-y-2.5">
              {REQUIREMENTS.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm text-ink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.4} />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              Not technical, or no time? Pick &ldquo;Install it for my team&rdquo; in the form and we&apos;ll handle it.
            </p>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7">
          <div data-reveal>
            <ToolkitForm />
          </div>
        </Reveal>
      </section>

      {/* Upsell */}
      <section id="install" className="mx-auto mt-28 max-w-7xl scroll-mt-28 px-6 sm:mt-36 sm:px-10 lg:px-16">
        <Reveal>
          <SectionHeading
            eyebrow="Rather not DIY?"
            title="We'll set it up,"
            flourish="or run it for you."
            description="Sira is an AI automation studio run by a licensed engineer. Choose how much of the work you want off your plate."
          />
        </Reveal>
        <Reveal className="mt-12 grid gap-5 lg:grid-cols-2" stagger={0.1}>
          <div data-reveal className="flex flex-col rounded-4xl border border-divider bg-surface p-8 shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
              <Wrench className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">Installed for your team</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              For teams that already have someone posting content. You own the system; we make it work on day one.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-ink">
              {[
                "Set up on your Windows PC",
                "Your brand kit: fonts, colors, logo, caption style",
                "Tuned on your own videos",
                "60-minute training for your team",
                "Optional ongoing support and updates",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.4} />
                  {x}
                </li>
              ))}
            </ul>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={`${btn.primary} mt-8 self-start`}>
              Book an install call
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </a>
          </div>
          <div data-reveal className="flex flex-col rounded-4xl bg-deep p-8 text-white shadow-card">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-primary-light">
              <Sparkles className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <h3 className="mt-5 font-display text-2xl font-bold tracking-tight">Done for you, every month</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Send us your recordings. You get finished, on-brand clips back, ready to post, with a person reviewing every one.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Send a link, get clips back within 48 hours",
                "Hooks and moments chosen for your audience",
                "Every clip reviewed by a human before delivery",
                "Enough clips to post every day",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" strokeWidth={2.4} />
                  {x}
                </li>
              ))}
            </ul>
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={`${btn.secondaryDark} mt-8 self-start`}>
              Talk about done-for-you
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </a>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-28 max-w-3xl px-6 sm:mt-36 sm:px-10">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions," flourish="answered." />
        </Reveal>
        <Reveal className="mt-10 divide-y divide-divider border-y border-divider" stagger={0.05}>
          {FAQ.map((f) => (
            <details key={f.q} data-reveal className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-semibold text-ink">
                {f.q}
                <span className="text-primary-dark transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </section>
    </div>
  );
}
