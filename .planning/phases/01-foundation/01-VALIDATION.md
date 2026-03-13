---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29 + ts-jest + @testing-library/react |
| **Config file** | `jest.config.js` (root) |
| **Quick run command** | `npm run test -- --testPathPattern=navigation` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --testPathPattern=navigation-auth`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | DSGN-01 | unit | `npm run test -- --testPathPattern=navigation-auth` | ✅ needs update | ⬜ pending |
| 1-01-02 | 01 | 1 | DSGN-01 | unit | `npm run test -- --testPathPattern=tailwind-tokens` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | DSGN-01 | smoke | `npm run build` | N/A — build check | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/tailwind-tokens.test.ts` — verifies `#ff9900` is the resolved primary token color (covers DSGN-01 token requirement)
- [ ] Update `src/__tests__/navigation-auth.test.tsx` — remove assertions for "Services" and "About" links; remove assertion for Sign In link pointing to `/signin`

*Existing test infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark background (slate-950) renders without FOUC on hard refresh in incognito | DSGN-01 | Visual rendering timing cannot be automated in unit tests | 1. `npm run build && npm start` 2. Open incognito 3. Hard refresh — no white flash |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
