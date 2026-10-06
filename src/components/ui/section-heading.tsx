import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section heading in the house style: a mono eyebrow, a display line and a
 * serif-italic second line. `tone="dark"` for sections on `bg-deep`.
 */
export function SectionHeading({
  eyebrow,
  title,
  flourish,
  description,
  align = "left",
  tone = "light",
  size = "md",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: ReactNode;
  flourish?: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  size?: "md" | "lg";
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p
          data-reveal
          className={cn(
            "eyebrow mb-5",
            dark ? "text-primary-light" : "text-primary-dark",
          )}
        >
          ╱ {eyebrow}
        </p>
      )}
      <Tag
        data-reveal
        className={cn(
          "font-display font-bold tracking-tighter text-balance",
          size === "lg"
            ? "text-4xl sm:text-6xl lg:text-7xl leading-[0.98]"
            : "text-3xl sm:text-5xl lg:text-6xl leading-[1.02]",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
        {flourish && (
          <>
            <br />
            <span
              className={cn(
                "font-serif font-medium italic tracking-normal",
                dark ? "text-primary-light" : "text-primary-dark",
              )}
            >
              {flourish}
            </span>
          </>
        )}
      </Tag>
      {description && (
        <p
          data-reveal
          className={cn(
            "mt-6 text-base sm:text-lg leading-relaxed",
            dark ? "text-white/65" : "text-muted",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Primary / secondary / text-link button classes, kept in one place. */
export const btn = {
  primary:
    "magnetic-btn inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  secondaryDark:
    "magnetic-btn inline-flex items-center justify-center gap-2 rounded-full glass-dark border border-white/15 px-6 py-3 font-display text-sm font-semibold text-white hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
  secondary:
    "magnetic-btn inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-surface px-6 py-3 font-display text-sm font-semibold text-ink hover:border-primary/50 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  link: "lift-on-hover inline-flex items-center gap-1.5 font-display text-sm font-semibold text-primary-dark hover:text-primary",
};
