---
phase: 3
slug: conversion-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.7.0 + @testing-library/react 16.3.2 |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npm test -- --testPathPattern=homepage` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=homepage`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | LEAD-03 | unit | `npm test -- --testPathPattern=homepage` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | LEAD-01 | unit | `npm test -- --testPathPattern=homepage` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | LEAD-02 | unit | `npm test -- --testPathPattern=homepage` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | LEAD-03 | unit | `npm test -- --testPathPattern=homepage` | ❌ W0 | ⬜ pending |
| 03-01-05 | 01 | 1 | LEAD-04 | unit | `npm test -- --testPathPattern=homepage` | ❌ W0 | ⬜ pending |
| 03-01-06 | 01 | 1 | BOOK-01 | unit | `npm test -- --testPathPattern=homepage` | ❌ W0 | ⬜ pending |
| 03-01-07 | 01 | 1 | BOOK-02 | unit | `npm test -- --testPathPattern=homepage` | ❌ W0 | ⬜ pending |
| 03-01-08 | 01 | 1 | DSGN-02 | manual | Visual QA at 375px, tablet, desktop | N/A | ⬜ pending |
| 03-01-09 | 01 | 1 | DSGN-03 | manual | Visual QA at 375px | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__mocks__/convex/react.ts` — mock for useMutation/useQuery (covers LEAD-03 test setup)
- [ ] New test cases in `src/__tests__/homepage.test.tsx` — stubs for LEAD-01, LEAD-02, LEAD-03, LEAD-04, BOOK-01, BOOK-02

*Existing infrastructure covers: jest.config.js, @testing-library/jest-dom matchers, next/link mock, lucide-react mock.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No horizontal scroll at 375px | DSGN-02 | CSS layout not testable in jsdom | Open page in browser at 375px width; verify no horizontal scrollbar |
| Touch-friendly tap targets | DSGN-03 | CSS properties not measurable in jsdom | Verify all buttons/inputs have min 44px height at 375px viewport |
| Two-column to single-column responsive transition | DSGN-02 | Layout reflow not testable in jsdom | Resize browser from 1280px → 375px; verify grid collapses to single column |
| Booking CTA visually dominant over lead form | BOOK-02 | Visual hierarchy is subjective | Compare filled orange CTA vs ghost submit button at 375px and 1280px |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
