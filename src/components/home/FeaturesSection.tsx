"use client";

import { useEffect, useState } from "react";
import { Layers, Activity, CalendarCheck, Check } from "lucide-react";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";

/* ------------------------------------------------------------------ */
/* 1. Stacked shuffler: the three ways to start                        */
/* ------------------------------------------------------------------ */

type Offer = { tag: string; meta: string; title: string; depth: number };

const OFFERS: Offer[] = [
  { tag: "sprint", meta: "2–4 wks", title: "CV prototype on your data", depth: 20 },
  { tag: "build", meta: "4–10 wks", title: "LLM automation in production", depth: 16 },
  { tag: "care", meta: "monthly", title: "Website build + maintenance", depth: 12 },
];

function StackedShuffler() {
  const [stack, setStack] = useState(OFFERS);

  useEffect(() => {
    const id = setInterval(() => {
      setStack((s) => {
        const next = [...s];
        next.unshift(next.pop() as Offer);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-44 w-full" aria-hidden="true">
      {stack.map((o, i) => (
        <div
          key={o.title}
          className="absolute left-0 top-0 w-[calc(100%-28px)] rounded-2xl border border-divider bg-surface p-4 shadow-card"
          style={{
            transform: `translate(${i * 14}px, ${i * 14}px) scale(${1 - i * 0.05})`,
            opacity: 1 - i * 0.25,
            zIndex: stack.length - i,
            transition: "transform .7s cubic-bezier(.34,1.56,.64,1), opacity .7s",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-dark">
              {o.tag}
            </span>
            <span className="font-mono text-[11px] text-muted">{o.meta}</span>
          </div>
          <p className="mt-3 font-display text-sm font-semibold text-ink">{o.title}</p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 24 }).map((_, d) => (
              <span
                key={d}
                className={`h-1 flex-1 rounded-full ${d < o.depth ? "bg-primary" : "bg-divider"}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Signature animation (tech/AI skin): server rack → scan dots →    */
/*    terminal surface, with a 4-state status story                    */
/* ------------------------------------------------------------------ */

const STATUS = ["Nominal", "Deploying", "Tests passing", "Shipped"] as const;

const PARTICLES = [
  { left: 14, size: 10, delay: 0, dur: 2.6 },
  { left: 27, size: 7, delay: 0.9, dur: 3.1 },
  { left: 41, size: 9, delay: 1.7, dur: 2.8 },
  { left: 55, size: 6, delay: 0.4, dur: 3.4 },
  { left: 68, size: 10, delay: 2.1, dur: 2.7 },
  { left: 80, size: 7, delay: 1.2, dur: 3.0 },
  { left: 90, size: 8, delay: 2.6, dur: 2.9 },
];

function SignatureAnimation() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % STATUS.length), 2300);
    return () => clearInterval(id);
  }, []);
  const status = STATUS[i];
  const alert = status === "Deploying";

  return (
    <div
      className="relative h-44 w-full overflow-hidden rounded-3xl"
      style={{ background: "linear-gradient(160deg,#EAF5E1 0%,#98C77E 100%)" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes rain-fall { 0% { transform: translate(-50%,-10px); opacity: 0 } 12% { opacity: 1 } 82% { opacity: 1 } 100% { transform: translate(-50%,95px); opacity: 0 } }
        @keyframes rain-ripple { 0% { transform: translateX(-50%) scale(.4); opacity: .9 } 80%, 100% { transform: translateX(-50%) scale(3.5); opacity: 0 } }
        @keyframes rain-fadein { from { opacity: 0; transform: translateY(2px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes scan-sweep { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }
      `}</style>

      {/* blobs */}
      <div className="absolute -left-6 top-6 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
      <div className="absolute right-2 top-10 h-20 w-28 rounded-full bg-white/40 blur-2xl" />

      {/* header strip */}
      <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-4 pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-deep/70">
        <Activity className="h-3.5 w-3.5" strokeWidth={2.4} />
        inference pipeline
      </div>

      {/* source: server rack */}
      <svg className="absolute left-1/2 top-9 -translate-x-1/2" width="150" height="26" viewBox="0 0 150 26" fill="none">
        <rect x="1" y="1" width="148" height="24" rx="5" stroke="#083524" strokeOpacity=".55" strokeWidth="1.5" fill="#ffffff55" />
        {[14, 28, 42, 56].map((x) => (
          <rect key={x} x={x} y="8" width="8" height="10" rx="2" fill="#083524" fillOpacity=".35" />
        ))}
        <circle cx="120" cy="13" r="3" fill="#C2410C" />
        <circle cx="132" cy="13" r="3" fill="#0B4A2F" />
      </svg>

      {/* falling particles */}
      {PARTICLES.map((p, k) => (
        <svg
          key={k}
          className="absolute top-14"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `rain-fall ${p.dur}s cubic-bezier(.55,.05,.7,.45) ${p.delay}s infinite`,
            filter: "drop-shadow(0 2px 3px rgba(8,53,36,.35))",
          }}
          viewBox="0 0 10 10"
        >
          <defs>
            <linearGradient id={`g${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#1F8A52" />
              <stop offset=".6" stopColor="#0B4A2F" />
              <stop offset="1" stopColor="#083524" />
            </linearGradient>
          </defs>
          <circle cx="5" cy="5" r="5" fill={`url(#g${k})`} />
          <circle cx="3.5" cy="3.5" r="1.3" fill="#fff" fillOpacity=".8" />
        </svg>
      ))}

      {/* surface: terminal line */}
      <div className="absolute inset-x-4 bottom-10 h-7 overflow-hidden rounded-md bg-deep/85 px-2 font-mono text-[10px] leading-7 text-white/85">
        <span className="text-accent">$</span> sira deploy --env prod
        <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-white/80 [animation:blink_1s_step-end_infinite]" />
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          style={{ animation: "scan-sweep 2.6s linear infinite" }}
        />
      </div>
      {/* ripples on the surface */}
      {[20, 50, 78].map((l, k) => (
        <span
          key={l}
          className="absolute bottom-[52px] h-3 w-3 rounded-full border-[3px] border-white/70"
          style={{ left: `${l}%`, animation: `rain-ripple 2.4s ease-out ${k * 0.8}s infinite` }}
        />
      ))}

      {/* footer status */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-white/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-deep/80 backdrop-blur">
        <span className="relative flex h-2 w-2">
          {alert && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${status === "Shipped" ? "bg-accent" : "bg-primary"}`} />
        </span>
        <span key={status} style={{ animation: "rain-fadein .5s ease-out" }}>
          {status}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Cursor scheduler: a mini week with a looping cursor that books   */
/* ------------------------------------------------------------------ */

const DAYS = ["M", "T", "W", "T", "F"];

function CursorScheduler() {
  const [step, setStep] = useState(0); // 0 hidden,1 move,2 hover day,3 click day,4 click button
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 5), 1400);
    return () => clearInterval(id);
  }, []);
  const dayPicked = step >= 3;
  const booked = step === 4;
  const cursor =
    step === 0 ? { x: 150, y: 150, o: 0 } :
    step === 1 ? { x: 100, y: 64, o: 1 } :
    step === 2 ? { x: 96, y: 62, o: 1 } :
    step === 3 ? { x: 96, y: 62, o: 1 } :
    { x: 120, y: 122, o: 1 };

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-3xl border border-divider bg-surface p-4" aria-hidden="true">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        <span>this week</span>
        <span>30 min · free</span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {DAYS.map((d, k) => {
          const active = dayPicked && k === 2;
          const hover = step === 2 && k === 2;
          return (
            <div
              key={k}
              className={`flex h-10 flex-col items-center justify-center rounded-xl border text-[11px] font-semibold transition-all duration-500 ${
                active
                  ? "scale-110 border-primary bg-primary text-white shadow-lg shadow-primary/30"
                  : hover
                    ? "border-primary/40 bg-primary/10 text-primary-dark"
                    : "border-divider bg-background text-muted"
              }`}
            >
              <span>{d}</span>
              <span className="font-mono text-[9px] opacity-70">{13 + k}</span>
            </div>
          );
        })}
      </div>
      <div
        className={`mt-3 flex h-10 items-center justify-center rounded-full font-display text-xs font-semibold text-white transition-all duration-500 ${
          booked ? "bg-accent" : "bg-primary"
        }`}
      >
        {booked ? (
          <span className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5" strokeWidth={3} /> Booked
          </span>
        ) : (
          "Book a free call"
        )}
      </div>

      {/* cursor */}
      <svg
        className="pointer-events-none absolute left-0 top-0 h-5 w-5 drop-shadow"
        viewBox="0 0 24 24"
        style={{
          transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${step === 3 || step === 4 ? 0.85 : 1})`,
          opacity: cursor.o,
          transition: "transform .5s cubic-bezier(.25,.46,.45,.94), opacity .3s",
        }}
      >
        <path d="M4 2 L20 12 L12 13.5 L8.5 21 Z" fill="#1A1A1A" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const FEATURES = [
  {
    eyebrow: "Scope",
    icon: Layers,
    title: "Start small, on purpose.",
    body: "Every engagement begins with a fixed-scope first piece: a prototype on your data, one automated workflow, or a site that ships in weeks. You see real output before committing to more.",
    points: ["Fixed price for the first milestone", "Your data, not a toy dataset", "Clear go / no-go at the end"],
    Visual: StackedShuffler,
  },
  {
    eyebrow: "Delivery",
    icon: Activity,
    title: "Production is the finish line.",
    body: "Models and automations are delivered as deployed services with tests, monitoring, and handover docs, so your team can run them without us in the loop.",
    points: ["APIs, Docker, cloud deploys", "Evaluation on held-out data", "Runbooks and handover"],
    Visual: SignatureAnimation,
  },
  {
    eyebrow: "Access",
    icon: CalendarCheck,
    title: "Talk to the engineer.",
    body: "No sales layer. The first call is 30 minutes with the person who will build the thing, and you leave it with a written next step either way.",
    points: ["Free 30-minute call", "Reply within 24–48 hours", "English or Spanish"],
    Visual: CursorScheduler,
  },
];

export function FeaturesSection() {
  return (
    <section className="relative px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            eyebrow="How SIRA works"
            title="Small scope, real data,"
            flourish="shipped to production."
            description="Three habits that keep AI projects from dying in the demo stage, and that make a website engagement feel the same way."
          />
        </Reveal>

        <Reveal className="mt-14 grid gap-6 lg:grid-cols-3" stagger={0.15}>
          {FEATURES.map(({ eyebrow, icon: Icon, title, body, points, Visual }) => (
            <article
              key={title}
              data-reveal
              className="feature-card flex flex-col rounded-3xl border border-divider bg-surface p-6 shadow-soft sm:p-8"
            >
              <p className="eyebrow flex items-center gap-2 text-primary-dark">
                <Icon className="h-3.5 w-3.5" strokeWidth={2.4} />
                {eyebrow}
              </p>
              <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                {title}
              </h3>
              <div className="mt-6">
                <Visual />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted sm:text-base">{body}</p>
              <ul className="mt-5 space-y-2">
                {points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm text-text-body">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
