# Phase 2: Content Sections - Research

**Researched:** 2026-03-13
**Domain:** Next.js 14 Server Components, Tailwind CSS dark palette, homepage section composition
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HERO-01 | Hero section displays an outcome-focused headline communicating what business problems Sira Services solves | New hero section in `src/app/page.tsx` or extracted `HeroSection` component — rewrite existing light-mode hero with locked copy and dark tokens |
| HERO-02 | Hero includes supporting subtext explaining who the service is for and the value delivered | Subtext `<p>` element in HeroSection with copy describing AI consulting target audience |
| HERO-03 | Hero has a prominent "Book a Consultation" CTA button that scrolls to the booking/lead capture section | Anchor-scroll CTA using `href="#booking"` or `href="#lead-form"` — Phase 3 adds the target section; Phase 2 CTA can use external booking URL as fallback |
| SRVC-01 | Services grid displays three cards: AI Consulting & Strategy, Data Pipeline Implementation, Custom Computer Vision Systems | Replace existing 4-card services grid with exact 3-card spec using dark palette tokens |
| SRVC-02 | Each service card has an icon, title, and benefit-oriented description focused on business outcomes | lucide-react icons (Brain/Database/Eye or equivalent), title, and copy focused on client outcomes not features |
| PRUF-01 | Testimonial from Jesse Batt with exact quoted text | TestimonialsSection component with 3 testimonial cards — static data array, no Convex query needed |
| PRUF-02 | Testimonial from Kerry Johnson with exact quoted text | Same TestimonialsSection — testimonial 2 of 3 |
| PRUF-03 | Testimonial from Daniel with exact quoted text | Same TestimonialsSection — testimonial 3 of 3 |
| CTA-01 | Bottom-of-page CTA banner reinforces consultation offer with link to booking | CtaBanner component at bottom of page — links to external booking URL or `#lead-form` anchor |
</phase_requirements>

---

## Summary

Phase 2 is a content and layout authoring phase. The dark design foundation (tokens, fonts, FOUC prevention) is fully established from Phase 1. The task is to replace the existing light-mode homepage in `src/app/page.tsx` with four distinct sections: a rewritten Hero, a 3-card Services grid, a 3-card Testimonials section, and a bottom CTA banner. All content is statically defined — no Convex queries are needed in this phase (testimonials and services are hardcoded data arrays). All components should be React Server Components (no `"use client"` directive) since there is no client-side interactivity required in this phase.

The existing homepage (`src/app/page.tsx`) is a substantial light-mode file that must be replaced in full. The new homepage composes four section components from `src/components/home/`. The `src/components/home/` directory already exists (created in Phase 1 as a scaffold). Each section is authored as its own file, keeping `page.tsx` as a thin composition root.

The key constraint for this phase is section ordering and the Hero CTA scroll target. HERO-03 requires the "Book a Consultation" button to scroll to the booking/lead capture section — but that section is not built until Phase 3 (LEAD-01 through BOOK-02). The correct approach is to add an `id="booking"` anchor to a placeholder `<div>` at the bottom of the Phase 2 page, or have the CTA link to the external Google Booking URL directly. Since STATE.md confirms the booking URL must be confirmed before Phase 3 ships, the safest Phase 2 approach is `href="#booking"` scroll with the booking section scaffold (a `<section id="booking">` placeholder rendered in page.tsx that Phase 3 will replace with the real widget + form).

**Primary recommendation:** Decompose the homepage into four Server Component files in `src/components/home/`, author each with dark palette tokens from Phase 1, use static data arrays for all content, and keep `page.tsx` as a thin composition of those four components plus a `<section id="booking">` placeholder for the Phase 3 scroll target.

---

## Standard Stack

### Core (all installed, verified)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^14.2.26 | App Router, Server Components, Link | Project framework |
| react | — | Component model | Project framework |
| tailwindcss | ^3.4.15 | Dark palette tokens, utilities | Tokens established in Phase 1 |
| lucide-react | — | Service card icons, quote marks | Already used throughout project |
| clsx / tailwind-merge | ^2.1.1 / ^3.5.0 | Conditional class composition via `cn()` | `@/lib/utils` already exports `cn()` |

