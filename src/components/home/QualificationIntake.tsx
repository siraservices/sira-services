"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, ChevronRight, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    key: "serviceInterest",
    title: "What type of problem are you solving?",
    subtitle: "Choose the area that best matches your project.",
    type: "tiles" as const,
    options: [
      "AI Integration",
      "Computer Vision",
      "Process Automation",
      "Agent Orchestration",
      "Data / ML Modeling",
      "Not Sure Yet",
    ],
  },
  {
    key: "projectMaturity",
    title: "Where are you in your project journey?",
    subtitle: "Be honest — it helps us calibrate the right engagement.",
    type: "tiles" as const,
    options: [
      "Just an idea",
      "Have a requirements doc",
      "PoC underway",
      "Production ready to scale",
      "Replacing an existing system",
    ],
  },
  {
    key: "budget",
    title: "What's your approximate budget?",
    subtitle: "Rough ranges are fine — no commitment required.",
    type: "tiles" as const,
    options: [
      "$0 – $5k",
      "$5k – $15k",
      "$15k – $50k",
      "$50k+",
      "Need help scoping",
    ],
  },
  {
    key: "timeline",
    title: "When do you want to start?",
    subtitle: "Timeline shapes how we staff and sequence the work.",
    type: "tiles" as const,
    options: [
      "ASAP",
      "1 – 3 months",
      "3 – 6 months",
      "6+ months",
      "Exploring options",
    ],
  },
  {
    key: "successCriteria",
    title: "Define success in measurable terms.",
    subtitle:
      "What does 'done' look like? Be specific: metrics, outcomes, thresholds.",
    type: "textarea" as const,
    placeholder:
      "e.g. Reduce manual review time by 70%, classify 10k images/day with >95% accuracy, automate 80% of our onboarding workflow...",
    minLength: 100,
  },
  {
    key: "biggestRisk",
    title: "What's your biggest risk or unknown?",
    subtitle: "What keeps you up at night about this project?",
    type: "textarea" as const,
    placeholder:
      "e.g. We don't have labeled training data, our team has no ML experience, we tried this before and it failed...",
    minLength: 50,
  },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

interface Answers extends Record<StepKey, string> {}

interface EmailCapture {
  name: string;
  email: string;
  company: string;
  decisionRole: string;
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-60%" : "60%", opacity: 0 }),
};

const transition = { duration: 0.28, ease: "easeInOut" } as const;

interface Props {
  buttonText?: string;
  variant?: "primary" | "banner";
  className?: string;
}

