"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { ArrowUpRight, Calendar, MailCheck } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { api } from "../../../convex/_generated/api";
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/seo";
import { Field, inputClass } from "@/components/ui/field";
import { btn } from "@/components/ui/section-heading";

const ROLES = ["Owner / founder", "Marketing / social", "Video editor / producer", "Other"];
const TEAM_SIZES = ["Just me", "2–10", "11–50", "51+"];
const VOLUMES = ["None yet", "1–2", "3–5", "6+"];
const WANTS = [
  { value: "diy", label: "Just the toolkit", sub: "I'll set it up myself" },
  { value: "install", label: "Install it for my team", sub: "Set up, branded and trained" },
  { value: "done-for-you", label: "Make the clips for me", sub: "Done-for-you, every month" },
];

export function ToolkitForm() {
  const request = useMutation(api.clipsToolkit.request);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    decisionRole: "",
    teamSize: "",
    videoVolume: "",
    wantsInstall: "diy",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("link") === "invalid") setInvalidLink(true);
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await request({
        name: form.name,
        email: form.email,
        company: form.company || undefined,
        decisionRole: form.decisionRole || undefined,
        teamSize: form.teamSize || undefined,
        videoVolume: form.videoVolume || undefined,
        wantsInstall: form.wantsInstall,
      });
      sendGAEvent("event", "generate_lead", {
        event_category: "lead_magnet",
        event_label: "clips_toolkit",
        wants: form.wantsInstall,
      });
      setSentTo(form.email);
    } catch (err) {
      console.error("Toolkit request failed:", err);
      setError(`That didn't go through. Check your email address and try again, or write to ${CONTACT_EMAIL}.`);
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    const wantsHelp = form.wantsInstall !== "diy";
    return (
      <div className="rounded-4xl border border-divider bg-surface p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary-dark">
          <MailCheck className="h-8 w-8" strokeWidth={2} />
        </span>
        <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">Check your inbox.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Your download link is on its way to <strong className="text-ink">{sentTo}</strong>. If you don&apos;t see it in a
          couple of minutes, check spam or promotions.
        </p>
        <div className={`mx-auto mt-8 max-w-md rounded-3xl p-6 text-left ${wantsHelp ? "bg-deep text-white" : "bg-background"}`}>
          <p className={`font-display text-base font-semibold ${wantsHelp ? "text-white" : "text-ink"}`}>
            {wantsHelp ? "You asked us to help. Let's find a time." : "Want it running this week without the setup?"}
          </p>
          <p className={`mt-1.5 text-sm ${wantsHelp ? "text-white/65" : "text-muted"}`}>
            30 minutes: we look at your videos and recommend the fastest path to clips.
          </p>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sendGAEvent("event", "book_call_click", { event_label: "clips_thankyou" })}
            className={`${wantsHelp ? btn.primary : btn.secondary} mt-4`}
          >
            <Calendar className="h-4 w-4" strokeWidth={2.4} />
            Book a free call
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-4xl border border-divider bg-surface p-6 shadow-card sm:p-10">
      {invalidLink && (
        <p role="status" className="rounded-2xl bg-accent/10 px-4 py-3 text-sm text-accent-dark">
          That download link didn&apos;t work. Enter your email again and we&apos;ll send you a fresh one.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="tk-name" required>
          <input id="tk-name" required autoComplete="name" value={form.name} onChange={set("name")} className={inputClass(false)} placeholder="Your name" />
        </Field>
        <Field label="Work email" htmlFor="tk-email" required>
          <input id="tk-email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className={inputClass(false)} placeholder="you@business.com" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business" htmlFor="tk-company" hint="optional">
          <input id="tk-company" autoComplete="organization" value={form.company} onChange={set("company")} className={inputClass(false)} placeholder="Business name" />
        </Field>
        <Field label="Your role" htmlFor="tk-role" hint="optional">
          <select id="tk-role" value={form.decisionRole} onChange={set("decisionRole")} className={inputClass(false)}>
            <option value="">Select…</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Team size" htmlFor="tk-team" hint="optional">
          <select id="tk-team" value={form.teamSize} onChange={set("teamSize")} className={inputClass(false)}>
            <option value="">Select…</option>
            {TEAM_SIZES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Long videos per month" htmlFor="tk-volume" hint="optional">
          <select id="tk-volume" value={form.videoVolume} onChange={set("videoVolume")} className={inputClass(false)}>
            <option value="">Select…</option>
            {VOLUMES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 block font-display text-sm font-medium text-ink">What would help most?</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {WANTS.map((w) => {
            const on = form.wantsInstall === w.value;
            return (
              <label
                key={w.value}
                className={`cursor-pointer rounded-2xl border p-4 transition-colors ${on ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-divider hover:border-primary/40"}`}
              >
                <input type="radio" name="wantsInstall" value={w.value} checked={on} onChange={set("wantsInstall")} className="sr-only" />
                <span className="block font-display text-sm font-semibold text-ink">{w.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{w.sub}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="magnetic-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-display text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Sending…" : "Email me the toolkit"}
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
      </button>
      <p className="text-xs leading-relaxed text-text-dim">
        We&apos;ll email your download link and may follow up once about setup. No newsletter, no sharing. See our{" "}
        <a href="/privacy" className="underline hover:text-ink">privacy policy</a>.
      </p>
    </form>
  );
}
