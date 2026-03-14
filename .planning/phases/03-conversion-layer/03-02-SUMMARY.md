---
phase: 03-conversion-layer
plan: 02
subsystem: test
tags: [jest, react-testing-library, convex-mock, user-event, tdd]

# Dependency graph
requires:
  - phase: 03-conversion-layer
    plan: 01
    provides: ConversionSection component with booking CTA and Zod lead form

provides:
  - Test coverage for LEAD-01..04 (form fields, validation, mutation, success state)
  - Test coverage for BOOK-01..02 (CTA target/rel, primary vs ghost styling)
  - src/__mocks__/convex/react.ts mock for useMutation in test environment

affects:
  - future phases touching ConversionSection or leads form

# Tech tracking
tech-stack:
  added: []
  patterns:
    - jest.mock("convex/react") inline + mockSubmitLead.mockResolvedValue for async mutation testing
    - userEvent.setup() + waitFor for form interaction tests
    - Filter getAllByRole results by attribute to disambiguate multiple matching elements

key-files:
  created:
    - src/__mocks__/convex/react.ts
  modified:
    - src/__tests__/homepage.test.tsx

key-decisions:
  - "Inline jest.mock('convex/react') in test file rather than relying on __mocks__ auto-resolution (third-party modules require root-level __mocks__ for auto-resolution)"
  - "CTA-01 test updated to filter #booking links instead of iterating all — ConversionSection adds a third 'Book a Consultation' link with href='#' (external CTA placeholder)"
  - "BOOK-01/02 use getAllByRole + find(target=_blank) to isolate ConversionSection CTA from hero/ctabanner links"

requirements-completed: [LEAD-01, LEAD-02, LEAD-03, LEAD-04, BOOK-01, BOOK-02, DSGN-02, DSGN-03]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 3 Plan 02: Conversion Layer Tests Summary

**ConversionSection test coverage: 6 new tests for LEAD-01..04 and BOOK-01..02, all passing alongside 9 existing Phase 2 tests**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14T00:00:00Z
- **Completed:** 2026-03-14T00:14:17Z
- **Tasks:** 2 of 2 complete
- **Files modified:** 2

## Accomplishments
- Created `src/__mocks__/convex/react.ts` with stubs for useMutation, useQuery, useConvex
- Added 6 new ConversionSection tests covering all LEAD and BOOK requirements
- All 15 tests pass (9 Phase 2 + 6 Phase 3) — no regressions

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create convex/react mock and add ConversionSection tests | 380036c | src/__mocks__/convex/react.ts, src/__tests__/homepage.test.tsx |

## Files Created/Modified
- `src/__mocks__/convex/react.ts` — Jest mock for convex/react (useMutation, useQuery, useConvex)
- `src/__tests__/homepage.test.tsx` — Added ConversionSection describe block with 6 tests; fixed CTA-01 to handle new third booking link

## Decisions Made
- Used inline `jest.mock("convex/react", () => ...)` in the test file for third-party module mocking — Jest's automatic `__mocks__` resolution for third-party packages requires root-level placement, but inline mocking is more explicit and portable
- Updated CTA-01 to filter links by `#booking` href rather than asserting all "Book a Consultation" links have that href — ConversionSection adds an external booking CTA with `href="#"` which broke the original forEach assertion
- Used `getAllByRole` + `.find(link => link.getAttribute("target") === "_blank")` to isolate the ConversionSection CTA from the hero/banner internal links for BOOK-01 and BOOK-02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CTA-01 broken by new ConversionSection link**
- **Found during:** Task 1 (RED phase run)
- **Issue:** Phase 2 CTA-01 test iterated all "Book a Consultation" links and expected all to have `href` containing `#booking`. ConversionSection adds a third such link with `href="#"` (external booking CTA placeholder), breaking the existing assertion.
- **Fix:** Updated CTA-01 to filter links by `#booking` href and assert count >= 2, preserving the test intent while accommodating the new external CTA link
- **Files modified:** src/__tests__/homepage.test.tsx
- **Committed in:** 380036c (Task 1 commit)

**2. [Rule 1 - Bug] Fixed BOOK-01 test with redundant getByRole call**
- **Found during:** Task 1 (RED phase run)
- **Issue:** Test had a `getByRole` call before `getAllByRole` which throws "multiple elements found" error
- **Fix:** Removed the redundant single `getByRole` call; used only `getAllByRole + find` pattern
- **Files modified:** src/__tests__/homepage.test.tsx
- **Committed in:** 380036c (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - test correctness bugs)
**Impact on plan:** Minor test fixes only. No production code changes. No scope creep.

## Issues Encountered
None beyond the auto-fixed test issues.

## Visual QA (Task 2) — Approved

Task 2 `checkpoint:human-verify` was approved by the human reviewer. Responsive layout confirmed at 375px mobile, tablet, and desktop. DSGN-02 and DSGN-03 are complete.

## Next Phase Readiness
- All automated tests passing (Phase 2 + Phase 3)
- ConversionSection is fully built, tested, and visually QA'd
- Pending: BOOKING_URL placeholder replacement with real Google Booking Page URL

---
*Phase: 03-conversion-layer*
*Completed: 2026-03-14*
