# Phase 1: Foundation - Research

**Researched:** 2026-03-13
**Domain:** Tailwind CSS design tokens, Next.js global styles, library installation, component scaffolding
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Primary accent: #ff9900 (orange) — replaces both gold (#FFD700) and blue-600 entirely
- Dark base: #333e48 (blue-gray) with a darker variant (e.g., #2a323a) for alternating section backgrounds
- Headings: #ffffff (pure white)
- Body text: soft off-white (e.g., #e0e4e8) for readability on dark backgrounds
- No gold, no blue anywhere — orange is the sole accent color
- Solid orange (#ff9900) fill with dark text for CTA buttons — no outline-style CTAs for primary actions
- Alternating section backgrounds between #333e48 and a slightly darker shade
- Minimal visual effects — no blur orbs, no radial glows, no neon effects — flat dark surfaces, content-driven
- Subtle lift/scale hover effects on cards and buttons (keep existing -translate-y-1 pattern)
- Keep current font pairing: Poppins (headings/display) + Open Sans (body) — no font changes
- LiquidButton: restyle with new orange/dark palette — do not replace, keep existing component API
- Remove unused pages: about, services, signin, signup
- Keep: homepage, blog, contact, admin
- Update Nav and Footer to remove links to deleted pages
- Whole site goes dark — body, Nav, Footer all use dark tokens
- No need to fix readability on removed pages
- Blog, contact, and admin pages should remain usable with the new dark globals

### Claude's Discretion
- Whether to keep gradient text (updated for new palette) or go solid-only
- Whether to keep existing CSS keyframe animations or consolidate with motion library

### Deferred Ideas (OUT OF SCOPE)
- Removing or redesigning individual page content (blog, contact, admin) — future milestones
- About/services page recreation if needed later — separate scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | Page uses a dark, tech-forward color palette with custom Tailwind tokens (dark backgrounds, accent gradients) | Tailwind config restructure with exact hex tokens, globals.css updates, body class in layout.tsx |
</phase_requirements>

---

## Summary

Phase 1 is a pure configuration and scaffolding phase — no new UI components are built, only the foundation that all subsequent components will inherit. The work has four concerns: (1) replace the current light-mode Tailwind color tokens with the locked dark-palette tokens, (2) update `globals.css` to use those tokens for custom utilities, (3) update `layout.tsx` body class to emit dark background/text globally (eliminating FOUC on hard refresh by using a static class rather than a JS-toggled dark mode), and (4) delete the four unused pages and update Nav/Footer navigation arrays.

The existing project already has Tailwind 3, the animation keyframes, and the font pipeline in place. The only net-new installs are four additive libraries required for later phases: `motion` (animations), `react-calendly` (booking widget), `zod` (schema validation), and `@hookform/resolvers` (zod integration with react-hook-form). Installing them in Phase 1 ensures TypeScript can resolve imports in every subsequent phase without revisiting `package.json`.

The most important pitfall is FOUC (flash of un-styled content). Since the design is permanently dark, the correct approach is to set the background color directly on the `<body>` element via a static Tailwind class (`bg-[#333e48]` or a semantic token) in `layout.tsx`. This renders the dark background server-side in HTML before any JavaScript executes, making a FOUC structurally impossible.

**Primary recommendation:** Author dark styles directly on elements — no `dark:` prefix, no JavaScript class toggling — because the site is permanently dark. Static HTML-level background classes prevent FOUC entirely.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | ^3.4.15 | Design tokens, utility classes | Project standard — `tailwind.config.ts` already exists |
| next | ^14.2.26 | App Router, SSR, font pipeline | Project framework |
| clsx | ^2.1.1 | Conditional class composition | Already used across components |
| tailwind-merge | ^3.5.0 | Resolves conflicting Tailwind classes | Already used in `cn()` utility |
| class-variance-authority | ^0.7.1 | Component variants (LiquidButton) | Already used |

### Libraries to Install (Phase 1 prerequisite — used in Phase 2+)
| Library | Version | Purpose | When Used |
|---------|---------|---------|------------|
| motion | latest | Scroll-triggered animations (v2 ANIM-01) | Phase 2+ components, Claude's discretion in Phase 1 |
| react-calendly | latest | Calendly booking embed | Phase 3 BOOK-01 |
| zod | latest | Form schema validation | Phase 3 LEAD-02 |
| @hookform/resolvers | latest | Connects zod to react-hook-form | Phase 3 LEAD-02 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| motion | framer-motion | `motion` is the modern package name (Framer Motion v11+ ships as `motion`). They are the same library — prefer `motion` for current naming. |
| zod | yup | Zod has superior TypeScript inference; react-hook-form documentation uses zod as the canonical example |

**Installation:**
```bash
npm install motion react-calendly zod @hookform/resolvers
```

---

## Architecture Patterns

### Tailwind Token Restructure Pattern

**What:** Replace the current `primary`/`cta`/`surface`/`text` semantic groups with dark-palette equivalents using the exact hex values from CONTEXT.md.

**When to use:** Any time the design palette is locked — map hex values to semantic token names so components reference tokens, not raw hex.

**Recommended token structure:**
```typescript
// tailwind.config.ts — theme.extend.colors
colors: {
  primary: {
    DEFAULT: "#ff9900",   // orange accent
    dark:    "#cc7a00",   // pressed state
    light:   "#ffad33",   // hover state
  },
  surface: {
    DEFAULT: "#333e48",   // main section background
    alt:     "#2a323a",   // alternating section background
    nav:     "#2a323a",   // nav/footer background
  },
  text: {
    DEFAULT: "#ffffff",   // headings
    body:    "#e0e4e8",   // body copy
    muted:   "#a0aab4",   // secondary text, captions
  },
  cta: {
    DEFAULT: "#ff9900",   // CTA button fill (same as primary)
    text:    "#1a1a1a",   // dark text on orange button
  },
}
```

### FOUC-Prevention Pattern for Permanently Dark Sites

**What:** Set the dark background directly on `<body>` in `layout.tsx` via a Tailwind class. Because Next.js renders this server-side, the HTML delivered to the browser already contains the dark background — no JS required.

**When to use:** Any permanently dark site where dark mode is not toggleable.

**Example:**
```tsx
// src/app/layout.tsx
<body className="font-body antialiased bg-surface text-text-body">
```

This replaces the current `bg-surface-muted text-text` which is a light background. Because `bg-surface` maps to `#333e48` in the new token system, the browser paints dark immediately. Contrast with the `dark:` media class approach which requires JavaScript to add/remove `dark` class and can produce a flash.

**Anti-pattern to avoid:**
```tsx
// DO NOT do this for a permanently-dark site
<html className="dark">  // requires JS or cookie
<body className="dark:bg-slate-900">  // only applies after JS
```

### Page Deletion Pattern (Next.js App Router)

**What:** Delete entire `src/app/<route>/` directories. Next.js App Router auto-registers routes from directory presence — deleting the directory removes the route with no config change needed.

**Pages to delete:**
```
src/app/about/    -> delete entire directory
src/app/services/ -> delete entire directory
src/app/signin/   -> delete entire directory
src/app/signup/   -> delete entire directory
```

**Navigation array update (Navigation.tsx):**
```typescript
// Before (5 links)
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// After (3 links — remove services, about)
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];
```

**Sign in link:** The `/signin` route is being deleted. The LiquidButton in Navigation that links to `/signin` should be removed or the sign-in flow reconsidered. Per CONTEXT.md, the admin dashboard is kept — if admin access is needed, the WorkOS auth redirect still works via middleware without a custom signin page. Remove the Sign In button from Navigation unless admin access is expected from the public nav.

### Component Directory Scaffold

**What:** Create `src/components/home/` as an empty directory with a `.gitkeep` or an initial barrel file (`index.ts`). This makes the directory visible to git and importable.

```
src/components/home/         # Phase 2+ section components go here
```

### globals.css Update Pattern

Every custom utility that references old palette tokens needs updating:

| Utility | Old | New |
|---------|-----|-----|
| `.text-gradient` | `#000000 → #FFD700 → #FF8C00` | `#ff9900 → #ffad33` (orange) or solid — Claude's discretion |
| `::selection` | `rgba(255,215,0,0.2)` with dark text | `rgba(255,153,0,0.3)` with light text |
| `::-webkit-scrollbar-track` | `#FFF8E7` (light) | `#2a323a` (dark surface-alt) |
| `::-webkit-scrollbar-thumb` | `#C0C0C0` | `#a0aab4` (text-muted) |
| `.prose h1/h2/h3` | `text-text` | `text-text` (still valid if token renamed) |
| `.prose p/ul/ol` | `text-text-muted` | `text-text-body` (new token name) |
| `.prose code` | `bg-primary-50` (light) | `bg-surface-alt` |
| `.prose blockquote` | `border-cta` (gold) | `border-primary` (orange) |
| `.prose a` | `text-cta-dark hover:text-cta` | `text-primary hover:text-primary-light` |

**Recommendation on gradient text (Claude's discretion):** Keep `.text-gradient` but restyle it for the orange palette — `linear-gradient(135deg, #ff9900 0%, #ffad33 100%)`. Gradient text on dark backgrounds with an orange gradient reads as premium/tech and avoids the visual monotony of flat orange headings. This is consistent with the "what can I help you with?" aesthetic reference in CONTEXT.md.

**Recommendation on CSS animations (Claude's discretion):** Keep the existing keyframe animations in `tailwind.config.ts` for Phase 1. They are zero-weight (no runtime library) and the stagger classes in `globals.css` work reliably. Consolidation with `motion` can happen in Phase 2 when scroll-triggered animations are actually needed. Do not add `motion` usage in Phase 1.

### LiquidButton Restyling

The `LiquidButton` component (in `src/components/ui/liquid-glass-button.tsx`) uses `dark:shadow-*` variants on the inner glass overlay div. Since the site is now permanently dark, these shadows will activate and the button will render in dark glass mode naturally. The main thing to update is any variant-level color that references old gold/blue tokens.

The `default` variant uses `text-primary` — that token is being replaced, so the class will pick up the new orange primary color automatically once `tailwind.config.ts` is updated.

**Anti-Patterns to Avoid:**
- **Using slate-950 for the body background** — The success criterion mentions "slate-950" but the locked decision is `#333e48`. Use the custom token. Tailwind's `slate-950` is `#020617`, which is much darker than the user's intent. Use the locked hex value.
- **Keeping `dark:` prefixes** — The site is permanently dark; `dark:` prefixes require JS to toggle and create unnecessary complexity.
- **Updating page content on deleted pages** — Pages being deleted do not need readability fixes (confirmed in CONTEXT.md).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation schemas | Custom validation functions | `zod` | Type inference, composable, react-hook-form native integration |
| Form/zod bridge | Custom resolver | `@hookform/resolvers/zod` | Maintained adapter with full error mapping |
| Scroll animations | CSS-only with IntersectionObserver | `motion` (for Phase 2+) | Handles exit animations, spring physics, reduced-motion automatically |
| Booking embed | Custom iframe + Calendly API | `react-calendly` | Managed sizing, event callbacks, popup/inline modes |

---

## Common Pitfalls

### Pitfall 1: FOUC from Background Color
**What goes wrong:** The page briefly shows white/light background before Tailwind classes apply on the client.
**Why it happens:** If the background is set via JavaScript (e.g., `dark:` class toggle), there's a render gap between HTML delivery and JS execution.
**How to avoid:** Set `bg-surface` (mapping to `#333e48`) directly on the `<body>` element in `layout.tsx`. Next.js renders this server-side so the dark background is in the HTML stream, not applied by JS.
**Warning signs:** White flash visible on hard refresh in incognito; visible in Chrome DevTools network throttling.

### Pitfall 2: Broken Tailwind Tokens in Prose Classes
**What goes wrong:** `globals.css` prose utilities reference token names like `text-text-muted` or `bg-primary-50` that no longer exist after the Tailwind config is restructured.
**Why it happens:** Custom `@apply` directives in CSS resolve at build time against the current Tailwind config. Renamed/removed tokens cause build errors or silent class omission.
**How to avoid:** After restructuring `tailwind.config.ts`, audit all `@apply` lines in `globals.css` and update every token reference. Run `npm run build` to catch unresolved classes.
**Warning signs:** Build warnings about unknown classes; blog posts losing prose styling.

### Pitfall 3: Navigation Test Failures After Link Removal
**What goes wrong:** `src/__tests__/navigation-auth.test.tsx` explicitly asserts that "Services", "About", "Contact", "Home", "Blog" are all rendered. After removing the services and about links, this test will fail.
**Why it happens:** The test at line 140-154 has `expect(screen.getByText("Services")).toBeInTheDocument()` and `expect(screen.getByText("About")).toBeInTheDocument()`.
**How to avoid:** Update the navigation test to reflect the new nav links (Home, Blog, Contact only) as part of the same task that updates `Navigation.tsx`.
**Warning signs:** `npm run test` fails on `navigation-auth.test.tsx` after nav links are changed.

### Pitfall 4: Stale Imports After Page Deletion
**What goes wrong:** If any other file imports from a deleted page directory (e.g., a server action or shared component), TypeScript build will fail.
**Why it happens:** App Router pages can export server actions or shared utilities; deleting the directory removes the export.
**How to avoid:** Before deleting `signin/` and `signup/` directories, grep for any imports referencing those paths. The `src/app/actions/auth.ts` file exists and may be referenced from signin/signup pages — confirm it is not imported by pages being kept.
**Warning signs:** TypeScript errors like "Cannot find module '@/app/signin/...'"

### Pitfall 5: LiquidButton Sign In Link Left Pointing to Deleted Route
**What goes wrong:** Navigation.tsx contains `<Link href="/signin">` wrapping the LiquidButton. After `/signin` is deleted, the link still renders and navigates to a 404.
**Why it happens:** The page directory is deleted but the nav component isn't updated.
**How to avoid:** Remove the Sign In button entirely from Navigation.tsx when deleting the signin page, or redirect auth to the WorkOS hosted page directly. Since admin is kept, the WorkOS middleware will handle auth redirects without a custom signin page.
**Warning signs:** Sign In button visible in nav; clicking it produces a Next.js 404 page.

---

## Code Examples

### Tailwind Config — Complete Token Replacement
```typescript
// src/tailwind.config.ts — replace entire theme.extend.colors block
colors: {
  primary: {
    DEFAULT: "#ff9900",
    dark:    "#cc7a00",
    light:   "#ffad33",
  },
  surface: {
    DEFAULT: "#333e48",
    alt:     "#2a323a",
    nav:     "#2a323a",
  },
  text: {
    DEFAULT: "#ffffff",
    body:    "#e0e4e8",
    muted:   "#a0aab4",
  },
  cta: {
    DEFAULT: "#ff9900",
    text:    "#1a1a1a",
  },
},
```

### layout.tsx — Dark Body Class (FOUC prevention)
```tsx
// src/app/layout.tsx
<body className="font-body antialiased bg-surface text-text-body">
```

This replaces the current `bg-surface-muted text-text`. With `surface.DEFAULT` mapped to `#333e48`, the browser renders dark immediately from the server-sent HTML.

### globals.css — Updated text-gradient
```css
/* Updated for orange palette */
.text-gradient {
  background: linear-gradient(135deg, #ff9900 0%, #ffad33 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### globals.css — Updated selection and scrollbar
```css
/* Selection — orange tint with light text */
::selection {
  background: rgba(255, 153, 0, 0.25);
  color: #ffffff;
}

/* Dark scrollbar */
::-webkit-scrollbar-track {
  background: #2a323a;
}
::-webkit-scrollbar-thumb {
  background: #a0aab4;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #e0e4e8;
}
```

### Navigation navLinks — Pruned Array
```typescript
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];
```

### Footer Navigation Links — Pruned Array
```typescript
// Remove services and about entries; keep blog and contact
[
  { href: "/blog",    label: "Blog" },
  { href: "/contact", label: "Contact" },
]
```

### CTA Button Token (for LiquidButton restyling reference)
```tsx
// Solid orange CTA — use in Phase 2+ but token established in Phase 1
<button className="bg-cta text-cta-text font-semibold px-6 py-3 rounded-lg hover:-translate-y-1 transition-transform duration-200">
  Book a Consultation
</button>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` package name | `motion` package | Framer Motion v11 (2024) | Install `motion` not `framer-motion` — same API, new package name |
| CSS `dark:` class toggle for dark mode | Static dark classes (no prefix) | Design decision | Simpler, no FOUC, no JS required for permanently dark sites |
| Gold/blue palette (`#FFD700`, `#2563eb`) | Orange/dark-gray (`#ff9900`, `#333e48`) | This phase | All token references must be replaced |

**Deprecated/outdated in this project:**
- `cta: { DEFAULT: "#FFD700", light: "#FFE033", dark: "#FF8C00" }` — replaced by orange
- `surface: { DEFAULT: "#FFFFFF", muted: "#FFF8E7" }` — replaced by dark surfaces
- `text: { DEFAULT: "#1A1A1A", muted: "#666666" }` — replaced by light-on-dark text
- `primary: { 50-900 }` — large scale unnecessary; replace with minimal 3-token group

---

## Open Questions

1. **Sign In button fate in Navigation**
   - What we know: `/signin` page is being deleted; admin is being kept
   - What's unclear: Should the Sign In button be removed entirely from the public nav, or should it redirect to WorkOS hosted auth?
   - Recommendation: Remove the Sign In button from the public nav for Phase 1. Admin users can navigate directly to `/admin` and WorkOS middleware will handle the auth redirect. This avoids the 404 issue with no rearchitecting.

2. **actions/auth.ts dependency**
   - What we know: `src/app/actions/auth.ts` exists and is likely imported by signin/signup pages
   - What's unclear: Is `actions/auth.ts` imported by any page being KEPT (homepage, blog, contact, admin)?
   - Recommendation: Grep for imports of `actions/auth.ts` before deleting signin/signup. If only those pages import it, the file can be left (orphaned server actions don't cause build errors) or deleted for cleanliness.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest 29 + ts-jest + @testing-library/react |
| Config file | `jest.config.js` (root) |
| Quick run command | `npm run test -- --testPathPattern=navigation` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | Navigation renders only Home, Blog, Contact links (about/services removed) | unit | `npm run test -- --testPathPattern=navigation-auth` | ✅ needs update |
| DSGN-01 | No `/signin` link rendered in Navigation | unit | `npm run test -- --testPathPattern=navigation-auth` | ✅ needs update |
| DSGN-01 | Tailwind config exports primary token as `#ff9900` | unit | `npm run test -- --testPathPattern=tailwind-tokens` | ❌ Wave 0 |
| DSGN-01 | Libraries (motion, zod, @hookform/resolvers, react-calendly) importable without TS error | smoke | `npm run build` (TypeScript compile) | N/A — build check |

### Sampling Rate
- **Per task commit:** `npm run test -- --testPathPattern=navigation-auth`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/tailwind-tokens.test.ts` — verifies `#ff9900` is the resolved primary token color (covers DSGN-01 token requirement)
- [ ] Update `src/__tests__/navigation-auth.test.tsx` — remove assertions for "Services" and "About" links; remove assertion for Sign In link pointing to `/signin`

*(Existing test infrastructure covers all other phase requirements)*

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `tailwind.config.ts`, `globals.css`, `layout.tsx`, `Navigation.tsx`, `Footer.tsx`, `package.json`, `jest.config.js`, `src/__tests__/navigation-auth.test.tsx`, `src/components/ui/liquid-glass-button.tsx`
- `.planning/phases/01-foundation/01-CONTEXT.md` — locked user decisions
- `.planning/REQUIREMENTS.md` — requirement DSGN-01 definition
- `design-system/sira-services/MASTER.md` — pre-existing design system (OLD palette — being replaced)

### Secondary (MEDIUM confidence)
- `.claude/skills/ui-ux-pro-max/SKILL.md` — project UI/UX skill patterns (contrast, hover, cursor-pointer requirements)
- `.claude/skills/frontend-design.md` — project frontend design principles

### Tertiary (LOW confidence)
- General knowledge: `motion` package is the renamed Framer Motion v11+ package — verify version compatibility with Next.js 14 before install if issues arise

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — direct inspection of package.json, all installed versions confirmed
- Architecture: HIGH — direct inspection of all affected files; token names and class locations confirmed
- Pitfalls: HIGH — navigation test failure risk confirmed by reading actual test assertions at lines 140-154
- Library installs: MEDIUM — `motion` as the new framer-motion package name based on training knowledge; version compatibility with Next.js 14 unverified but LOW risk (well-maintained library)

**Research date:** 2026-03-13
**Valid until:** 2026-04-12 (stable tooling — 30 days)
