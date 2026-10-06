import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/seo";

/**
 * Shared shell for the Privacy and Terms pages. The copy is boilerplate for
 * the owner to review before launch; it is not legal advice.
 */
export function LegalPage({
  eyebrow,
  title,
  flourish,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  flourish: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="px-6 pb-24 pt-36 sm:px-10 sm:pt-40">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-5 text-primary-dark">╱ {eyebrow}</p>
        <h1 className="font-display text-4xl font-bold leading-[0.98] tracking-tighter text-ink sm:text-6xl">
          {title}
          <br />
          <span className="font-serif font-medium italic tracking-normal text-primary-dark">{flourish}</span>
        </h1>
        <p className="mt-6 font-mono text-xs text-muted">Last updated {updated}</p>

        <div className="mt-12 space-y-8 text-base leading-relaxed text-text-body [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink [&_p]:mt-3">
          {children}
        </div>

        <p className="mt-14 rounded-3xl border border-divider bg-surface p-6 text-sm text-muted">
          Questions about this page? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary-dark">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
