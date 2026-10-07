import type { ReactNode } from "react";

/** Labelled form field with the label above and an inline error line. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block font-display text-sm font-medium text-ink">
        {label}
        {required && <span className="text-primary"> *</span>}
        {hint && <span className="ml-1 font-normal text-muted">({hint})</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function inputClass(invalid: boolean) {
  return `w-full rounded-2xl border bg-background px-4 py-3 font-body text-sm text-ink placeholder:text-text-dim transition-colors duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${
    invalid ? "border-red-400" : "border-divider"
  }`;
}
