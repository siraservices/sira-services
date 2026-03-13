# Project Research Summary

**Project:** Sira Services — AI/ML Consulting Homepage Enhancement
**Domain:** Conversion-focused B2B consulting landing page (Next.js 14 + Convex)
**Researched:** 2026-03-13
**Confidence:** HIGH

## Executive Summary

Sira Services needs a conversion-optimized homepage that positions the firm as a credible AI/ML/Computer Vision specialist — not a generic IT shop. Research across four domains converges on a clear approach: enhance the existing Next.js 14 + Convex codebase with additive libraries only (Framer Motion for animations, react-calendly for booking, zod for form validation), organize the page as RSC-first with two isolated client-side islands (lead form + Calendly widget), and lead every content decision with business outcomes rather than technical capabilities. The stack is largely locked; no framework upgrades or major rewrites are needed.

The recommended page structure follows the high-converting B2B consulting formula: outcome-focused hero with a single dominant CTA, trust metrics bar, services grid with outcome-framed descriptions, social proof (Jesse Batt testimonial + Performance Meal Prep case study), dual-track conversion section (Calendly booking as primary + lead form as secondary), and a closing CTA banner. This structure is validated by conversion research and competitor analysis. The Performance Meal Prep case study is the single most important content asset — one real quantified outcome beats three vague testimonials.

The highest-risk area is not technical; it is messaging and content hierarchy. The most common failure mode for consulting homepages is feature-led copy that describes capabilities ("we build computer vision systems") instead of outcomes ("catch defects before they reach shipping"). A secondary risk is the Calendly integration blocking page load performance — this must be deferred via `next/dynamic` with `ssr: false` from day one, not retrofitted later. Both risks are avoidable with explicit planning; neither requires research-phase intervention during execution.

## Key Findings

### Recommended Stack

The existing stack (Next.js 14, Tailwind CSS 3, Convex, react-hook-form, lucide-react) is locked and requires no changes. Four additive libraries cover all new functionality: `motion` (Framer Motion) for scroll-triggered animations, `react-calendly` for the booking embed, `zod` for form schema validation, and `@hookform/resolvers` to bridge zod with the already-installed react-hook-form. A permanently dark design eliminates the need for `next-themes` — the dark background is authored directly in `globals.css` without conditional class toggling, which also avoids FOUC.

