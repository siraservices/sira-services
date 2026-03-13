# Architecture Research

**Domain:** Conversion-focused landing page — AI/ML consulting, Next.js 14 App Router + Convex
**Researched:** 2026-03-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                              │
├──────────────────────────────┬──────────────────────────────────────┤
│  Static / RSC Sections       │  Interactive Islands ("use client")  │
│  ┌──────────────┐            │  ┌──────────────┐ ┌───────────────┐  │
│  │  HeroSection  │            │  │ LeadCaptureForm│ │CalendlyWidget │  │
│  │  ServicesGrid │            │  │ (Convex mut.) │ │ (dynamic()   │  │
│  │ TestimonialsRow│           │  └──────────────┘ │  ssr:false)   │  │
│  │ TrustMetrics  │            │                   └───────────────┘  │
│  │  CTABanner    │            │                                       │
│  └──────────────┘            │                                       │
├──────────────────────────────┴──────────────────────────────────────┤
│                     Next.js App Router (Server)                      │
│  src/app/page.tsx (Server Component — composes all sections)         │
├─────────────────────────────────────────────────────────────────────┤
│                     Convex (Backend)                                 │
│  ┌───────────────┐  ┌──────────────────────────────────────────┐    │
│  │  leads table  │  │  api.leads.submit mutation (public)       │    │
│  └───────────────┘  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

The homepage (`src/app/page.tsx`) is a React Server Component (RSC) that acts as a layout compositor. Each visual section is either a pure Server Component (no interactivity needed) or a Client Component island (needs browser events, form state, or third-party SDK). Only the form and Calendly widget require `"use client"`. Everything else renders server-side with zero hydration overhead, which is optimal for Core Web Vitals on a landing page.

### Component Responsibilities

| Component | RSC or Client | Responsibility | Communicates With |
|-----------|---------------|----------------|-------------------|
| `src/app/page.tsx` | RSC | Layout compositor — imports and orders all sections | Nothing directly |
| `HeroSection` | RSC | Headline, subtext, dual CTA buttons (links only) | Navigation links |
| `ServicesGrid` | RSC | Three service cards rendered from static data | None |
| `TrustMetrics` | RSC | Four metric stats bar (static numbers) | None |
| `TestimonialsRow` | RSC | Testimonial card(s) rendered from static data | None |
| `CaseStudySpotlight` | RSC | Single case study callout (Performance Meal Prep) | None |
| `LeadCaptureSection` | RSC | Layout wrapper containing form + Calendly side by side | None |
| `LeadCaptureForm` | Client | Form state, validation, Convex mutation call | `api.leads.submit` |
| `CalendlyWidget` | Client | Calendly inline embed via `react-calendly` | External Calendly iframe |
| `CTABanner` | RSC | Dark closing CTA band with link to contact page | Navigation link |
| `Navigation` | Client (existing) | Scroll-aware nav, auth state, mobile menu | WorkOS AuthKit |
| `Footer` | RSC (existing) | Site footer links | None |

## Recommended Project Structure

```
src/
├── app/
│   └── page.tsx                  # Server Component — imports sections, defines order
├── components/
│   ├── ui/                       # Existing primitive components (LiquidButton, etc.)
│   ├── Navigation.tsx            # Existing — no changes needed
│   ├── Footer.tsx                # Existing — no changes needed
│   └── home/                     # NEW — homepage-specific section components
│       ├── HeroSection.tsx       # RSC: headline, subtext, dual CTA
│       ├── TrustMetrics.tsx      # RSC: stats bar (50+ projects, 98% satisfaction, etc.)
│       ├── ServicesGrid.tsx      # RSC: three service cards
│       ├── TestimonialsRow.tsx   # RSC: testimonial cards
│       ├── CaseStudySpotlight.tsx # RSC: Performance Meal Prep case study callout
│       ├── LeadCaptureSection.tsx # RSC: two-column layout wrapper
│       ├── LeadCaptureForm.tsx   # Client: form with Convex mutation
│       ├── CalendlyWidget.tsx    # Client: dynamic import of react-calendly
│       └── CTABanner.tsx         # RSC: closing dark CTA band
```

