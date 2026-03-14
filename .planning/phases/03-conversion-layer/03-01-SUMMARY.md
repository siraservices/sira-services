---
phase: 03-conversion-layer
plan: 01
subsystem: ui
tags: [react, zod, react-hook-form, convex, tailwind, lucide-react]

# Dependency graph
requires:
  - phase: 02-content-sections
    provides: Homepage sections (Hero, Services, Testimonials, CtaBanner) and page.tsx composition
  - phase: 01-foundation
    provides: Design tokens, Tailwind config, ConvexClientProvider, leads.ts mutation

provides:
  - ConversionSection client component with booking CTA and Zod-validated lead form
  - Homepage composition with all five sections including ConversionSection at #booking anchor

affects:
  - future phases touching homepage conversion
  - any work that modifies leads.ts or the Convex schema

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Zod schema + react-hook-form (zodResolver) for inline validated forms
    - useMutation(api.leads.submit) from convex/react for serverless lead capture
    - Two-path conversion layout: primary CTA (orange filled) + secondary form (ghost outline)
    - Success state replaces form in-place (no page navigation) on mutation success

key-files:
  created:
    - src/components/home/ConversionSection.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "Relative import path for Convex api: ../../../convex/_generated/api (3 levels from src/components/home/, not 4 as plan noted)"
  - "Booking URL set to # placeholder — must be replaced with Google Booking Page URL before ship (tracked in STATE.md blockers)"
  - "grid-cols-[1fr_auto_1fr] for three-column divider layout — cleaner than absolute positioned divider"

patterns-established:
  - "Zod + react-hook-form pattern: define schema, infer type, zodResolver in useForm, register each field, show errors.fieldName.message inline"
  - "Convex mutation pattern in client components: useMutation + try/catch with loading/error/submitted state trio"
  - "Conversion CTA hierarchy: filled orange (bg-cta) = primary path, ghost border (border-text-muted/40) = secondary path"

requirements-completed: [LEAD-01, LEAD-02, LEAD-03, LEAD-04, BOOK-01, BOOK-02, DSGN-02, DSGN-03]

# Metrics
duration: 2min
completed: 2026-03-14
---

# Phase 3 Plan 01: Conversion Layer Summary

**Two-column homepage conversion section with orange booking CTA and Zod/react-hook-form lead form wired to Convex leads.submit**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-13T23:59:45Z
- **Completed:** 2026-03-14T00:02:18Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Built ConversionSection (285 lines) as a "use client" component with full Zod validation and Convex mutation
- Wired ConversionSection into page.tsx, replacing the empty booking placeholder while preserving the #booking anchor target
- Implemented two-path conversion layout: dominant booking CTA (filled orange) and secondary lead form (ghost/outline), separated by an "or" divider that is horizontal on mobile and vertical on desktop

## Task Commits

Each task was committed atomically:

1. **Task 1: Build ConversionSection client component** - `5dc6cd9` (feat)
2. **Task 2: Wire ConversionSection into page.tsx** - `ff400e6` (feat)

## Files Created/Modified
- `src/components/home/ConversionSection.tsx` - "use client" two-column conversion component with booking CTA, Zod form validation, Convex mutation, success/error states
- `src/app/page.tsx` - Added ConversionSection import and render, removed empty booking placeholder

## Decisions Made
- Relative import for Convex api is 3 levels up (`../../../convex/_generated/api`) from `src/components/home/`, not 4 as noted in the plan — fixed during Task 1 execution
- Used `grid-cols-[1fr_auto_1fr]` three-column grid for the divider layout, allowing the "or" divider column to size naturally without absolute positioning
- BOOKING_URL kept as `#` placeholder per plan — replace before shipping

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect relative import path for Convex api**
- **Found during:** Task 1 (Build ConversionSection)
- **Issue:** Plan specified `../../../../convex/_generated/api` (4 levels), but `src/components/home/` is only 3 levels from the project root, so the correct path is `../../../convex/_generated/api`
- **Fix:** Changed import path to `../../../convex/_generated/api` — TypeScript confirmed with `tsc --noEmit`
- **Files modified:** src/components/home/ConversionSection.tsx
- **Verification:** `npx tsc --noEmit` passed cleanly after fix
- **Committed in:** 5dc6cd9 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - wrong import path)
**Impact on plan:** Minor path correction only. No scope creep, no architectural changes.

## Issues Encountered
None beyond the auto-fixed import path.

## User Setup Required
**One manual step needed before shipping Phase 3:**
- Replace `BOOKING_URL = "#"` in `src/components/home/ConversionSection.tsx` with the actual Google Booking Page URL
- This is tracked as a blocker in STATE.md: "Calendly/Google Booking Page URL must be confirmed before Phase 3 ships"

## Next Phase Readiness
- All homepage sections are complete: Hero, Services, Testimonials, CtaBanner, ConversionSection
- The #booking anchor scroll target works correctly (HeroSection and CtaBanner both link to it)
- Lead form is fully functional once Convex is running
- Blocker: BOOKING_URL placeholder must be replaced with real Google Booking Page URL before the site ships

---
*Phase: 03-conversion-layer*
*Completed: 2026-03-14*