**Core technologies:**
- `motion` (Framer Motion ^11.x): Scroll-triggered section reveals — the only React-native library with built-in `whileInView` + `useInView`. Must be in `'use client'` wrapper components.
- `react-calendly ^4.4.0`: Calendly inline embed — official integration pattern, requires `next/dynamic` with `ssr: false` to avoid blocking page load. Last published ~9 months ago but stable.
- `zod ^3.x` + `@hookform/resolvers ^3.x`: Form validation — pairs with already-installed react-hook-form v7; eliminates TypeScript interface duplication.
- Tailwind CSS 3 (existing): Dark theme via direct `bg-slate-900`/`slate-950` authoring — no `dark:` class prefix needed since the site is permanently dark. Color palette: slate-900/950 backgrounds, blue-600 primary (#2563eb already configured), white headings, slate-300 body text.

### Expected Features

Research confirms a clear v1 feature set for launch and a v1.x backlog to add post-validation.

**Must have (table stakes):**
- Hero section — outcome-focused headline naming AI/ML/CV disciplines, single primary CTA ("Book a Consultation"), dark gradient background
- Services grid (3 cards) — AI Consulting/Strategy, Data Pipeline Implementation, Custom Computer Vision Systems; outcome-framed descriptions naming specific industries
- Social proof section — Jesse Batt testimonial with at least one concrete Performance Meal Prep metric alongside it
- Lead capture form — exactly 4 fields (name, email, company, project description); submits to existing Convex `leads` table with `source: "homepage"`
- Calendly booking — inline embed or popup as primary conversion path; positioned as the "ready now" CTA
- Dark tech visual design — gradient backgrounds, consistent typography, professional polish signaling AI expertise

**Should have (competitive differentiators):**
- Dual-track conversion hierarchy — Calendly as primary (filled button), lead form as secondary ("prefer to send details first?")
- Domain-specific credibility signals — AI/ML/CV named explicitly in hero; industry names (manufacturing, food production) in service descriptions
- "Why Sira Services" differentiator block — names specific advantages over large agencies and offshore shops
- Metrics/results bar — concrete figures from Performance Meal Prep engagement (hours automated, accuracy improvements)

**Defer (v2+):**
- Services page redesign — homepage is the highest-leverage page; other pages are functional
- "How we work" process section — add when bounce data suggests visitors need engagement model clarity
- Video testimonials — high conversion lift but requires production work
- ROI calculator — high complexity, low credibility; a real case study metric outperforms

### Architecture Approach

The homepage follows an RSC-first architecture with client-side islands only where required. `src/app/page.tsx` is a pure compositor (Server Component) that imports and orders section components. All static sections (HeroSection, ServicesGrid, TrustMetrics, TestimonialsRow, CTABanner) are Server Components with static data co-located as typed constants — no Convex queries, no `useState`, zero JS bundle contribution. Only two components require `"use client"`: `LeadCaptureForm` (Convex mutation) and `CalendlyWidget` (browser SDK). All new section components live in `src/components/home/` to scope the landing page without polluting the root components directory.

**Major components:**
1. `src/app/page.tsx` (RSC) — layout compositor; imports all sections in the correct visual order
2. `src/components/home/HeroSection.tsx` (RSC) — headline, sub-headline, dual CTA links (primary: Calendly anchor, secondary: form anchor)
3. `src/components/home/TrustMetrics.tsx` (RSC) — stats bar with quantified outcomes from Performance Meal Prep
4. `src/components/home/ServicesGrid.tsx` (RSC) — three service cards with outcome-framed descriptions
5. `src/components/home/TestimonialsRow.tsx` (RSC) — Jesse Batt testimonial + case study callout
6. `src/components/home/LeadCaptureSection.tsx` (RSC) — two-column layout wrapper with `id="book"` anchor
7. `src/components/home/LeadCaptureForm.tsx` (Client) — form with Convex `api.leads.submit` mutation; `source: "homepage"`
8. `src/components/home/CalendlyWidget.tsx` (Client) — `next/dynamic` with `ssr: false`; 650px reserved height to prevent layout shift
9. `src/components/home/CTABanner.tsx` (RSC) — closing dark CTA band linking to contact page

### Critical Pitfalls

1. **Feature-led messaging** — Run the "so what?" test on every headline and service description. "AI Consulting" is a feature; "a prioritized roadmap showing which processes to automate first" is a benefit. Every headline must name a client pain or outcome, not a service category. Address in the content/copy phase before any JSX is written.

2. **Calendly embed blocking page load** — The default Calendly embed loads synchronously and adds 1-3 seconds to LCP. Use `next/dynamic` with `ssr: false` and a 650px skeleton placeholder from day one. Never use the vanilla `<script>` tag approach in `layout.tsx`. Address in the Calendly integration phase and verify with Lighthouse (target: Performance score >= 85).

3. **Dual CTA confusion (form + Calendly at equal visual weight)** — Presenting both conversion paths as siblings without hierarchy dilutes both. Calendly is the primary CTA (filled button, prominent placement); the lead form is labeled as the secondary path ("prefer to send details first?"). Visual hierarchy enforced in Tailwind: filled vs. outline button styles. Address in the LeadCaptureSection layout phase.

4. **Dark theme FOUC on first load** — If `dark:` Tailwind variants are used conditionally, the page flashes light on hard refresh. Solution: author the entire page in dark styles without the `dark:` prefix; set `bg-slate-950` directly on `body` in `globals.css`. Address in the global styles phase, before any section components are built.

5. **Convex hooks on static content** — Wrapping hero, services, and testimonials in `useQuery` forces unnecessary client-side JS for data that never changes per visitor. Static content lives as typed constants inside the RSC files. Only `LeadCaptureForm` and any future blog preview need Convex hooks. Enforce throughout the component build phases.

## Implications for Roadmap

Based on combined research, the recommended phase structure is:

### Phase 1: Global Styles and Design Tokens
**Rationale:** Architecture research identifies this as the hard dependency — all section components depend on dark theme tokens existing in `tailwind.config.ts` and `globals.css`. Doing it first eliminates color inconsistencies that compound as sections are added. PITFALLS.md identifies dark theme FOUC as a critical pitfall that must be resolved before any section work.
**Delivers:** Confirmed dark color palette (slate-900/950 backgrounds, blue-600 primary, slate-100/white text), `body` background set in `globals.css` to prevent FOUC, WCAG AA contrast verified for all planned color pairings, Tailwind config extended with any new tokens.
**Addresses:** Dark tech visual design (FEATURES.md table stakes), dark theme FOUC (PITFALLS.md critical), gradient contrast accessibility (PITFALLS.md)
**Avoids:** Pitfall 5 (FOUC), Pitfall 7 (gradient contrast failures)
**Research flag:** Skip — established Tailwind patterns, no research needed

### Phase 2: Package Installation and Library Setup
**Rationale:** Install additive libraries before any component that depends on them. This is a low-risk, high-clarity phase with no architectural decisions.
**Delivers:** `motion`, `react-calendly`, `zod`, `@hookform/resolvers` installed and verified compatible with existing stack. `src/lib/config.ts` created with Calendly URL constant. `src/components/home/` directory scaffolded.
**Uses:** STACK.md installation guidance; version compatibility table
**Avoids:** Version conflict surprises mid-build; Pitfall 4 (synchronous Calendly loading) by setting up the `next/dynamic` pattern before the widget is built
**Research flag:** Skip — verified package versions from npm, no research needed

### Phase 3: Static RSC Section Components
**Rationale:** All static sections (Hero, TrustMetrics, ServicesGrid, TestimonialsRow, CTABanner) are independent of each other and have zero external dependencies. They can be built in parallel or sequentially without blocking the client-side components. Building them first establishes the page's visual narrative and content hierarchy before adding interactivity.
**Delivers:** Hero section with outcome-focused headline and dual CTA buttons; TrustMetrics bar with Performance Meal Prep quantified outcomes; ServicesGrid with 3 outcome-framed service cards; TestimonialsRow with Jesse Batt testimonial and case study callout; CTABanner closing section.
**Addresses:** Hero (P1), Services grid (P1), Social proof (P1), Professional visual design (P1) from FEATURES.md
**Avoids:** Pitfall 1 (feature-led messaging) — copy review gates this phase; Pitfall 8 (Convex hooks on static content); Anti-pattern 2 (unnecessary `"use client"` on static sections)
**Research flag:** Skip for implementation — content/copy review may need stakeholder input on real testimonial wording and metrics

### Phase 4: Lead Capture Form (Client Component)
**Rationale:** The lead form wires to the existing Convex `api.leads.submit` mutation — no schema changes needed. It is isolated as a Client Component leaf node. Building it as a standalone phase ensures proper validation (zod + @hookform/resolvers) and success state handling before it is composed into the section layout.
**Delivers:** `LeadCaptureForm.tsx` — 4-field form (name, email, company, project description), zod validation schema, Convex mutation call with `source: "homepage"`, inline success state, spam honeypot field, submit button disabled post-submission.
**Uses:** react-hook-form (existing), zod + @hookform/resolvers (new), Convex `api.leads.submit` (existing)
**Addresses:** Lead capture form (P1 table stakes), form field discipline (exactly 4 fields)
**Avoids:** Pitfall 6 (form field overload — 4 fields maximum enforced); UX pitfall (no confirmation state after submission); Security mistake (no spam protection)
**Research flag:** Skip — well-documented pattern; existing Convex mutation already matches requirements

### Phase 5: Calendly Widget and Booking Integration
**Rationale:** Calendly requires an external account and event type URL to be configured — this is the one external dependency that cannot be resolved purely in code. Isolating it to its own phase allows a fallback (direct email link) if Calendly setup is delayed. The `next/dynamic` wrapper must be correct from the start to avoid the LCP performance trap.
**Delivers:** `CalendlyWidget.tsx` — `react-calendly` `InlineWidget` wrapped in `next/dynamic` with `ssr: false`, 650px skeleton placeholder, Calendly URL pulled from `src/lib/config.ts`. Fallback: direct Calendly link if inline embed is not ready.
**Uses:** react-calendly (new), next/dynamic (existing Next.js API)
**Addresses:** Calendly CTA / booking link (P1), dual-track conversion (differentiator)
**Avoids:** Pitfall 4 (Calendly blocking LCP); Architecture Anti-pattern 3 (inline script tag approach); Integration gotcha (specific event type URL, not general booking page)
**Research flag:** Skip — Calendly integration pattern is well-documented; main dependency is external account setup, not code research

### Phase 6: LeadCaptureSection Layout Composition
**Rationale:** This phase composes `LeadCaptureForm` and `CalendlyWidget` into the `LeadCaptureSection` two-column layout. Depends on both Phase 4 and Phase 5 completing. The critical design decision here is enforcing CTA hierarchy — Calendly as primary, form as secondary — to avoid the dual CTA confusion pitfall.
**Delivers:** `LeadCaptureSection.tsx` with `id="book"` anchor, two-column layout (Calendly left/primary, form right/secondary on desktop; stacked on mobile), framing microcopy establishing hierarchy ("Ready to get started? Book a call. Prefer to send details first? Fill out this form.").
**Addresses:** Dual-track CTA conversion strategy (differentiator), mobile responsiveness (table stakes)
**Avoids:** Pitfall 3 (dual CTA confusion — hierarchy enforced via layout, visual weight, and microcopy)
**Research flag:** Skip — layout patterns are standard; CTA hierarchy decision is a product/design call, not a research question

### Phase 7: Page Composition and Scroll Animations
**Rationale:** Final assembly phase. `page.tsx` imports all section components in the research-validated order. Scroll animations (Framer Motion `whileInView`) are added last — they are progressive enhancement over a fully-functional static page. Adding animations before content is stable wastes effort if sections are reordered.
**Delivers:** `src/app/page.tsx` as clean compositor (Hero → TrustMetrics → ServicesGrid → TestimonialsRow → LeadCaptureSection → CTABanner). Section reveals with `motion` `whileInView`, `viewport={{ once: true }}`. Animation wrapper components are `'use client'` leaf wrappers — static sections remain RSC.
**Uses:** motion/Framer Motion (new)
**Addresses:** Animated section transitions (P3 — progressive enhancement), professional visual design (P1)
**Avoids:** Anti-pattern 2 (sections converted to client components for animation — wrapper pattern preserves RSC status)
**Research flag:** Skip — Framer Motion whileInView pattern is well-documented

### Phase 8: Quality Assurance and Pre-launch Verification
**Rationale:** Research identified a specific "looks done but isn't" checklist. This phase validates that all integration points actually work end-to-end in a production-like environment — not just in the dev server with hot reloading.
**Delivers:** Verified lead form writes to Convex and appears in admin dashboard; Calendly embed renders correctly at 375px mobile viewport; no dark theme FOUC on hard refresh in incognito; Lighthouse Performance >= 85 with Calendly present; Lighthouse Accessibility >= 90 with no WCAG AA failures; WorkOS middleware confirmed to allow public access to `/`.
**Avoids:** All 8 critical/moderate pitfalls (verification step); "looks done but isn't" shipping failures

### Phase Ordering Rationale

- **Design tokens before components:** Every section depends on the color palette being decided; doing it first prevents cascading rework.
- **Static RSC sections before client islands:** Static sections are independent and risk-free; building them first establishes the page's content and visual structure, making the client component integration phases lower-risk.
- **Lead form before section composition:** The form is the simpler client component (no external account dependency); it can be built and tested in isolation while Calendly setup proceeds in parallel if needed.
- **Calendly before section composition:** External dependency (Calendly account) must be resolved before this is production-ready; building it in its own phase allows fallback planning.
- **Animations last:** Progressive enhancement — the page must be fully functional before animation is layered on.

### Research Flags

Phases likely needing deeper research during planning:
- None identified. All phases follow well-documented patterns with verified library choices.

Phases with standard patterns (skip research-phase):
- **All phases:** Existing Next.js 14 + Convex + Tailwind CSS 3 patterns are well-documented with official sources. The additive libraries (motion, react-calendly, zod) have clear integration guides. The conversion patterns (hero structure, dual CTA, form field count) are validated by multiple independent sources.

One area requiring non-research validation during execution:
- **Content/copy:** Real testimonial wording (Jesse Batt) and real metrics from Performance Meal Prep must be confirmed with the client before the social proof section ships. This is a content dependency, not a research gap.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package choices verified against official docs and npm; version compatibility confirmed; locked stack eliminates upgrade risk |
| Features | HIGH | Multiple independent B2B conversion sources corroborate the same feature priorities; competitor analysis cross-referenced |
| Architecture | HIGH | Official Next.js App Router docs confirm RSC patterns; Convex integration pattern matches existing codebase; component structure is additive not structural |
| Pitfalls | HIGH (messaging), MEDIUM (technical) | Conversion/messaging pitfalls backed by multiple CRO sources; technical pitfalls (FOUC, Calendly performance) backed by community consensus but less formally validated |

**Overall confidence:** HIGH

### Gaps to Address

- **Real Performance Meal Prep metrics:** The TrustMetrics bar and case study callout need actual quantified outcomes (hours automated per month, accuracy improvement percentage, etc.). Placeholder figures can unblock development but must be replaced with real data before launch. Coordinate with client to gather this data before Phase 3.

- **Calendly account and event type URL:** The CalendlyWidget requires a configured Calendly account with a specific event type URL. This is an external dependency outside the codebase. Confirm the URL before Phase 5 starts; the Phase 5 fallback is a direct Calendly link if the account is not configured in time.

- **Jesse Batt testimonial exact wording:** Confirm the exact quote text (and permission to use it) before Phase 3 ships. A placeholder can unblock layout work but must not be accidentally shipped.

- **WorkOS middleware matcher:** Verify that `middleware.ts` does not accidentally protect the `/` route. This is a quick audit (one file, one regex pattern) but must be confirmed before launch — it is listed in the pitfalls checklist.

## Sources

### Primary (HIGH confidence)
- [Next.js App Router — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — RSC patterns, `"use client"` boundaries
- [motion.dev — React Installation](https://motion.dev/docs/react-installation) — Framer Motion v11 installation and whileInView API
- [npmjs.com/package/react-calendly](https://www.npmjs.com/package/react-calendly) — version 4.4.0, peer dependencies confirmed
- [Calendly Help Center — React embed](https://help.calendly.com/hc/en-us/articles/31644195810199-How-to-embed-Calendly-in-a-React-app) — official integration pattern
- [react-hook-form releases](https://github.com/react-hook-form/react-hook-form/releases) — v7.54.0 current, no v8
- [shadcn/ui — Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — confirms v3/v4 boundary and tailwindcss-animate status

### Secondary (MEDIUM confidence)
- [9 B2B Landing Page Lessons From 2025 — Instapage](https://instapage.com/blog/b2b-landing-page-best-practices) — conversion patterns, CTA hierarchy
- [Boosting website leads by 30-70% using Calendly forms — Webgate](https://webgate.digital/use-cases/boosting-website-leads-using-calendly-forms/) — dual-track CTA conversion lift
- [Social Proof on Landing Page: Boost Conversions by 340% — LanderLab](https://landerlab.io/blog/social-proof-examples) — testimonial specificity requirements
- [Top 10 Costly Mistakes for Calendly Integration — Calendly Consulting](https://calendlyconsulting.com/top-10-costly-mistakes-for-calendly-integration/) — integration gotchas
- [How to Master Lead Gen Form Optimization — CXL](https://cxl.com/blog/lead-gen-form-optimization/) — form field count research
- [LogRocket — React animation libraries comparison](https://blog.logrocket.com/best-react-animation-libraries/) — Framer Motion vs. alternatives
- [How I Finally Conquered Dark Mode in Next.js & Tailwind — Medium](https://medium.com/@giolvani/how-i-finally-conquered-dark-mode-in-next-js-tailwind-67c12c685fb4) — FOUC prevention

### Tertiary (LOW confidence)
- [motion.dev — GSAP vs Motion comparison](https://motion.dev/docs/gsap-vs-motion) — vendor source; used only to confirm GSAP is overkill for a landing page, not for technical accuracy

---
*Research completed: 2026-03-13*
*Ready for roadmap: yes*
