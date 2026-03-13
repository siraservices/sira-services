---
phase: 01-foundation
plan: 01
subsystem: ui
tags: [tailwind, dark-theme, navigation, footer, motion, zod, react-calendly, hookform]

# Dependency graph
requires: []
provides:
  - Dark Tailwind palette tokens (primary=#ff9900, surface=#333e48, text-body=#e0e4e8)
  - FOUC-free dark background via server-rendered body class
  - Pruned navigation (Home, Blog, Contact only, no Sign In)
  - Pruned footer (Blog, Contact only)
  - motion, zod, @hookform/resolvers, react-calendly installed
  - src/components/home/ scaffold directory
affects: [02-homepage-sections, 03-contact-integration]

# Tech tracking
tech-stack:
  added: [motion, react-calendly, zod, "@hookform/resolvers"]
  patterns: [dark-first styling (no dark: prefix), bg-surface for FOUC prevention, token-based dark palette via tailwind.config.ts]

key-files:
  created:
    - src/components/home/.gitkeep
    - src/__tests__/navigation-auth.test.tsx
  modified:
    - tailwind.config.ts
    - src/app/globals.css
    - src/app/layout.tsx
    - src/components/Navigation.tsx
    - src/components/Footer.tsx

key-decisions:
  - "Dark palette uses #ff9900 orange as primary/cta (not gold FFD700), aligns with premium/tech aesthetic"
  - "Sign In button removed from Navigation — admin access via WorkOS middleware, no public sign-in UI needed"
  - "bg-surface on body tag (server-rendered) prevents FOUC — no dark: prefix, no client-side toggle"
  - "about, services, signin, signup pages deleted — homepage-only milestone scope"

patterns-established:
  - "Token pattern: all colors reference Tailwind tokens (text-text-muted, bg-surface-alt) not hardcoded hex"
  - "Dark-first: author styles directly in dark; no light base to override"
  - "FOUC prevention: body className includes bg-surface so background renders on first server paint"

requirements-completed: [DSGN-01]

# Metrics
duration: 15min
completed: 2026-03-13
---

# Phase 1 Plan 01: Dark Design Foundation Summary

**Orange-on-dark Tailwind palette (#ff9900 primary, #333e48 surface) with FOUC-free body class, pruned nav/footer, and Phase 2+ library installation**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-13T22:16:00Z
- **Completed:** 2026-03-13T22:31:32Z
- **Tasks:** 2
- **Files modified:** 9 (3 updated + 4 deleted + 2 created)

## Accomplishments

- Replaced entire light-mode Tailwind color palette with locked dark palette (primary=#ff9900, surface=#333e48, text-body=#e0e4e8, cta=#ff9900)
- Updated globals.css with orange gradient text, dark scrollbar, orange selection highlight, and corrected prose token references
- Navigation pruned to Home/Blog/Contact only with no Sign In button; styled with dark palette tokens
- Footer pruned to Blog/Contact only; styled with dark palette tokens (surface-alt, text-muted)
- Deleted about, services, signin, signup pages (out of scope for homepage milestone)
- Installed motion, react-calendly, zod, @hookform/resolvers; scaffolded src/components/home/
- All 16 tests pass; `npm run build` succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace Tailwind tokens with dark palette and update global styles** - `46517f8` (feat)
2. **Task 2: Delete unused pages, update Nav/Footer for dark theme, install libraries, scaffold home directory, update tests** - `ddf6a14` (feat)

## Files Created/Modified

- `tailwind.config.ts` - Dark palette: primary=#ff9900, surface=#333e48, text-body=#e0e4e8, cta=#ff9900; orange cta-glow shadow
- `src/app/globals.css` - Orange gradient text, dark scrollbar colors, orange selection, updated prose tokens
- `src/app/layout.tsx` - Body class changed to bg-surface text-text-body for server-side FOUC prevention
- `src/components/Navigation.tsx` - Pruned to Home/Blog/Contact; Sign In removed; dark palette tokens applied
- `src/components/Footer.tsx` - Pruned to Blog/Contact; bg-surface-alt, text-muted, border-text-muted/20 applied
- `src/__tests__/navigation-auth.test.tsx` - Updated: Sign In absence asserted, Services/About removed from link test
- `src/components/home/.gitkeep` - Scaffold directory for Phase 2 home components
- `src/app/about/page.tsx` - Deleted
- `src/app/services/page.tsx` - Deleted
- `src/app/signin/page.tsx` - Deleted
- `src/app/signup/page.tsx` - Deleted

## Decisions Made

- Orange (#ff9900) chosen as primary/CTA token — differentiates from gold (#FFD700) and reads as premium/tech on dark backgrounds
- Sign In button removed from Navigation entirely — WorkOS AuthKit middleware handles auth gate for admin routes, no public sign-in UI needed in this milestone
- No `dark:` prefix used anywhere — site is dark-only, authoring directly in dark styles prevents FOUC and simplifies class structure

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All global design tokens locked; Phase 2 components can use bg-surface, text-text-body, text-primary, bg-primary/10 etc. without revisiting config
- src/components/home/ ready to receive section components
- motion library available for scroll-triggered animations
- react-calendly available for booking integration
- zod + @hookform/resolvers available for contact form validation

---
*Phase: 01-foundation*
*Completed: 2026-03-13*
