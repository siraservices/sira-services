"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArrowUpRight, Calendar, CheckCircle2, Clock, Mail, MapPin } from "lucide-react";
import { sendGAEvent } from "@next/third-parties/google";
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/seo";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Field, inputClass } from "@/components/ui/field";
import { SERVICE_OPTIONS, BUDGET_OPTIONS } from "@/components/home/ConversionSection";

export function ContactForm() {
  const submitLead = useMutation(api.leads.submit);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    serviceInterest: "",
    budget: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitLead({
        name: formData.name,
        email: formData.email,
        serviceInterest: formData.serviceInterest || undefined,
        budget: formData.budget || undefined,
        message: formData.message,
        source: "contact-page",
      });
      sendGAEvent("event", "contact_form_submit", {
        event_category: "engagement",
        event_label: "contact_page",
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(
        `Your message didn't send. Check your connection and try again, or email ${CONTACT_EMAIL}.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-36 sm:pt-40">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:px-16">
        <Reveal className="lg:col-span-5">
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow="Contact"
            title="Let's work"
            flourish="together."
            description="Have a project in mind? Book a free 30-minute call, or fill out the form and get a reply within 24–48 hours."
          />

          <div data-reveal className="mt-10 space-y-3">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-3xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:border-primary/60 hover:bg-primary/10"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                <Calendar className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="flex-1">
                <span className="block font-display text-sm font-semibold text-ink">Book a free 30-minute call</span>
                <span className="block text-xs text-muted">Google Meet · leave with a clear next step</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary-dark transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-4 rounded-3xl border border-divider bg-surface p-5 transition-colors hover:border-primary/40">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-dark">
                <Mail className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-ink">{CONTACT_EMAIL}</span>
                <span className="block text-xs text-muted">Reply within 24–48 hours</span>
              </span>
            </a>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-3xl border border-divider bg-surface p-5">
                <MapPin className="h-5 w-5 shrink-0 text-primary-dark" strokeWidth={2.2} />
                <span className="text-xs leading-snug text-muted">Charlotte, NC · remote worldwide</span>
              </div>
              <div className="flex items-center gap-3 rounded-3xl border border-divider bg-surface p-5">
                <Clock className="h-5 w-5 shrink-0 text-primary-dark" strokeWidth={2.2} />
                <span className="text-xs leading-snug text-muted">Eastern time · English / Español</span>
              </div>
            </div>
          </div>
          <p data-reveal className="mt-6 text-xs leading-relaxed text-text-dim">
            What you send here goes only to SIRA and is used to reply to you. No
            newsletters, no sharing.
          </p>
        </Reveal>

        <Reveal className="lg:col-span-7">
          <div data-reveal className="rounded-4xl border border-divider bg-surface p-6 shadow-card sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent-dark">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} />
                </span>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink">Thank you.</h2>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  Your message has been received. I&apos;ll get back to you within
                  24–48 hours to discuss how we can work together.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <p className="eyebrow text-primary-dark">╱ Send a message</p>
                  <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    Tell me about the project.
                  </h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" htmlFor="name" required>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass(false)}
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field label="Email" htmlFor="email" required>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass(false)}
                      placeholder="you@example.com"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Service" htmlFor="serviceInterest" hint="optional">
                    <select
                      id="serviceInterest"
                      value={formData.serviceInterest}
                      onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                      className={inputClass(false)}
                    >
                      <option value="">Select a service…</option>
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Approximate budget" htmlFor="budget" hint="optional">
                    <select
                      id="budget"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className={inputClass(false)}
                    >
                      <option value="">Select range…</option>
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Tell me about your project" htmlFor="message" required>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="What problem are you trying to solve? What does success look like?"
                    className={`${inputClass(false)} resize-none`}
                  />
                </Field>

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="magnetic-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-display text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {loading ? "Sending…" : "Send message"}
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