### Supporting (installed, used in Phase 3)
| Library | Version | Purpose | When Used |
|---------|---------|---------|-----------|
| motion | ^12.36.0 | Scroll-triggered animations | v2 ANIM-01, not Phase 2 |
| react-calendly | ^4.4.0 | Booking widget | Phase 3 BOOK-01 |
| zod | ^4.3.6 | Form schema validation | Phase 3 LEAD-02 |
| @hookform/resolvers | ^5.2.2 | Zod + react-hook-form bridge | Phase 3 LEAD-02 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static data arrays for testimonials | Convex query | Static is correct here — testimonials are fixed copy, not CMS-managed content in this milestone. Convex is for user-generated data (posts, leads) |
| Server Components | Client Components | No client state or event handlers needed in Phase 2 sections; Server Components are correct per success criteria |
| `src/components/home/` file-per-section | Single monolithic page.tsx | Modular files are correct — makes Phase 3 and beyond easier to integrate without touching unrelated sections |

**No new installations required for Phase 2.**

---

## Architecture Patterns

### Recommended Project Structure (Phase 2 additions)

```
src/
├── app/
│   └── page.tsx                    # Composition root — imports 4 section components
└── components/
    └── home/                       # Already scaffolded in Phase 1
        ├── HeroSection.tsx         # HERO-01, HERO-02, HERO-03
        ├── ServicesSection.tsx     # SRVC-01, SRVC-02
        ├── TestimonialsSection.tsx # PRUF-01, PRUF-02, PRUF-03
        └── CtaBanner.tsx          # CTA-01
```

### Pattern 1: Server Component Section Files

**What:** Each homepage section is its own `.tsx` file with no `"use client"` directive. Data is defined as a const array at the top of the file (not fetched).

**When to use:** Any section whose content is static and requires no browser APIs, event handlers, or React state.

**Example:**
```tsx
// src/components/home/ServicesSection.tsx
// NO "use client" — this is a Server Component
import { Brain, Database, Eye } from "lucide-react";

const services = [
  {
    icon: Brain,
    title: "AI Consulting & Strategy",
    description: "...",
  },
  // ...
];

export function ServicesSection() {
  return (
    <section className="py-24 px-6 bg-surface-alt">
      {/* ... */}
    </section>
  );
}
```

### Pattern 2: Alternating Section Backgrounds

