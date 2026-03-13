# Stack Research

**Domain:** AI/ML consulting landing page (Next.js 14 enhancement)
**Researched:** 2026-03-13
**Confidence:** MEDIUM-HIGH

## Context

This is an enhancement to an existing Next.js 14 + Tailwind CSS 3 + Convex site. The existing stack is locked — no new frameworks, no Tailwind v4 upgrade. All additions must be additive libraries only. The goal is a dark, high-converting AI/ML consulting homepage with animations, a Calendly booking embed, and a lead capture form.

## Existing Stack (Do Not Change)

| Technology | Version | Locked |
|------------|---------|--------|
| Next.js | ^14.2.26 | Yes |
| React | ^18.3.0 | Yes |
| Tailwind CSS | ^3.4.15 | Yes |
| Convex | ^1.17.0 | Yes |
| react-hook-form | ^7.54.0 | Yes — already installed |
| lucide-react | ^0.460.0 | Yes — already installed |
| clsx + tailwind-merge | ^2.1.1 / ^3.5.0 | Yes — already installed |

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| motion (framer-motion) | ^11.x | Scroll-triggered animations, hero entrance effects, section reveals | The only React-native animation library with `useInView` + `whileInView` built in. Declarative API fits Next.js App Router's component model perfectly. `framer-motion` package still works (identical API) but `motion` is the canonical name going forward. Requires `'use client'` directive. |
| react-calendly | ^4.4.0 | Calendly inline embed and popup modal | Official integration pattern documented by Calendly. Provides `InlineWidget` (embed directly in page) and `PopupModal` (trigger from CTA button). No server-side API keys needed — just a Calendly URL. Works as a `'use client'` component in Next.js App Router. |
| zod | ^3.x | Form schema validation with TypeScript inference | Already the ecosystem standard paired with react-hook-form. `@hookform/resolvers` bridges the two. Eliminates manual TypeScript interface duplication — schema IS the type. |
| @hookform/resolvers | ^3.x | Connects zod schemas to react-hook-form | Required adapter. Without it, zod + RHF won't integrate cleanly. 1.5kB, zero friction. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | ^0.4.6 | Persistent dark mode without flash | Use if the site needs a dark/light toggle. If the homepage is permanently dark (no toggle), skip it — just set `dark` class on `<html>` statically in `layout.tsx` and use `dark:` Tailwind variants. |
| tailwindcss-animate | ^1.0.7 | CSS-based micro-animations (fade-in, slide-up) for elements that don't need JS | Use for simple hover transitions and subtle entrance effects where Framer Motion is overkill. Note: shadcn/ui deprecated this in March 2025 in favor of built-in CSS; safe to use standalone without shadcn. |
| @radix-ui/react-dialog | ^1.x | Accessible modal/popup for a Calendly popup trigger | Already have `@radix-ui/react-slot` in project. Radix is the underlying primitive for any popup CTA. Use if building a custom "Book a Call" modal wrapper around Calendly. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| TypeScript strict mode | Already enabled — keep enforced | All new animation components need proper prop types for `motion` variants |

## Installation

```bash
# Core additions
npm install motion react-calendly zod @hookform/resolvers

# Optional: only if adding a persistent dark/light toggle
npm install next-themes

# Optional: only if adding CSS-only micro-animations without Framer Motion
npm install tailwindcss-animate
```

