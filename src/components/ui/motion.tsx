"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scroll reveal: fades + lifts every `[data-reveal]` child (or the wrapper
 * itself when it has none) the first time it scrolls into view.
 */
export function Reveal({
  children,
  className,
  stagger = 0.12,
  y = 36,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  as?: keyof JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const targets = items.length ? Array.from(items) : [el];
    // Hide, then play once the wrapper is in view. An IntersectionObserver is
    // used (not ScrollTrigger) so late image loads can't leave content hidden.
    gsap.set(targets, { y, opacity: 0 });
    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(targets, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    };
    const obs = new IntersectionObserver(
      (entries) => entries.some((e) => e.isIntersecting) && play(),
      { rootMargin: "0px 0px -12% 0px" },
    );
    obs.observe(el);
    // Safety net: never leave content invisible.
    const t = setTimeout(play, 6000);
    return () => {
      obs.disconnect();
      clearTimeout(t);
      gsap.set(targets, { clearProps: "transform,opacity" });
    };
  }, [stagger, y]);

  const Comp = Tag as unknown as React.ElementType;
  return (
    <Comp ref={ref} className={className}>
      {children}
    </Comp>
  );
}

/** Refreshes ScrollTrigger once fonts are in, so pinned/scrubbed sections measure right. */
export function ScrollTriggerRefresh() {
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 200);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => clearTimeout(t);
  }, []);
  return null;
}

/** Counts from 0 to `end` the first time it is 40% visible. */
export function CountUp({
  end,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 2000,
  className,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const render = (v: number) => {
      el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
    };
    if (prefersReducedMotion()) {
      render(end);
      return;
    }
    render(0);
    let started = false;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        const t0 = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / duration);
          render(end * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, suffix, prefix, decimals, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {end.toFixed(decimals)}
      {suffix}
    </span>
  );
}