### Structure Rationale

- **`components/home/`:** Scopes all landing-page sections to one folder. If this ever becomes a marketing A/B test, or another page reuses a section (e.g., Services page reuses `ServicesGrid`), the component is in an obvious location without polluting the root `components/` directory.
- **`app/page.tsx` as compositor:** The page file contains no styling or logic — it only imports sections and puts them in the right order. This keeps the page file readable even as sections grow.
- **No `data/` folder needed yet:** Static copy for services and testimonials lives as typed constants inside the RSC files themselves (e.g., `const services = [...]` at the top of `ServicesGrid.tsx`). Moving to a CMS is a future milestone; a separate data layer now would be premature.

## Architectural Patterns

### Pattern 1: RSC-first, Client Islands at the Leaf

**What:** Default every new component to a Server Component. Only add `"use client"` when the component genuinely requires `useState`, `useEffect`, browser APIs, or a third-party SDK that accesses `window`. In this project that means only `LeadCaptureForm` and `CalendlyWidget`.

**When to use:** Every new component starts here. Ask "does this need the browser?" before adding `"use client"`.

**Trade-offs:** Smaller JS bundle, faster hydration, no server-side data fetching problems. Downside: requires explicit `"use client"` isolation; parent RSC cannot import and use a Client Component prop that requires browser APIs without dynamic import.

**Example:**
```typescript
// src/components/home/HeroSection.tsx — no directive needed, RSC by default
import Link from "next/link";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export function HeroSection() {
  return (
    <section className="relative min-h-screen ...">
      ...
      <LiquidButton asChild>
        <Link href="#book">Book a Consultation</Link>
      </LiquidButton>
    </section>
  );
}
```

### Pattern 2: Dynamic Import with `ssr: false` for Third-Party Browser SDKs

**What:** Calendly's `InlineWidget` from `react-calendly` accesses `window` and cannot render on the server. Wrap it in `next/dynamic` with `ssr: false` so Next.js skips SSR for that component only.

**When to use:** Any third-party library that references `window`, `document`, or `navigator` at import time.

**Trade-offs:** The widget renders client-side only, meaning a brief layout shift if height is not reserved. Fix with a skeleton/placeholder inside `loading` prop.

**Example:**
```typescript
// src/components/home/CalendlyWidget.tsx
"use client";
import dynamic from "next/dynamic";

const InlineWidget = dynamic(
  () => import("react-calendly").then((m) => m.InlineWidget),
  {
    ssr: false,
    loading: () => <div className="h-[650px] bg-surface-muted animate-pulse rounded-xl" />,
  }
);

export function CalendlyWidget({ url }: { url: string }) {
  return <InlineWidget url={url} styles={{ height: "650px" }} />;
}
```

### Pattern 3: Convex Mutation in an Isolated Client Component

**What:** The lead form calls `useMutation(api.leads.submit)` from Convex. This hook requires the Convex client context, which is only available on the client. The mutation call accepts `source` so analytics can distinguish homepage vs contact-page leads.

**When to use:** Any form that writes to Convex. The form component must be `"use client"` and must be a leaf node (no RSC children inside it).

**Trade-offs:** The form re-renders on state changes but is isolated — the rest of the page is static and unaffected.

**Example:**
```typescript
// src/components/home/LeadCaptureForm.tsx
"use client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function LeadCaptureForm() {
  const submitLead = useMutation(api.leads.submit);

  const handleSubmit = async (data: FormData) => {
    await submitLead({
      name: data.name,
      email: data.email,
      company: data.company,
      message: data.message,
      source: "homepage",  // distinguishes from contact-page submissions
    });
  };
  // ...
}
```

## Data Flow

### Lead Capture Flow (Primary Conversion Path)

```
User fills form
    ↓
LeadCaptureForm (Client Component)
    ↓ useMutation hook
Convex client (WebSocket transport)
    ↓
api.leads.submit mutation (Convex server)
    ↓
leads table (Convex database)
    ↓
Admin dashboard (api.leads.list query) reads it
```

