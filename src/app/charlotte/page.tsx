import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Eye,
  Globe,
  Plus,
  Sparkles,
  Workflow,
} from "lucide-react";
import {
  BOOKING_URL,
  CONTACT_EMAIL,
  DEFAULT_OG_IMAGE,
  FOUNDER_NAME,
  SITE_URL,
  SOCIAL_LINKS,
  breadcrumbJsonLd,
  buildMetadata,
} from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading, btn } from "@/components/ui/section-heading";

const PATH = "/charlotte";
const TITLE = "AI Automation & Consulting in Charlotte, NC | SIRA";
const DESCRIPTION =
  "Charlotte, NC AI consultancy run by a licensed engineer: computer vision, machine learning, AI automation and websites, scoped and shipped on your data.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  absoluteTitle: true,
});

const WHAT_WE_BUILD = [
  {
    icon: Eye,
    title: "Computer vision",
    slug: "computer-vision-solutions",
    body: "Cameras already on your floor, your line, or your lot turned into counts, defects, and events. Detection, tracking, and OCR that run on a GPU box in a closet or at the edge, with the accuracy numbers written down before anyone signs off.",
  },
  {
    icon: Sparkles,
    title: "Machine learning",
    slug: "machine-learning-development",
    body: "Forecasting, classification, and anomaly detection trained on the data you have, not the data a vendor wishes you had. We start with a baseline you can beat, then earn every point of lift on a held-out set.",
  },
  {
    icon: Workflow,
    title: "AI process automation",
    slug: "ai-process-automation",
    body: "Inbox triage, document extraction, quote prep, and the weekly reports somebody rebuilds by hand. We wire an LLM into the step that needs judgment and leave the deterministic parts deterministic.",
  },
  {
    icon: Bot,
    title: "AI agents and integrations",
    slug: "ai-agent-orchestration",
    body: "Assistants that read your own documents and act inside your tools, with permissions, logging, and a human in the loop where the cost of a wrong answer is real.",
  },
  {
    icon: Globe,
    title: "Websites and maintenance",
    slug: "websites-and-maintenance",
    body: "Shopify, WordPress, and Next.js sites built for the business they serve, then kept current on a flat monthly care plan so updates ship the same week you ask.",
  },
];

const PROOF = [
  {
    eyebrow: "Computer vision",
    title: "Real-time poker vision at 67 FPS",
    slug: "real-time-poker-computer-vision",
    body: "A live capture pipeline that reads cards and chips from a table feed fast enough to keep up with play. The hard part was not the model; it was the frame budget and the camera mounts.",
  },
  {
    eyebrow: "ML and detection",
    title: "AI-generated image detection for insurance claims",
    slug: "ai-generated-image-detection-insurance-claims",
    body: "A classifier that flags synthetic photos submitted with claims, deployed on AWS with a review queue for the borderline cases rather than a single threshold.",
  },
  {
    eyebrow: "LLM automation",
    title: "Email classification for an industrial manufacturer",
    slug: "ai-email-classification-industrial-manufacturer",
    body: "An LLM classifier that routes a shared inbox into the right queues in production, measured against the humans who used to do it by hand.",
  },
  {
    eyebrow: "Websites",
    title: "RowHome Magazine rebuild",
    slug: "rowhome-magazine-website-rebuild",
    body: "A WordPress rebuild for a neighborhood magazine with a growing archive and a staff that publishes daily.",
  },
  {
    eyebrow: "Shopify",
    title: "Two meal-prep storefronts",
    slug: "performance-meal-prep-shopify",
    body: "Build and weekly maintenance for two meal-prep businesses selling on a cutoff, where a missed menu update is lost revenue.",
    secondSlug: "horseman-wellness-club-shopify",
  },
  {
    eyebrow: "Next.js",
    title: "Siesta Key vacation rental",
    slug: "jorge-siesta-key-vacation-rental",
    body: "A direct-booking site for a two-bedroom rental, deployed on Vercel and tuned for phones on a beach connection.",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Discovery call",
    desc: "Thirty minutes, free. You describe the problem and the data you have. You leave with a straight answer on whether it is worth automating, and roughly what it would cost.",
  },
  {
    step: "02",
    title: "Written scope",
    desc: "A one- or two-page scope with the success metric, the data we need, the milestones, and a fixed price or a capped range. No retainer to read it.",
  },
  {
    step: "03",
    title: "First milestone on real data",
    desc: "The first deliverable runs on your data, not a demo set. If the numbers are not there, we say so and adjust the plan before more money is spent.",
  },
  {
    step: "04",
    title: "Deploy and hand over",
    desc: "Shipped to your infrastructure or ours, monitored, documented, and handed to whoever will own it. Maintenance is optional and priced separately.",
  },
];

