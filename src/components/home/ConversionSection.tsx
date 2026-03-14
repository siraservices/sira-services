"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Calendar, CheckCircle } from "lucide-react";

// Booking URL placeholder — replace with Google Booking Page URL before ship
const BOOKING_URL = "#";

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  company: z.string().optional(),
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
        company: data.company || undefined,
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
    <section id="booking" className="py-24 px-6 bg-surface">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-text leading-tight mb-4">
            Let&apos;s Build Something That Matters
          </h2>
          <p className="text-text-body font-body text-lg max-w-2xl mx-auto leading-relaxed">
            Ready to turn your data into a competitive advantage? Book a free
            consultation or drop us a note — we&apos;ll respond within 24-48 hours.
          </p>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 items-start">
          {/* Left column — Booking CTA card */}
          <div className="bg-surface-alt border border-primary/30 rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-text mb-3">
                Ready to get started?
              </h3>
              <p className="text-text-body font-body leading-relaxed">
                Skip the back-and-forth. Book a free 30-minute consultation
                directly on our calendar — we&apos;ll discuss your goals, challenges,
                and how we can help.
              </p>
            </div>

            <ul className="space-y-2">
              {[
                "100% free, no obligation",
                "30-minute focused session",
                "Immediate project clarity",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-text-body font-body text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-cta text-cta-text font-display font-semibold px-8 py-4 rounded-lg hover:-translate-y-1 hover:shadow-cta-glow transition-all duration-200 mt-auto"
            >
              <Calendar className="w-5 h-5" />
              Book a Consultation
            </a>
          </div>

          {/* "Or" divider — horizontal on mobile, vertical on desktop */}
          <div className="flex flex-col items-center justify-center md:px-8 py-6 md:py-0 md:self-stretch">
            {/* Mobile: horizontal lines with "or" */}
            <div className="flex items-center w-full md:hidden">
              <div className="flex-1 h-px bg-text-muted/20" />
              <span className="mx-4 text-text-muted text-sm uppercase tracking-wider font-display">
                or
              </span>
              <div className="flex-1 h-px bg-text-muted/20" />
            </div>

            {/* Desktop: vertical lines with "or" */}
            <div className="hidden md:flex flex-col items-center h-full gap-3">
              <div className="flex-1 w-px bg-text-muted/20" />
              <span className="text-text-muted text-sm uppercase tracking-wider font-display">
                or
              </span>
              <div className="flex-1 w-px bg-text-muted/20" />
            </div>
          </div>

          {/* Right column — Lead form card */}
          <div className="bg-surface-alt rounded-2xl p-8">
            {submitted ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                <CheckCircle className="w-14 h-14 text-primary" />
                <div>
                  <h3 className="font-display font-bold text-xl text-text mb-2">
                    Message received!
                  </h3>
                  <p className="text-text-body font-body leading-relaxed">
                    Thanks! We&apos;ll be in touch within 24-48 hours.
                  </p>
                </div>
              </div>
            ) : (
              /* Lead form */
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <div>
                  <h3 className="font-display font-semibold text-xl text-text mb-1">
                    Send us a message
                  </h3>
                  <p className="text-text-muted font-body text-sm">
                    Prefer to share details first? We&apos;ll follow up within 24-48 hours.
                  </p>
                </div>

                {/* Name + Email: side-by-side on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-display font-medium text-text mb-1.5"
                    >
                      Name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      aria-invalid={!!errors.name}
                      className={`w-full px-4 py-3 bg-surface border rounded-lg text-text placeholder:text-text-muted font-body focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors duration-200 ${
                        errors.name
                          ? "border-red-500"
                          : "border-text-muted/20"
                      }`}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-display font-medium text-text mb-1.5"
                    >
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      aria-invalid={!!errors.email}
                      className={`w-full px-4 py-3 bg-surface border rounded-lg text-text placeholder:text-text-muted font-body focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors duration-200 ${
                        errors.email
                          ? "border-red-500"
                          : "border-text-muted/20"
                      }`}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company — full width */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-display font-medium text-text mb-1.5"
                  >
                    Company{" "}
                    <span className="text-text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    placeholder="Your company name"
                    className="w-full px-4 py-3 bg-surface border border-text-muted/20 rounded-lg text-text placeholder:text-text-muted font-body focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors duration-200"
                    {...register("company")}
                  />
                </div>

                {/* Project description — full width */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-display font-medium text-text mb-1.5"
                  >
                    Tell us about your project <span className="text-primary">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="What problem are you trying to solve? What does success look like?"
                    aria-invalid={!!errors.message}
                    className={`w-full px-4 py-3 bg-surface border rounded-lg text-text placeholder:text-text-muted font-body focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-colors duration-200 resize-none ${
                      errors.message
                        ? "border-red-500"
                        : "border-text-muted/20"
                    }`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Mutation error */}
                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                {/* Submit button — ghost/outline style (secondary) */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-8 border border-text-muted/40 text-text bg-transparent font-display font-semibold rounded-lg hover:border-text-muted/70 hover:bg-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