### Calendly Booking Flow (Secondary Conversion Path)

```
User views CalendlyWidget (iframe, client-only)
    ↓
User selects time in Calendly iframe
    ↓
Calendly handles booking server-side (external)
    ↓
Optional: Calendly webhook → future lead enrichment
```

### Page Render Flow

```
Browser requests /
    ↓
Next.js App Router
    ↓
page.tsx (RSC) — server renders all static sections to HTML
    ↓
HTML streamed to browser (HeroSection, ServicesGrid, etc. fully resolved)
    ↓
LeadCaptureForm and CalendlyWidget hydrated client-side
    ↓
First Contentful Paint from static HTML — fast
Interactive elements become live after hydration
```

### Key Data Flows

1. **Static section data:** Service names, testimonial text, metric values — defined as typed constants co-located inside their section component files. No network call, no state. Pure HTML on first paint.
2. **Lead submission:** User-submitted form data travels via Convex WebSocket mutation to the database. The `source` field is hardcoded to `"homepage"` so admin dashboard can filter by acquisition channel.
3. **Calendly:** All booking data lives in Calendly's system. The embed is a passive iframe. No data flows back to Convex unless a webhook integration is added in a later milestone.

## Scaling Considerations

This is a single-operator consulting landing page. Scaling concerns are minimal for the foreseeable future. That said:

| Scale | Architecture Adjustment |
|-------|--------------------------|
| Current (0–1k leads/month) | Current monolithic page + Convex is more than sufficient. No changes needed. |
| Growing (1k–10k leads/month) | Convex scales reads/writes automatically. No app changes. Consider email notification on new lead via Convex action. |
| Portfolio expansion | Extract `ServicesGrid` data to a Convex `services` table with admin CRUD if service offerings change frequently. |
| Multiple landing pages | Promote `home/` section components to be props-driven and reusable across campaign pages. |

### Scaling Priority

1. **First concern:** Lead volume is unlikely to be the bottleneck. Content maintenance is. If service descriptions or testimonials change frequently, moving them to Convex-managed content (a simple `testimonials` table) is the right next step before technical scaling.
2. **Second concern:** Calendly is a dependency. If Calendly pricing or availability becomes a problem, the `CalendlyWidget` component's isolation means swapping to Cal.com or another provider requires changing one file.

## Anti-Patterns

### Anti-Pattern 1: Putting Everything in `page.tsx`

**What people do:** Write all section markup directly in `src/app/page.tsx` as one large JSX return.

**Why it's wrong:** The current `page.tsx` already has ~215 lines for a minimal homepage. Adding a testimonials section, lead form, and Calendly widget will push it past 600 lines. Section-specific changes (e.g., updating testimonial copy) require scrolling through unrelated code. Testing becomes difficult.

**Do this instead:** Each section is its own file in `src/components/home/`. `page.tsx` stays as a clean list of `<SectionName />` imports, making the page's visual narrative readable at a glance.

### Anti-Pattern 2: Making Sections `"use client"` by Default

**What people do:** Add `"use client"` to section files preemptively "just in case" or because they added one hover animation.

**Why it's wrong:** `"use client"` causes the entire component tree below it to be shipped as JavaScript and hydrated. A static testimonials row has no business needing hydration. Unnecessary client components inflate the JS bundle and slow TTI.

**Do this instead:** Keep sections as RSC unless they use `useState`, `useEffect`, or a browser API. Hover effects using Tailwind CSS classes work fine in RSC — they are pure CSS, not JavaScript event listeners.

### Anti-Pattern 3: Inline Calendly Script Tag in `<head>`

**What people do:** Follow Calendly's vanilla JS instructions, adding their `<script>` tag to `layout.tsx` and a `<div class="calendly-inline-widget">` in the page.

**Why it's wrong:** Global script injection conflicts with Next.js hydration, creates race conditions, and Calendly's vanilla embed has no cleanup — the widget persists across client-side navigations in the App Router. The widget also renders at page load even if the user never scrolls to it.