const FAQ = [
  {
    q: "What does an AI project cost in Charlotte?",
    a: "Scoped AI and computer-vision builds typically run from the low thousands for a narrow automation up to the tens of thousands for a vision system with hardware, integration, and a deployment target. Website builds start lower, and maintenance is a flat monthly fee. Every project gets a written scope with a fixed price or a capped range before any work starts, and the discovery call is free.",
  },
  {
    q: "How long does a typical engagement take?",
    a: "A single-purpose automation, such as an email classifier or a document extractor, is usually live in two to six weeks. Custom ML work runs six to twelve weeks and computer vision eight to sixteen, depending on how much data exists and how much has to be collected and labeled. Agent systems take four to ten weeks. Websites take two to five weeks. You get a first milestone on real data early, so you are not waiting until the end to find out whether it works.",
  },
  {
    q: "What data do I need to have ready?",
    a: "Less than you might think, but more than none. For automation, a few hundred real examples of the inputs and the decisions a person made on them. For vision, access to the cameras or a sample of footage from the actual location. For forecasting, a year or more of history. If the data does not exist yet, the first milestone is often a small collection and labeling effort so the rest of the project stands on something real.",
  },
  {
    q: "Do you work on-site in Charlotte or remotely?",
    a: "Both. SIRA is based in Charlotte, so site visits, camera placement, and in-person kickoffs across the metro are easy to arrange, and most clients here start that way. Day-to-day work runs remotely with weekly updates, which keeps the cost down. We also work with clients outside North Carolina entirely remotely.",
  },
  {
    q: "Who actually does the work?",
    a: `${FOUNDER_NAME}, a licensed Professional Engineer with a mechanical engineering background, scopes and builds every project personally. There is no sales team handing you off to a junior developer. For large builds we bring in vetted specialists for pieces like front-end or data labeling, but the architecture, the modeling, and the responsibility stay with one engineer you can call.`,
  },
];

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function charlotteBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    "@id": `${SITE_URL}${PATH}#business`,
    name: "SIRA",
    legalName: "Aira Development LLC",
    url: `${SITE_URL}${PATH}`,
    image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
    logo: `${SITE_URL}/sira-mark.png`,
    email: CONTACT_EMAIL,
    description: DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Charlotte",
      addressRegion: "NC",
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: "Charlotte" },
      { "@type": "AdministrativeArea", name: "Charlotte metropolitan area" },
      { "@type": "State", name: "North Carolina" },
    ],
    founder: { "@type": "Person", name: FOUNDER_NAME, url: `${SITE_URL}/about` },
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    knowsAbout: [
      "AI consulting",
      "AI process automation",
      "Machine learning consulting",
      "Computer vision",
      "AI agents",
      "Web development",
    ],
    sameAs: [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.github],
    potentialAction: {
      "@type": "ScheduleAction",
      target: BOOKING_URL,
      name: "Book a free 30-minute call",
    },
  };
}