**What:** Phase 1 established the design decision of alternating section backgrounds between `bg-surface` (#333e48) and `bg-surface-alt` (#2a323a). Apply this to every section.

**When to use:** Every top-level `<section>` element on the homepage.

**Section background assignment:**
| Section | Background Token | Hex |
|---------|-----------------|-----|
| Hero | `bg-surface` | #333e48 |
| Services | `bg-surface-alt` | #2a323a |
| Testimonials | `bg-surface` | #333e48 |
| CTA Banner | `bg-surface-alt` | #2a323a |
| Booking placeholder | `bg-surface` | #333e48 |

### Pattern 3: Dark-Token Typography

**What:** All text uses tokens, never raw hex values. This was established as the key pattern in Phase 1.

**When to use:** Every text element in Phase 2 components.

**Token reference:**
```
Headings:       text-text (white, #ffffff)
Body copy:      text-text-body (#e0e4e8)
Muted / labels: text-text-muted (#a0aab4)
Accent / icons: text-primary (#ff9900)
CTA buttons:    bg-cta text-cta-text (orange bg, dark text)
```

### Pattern 4: Thin Composition Root (page.tsx)

**What:** `src/app/page.tsx` becomes a thin orchestrator that imports and renders the four section components plus a booking placeholder. No logic, no data fetching in the page file.

**Example:**
```tsx
// src/app/page.tsx
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <CtaBanner />
      {/* Phase 3 booking section target */}
      <section id="booking" className="bg-surface" />
    </div>
  );
}
```

### Pattern 5: Hero CTA Scroll Target

**What:** HERO-03 requires the "Book a Consultation" CTA to scroll to the booking section. Since Phase 3 has not built that section yet, the correct Phase 2 implementation adds `id="booking"` to a placeholder section at the bottom of page.tsx. The Hero CTA button uses `href="#booking"`.

**Why not use an external URL for Phase 2?** STATE.md notes "Calendly/Google Booking Page URL must be confirmed before Phase 3 ships." Using an anchor scroll target is cleaner — it works in Phase 2 (scrolls to bottom), and Phase 3 replaces the placeholder with the real section content without changing the Hero CTA href.

**Example:**
```tsx
// In HeroSection.tsx
import Link from "next/link";

<Link
  href="#booking"
  className="inline-flex items-center justify-center gap-2 bg-cta text-cta-text font-display font-semibold px-8 py-4 rounded-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer"
>
  Book a Consultation
</Link>
```

### Pattern 6: Service Card with Icon Hover

**What:** The Phase 1 homepage already had service cards with an icon-background hover transition (`group-hover:bg-[#000000]`). The new cards reuse the same pattern but with dark palette tokens.

**Example:**
```tsx
// Service card with hover — dark palette
<div className="group relative p-7 rounded-xl bg-surface border border-text-muted/20 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-200 cursor-pointer">
  <div className="p-3 rounded-xl bg-primary/10 w-fit mb-5 group-hover:bg-primary transition-colors duration-200">
    <ServiceIcon className="h-6 w-6 text-primary group-hover:text-cta-text transition-colors duration-200" />
  </div>
  <h3 className="font-display font-semibold text-text text-lg mb-2">{service.title}</h3>
  <p className="text-sm text-text-body leading-relaxed font-body">{service.description}</p>
</div>
```

### Pattern 7: Testimonial Card

**What:** Testimonial cards display a quote, the testimonial text, and attribution. No star ratings, no photos (none available). Simple card layout.

**Example:**
```tsx
// Testimonial card pattern
<div className="p-6 rounded-xl bg-surface-alt border border-text-muted/20 flex flex-col gap-4">
  <p className="text-text-body leading-relaxed font-body italic">
    &ldquo;{testimonial.quote}&rdquo;
  </p>
  <div>
    <p className="font-display font-semibold text-text text-sm">{testimonial.name}</p>
    {testimonial.role && (
      <p className="text-text-muted text-xs mt-0.5">{testimonial.role}</p>
    )}
  </div>
</div>
```

### Anti-Patterns to Avoid

- **Light-mode classes on section backgrounds:** Do not use `bg-white`, `bg-[#FFF8E7]`, `bg-[#FFFDF5]`, `bg-[#000000]` — the existing `page.tsx` uses all of these and must be fully replaced.
- **Hardcoded hex colors in JSX:** Use `text-primary`, `bg-surface`, etc. — never `text-[#ff9900]` or `bg-[#333e48]` in Phase 2 components.
- **"use client" on section components:** No interactivity in Phase 2 sections; adding `"use client"` unnecessarily opts out of Server Component streaming.
- **Linking to `/services` or `/about`:** Both pages were deleted in Phase 1. The "View Services" and "Learn About Us" buttons in the current `page.tsx` must be removed.
- **Using `motion` for Phase 2 animations:** The motion library is installed but animations are v2 scope (ANIM-01). Do not add `motion` to Phase 2 components.
- **Blur orbs or radial glows:** The locked design decision from Phase 1 is "minimal visual effects — no blur orbs, no radial glows, no neon effects." The current `page.tsx` has `blur-[120px]` orbs that must not be carried forward.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon components | Custom SVG components | `lucide-react` (already installed) | Consistent viewBox, sizing, a11y attributes |
| Smooth hover transitions | Custom CSS animations | Tailwind `transition-*` utilities | Zero-weight, works with SSR, already in use on cards |
| Scroll-to-section | Custom scroll JS | Native HTML anchor `href="#booking"` | Works without JavaScript; no IntersectionObserver needed |
| Quote marks around testimonials | CSS pseudo-elements | HTML entities `&ldquo;` / `&rdquo;` | Render correctly in SSR, no CSS specificity issues |
| Class concatenation | Template literals | `cn()` from `@/lib/utils` | Already available, handles Tailwind conflicts |

---

## Common Pitfalls

### Pitfall 1: Old page.tsx content surviving the rewrite
**What goes wrong:** The new Server Component sections import cleanly but some of the old light-mode markup remains in `page.tsx`, producing visual inconsistency — dark sections surrounded by light-mode hero or CTA.
**Why it happens:** Partial edits to `page.tsx` instead of a full replacement.
**How to avoid:** Treat `page.tsx` as a full replacement in the task. The plan should specify "replace entire file" not "edit sections." The old file is 214 lines and entirely light-mode.
**Warning signs:** `bg-gradient-to-br from-white`, `bg-[#FFF8E7]`, `bg-[#000000]` appearing in the rendered DOM.

### Pitfall 2: Deleted routes referenced in new CTA buttons
**What goes wrong:** The old hero CTA links to `/contact` and old hero secondary links to `/services`. The CTA banner links to `/about`. All three destinations are either deleted (`/services`, `/about`) or incorrect for this phase (`/contact` — Phase 3 adds the lead form).
**Why it happens:** Copy-pasting from the existing `page.tsx` without updating hrefs.
**How to avoid:** All CTA buttons in Phase 2 must link to `#booking` (scroll to Phase 3 placeholder section). The contact page still exists but is not the booking flow — it is the old generic contact form.
**Warning signs:** Clicking CTA buttons routes to `/contact`, `/services`, or produces a 404.

### Pitfall 3: Services grid spec mismatch
**What goes wrong:** The existing `page.tsx` has 4 services (Machine Learning, Computer Vision, AI Automation, Data Strategy). The requirements specify exactly 3 (AI Consulting & Strategy, Data Pipeline Implementation, Custom Computer Vision Systems). Using the existing data array produces wrong content.
**Why it happens:** Reusing the existing `services` const array.
**How to avoid:** Define a new `services` data array in `ServicesSection.tsx` with exactly the 3 required titles and benefit-focused (not feature-focused) descriptions.
**Warning signs:** Grid shows 4 cards; titles do not match SRVC-01 spec.

### Pitfall 4: Testimonial text typos or truncation
**What goes wrong:** The exact testimonial text is specified verbatim in PRUF-01, PRUF-02, PRUF-03. Any truncation or paraphrase fails the requirement.
**Why it happens:** Typing testimonials from memory or summarizing.
**How to avoid:** Copy the exact text from REQUIREMENTS.md. Jesse Batt's testimonial includes "100% recommend"; Kerry Johnson's includes "eager to learn"; Daniel's is the longest and includes "qualifying questions."
**Warning signs:** Testimonial text differs from REQUIREMENTS.md; missing words like "100%", "punctual", or "dial in on the analysis."

### Pitfall 5: Missing `cursor-pointer` on interactive elements
**What goes wrong:** Service cards and CTA buttons render as non-interactive-looking on hover because the default cursor is a pointer but does not match the hover transform, causing UX inconsistency.
**Why it happens:** Forgetting `cursor-pointer` on div-based cards (not `<button>` elements).
**How to avoid:** ui-ux-pro-max skill mandates `cursor-pointer` on all clickable/hoverable elements. Every service card div and every CTA link must include `cursor-pointer`. The `LiquidButton` component already has `cursor-pointer` in its base cva definition.
**Warning signs:** Hovering a card shows `-translate-y-1` transform but the cursor remains the default arrow.

### Pitfall 6: Testimonials section renders with missing attribution
**What goes wrong:** PRUF-01 has full name + role ("Jesse Batt, Owner of Performance Meal Prep"). PRUF-02 and PRUF-03 only have names (Kerry Johnson, Daniel) with no role provided in requirements. Hardcoding empty role slots produces visual asymmetry.
**Why it happens:** Forcing a consistent data shape with a required `role` field.
**How to avoid:** Make `role` optional in the testimonial data type. Conditionally render the role line. Kerry Johnson and Daniel render without a role subtitle.

---

## Content Specification (verbatim from requirements)

### Exact Testimonials (PRUF-01 — PRUF-03)

```typescript
const testimonials = [
  {
    name: "Jesse Batt",
    role: "Owner of Performance Meal Prep",
    quote: "Amazing experience! Super fast at addressing issues. Always making suggestions to better our site. Would 100% recommend",
  },
  {
    name: "Kerry Johnson",
    role: null,
    quote: "Julio, is a young vibrant individual who enjoys his work. Great communication, punctual and eager to learn.",
  },
  {
    name: "Daniel",
    role: null,
    quote: "Julio was very polite and professional. He asked great qualifying questions and we were able to dial in on the analysis that suited the project best. I would recommend his services and look forward to working with him in the future.",
  },
];
```

### Exact Services (SRVC-01)

```typescript
const services = [
  {
    icon: Brain,       // from lucide-react
    title: "AI Consulting & Strategy",
    description: "...", // benefit-oriented, written by executor
  },
  {
    icon: Database,    // from lucide-react
    title: "Data Pipeline Implementation",
    description: "...",
  },
  {
    icon: Eye,         // from lucide-react
    title: "Custom Computer Vision Systems",
    description: "...",
  },
];
```

**Note on icons:** `Brain` and `Eye` already exist in the current `page.tsx` imports. `Database` is available in lucide-react. The executor should choose icons appropriate to each service — the above are suggestions, not locked. No emojis.

### Hero Copy Guidance (HERO-01, HERO-02)

The existing hero headline ("Trusted expertise in AI & Machine Learning") is feature-focused, not outcome-focused. The new headline must communicate what business problems are solved. The executor writes final copy but it should follow the pattern:

- **Headline:** Outcome-focused — "What can we help you achieve?" / "Transform your business with..." / "Build AI systems that..."
- **Subtext:** Audience + value delivered — who the service is for (businesses with data problems, companies needing automation) and what they get (reduced manual work, smarter decisions, competitive advantage)

---

## Code Examples

Verified patterns from codebase inspection and Phase 1 decisions:

### Section Background Alternation (from Phase 1 locked decisions)
```tsx
// bg-surface = #333e48 (main), bg-surface-alt = #2a323a (alternate)
<section className="py-24 px-6 bg-surface">   {/* Hero */}
<section className="py-24 px-6 bg-surface-alt"> {/* Services */}
<section className="py-24 px-6 bg-surface">   {/* Testimonials */}
<section className="py-24 px-6 bg-surface-alt"> {/* CTA Banner */}
```

### Solid Orange CTA Button (from Phase 1 code examples)
```tsx
// Solid orange fill, dark text — primary CTA pattern
<Link
  href="#booking"
  className="inline-flex items-center justify-center gap-2 bg-cta text-cta-text font-display font-semibold px-8 py-4 rounded-lg hover:-translate-y-1 hover:shadow-cta-glow transition-all duration-200 cursor-pointer"
>
  Book a Consultation
</Link>
```

### Card Hover Pattern (established in Phase 1)
```tsx
// -translate-y-1 on hover, shadow-elevated, cursor-pointer on div
<div className="group relative p-7 rounded-xl bg-surface border border-text-muted/20 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-200 cursor-pointer">
```

### cn() utility (available at @/lib/utils)
```typescript
import { cn } from "@/lib/utils";
// Usage: cn("base-class", condition && "conditional-class")
```

### Section max-width container (consistent with existing page)
```tsx
<div className="max-w-7xl mx-auto">
  {/* section content */}
</div>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Light-mode homepage with `bg-gradient-to-br from-white` hero | Dark-first homepage using `bg-surface` / `bg-surface-alt` tokens | Full replacement — current `page.tsx` is entirely light-mode and must be rewritten |
| 4-service grid (Machine Learning, Computer Vision, AI Automation, Data Strategy) | 3-service grid per SRVC-01 spec | New data array, new component |
| Hero secondary CTA links to `/services` | `/services` deleted; CTA links to `#booking` | Href must change |
| CTA banner "Learn About Us" links to `/about` | `/about` deleted; CTA banner only has booking link | Href must change |
| Background blur orbs (`blur-[120px]` divs) | Flat dark surfaces per locked design decision | Remove all orbs |

**Key: the existing `page.tsx` is structurally incompatible with Phase 2 requirements.** A full file replacement is more appropriate than incremental edits.

---

## Open Questions

1. **Hero headline copy**
   - What we know: Must be "outcome-focused" (HERO-01) — existing headline is feature-focused
   - What's unclear: The exact headline is not specified in requirements; executor writes it
   - Recommendation: Executor writes copy; planner does not need to specify exact wording. The plan action should state the copy direction ("outcome-focused, communicates business problems solved") and let the executor author it.

2. **Booking URL for Phase 2 CTA**
   - What we know: STATE.md flags "Calendly/Google Booking Page URL must be confirmed before Phase 3 ships." BOOK-01 is Phase 3.
   - What's unclear: Should Phase 2 CTA use `#booking` anchor or an external URL?
   - Recommendation: Use `href="#booking"` anchor scroll in Phase 2. This satisfies HERO-03 (scrolls to booking section) without needing the confirmed external URL. Phase 3 will populate the `id="booking"` section with the real widget.

3. **Jesse Batt testimonial usage permission**
   - What we know: STATE.md flags "Jesse Batt testimonial exact wording and usage permission should be confirmed before Phase 2 ships."
   - What's unclear: Whether the testimonial can be published as-is.
   - Recommendation: Build with the exact PRUF-01 text. Flag to user that confirmation is needed before this phase ships — the blocker is external, not a code problem. The plan should note this as a pre-ship confirmation item.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + ts-jest + @testing-library/react |
| Config file | `jest.config.js` (root) |
| Quick run command | `npm run test -- --testPathPattern=homepage` |
| Full suite command | `npm run test -- --no-coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | Hero section renders an outcome-focused headline | unit | `npm run test -- --testPathPattern=homepage --no-coverage` | ❌ Wave 0 |
| HERO-02 | Hero renders supporting subtext | unit | same | ❌ Wave 0 |
| HERO-03 | Hero CTA button renders with href="#booking" | unit | same | ❌ Wave 0 |
| SRVC-01 | Services section renders exactly 3 cards with correct titles | unit | same | ❌ Wave 0 |
| SRVC-02 | Each service card renders icon, title, and description | unit | same | ❌ Wave 0 |
| PRUF-01 | Jesse Batt testimonial renders with exact text | unit | same | ❌ Wave 0 |
| PRUF-02 | Kerry Johnson testimonial renders with exact text | unit | same | ❌ Wave 0 |
| PRUF-03 | Daniel testimonial renders with exact text | unit | same | ❌ Wave 0 |
| CTA-01 | Bottom CTA banner renders with link to booking | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test -- --no-coverage` (full suite, only 3 existing suites — fast at ~3.5s)
- **Per wave merge:** `npm run test -- --no-coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/homepage.test.tsx` — covers all 9 Phase 2 requirements (HERO-01 through CTA-01)

**Suggested test structure for homepage.test.tsx:**

```typescript
// Mock next/link, lucide-react as in navigation-auth.test.tsx
// Test: renders "Book a Consultation" with href="#booking"
// Test: renders exactly 3 service cards
// Test: service titles match ["AI Consulting & Strategy", "Data Pipeline Implementation", "Custom Computer Vision Systems"]
// Test: Jesse Batt quote contains "100% recommend"
// Test: Kerry Johnson quote contains "punctual and eager to learn"
// Test: Daniel quote contains "qualifying questions"
// Test: CTA banner renders with href="#booking" or href containing booking URL
```

**Note on testing Server Components:** The homepage `page.tsx` is a Server Component. Testing-library can render Server Components in jest/jsdom if the component has no async data fetching (static data only). Since Phase 2 sections use static arrays, they can be rendered synchronously in tests without mocking. If the test runner has issues with RSC, extract section components and test them individually (already the recommended architecture).

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `src/app/page.tsx` (current light-mode homepage — 214 lines, full content confirmed), `tailwind.config.ts` (dark palette tokens confirmed), `src/components/home/` (scaffold exists), `src/components/ui/liquid-glass-button.tsx` (LiquidButton API confirmed), `src/lib/utils.ts` (cn() confirmed), `jest.config.js` (test setup confirmed)
- `.planning/REQUIREMENTS.md` — exact requirement text for HERO-01 through CTA-01, verbatim testimonial copy
- `.planning/STATE.md` — locked decisions, blockers, Calendly URL confirmation needed
- `.planning/phases/01-foundation/01-01-SUMMARY.md` — Phase 1 completion confirmed, all tokens and libraries verified
- `npm run test -- --no-coverage` output — 16 tests pass, confirms clean baseline

### Secondary (MEDIUM confidence)
- `.claude/skills/ui-ux-pro-max/SKILL.md` — cursor-pointer, hover feedback, no emoji icon, transition timing requirements
- `design-system/sira-services/MASTER.md` — note: this file reflects OLD palette (blue primary) from pre-Phase-1 generation; use tailwind.config.ts tokens, not this file's hex values

### Tertiary (LOW confidence)
- General knowledge: Next.js 14 Server Components render static JSX without async in test environments — verify with `npm run test` after Wave 0 test file is created

---

## Metadata

**Confidence breakdown:**
- Content requirements (testimonials, services): HIGH — verbatim from REQUIREMENTS.md, no interpretation needed
- Component architecture: HIGH — directly follows Phase 1 scaffold pattern, confirmed directory exists
- Dark palette token usage: HIGH — tokens verified from tailwind.config.ts
- Test strategy: MEDIUM — Server Component testability in jest/jsdom is generally reliable for static components, but not verified for this specific test runner setup until Wave 0 file is created

**Research date:** 2026-03-13
**Valid until:** 2026-04-12 (stable tooling and locked design decisions — 30 days)
