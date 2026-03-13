---
phase: 2
slug: content-sections
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29 + ts-jest + @testing-library/react |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npm run test -- --testPathPattern=homepage --no-coverage` |
| **Full suite command** | `npm run test -- --no-coverage` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --no-coverage`
- **After every plan wave:** Run `npm run test -- --no-coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-00-01 | 00 | 0 | ALL | test scaffold | `npm run test -- --testPathPattern=homepage --no-coverage` | ❌ W0 | ⬜ pending |
| 02-01-01 | 01 | 1 | HERO-01 | unit | `npm run test -- --testPathPattern=homepage --no-coverage` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | HERO-02 | unit | same | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | HERO-03 | unit | same | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | SRVC-01, SRVC-02 | unit | same | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | PRUF-01, PRUF-02, PRUF-03 | unit | same | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | CTA-01 | unit | same | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/homepage.test.tsx` — stubs for HERO-01, HERO-02, HERO-03, SRVC-01, SRVC-02, PRUF-01, PRUF-02, PRUF-03, CTA-01
- [ ] Test mocks for `next/link` and `lucide-react` (reuse existing mock patterns)

*Existing jest.config.js and test setup already in place from Phase 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual alternating section backgrounds | Design decision | Visual appearance not unit-testable | Inspect homepage in browser — sections alternate bg-surface / bg-surface-alt |
| Hero CTA scrolls to #booking target | HERO-03 | Scroll behavior requires browser | Click "Book a Consultation" — page scrolls to bottom placeholder |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