export default function CharlottePage() {
  return (
    <div className="pb-24 pt-36 sm:pt-40">
      <JsonLd data={charlotteBusinessJsonLd()} />
      <JsonLd data={faqJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Charlotte, NC", path: PATH },
        ])}
      />

      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        {/* Hero */}
        <Reveal>
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow="Charlotte, North Carolina"
            title="AI automation and consulting in Charlotte,"
            flourish="built by an engineer who lives here."
            description="SIRA is a Charlotte-based studio for computer vision, machine learning, AI process automation, and the websites small businesses run on. One licensed engineer scopes the work, builds it on your data, and ships it to production."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <a data-reveal href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={btn.primary}>
              Book a free 30-minute call
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
            </a>
            <Link data-reveal href="/case-studies" className={btn.secondary}>
              See the work
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          </div>
        </Reveal>

        {/* Who it's for */}
        <Reveal as="section" className="mt-24 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p data-reveal className="eyebrow text-primary-dark">
              ╱ Who this is for
            </p>
            <h2 data-reveal className="mt-3 font-display text-3xl font-bold tracking-tighter text-ink sm:text-4xl">
              Charlotte businesses with a real process and real data.
            </h2>
          </div>
          <div data-reveal className="space-y-5 text-base leading-relaxed text-text-body sm:text-lg lg:col-span-7">
            <p>
              Most of the companies we work with in the Charlotte area are small to mid-sized: a manufacturer or
              distributor off I-85 with a shared inbox nobody can keep up with, a logistics yard with cameras that
              only get watched after something goes wrong, a clinic or a property manager drowning in documents, a
              food or retail business whose website is the storefront. They have ten to a few hundred employees,
              an owner or operations lead who can make a decision, and a problem that costs them hours every week.
            </p>
            <p>
              What they usually do not have is an in-house ML team, and they should not need one. The large
              consultancies uptown are built for banks. The no-code tools break the moment a task requires
              judgment. SIRA sits in between: engineering depth without the enterprise overhead, and a scope small
              enough that you can see results before you commit to more.
            </p>
            <p>
              If your problem is &ldquo;we should do something with AI,&rdquo; the discovery call will tell you
              honestly whether there is anything worth doing. If your problem is &ldquo;this specific task eats
              twenty hours a week,&rdquo; that is exactly where we start.
            </p>
          </div>
        </Reveal>

        {/* What we build */}
        <section className="mt-24">
          <Reveal>
            <SectionHeading
              eyebrow="What we build"
              title="Five kinds of work,"
              flourish="one engineer accountable for all of them."
              description="Each one has its own page with the details. The short version is below."
            />
          </Reveal>
          <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {WHAT_WE_BUILD.map(({ icon: Icon, title, slug, body }) => (
              <Link
                key={slug}
                href={`/services/${slug}`}
                data-reveal
                className="lift-on-hover group glass rounded-3xl p-6 transition-shadow hover:shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink group-hover:text-primary-dark">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-body">{body}</p>
                <span className={`${btn.link} mt-4`}>
                  Read about {title.toLowerCase()}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
              </Link>
            ))}
          </Reveal>
        </section>

        {/* Local proof */}
        <section className="mt-24 rounded-4xl bg-deep px-6 py-14 text-white sm:px-10 sm:py-20 lg:px-16">
          <Reveal>
            <SectionHeading
              tone="dark"
              eyebrow="Proof"
              title="Shipped work,"
              flourish="not a slide deck."
              description="These are real projects with real numbers, built from Charlotte for clients here and elsewhere. Each links to a full write-up of what was built, what it cost in effort, and what we would do differently."
            />
          </Reveal>
          <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
            {PROOF.map((item) => (
              <article
                key={item.slug}
                data-reveal
                className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <p className="eyebrow text-primary-light">╱ {item.eyebrow}</p>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white">
                  <Link href={`/case-studies/${item.slug}`} className="hover:text-primary-light">
                    {item.title}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/65">{item.body}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                  <Link
                    href={`/case-studies/${item.slug}`}
                    className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-light hover:text-white"
                  >
                    {item.secondSlug ? "Performance Meal Prep" : "Read the case study"}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </Link>
                  {item.secondSlug && (
                    <Link
                      href={`/case-studies/${item.secondSlug}`}
                      className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-light hover:text-white"
                    >
                      Horseman Wellness Club
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </Reveal>
        </section>

        {/* How an engagement runs */}
        <section className="mt-24">
          <Reveal>
            <SectionHeading
              eyebrow="How an engagement runs"
              title="Four steps,"
              flourish="and you can stop after any of them."
              description="The structure is the same whether the project is a two-week automation or a three-month vision system. The point is that you see working software on your own data before most of the budget is spent."
            />
          </Reveal>
          <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
            {PROCESS.map((phase) => (
              <div key={phase.step} data-reveal className="rounded-3xl border border-divider bg-surface p-6 shadow-soft">
                <p className="font-display text-4xl font-bold tracking-tighter text-primary/30">{phase.step}</p>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{phase.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{phase.desc}</p>
              </div>
            ))}
          </Reveal>
          <Reveal className="mt-10 max-w-3xl">
            <p data-reveal className="text-base leading-relaxed text-text-body sm:text-lg">
              Between milestones you get a short written update every week: what shipped, what the numbers look
              like, what is blocked. Code lives in a repository you own from day one. When the project ends you
              have the system, the documentation, and the option of a maintenance plan, not a dependency.
            </p>
          </Reveal>
        </section>

        {/* FAQ */}
        <section className="mt-24 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <SectionHeading
              eyebrow="Questions"
              title="What Charlotte clients"
              flourish="ask first."
            />
          </Reveal>
          <Reveal className="lg:col-span-8" stagger={0.06}>
            <div className="divide-y divide-divider border-y border-divider">
              {FAQ.map((item) => (
                <details key={item.q} data-reveal className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg font-bold text-ink [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <Plus
                      className="mt-1 h-5 w-5 shrink-0 text-primary-dark transition-transform group-open:rotate-45"
                      strokeWidth={2.4}
                    />
                  </summary>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-body">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </section>

        {/* CTA */}
        <Reveal as="section" className="mt-24">
          <div data-reveal className="glass-strong rounded-4xl p-8 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="eyebrow text-primary-dark">╱ Start here</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tighter text-ink sm:text-4xl">
                Talk to an engineer in Charlotte,
                <br />
                <span className="font-serif font-medium italic tracking-normal text-primary-dark">
                  not a sales call.
                </span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-body sm:text-lg">
                Thirty minutes, free, no deck. Bring the task that eats your week and the data you have. You will
                leave with a straight read on whether it is worth automating and what it would take. Prefer email?
                Write to{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary-dark underline-offset-4 hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                or use the contact form. Conversations in English or Spanish.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row lg:mt-0 lg:flex-col">
              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className={btn.primary}>
                Book a free call
                <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
              </a>
              <Link href="/contact" className={btn.secondary}>
                Send a message
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