Note: `react-hook-form` is already installed at ^7.54.0. No reinstall needed.

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `motion` (framer-motion) | GSAP | Only if you need timeline-based sequencing of 10+ simultaneous animations (e.g., a complex particle system). GSAP is more powerful but requires manual cleanup hooks in React — more boilerplate for marginal gain on a landing page. |
| `motion` (framer-motion) | AOS (Animate On Scroll) | Never for this project. AOS is a jQuery-era library that adds `data-` attributes to HTML. It doesn't integrate with React's component model, conflicts with SSR, and is actively discouraged in modern Next.js projects. |
| `motion` (framer-motion) | CSS Intersection Observer + Tailwind | Valid lightweight approach. Use if you want zero JS bundle impact. The tradeoff: no spring physics, no stagger children, and more manual `useEffect` boilerplate. For a consulting landing page with 5–6 sections, Framer Motion's convenience wins. |
| `react-calendly` | `<script>` tag embed via `next/script` | Viable fallback if `react-calendly` maintenance is a concern (last published ~9 months ago). The Calendly JS snippet can be loaded with `<Script src="..." strategy="lazyOnload" />` and initialized in `useEffect`. More brittle — no TypeScript types, no event callbacks. |
| `react-calendly` | Cal.com embed | Use if the client wants self-hosted scheduling, white-label branding, or open-source control. Cal.com has its own embed SDK. Overkill for an initial MVP — Calendly is simpler to set up. |
| `zod` | `yup` | Use yup only if the codebase already has yup dependencies (it doesn't). Zod has better TypeScript inference and smaller bundle size in 2025. |
| Permanent dark layout | `next-themes` toggle | The PROJECT.md specifies a "dark, tech-forward design" — not a toggle. A permanently dark page needs no theme library. Adding a toggle increases scope without adding conversion value. Skip `next-themes` unless explicitly requested. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind CSS v4 | The project is locked to Tailwind v3 (^3.4.15). shadcn/ui's Tailwind v4 support requires a full migration (`@theme` directive, CSS-first config). Do not upgrade mid-milestone. | Stay on Tailwind v3 — all Tailwind features needed for this landing page exist in v3. |
| AOS (aos npm package) | jQuery-era, non-React, SSR-hostile. Triggers hydration mismatches in Next.js App Router. Community has broadly abandoned it for React projects. | `motion` with `whileInView` |
| React Spring | Excellent library but optimized for gesture-driven interactive animations (drag, pinch). Overkill for scroll-reveal landing pages. Larger API surface to learn for no gain here. | `motion` with `whileInView` and `useInView` |
| shadcn/ui CLI initialization | The project already has `@radix-ui/react-slot`, `clsx`, `tailwind-merge`, and `class-variance-authority` installed — the shadcn dependencies. shadcn/ui components can be copied manually into `src/components/ui/` without running `npx shadcn init`, which would overwrite `globals.css` and `tailwind.config.ts`. | Copy individual shadcn component source files manually as needed |
| GSAP with ScrollTrigger plugin | ScrollTrigger is licensed under GSAP's "No Charge" license — free for most uses but not true open source. Adds unnecessary license complexity. ScrollTrigger is not needed for a 6-section landing page. | `motion` `useScroll` + `useTransform` |
| `react-hook-form` v8 / upgrade | v7 is already installed and stable. There is no v8 as of March 2026. Do not upgrade. | Stay on ^7.54.0 |

## Stack Patterns by Variant

**For animation components (hero, section reveals, cards):**
- All motion components must be in `'use client'` files
- Use `whileInView={{ opacity: 1, y: 0 }}` + `initial={{ opacity: 0, y: 30 }}` pattern for section reveals
- Use `viewport={{ once: true }}` to prevent re-animation on scroll back
- Wrap motion variants in a single `'use client'` wrapper component rather than making entire page files client components

**For the lead capture form:**
- `react-hook-form` + `zod` + `@hookform/resolvers` is already the established pattern in the project
- Form submission hits existing Convex `leads` mutation directly (no new backend needed)
- Mark form component as `'use client'`
- Keep fields minimal: name, email, company, project description — 4 fields max for higher conversion

**For the Calendly booking integration:**
- Dual CTA pattern: primary "Book a Consultation" button (links to Calendly) + secondary lead form (for visitors not ready to commit to a call)
- Use `react-calendly`'s `InlineWidget` embedded directly below the hero, or `PopupModal` triggered from the CTA button — inline is higher converting for consulting pages
- Wrap in `'use client'` component, set `min-height: 650px` on the container to prevent layout shift while widget loads
- Pass `styles={{ height: '650px' }}` prop to InlineWidget

**For dark theme implementation:**
- No theme toggle needed — use `dark` class on `<html>` in `layout.tsx` (or Tailwind's `darkMode: 'class'` + static class)
- Color palette: `slate-900` / `slate-950` backgrounds, `blue-600` / `blue-500` primary (#2563eb already configured), `slate-300` body text, `white` headings
- Gradient pattern: `bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950` for hero section
- Border glow effects: `border border-blue-500/20` + `shadow-blue-500/10` for card accents

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| motion@^11.x | React ^18.3.0, Next.js ^14.2.26 | React 18.2+ required. No breaking changes between v11 and v12 for the `whileInView` / `useInView` API used here. Install as `framer-motion` OR `motion` — both work. |
| react-calendly@^4.4.0 | React ^18.3.0, Next.js ^14.2.26 | Peer dep is React >=16.8.0. Must be in `'use client'` component. Works with App Router. Last published ~9 months ago but stable — no active bugs. |
| zod@^3.x | react-hook-form@^7.54.0 | Requires `@hookform/resolvers@^3.x` as the bridge adapter. Do not use `@hookform/resolvers@^2.x` — incompatible with RHF v7. |
| tailwindcss-animate@^1.0.7 | tailwindcss@^3.4.15 | Only compatible with Tailwind v3. If project ever upgrades to Tailwind v4, this plugin must be removed. |

## Sources

- [motion.dev — React Installation](https://motion.dev/docs/react-installation) — installation and `motion/react` import path (HIGH confidence)
- [motion.dev — GSAP vs Motion comparison](https://motion.dev/docs/gsap-vs-motion) — performance benchmarks (MEDIUM confidence — vendor source)
- [npmjs.com/package/framer-motion](https://www.npmjs.com/package/framer-motion) — version 12.36.0 confirmed as latest (HIGH confidence)
- [npmjs.com/package/react-calendly](https://www.npmjs.com/package/react-calendly) — version 4.4.0, last published ~9 months ago (HIGH confidence)
- [Calendly Help Center — React embed](https://help.calendly.com/hc/en-us/articles/31644195810199-How-to-embed-Calendly-in-a-React-app) — official integration guidance (HIGH confidence)
- [shadcn/ui — Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — confirms v3 and v4 coexistence, March 2025 deprecation of tailwindcss-animate (HIGH confidence)
- [github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes) — version 0.4.6 stable (HIGH confidence)
- [LogRocket — React animation libraries comparison](https://blog.logrocket.com/best-react-animation-libraries/) — ecosystem survey (MEDIUM confidence)
- [react-hook-form releases](https://github.com/react-hook-form/react-hook-form/releases) — v7.54.0 current (HIGH confidence)
- [LogRocket — React Hook Form vs React 19](https://blog.logrocket.com/react-hook-form-vs-react-19/) — RHF v7 viability in 2025 confirmed (MEDIUM confidence)

---
*Stack research for: AI/ML consulting landing page enhancement (Next.js 14 + Tailwind CSS 3)*
*Researched: 2026-03-13*
