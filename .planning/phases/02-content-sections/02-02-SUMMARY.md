---
phase: 02-content-sections
plan: 02
subsystem: testing
tags: [react, jest, testing-library, homepage, tdd, page-composition]

requires:
  - phase: 02-01
    provides: [HeroSection, ServicesSection, TestimonialsSection, CtaBanner]
provides:
  - Homepage test suite covering all 9 Phase 2 requirements
  - Rewritten page.tsx as thin composition root (17 lines, dark-themed)
affects: [phase-03-booking]

tech-stack:
  added: []
  patterns: [TDD red-green cycle, page composition root pattern, jest mock for lucide-react]

key-files:
  created:
    - src/__tests__/homepage.test.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "getByText(/growth-stage companies/i) used for HERO-02 uniqueness — '/business/i' matches multiple elements across sections"
  - "page.tsx fully replaced (not patched) — old 214-line light-mode file was structurally incompatible"

patterns-established:
  - "Homepage page.tsx: thin composition root — import section components, no logic, no styles"
  - "Test mocks: jest.mock('lucide-react') with data-testid spans, jest.mock('next/link') as <a>"

requirements-completed: [HERO-01, HERO-02, HERO-03, SRVC-01, SRVC-02, PRUF-01, PRUF-02, PRUF-03, CTA-01]

duration: 5min
completed: "2026-03-13"
---

# Phase 02 Plan 02: Homepage Wire-Up and Test Suite Summary

**9-test TDD suite validating all Phase 2 requirements, plus 17-line dark composition root replacing the 214-line light-mode page.tsx.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-13T23:16:00Z
- **Completed:** 2026-03-13T23:19:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created `homepage.test.tsx` with 9 test cases covering HERO-01 through CTA-01 (all pass GREEN)
- Fully replaced old 214-line light-mode page.tsx with 17-line dark composition root
- All 25 tests pass (9 new homepage + 16 existing navigation/middleware/auth-actions)
- No TypeScript errors; zero light-mode classes remaining in page.tsx
- `#booking` placeholder section added as Phase 3 scroll target

## Task Commits

Each task was committed atomically:

1. **Task 1: Create homepage test scaffold** - `583b58e` (test)
2. **Task 2: Rewrite page.tsx as thin composition root** - `35b4cc0` (feat)

## Files Created/Modified

- `src/__tests__/homepage.test.tsx` — 9-test suite covering all Phase 2 requirement IDs; mocks lucide-react and next/link
- `src/app/page.tsx` — Rewritten from 214 lines to 17 lines; imports 4 section components and #booking placeholder

## Decisions Made

- Used `getByText(/growth-stage companies/i)` for HERO-02 instead of `/business/i` — "business" appears in multiple elements across Services descriptions, TestimonialsSection, and HeroSection, causing `getByText` to throw "multiple elements found" error. The unique phrase from HeroSection's subtext avoids ambiguity.
- Fully replaced page.tsx (not patched) — the old file had structural incompatibilities (LiquidButton, light-mode colors, ArrowRight from lucide, Next.js Link for routes) that couldn't be incrementally cleaned.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed HERO-02 test selector ambiguity**
- **Found during:** Task 2 (after rewriting page.tsx, running tests)
- **Issue:** `screen.getByText(/business/i)` threw "Found multiple elements with the text: /business/i" — word "business" appears in HeroSection p, ServicesSection descriptions, and testimonials
- **Fix:** Changed selector to `screen.getByText(/growth-stage companies/i)` — a unique phrase from HeroSection's subtext only
- **Files modified:** src/__tests__/homepage.test.tsx
- **Verification:** All 25 tests pass after fix
- **Committed in:** 35b4cc0 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug in test selector)
**Impact on plan:** Minimal correction to test selector. No scope creep. Test intent unchanged.

## Issues Encountered

None beyond the HERO-02 selector fix documented above.

## Next Phase Readiness

- All 9 Phase 2 requirements verified by automated tests
- page.tsx is a clean composition root ready for Phase 3 booking section addition
- `#booking` placeholder section exists for Phase 3 Calendly/lead-form scroll target
- Blocker noted in STATE.md: Calendly/Google Booking URL must be confirmed before Phase 3 ships

---
*Phase: 02-content-sections*
*Completed: 2026-03-13*
