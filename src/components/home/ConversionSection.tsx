"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ArrowUpRight, Calendar, CheckCircle2, Clock, Mail, MapPin } from "lucide-react";
import { BOOKING_URL, CONTACT_EMAIL } from "@/lib/seo";
import { Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Field, inputClass } from "@/components/ui/field";

export const SERVICE_OPTIONS = [
  "Machine Learning Development",
  "Computer Vision Solutions",
  "AI Process Automation",
  "AI Integration & Agent Orchestration",
  "Websites & Maintenance",
  "Not sure yet",
] as const;

export const BUDGET_OPTIONS = [
  "Under $5,000",
  "$5,000 – $15,000",
  "$15,000 – $50,000",
  "$50,000+",
  "Not sure yet",
] as const;

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  serviceInterest: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(1, "Please describe your project"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export function ConversionSection() {
  const submitLead = useMutation(api.leads.submit);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
  });

  const onSubmit = async (data: LeadFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await submitLead({
        name: data.name,
        email: data.email,
        serviceInterest: data.serviceInterest || undefined,
        budget: data.budget || undefined,
        message: data.message,
        source: "homepage",
      });
      reset();
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16 lg:py-40">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
        {/* Left: heading + contact cards */}
        <Reveal className="lg:col-span-5">
          <SectionHeading
            eyebrow="Start here"
            title="Talk to an engineer,"
            flourish="not a sales team."
            description="Book a free 30-minute call, or send a note and get a reply within 24–48 hours."
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
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-4 rounded-3xl border border-divider bg-surface p-5 transition-colors hover:border-primary/40"
            >
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

        {/* Right: form */}
        <Reveal className="lg:col-span-7">
          <div data-reveal className="rounded-4xl border border-divider bg-surface p-6 shadow-card sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent-dark">
                  <CheckCircle2 className="h-8 w-8" strokeWidth={2.2} />
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">Message received.</h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  Thanks. You&apos;ll hear back within 24–48 hours. If it&apos;s urgent, book a
                  call and we&apos;ll talk sooner.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div>
                  <p className="eyebrow text-primary-dark">╱ Send a message</p>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
                    Tell us about the project.
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name" htmlFor="name" required error={errors.name?.message}>
                    <input id="name" type="text" placeholder="Your full name" aria-invalid={!!errors.name} className={inputClass(!!errors.name)} {...register("name")} />
                  </Field>
                  <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                    <input id="email" type="email" placeholder="you@company.com" aria-invalid={!!errors.email} className={inputClass(!!errors.email)} {...register("email")} />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Service" htmlFor="serviceInterest" hint="optional">
                    <select id="serviceInterest" className={inputClass(false)} {...register("serviceInterest")}>
                      <option value="">Select a service…</option>
                      {SERVICE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Approximate budget" htmlFor="budget" hint="optional">
                    <select id="budget" className={inputClass(false)} {...register("budget")}>
                      <option value="">Select range…</option>
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Tell us about your project" htmlFor="message" required error={errors.message?.message}>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="What problem are you trying to solve? What does success look like?"
                    aria-invalid={!!errors.message}
                    className={`${inputClass(!!errors.message)} resize-none`}
                    {...register("message")}
                  />
                </Field>

                {error && <p className="text-center text-sm text-red-500">{error}</p>}

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
    </section>
  );
}