**Do this instead:** Use `react-calendly` via `next/dynamic` with `ssr: false` as described in Pattern 2. The component is isolated, lazy-loaded, and properly cleaned up with React lifecycle.

### Anti-Pattern 4: Duplicating the Lead Form Instead of Setting `source`

**What people do:** Create a separate `HomepageLeadForm` component that is a copy of `ContactPage`'s form with different styling.

**Why it's wrong:** Two forms diverge in behavior over time (validation rules, field additions, error handling). Bug fixes must be applied twice.

**Do this instead:** The existing `api.leads.submit` Convex mutation already accepts a `source` field. A single shared `LeadCaptureForm` component accepts `source` as a prop and passes it to the mutation. Styling differences are handled through props or CSS classes, not duplication.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Calendly | `react-calendly` `InlineWidget` via `next/dynamic` with `ssr: false` | Requires Calendly account URL as env var or config constant. Height must be explicitly set (recommend 650px) to avoid iframe collapse. |
| WorkOS AuthKit | Existing middleware + `useAuth()` hook in Navigation | No changes needed for homepage. Homepage is public — no auth gate. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `page.tsx` (RSC) → section components | Import and render — no props needed for static sections | `LeadCaptureSection` needs no props; Calendly URL can be a constant in that file. |
| `LeadCaptureForm` (Client) → Convex | `useMutation` hook over WebSocket | `source: "homepage"` differentiates from contact page in admin dashboard. |
| `CalendlyWidget` (Client) → Calendly | Iframe via `react-calendly` | No data returned to Next.js app. Calendly URL should be extracted to a config constant (e.g., `src/lib/config.ts`) so it is changed in one place. |
| Homepage sections → Navigation | Navigation is a fixed overlay; sections use `id` anchors for in-page scroll targets | Set `id="book"` on `LeadCaptureSection` so the Hero "Book a Consultation" button can anchor-link to it without a page reload. |

## Build Order (Phase Dependencies)

Build sections in this order to avoid blocking work:

1. **Design tokens first** — Confirm dark theme tokens exist in `tailwind.config.ts`. The current config is light (warm cream/black). Dark backgrounds for the new design need new tokens (e.g., `dark-bg: #0A0A0A`, `dark-card: #111111`). All section work depends on these.

2. **Static RSC sections** — `HeroSection`, `ServicesGrid`, `TrustMetrics`, `TestimonialsRow`, `CTABanner` can all be built in parallel — they have zero dependencies on each other and no async data.

3. **`LeadCaptureForm`** — Depends on existing `api.leads.submit` mutation (already shipped). No schema changes needed. Can be built while static sections are in progress.

4. **`CalendlyWidget`** — Depends on `react-calendly` npm package install and a Calendly account URL. Isolate behind `dynamic()` from day one. Can be built and tested with a placeholder URL.

5. **`LeadCaptureSection` layout wrapper** — Depends on both `LeadCaptureForm` and `CalendlyWidget` being ready. This is the two-column layout that holds them together.

6. **`page.tsx` composition** — Assemble in final section order once all components exist. Section order recommendation: Hero → TrustMetrics → ServicesGrid → TestimonialsRow → CaseStudySpotlight → LeadCaptureSection → CTABanner.

## Sources

- [Next.js App Router — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) (official docs, HIGH confidence)
- [react-calendly on npm](https://www.npmjs.com/package/react-calendly) (official package, HIGH confidence)
- [Calendly embed options overview](https://help.calendly.com/hc/en-us/articles/223147027-Embed-options-overview) (official Calendly docs, HIGH confidence)
- [High-converting SaaS landing page section structure — CXL](https://cxl.com/blog/how-to-build-a-high-converting-landing-page/) (MEDIUM confidence, conversion research)
- [Next.js 14 project structure best practices — WebSearch synthesis](https://www.raftlabs.com/blog/building-with-next-js-best-practices-and-benefits-for-performance-first-teams/) (MEDIUM confidence)

---
*Architecture research for: Sira Services homepage — conversion-focused landing page, Next.js 14 + Convex*
*Researched: 2026-03-13*
