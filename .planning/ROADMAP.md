# Roadmap: Sira Services Landing Page Enhancement

## Overview

Three phases deliver a conversion-focused homepage: first, establish the dark design foundation so all components share a consistent visual language; second, build all static content sections that tell the story (hero, services, social proof, CTA); third, wire the interactive conversion layer (lead form + booking) and verify the full page works end-to-end on all viewports.

## Phases

- [x] **Phase 1: Foundation** - Dark design tokens, library installs, and component directory scaffolding (completed 2026-03-13)
- [ ] **Phase 2: Content Sections** - Hero, services grid, testimonials, and CTA banner as static RSC components
- [ ] **Phase 3: Conversion Layer** - Lead capture form, Calendly booking, section composition, and responsive QA

## Phase Details

### Phase 1: Foundation
**Goal**: The design system and tooling are in place so every subsequent component can be built without revisiting global configuration
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01
**Success Criteria** (what must be TRUE):
  1. The page body renders a dark background (#333e48) with no flash of light content on hard refresh in incognito
  2. Tailwind config contains the #ff9900 orange primary accent token and all extended palette tokens needed by later phases
  3. All additive libraries (motion, react-calendly, zod, @hookform/resolvers) are installed and importable without TypeScript errors
  4. `src/components/home/` directory exists and is ready to receive section components
**Plans:** 1/1 plans complete

Plans:
- [ ] 01-01-PLAN.md — Dark palette tokens, global styles, site cleanup, library installs

### Phase 2: Content Sections
**Goal**: A visitor can read the full homepage narrative — who Sira Services is, what they offer, and why to trust them — from hero to closing CTA
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, HERO-03, SRVC-01, SRVC-02, PRUF-01, PRUF-02, PRUF-03, CTA-01
**Success Criteria** (what must be TRUE):
  1. Hero section is visible with an outcome-focused headline, supporting subtext, and a "Book a Consultation" CTA button that scrolls to the booking section
  2. Services grid shows three cards (AI Consulting & Strategy, Data Pipeline Implementation, Custom Computer Vision Systems), each with an icon and benefit-oriented description
  3. Social proof section displays all three testimonials (Jesse Batt, Kerry Johnson, Daniel) with attribution
  4. A closing CTA banner appears at the bottom of the page with a link to book a consultation
  5. All sections render as Server Components with no unnecessary client-side JavaScript
**Plans**: TBD

### Phase 3: Conversion Layer
**Goal**: A visitor who is ready to engage can either book a call directly via Calendly or submit a lead form — and the page works flawlessly on mobile, tablet, and desktop
**Depends on**: Phase 2
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, BOOK-01, BOOK-02, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. The lead form accepts name, email, company, and project description; shows inline validation errors on invalid input; and clears with a success message after submission
  2. A submitted lead appears in the Convex admin dashboard with source set to "homepage"
  3. The "Book a Consultation" CTA opens the Google Booking Page in a new tab
  4. Calendly/booking CTA is visually dominant (filled button) and the lead form is clearly secondary — a visitor can distinguish the two conversion paths at a glance
  5. The full page is usable on a 375px mobile viewport with no horizontal scroll, readable text, and touch-friendly tap targets on all interactive elements
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete   | 2026-03-13 |
| 2. Content Sections | 0/TBD | Not started | - |
| 3. Conversion Layer | 0/TBD | Not started | - |