export function QualificationIntake({
  buttonText = "AM I QUALIFIED?",
  variant = "primary",
  className,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [emailData, setEmailData] = useState<Partial<EmailCapture>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLead = useMutation(api.leads.submit);

  const totalScreens = STEPS.length + 1; // questions + email capture (success is bonus)
  const progress =
    step <= STEPS.length
      ? Math.round(((step + 1) / (totalScreens + 1)) * 100)
      : 100;

  const currentStepDef = step < STEPS.length ? STEPS[step] : null;

  const canAdvance = useCallback(() => {
    if (step < STEPS.length) {
      const s = STEPS[step];
      const val = answers[s.key] ?? "";
      if (s.type === "tiles") return val.length > 0;
      return val.length >= s.minLength;
    }
    if (step === STEPS.length) {
      const { name = "", email = "" } = emailData;
      return name.trim().length > 0 && email.includes("@");
    }
    return false;
  }, [step, answers, emailData]);

  const advance = useCallback(() => {
    setDirection(1);
    setStep((s) => s + 1);
  }, []);

  const back = useCallback(() => {
    setDirection(-1);
    setStep((s) => s - 1);
  }, []);

  const setAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!emailData.name || !emailData.email) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitLead({
        name: emailData.name,
        email: emailData.email,
        company: emailData.company,
        message: answers.successCriteria ?? "",
        source: "qualification_intake",
        serviceInterest: answers.serviceInterest,
        budget: answers.budget,
        timeline: answers.timeline,
        projectMaturity: answers.projectMaturity,
        successCriteria: answers.successCriteria,
        biggestRisk: answers.biggestRisk,
        decisionRole: emailData.decisionRole,
      });
      setDirection(1);
      setStep(STEPS.length + 1);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(0);
      setAnswers({});
      setEmailData({});
      setError(null);
      setDirection(1);
    }, 350);
  };

  return (
    <>
      {variant === "primary" ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={cn(
            "h-12 rounded-full pl-6 pr-4 text-base font-display font-semibold",
            "bg-cta text-cta-text hover:bg-cta/90 transition-all duration-200",
            className
          )}
        >
          <span className="text-nowrap">{buttonText}</span>
          <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "inline-flex items-center justify-center gap-2 bg-cta text-cta-text",
            "font-display font-semibold px-8 py-4 rounded-full",
            "hover:-translate-y-1 transition-all duration-200 cursor-pointer",
            className
          )}
        >
          {buttonText}
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
              onClick={close}
            />

            {/* Card */}
            <motion.div
              className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ maxHeight: "90vh" }}
            >
              {/* Progress bar */}
              <div className="h-1 bg-surface-muted flex-shrink-0">
                <motion.div
                  className="h-full bg-cta"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              {/* Close */}
              <button
                onClick={close}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-surface-hover transition-colors z-10"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-text-muted" />
              </button>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1" style={{ minHeight: 360 }}>
                <AnimatePresence custom={direction} mode="wait">
                  {/* Tile/textarea question steps */}
                  {step < STEPS.length && currentStepDef && (
                    <motion.div
                      key={`step-${step}`}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={transition}
                      className="px-8 pt-8 pb-4"
                    >
                      <p className="text-xs font-display font-semibold text-text-dim uppercase tracking-widest mb-3">
                        Question {step + 1} of {STEPS.length}
                      </p>
                      <h2 className="font-display font-bold text-xl sm:text-2xl text-text mb-2 leading-snug">
                        {currentStepDef.title}
                      </h2>
                      <p className="text-text-muted font-body text-sm mb-6">
                        {currentStepDef.subtitle}
                      </p>

                      {currentStepDef.type === "tiles" && (
                        <div className="grid grid-cols-2 gap-3">
                          {currentStepDef.options.map((opt) => {
                            const selected = answers[currentStepDef.key] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => setAnswer(currentStepDef.key, opt)}
                                className={cn(
                                  "p-4 rounded-xl border-2 text-left font-body text-sm transition-all duration-150",
                                  selected
                                    ? "border-text bg-text text-surface font-semibold"
                                    : "border-surface-border bg-surface-alt text-text hover:border-charcoal/40 hover:bg-surface-muted"
                                )}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {currentStepDef.type === "textarea" && (
                        <div>
                          <textarea
                            value={answers[currentStepDef.key] ?? ""}
                            onChange={(e) =>
                              setAnswer(currentStepDef.key, e.target.value)
                            }
                            placeholder={currentStepDef.placeholder}
                            rows={5}
                            className="w-full border border-surface-border rounded-xl p-4 font-body text-sm text-text bg-surface-alt resize-none focus:outline-none focus:ring-2 focus:ring-text/20 placeholder:text-text-dim"
                          />
                          <p
                            className={cn(
                              "text-xs mt-1 transition-colors",
                              (answers[currentStepDef.key] ?? "").length >=
                                currentStepDef.minLength
                                ? "text-text-dim"
                                : "text-muted"
                            )}
                          >
                            {(answers[currentStepDef.key] ?? "").length} /{" "}
                            {currentStepDef.minLength} min characters
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Email capture */}
                  {step === STEPS.length && (
                    <motion.div
                      key="email"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={transition}
                      className="px-8 pt-8 pb-4"
                    >
                      <p className="text-xs font-display font-semibold text-text-dim uppercase tracking-widest mb-3">
                        Almost there
                      </p>
                      <h2 className="font-display font-bold text-xl sm:text-2xl text-text mb-2">
                        Where should we send your results?
                      </h2>
                      <p className="text-text-muted font-body text-sm mb-6">
                        We&apos;ll review your answers and reach out within 1
                        business day.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(
                          [
                            {
                              key: "name",
                              label: "Name",
                              required: true,
                              type: "text",
                              placeholder: "Jane Smith",
                            },
                            {
                              key: "email",
                              label: "Work Email",
                              required: true,
                              type: "email",
                              placeholder: "jane@company.com",
                            },
                            {
                              key: "company",
                              label: "Company",
                              required: false,
                              type: "text",
                              placeholder: "Acme Corp",
                            },
                            {
                              key: "decisionRole",
                              label: "Your Role",
                              required: false,
                              type: "text",
                              placeholder: "CTO, Founder, PM...",
                            },
                          ] as const
                        ).map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-display font-semibold text-text-muted mb-1 uppercase tracking-wide">
                              {field.label}
                              {field.required && (
                                <span className="text-text ml-0.5">*</span>
                              )}
                            </label>
                            <input
                              type={field.type}
                              value={emailData[field.key] ?? ""}
                              onChange={(e) =>
                                setEmailData((p) => ({
                                  ...p,
                                  [field.key]: e.target.value,
                                }))
                              }
                              placeholder={field.placeholder}
                              className="w-full border border-surface-border rounded-xl px-4 py-3 font-body text-sm text-text bg-surface-alt focus:outline-none focus:ring-2 focus:ring-text/20 placeholder:text-text-dim"
                            />
                          </div>
                        ))}
                      </div>

                      {error && (
                        <p className="mt-4 text-sm text-red-500">{error}</p>
                      )}
                    </motion.div>
                  )}

                  {/* Success */}
                  {step === STEPS.length + 1 && (
                    <motion.div
                      key="success"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={transition}
                      className="px-8 py-16 flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-text flex items-center justify-center mb-6">
                        <Check className="h-8 w-8 text-surface" strokeWidth={2.5} />
                      </div>
                      <h2 className="font-display font-bold text-2xl text-text mb-3">
                        You&apos;re in the queue.
                      </h2>
                      <p className="font-body text-text-muted max-w-sm mb-8">
                        We&apos;ll review your answers and reach out within 1
                        business day. The more specific you were, the faster we
                        can respond.
                      </p>
                      <button
                        onClick={close}
                        className="font-display font-semibold text-sm text-text-muted hover:text-text transition-colors"
                      >
                        Close
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer nav — hidden on success */}
              {step <= STEPS.length && (
                <div className="px-8 py-5 flex items-center justify-between border-t border-surface-border flex-shrink-0">
                  <button
                    onClick={step === 0 ? close : back}
                    className="flex items-center gap-1.5 text-sm font-body text-text-muted hover:text-text transition-colors"
                  >
                    {step === 0 ? (
                      "Cancel"
                    ) : (
                      <>
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </>
                    )}
                  </button>

                  {step < STEPS.length ? (
                    <Button
                      onClick={advance}
                      disabled={!canAdvance()}
                      size="sm"
                      className="rounded-full px-6 h-10 font-display font-semibold bg-cta text-cta-text disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canAdvance() || submitting}
                      size="sm"
                      className="rounded-full px-6 h-10 font-display font-semibold bg-cta text-cta-text disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Submitting…" : "Submit"}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
