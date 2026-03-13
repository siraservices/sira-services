# Phase 3: Conversion Layer - Research

**Researched:** 2026-03-13
**Domain:** React form handling (react-hook-form + Zod), Convex mutations, responsive Tailwind layout
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Conversion section layout**
- Two-column layout: booking CTA card on the left (visually dominant), lead form on the right
- Section has a centered header above both columns with headline + supporting subtext
- Booking card gets distinct treatment (darker bg or subtle orange accent border) to emphasize it as the primary path
- Booking card contains: headline ("Ready to get started?"), 1-2 lines of subtext about the free consultation, then the orange CTA button
- "Book a Consultation" button opens Google Booking Page in a new tab (external link)
- An "or" divider separates the two paths (visible on desktop between columns, horizontal with centered "or" text on mobile between stacked cards)

**Lead form design**
- Fields: Name (required), Email (required), Company (optional with "(optional)" hint), "Tell us about your project" (required, maps to `message` in Convex)
- Name and Email side-by-side on desktop/tablet, full-width stacked on mobile
- Company and project description are always full-width
- Validation: Zod schema + react-hook-form with inline error text below each invalid field
- Submit button: ghost/outline style (white/light border, transparent bg) — clearly secondary to the orange booking CTA
- Submit button shows "Sending..." and is disabled during mutation
- Form submits to existing `leads.submit` mutation with source: "homepage"

**Success & error states**
- On success: form fields clear, success message replaces form within the same card (checkmark + "Thanks! We'll be in touch within 24-48 hours")
- One submission only — no reset/resubmit option
- On error: inline error message above submit button ("Something went wrong. Please try again."), all field values preserved
- Loading state: button text changes to "Sending..." and button is disabled

**Responsive behavior**
- Mobile (375px): booking CTA card stacks on top, form below — primary action first
- All form inputs full-width on mobile (including Name/Email which are side-by-side on desktop)
- Subtle horizontal "or" divider between stacked cards on mobile
- Full-page responsive QA: verify all homepage sections at 375px mobile, tablet, and desktop
- Touch-friendly tap targets on all interactive elements, no horizontal scroll

### Claude's Discretion
- Exact section header text and subtext copy
- Booking card headline and subtext copy
- Input field placeholder text
- Spacing, padding, and typography scale
- "Or" divider exact styling (line weight, text size, opacity)
- Dark input field styling (bg shade, border color, focus ring)
- Success state icon/animation
- Error message exact wording

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEAD-01 | Lead form captures 4 fields: name, email, company, project description | react-hook-form register pattern; Zod schema validation; field layout from CONTEXT.md |
| LEAD-02 | Form has client-side validation with clear error messages (all fields required, valid email) | Zod .email() + .min(1) validators; formState.errors rendered below each field |
| LEAD-03 | Form submits to existing Convex leads mutation with source "homepage" | useMutation(api.leads.submit) — mutation already exists, accepts all required args |
| LEAD-04 | Form shows success state after submission and clears fields | useState(submitted); replace form JSX with success card; reset() from react-hook-form |
| BOOK-01 | "Book a Consultation" button links to Google Booking Page (external link, opens in new tab) | Plain anchor tag with target="_blank" rel="noopener noreferrer"; URL is a runtime config concern |
| BOOK-02 | Booking CTA is visually primary; lead form is positioned as secondary/fallback option | bg-primary CTA button for booking; ghost/outline button for form submit |
| DSGN-02 | Page is fully responsive and optimized for mobile, tablet, and desktop viewports | Tailwind responsive prefixes (sm:, md:); grid-cols-1 mobile / grid-cols-2 desktop |
| DSGN-03 | Mobile layout is a first-class experience with touch-friendly spacing, readable typography, and properly stacked sections | min-h-[44px] tap targets; full-width inputs on mobile; order-first for booking card |
</phase_requirements>

## Summary

Phase 3 delivers a single new React component — `ConversionSection` — that slots into the existing `<section id="booking">` placeholder in `src/app/page.tsx`. The component is a "use client" island inside an otherwise RSC page (consistent with the pattern established by Phase 2). All libraries needed are already installed: `react-hook-form`, `zod`, `@hookform/resolvers`, `convex/react`, and `lucide-react`. The Convex `leads.submit` mutation is already implemented and accepts all required fields.

The primary implementation risk is not technical complexity but visual hierarchy. The booking CTA must feel significantly more prominent than the lead form. This is achieved through button styling (filled orange vs. ghost outline), card treatment (accent border or darker bg on the booking card), and mobile stacking order (booking card first). The "or" divider is a cosmetic element — a simple flexbox row with lines flanking centered text.

Responsive QA covers the entire homepage, not just the new section. This means verifying HeroSection, ServicesSection, TestimonialsSection, CtaBanner, and ConversionSection all behave correctly at 375px. No layout changes to existing sections are expected, but the QA task must touch them all.

**Primary recommendation:** Build `ConversionSection` as a single `"use client"` component in `src/components/home/`, wire it into `page.tsx` replacing the empty `<section id="booking">` placeholder, and use react-hook-form's `handleSubmit` + `formState.errors` for validation with a Zod resolver.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.54.0 | Form state, validation triggering, field registration | Already installed; performant uncontrolled form pattern |
| zod | 4.3.6 | Schema-first validation with TypeScript inference | Already installed; works natively with @hookform/resolvers |
| @hookform/resolvers | 5.2.2 | Bridges Zod schema into react-hook-form | Already installed; eliminates manual validation wiring |
| convex/react | 1.17.0 | `useMutation` hook for Convex mutations | Already installed; pattern established in contact page |
| lucide-react | 0.460.0 | Icons (CheckCircle for success state, Calendar or ArrowRight for booking CTA) | Already installed; used throughout |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Component test rendering + queries | All new component tests |
| @testing-library/user-event | 14.6.1 | Simulating typed input and clicks | Form interaction tests |
| jest | 29.7.0 | Test runner | Existing test infrastructure |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hook-form + Zod | useState + manual validation | Already installed, inferior DX, no Zod type inference |
| Zod v4 (.email(), .min()) | Custom regex | Library handles edge cases we'd miss |
| Plain anchor tag for booking CTA | next/link | External URL — next/link is for internal routes only |

**Installation:** No new packages needed. All dependencies are present.

## Architecture Patterns

### Recommended Project Structure

```
src/
  components/
    home/
      HeroSection.tsx        # existing
      ServicesSection.tsx    # existing
      TestimonialsSection.tsx # existing
      CtaBanner.tsx          # existing
      ConversionSection.tsx  # NEW — "use client" form component
  app/
    page.tsx                 # updated to import ConversionSection
  __tests__/
    homepage.test.tsx        # updated to cover LEAD-01..04, BOOK-01..02, DSGN-02..03
```

### Pattern 1: "use client" Island in RSC Page

**What:** `page.tsx` is a Server Component that imports `ConversionSection` marked `"use client"`. Only the conversion section opts into client-side JavaScript.

**When to use:** Any component that uses hooks (useMutation, useForm) or interacts with browser APIs must be "use client". This is the established pattern in this codebase.

**Example:**
```typescript
// src/app/page.tsx — stays a Server Component
import { ConversionSection } from "@/components/home/ConversionSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ServicesSection />
      <TestimonialsSection />
      <CtaBanner />
      <ConversionSection />   {/* replaces empty <section id="booking"> */}
    </div>
  );
}
```

### Pattern 2: react-hook-form with Zod Resolver

**What:** Define a Zod schema, pass it to `zodResolver`, destructure `register`, `handleSubmit`, `formState.errors`, and `reset` from `useForm`.

**When to use:** Any form with client-side validation that maps to a typed schema.

**Example:**
```typescript
// Source: react-hook-form + zod documented pattern (verified against installed versions)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(1, "Project description is required"),
});

type FormValues = z.infer<typeof schema>;

// Inside component:
const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
  resolver: zodResolver(schema),
});

// On success — clear form:
reset();
```

**Note on Zod v4:** The installed version is Zod 4.3.6. In Zod v4, `z.string().email()` continues to work as in v3. The `@hookform/resolvers` v5 package supports Zod v4. No compatibility issues.

### Pattern 3: Convex useMutation for Form Submission

**What:** Call `useMutation` at the top level of the component, invoke the returned function inside `handleSubmit`. Wrap in try/catch for error state.

**When to use:** Any client component that writes to Convex.

**Example:**
```typescript
// Source: contact/page.tsx (established project pattern)
"use client";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Inside component:
const submitLead = useMutation(api.leads.submit);

const onSubmit = async (data: FormValues) => {
  setLoading(true);
  setError(null);
  try {
    await submitLead({
      name: data.name,
      email: data.email,
      company: data.company || undefined,  // optional field handling
      message: data.message,
      source: "homepage",
    });
    reset();            // clear form fields
    setSubmitted(true); // switch to success view
  } catch {
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

### Pattern 4: Two-Column Responsive Layout with Mobile Stack

**What:** CSS Grid with `grid-cols-1 md:grid-cols-2`. On mobile, booking card uses `order-first` to appear above the form (primary action first).

**Example:**
```typescript
// Section wrapper
<section id="booking" className="py-24 px-6 bg-surface">
  <div className="max-w-7xl mx-auto">
    {/* Section header */}
    <div className="text-center mb-12">...</div>

    {/* Two-column grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      {/* Booking card — left on desktop, first on mobile */}
      <div className="order-first ...">...</div>

      {/* "Or" divider — vertical on desktop, horizontal on mobile */}
      <div className="hidden md:flex ...">...</div>

      {/* Lead form card — right on desktop, second on mobile */}
      <div>...</div>
    </div>
  </div>
</section>
```

**Note on "or" divider:** On desktop (two-column grid), the divider is not a grid child but can be implemented with `relative` positioning or as an `absolute` element between the two cards. The simplest approach: use a flex container with lines and centered text, shown as a horizontal strip on mobile and a vertical strip on desktop via `flex-col` vs `flex-row`.

### Pattern 5: Inline Error Display

**What:** Render `{errors.fieldName && <p>...</p>}` immediately below each input field. Uses `formState.errors` from react-hook-form.

**Example:**
```typescript
<div>
  <input
    {...register("email")}
    type="email"
    aria-invalid={!!errors.email}
    className={`... ${errors.email ? "border-red-500" : "border-text-muted/30"}`}
  />
  {errors.email && (
    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
  )}
</div>
```

### Anti-Patterns to Avoid

- **Controlled inputs with useState:** Using `value={state}` + `onChange` instead of `{...register(...)}` bypasses react-hook-form's optimization and validation. Use `register()`.
- **next/link for external URLs:** The Google Booking Page is an external URL. Use a plain `<a>` tag with `target="_blank" rel="noopener noreferrer"`.
- **dark: Tailwind prefix:** Established project convention is dark-first with no `dark:` prefix. Do not use `dark:` classes anywhere in this component.
- **Importing from convex/_generated/ with absolute paths mismatched:** The contact page uses `"../../../convex/_generated/api"` (relative). The components/home/ path is different — use `@/` alias or calculate the correct relative path. Easiest: `import { api } from "../../../../convex/_generated/api"` or `import { api } from "@/../convex/_generated/api"`. Check against project tsconfig alias coverage. The safe pattern: relative path from the component file location.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email format validation | Custom regex | `z.string().email()` | Handles all RFC edge cases |
| Form error state management | useState per field | `formState.errors` from react-hook-form | Automatic per-field error tracking |
| Form reset after submit | Manually clear useState fields | `reset()` from useForm | Handles all registered fields atomically |
| Required field validation | HTML `required` attribute | Zod schema + zodResolver | HTML `required` triggers browser UI, not inline React errors |

**Key insight:** The contact page uses HTML `required` — this is explicitly called out in CONTEXT.md as a pattern NOT to copy for the homepage form. The homepage form must use Zod + react-hook-form for proper inline React error messages.

## Common Pitfalls

### Pitfall 1: Convex API import path from components/home/

**What goes wrong:** `import { api } from "../../../convex/_generated/api"` works from `src/app/contact/page.tsx` (3 levels up) but not from `src/components/home/ConversionSection.tsx` (4 levels up).

**Why it happens:** Relative path depth differs by file location.

**How to avoid:** Use a path that works from `src/components/home/`. Either `../../../../convex/_generated/api` (relative) or check if tsconfig has a `convex` path alias. The project's tsconfig only defines `@/*` mapping to `./src/*` — convex is outside src, so `@/` won't reach it. Use the relative path `../../../../convex/_generated/api` or add a tsconfig path alias.

**Warning signs:** TypeScript error "Cannot find module" on the api import.

### Pitfall 2: "or" Divider Layout on Mobile

**What goes wrong:** A vertical divider (using `border-l` or an absolutely positioned line) renders as an odd horizontal bar or disappears entirely when the grid collapses to single column on mobile.

**Why it happens:** The divider element needs different geometry on different breakpoints.

**How to avoid:** Use a single divider element with responsive flex direction. `flex-row` with `flex-1 border-t` flanking text on mobile; `flex-col` with `flex-1 border-l` flanking text on desktop. Or: hide the desktop divider entirely and show a simple horizontal `<hr>`-style element on mobile only with `md:hidden`.

**Warning signs:** Divider overlapping content or not visible at all on 375px viewport.

### Pitfall 3: Submit Button Not Disabled During Mutation

**What goes wrong:** User double-clicks submit; two Convex mutation calls fire; two leads created.

**Why it happens:** The `loading` state is set but the button's `disabled` prop is not wired correctly, or `isSubmitting` from react-hook-form is not used.

**How to avoid:** Disable the button when `loading` is true OR use react-hook-form's `formState.isSubmitting` as the disabled condition. Either works; pick one and be consistent.

### Pitfall 4: jest.mock for convex/react Missing in Tests

**What goes wrong:** Tests for `ConversionSection` that import `useMutation` will fail unless `convex/react` is mocked — the Convex client is not available in jsdom.

**Why it happens:** `useMutation` requires a Convex provider context, which doesn't exist in the test environment.

**How to avoid:** Add a manual mock at `src/__mocks__/convex/react.ts` (or inline `jest.mock('convex/react', ...)` in the test file). The mock should return a jest.fn() for `useMutation` that returns another jest.fn().

**Example mock:**
```typescript
// src/__mocks__/convex/react.ts  (or inline in test)
jest.mock("convex/react", () => ({
  useMutation: jest.fn(() => jest.fn()),
  useQuery: jest.fn(() => undefined),
}));
```

### Pitfall 5: Zod v4 API Differences

**What goes wrong:** Developers copy Zod v3 patterns that are removed or renamed in v4.

**Why it happens:** Zod v4 (released 2025) has a new import path and some breaking changes.

**How to avoid:** In Zod v4, import from `"zod"` (same as v3). The core API (`z.object`, `z.string`, `.email()`, `.min()`, `.optional()`) is unchanged. The main breaking changes in v4 are in `.error()` vs `.message()` for custom error messages — use `.min(1, "message")` string shorthand which works in both versions. Confidence: HIGH (verified against package.json showing zod@4.3.6 and @hookform/resolvers@5.2.2 which targets Zod v4).

### Pitfall 6: Booking CTA URL Hardcoded vs. Environment Variable

**What goes wrong:** The Google Booking Page URL is hardcoded in the component, making it impossible to update without a code change.

**Why it happens:** URL is treated as a constant rather than configuration.

**How to avoid:** Define the URL as a `const BOOKING_URL = "..."` at the top of the file. The URL will be confirmed before Phase 3 ships (noted as a blocker in STATE.md). A placeholder `#` can unblock development; the const makes it a single-line change when the real URL arrives. Do NOT use `NEXT_PUBLIC_` env vars for this unless the URL must be secret — for a public booking link, a file-level constant is simpler.

## Code Examples

### Complete Zod Schema for Lead Form
```typescript
// Source: zod docs + @hookform/resolvers docs (verified against installed versions)
import { z } from "zod";

const leadFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  company: z.string().optional(),
  message: z.string().min(1, "Please describe your project"),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;
```

### Success State Replacement Pattern
```typescript
// Replaces form contents within the same card; no page navigation
if (submitted) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-4">
      <CheckCircle className="h-12 w-12 text-primary" />
      <h3 className="font-display font-semibold text-text text-xl">
        Thanks! We&apos;ll be in touch within 24-48 hours.
      </h3>
    </div>
  );
}
```

### Booking CTA Anchor Tag Pattern
```typescript
// External link — plain anchor, NOT next/link
<a
  href={BOOKING_URL}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center justify-center w-full bg-cta text-cta-text font-display font-semibold px-8 py-4 rounded-lg hover:-translate-y-1 hover:shadow-cta-glow transition-all duration-200"
>
  Book a Free Consultation
</a>
```

### Ghost/Outline Submit Button (Secondary Style)
```typescript
// Visually secondary to the orange booking CTA
<button
  type="submit"
  disabled={loading}
  className="w-full border border-text-muted/40 text-text bg-transparent font-display font-semibold px-8 py-4 rounded-lg hover:border-text-muted/70 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? "Sending..." : "Send Message"}
</button>
```

### Dark-themed Input Field (Consistent with Design System)
```typescript
// Dark input consistent with bg-surface base — no dark: prefix
<input
  type="text"
  {...register("name")}
  placeholder="Your full name"
  className="w-full px-4 py-3 bg-surface-alt border border-text-muted/20 rounded-lg text-text font-body placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all duration-200"
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML `required` + browser validation | Zod + react-hook-form inline errors | Established practice | Inline React errors, not browser tooltip popups |
| Controlled form state (useState per field) | Uncontrolled via react-hook-form register | N/A | Better perf, less re-renders |
| Zod v3 import patterns | Zod v4 (same import path, minor API changes) | Zod v4 released 2025 | No breaking change for this use case |

**Deprecated/outdated:**
- HTML `required` attribute for form validation: Works but produces browser-native UI, not inline React error messages. The CONTEXT.md explicitly calls out the contact page's use of `required` as NOT the model to copy.

## Open Questions

1. **Google Booking Page URL**
   - What we know: The button must open an external URL in a new tab (BOOK-01)
   - What's unclear: The actual URL is not confirmed (noted as a blocker in STATE.md)
   - Recommendation: Use `const BOOKING_URL = "https://placeholder.example.com"` during development. Make it a single named constant so the URL change is one line when confirmed.

2. **Convex API import path alias**
   - What we know: The project tsconfig defines `@/*` → `./src/*` only; convex/ is outside src/
   - What's unclear: Whether a tsconfig path alias for convex has been added since initial setup
   - Recommendation: Read `tsconfig.json` at plan time and use relative path `../../../../convex/_generated/api` from `src/components/home/` if no alias exists.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + @testing-library/react 16.3.2 |
| Config file | `jest.config.js` (root) |
| Quick run command | `npm test -- --testPathPattern=homepage` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LEAD-01 | Form renders all 4 fields (name, email, company, message) | unit | `npm test -- --testPathPattern=homepage` | ✅ homepage.test.tsx (needs new tests) |
| LEAD-02 | Submitting empty required fields shows inline error messages | unit | `npm test -- --testPathPattern=homepage` | ✅ homepage.test.tsx (needs new tests) |
| LEAD-03 | Form calls Convex submit mutation with source "homepage" on valid submit | unit | `npm test -- --testPathPattern=homepage` | ✅ homepage.test.tsx (needs new tests) |
| LEAD-04 | Success state renders after submission; form fields cleared | unit | `npm test -- --testPathPattern=homepage` | ✅ homepage.test.tsx (needs new tests) |
| BOOK-01 | Booking CTA link has correct href and target="_blank" | unit | `npm test -- --testPathPattern=homepage` | ✅ homepage.test.tsx (needs new tests) |
| BOOK-02 | Booking CTA is visually primary (rendered before form, orange btn class present) | unit | `npm test -- --testPathPattern=homepage` | ✅ homepage.test.tsx (needs new tests) |
| DSGN-02 | Page has no horizontal scroll at 375px; all sections render | smoke/manual | Visual QA at 375px, tablet, desktop | manual-only — CSS/layout cannot be unit tested |
| DSGN-03 | Touch targets have adequate size; inputs full-width on mobile | smoke/manual | Visual QA at 375px | manual-only — CSS properties not testable in jsdom |

**Note on DSGN-02/DSGN-03:** Layout and responsive behavior are inherently visual and cannot be meaningfully tested in jsdom. These requirements are verified through manual responsive QA (or screenshot testing with a tool like Playwright, which is out of scope for this phase). The QA task must document the manual verification steps.

### Sampling Rate
- **Per task commit:** `npm test -- --testPathPattern=homepage`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__mocks__/convex/react.ts` — needed for useMutation mock in ConversionSection tests; covers LEAD-03
- [ ] New test cases in `src/__tests__/homepage.test.tsx` — covers LEAD-01, LEAD-02, LEAD-03, LEAD-04, BOOK-01, BOOK-02

*(Existing test infrastructure covers the test runner setup, mocks for next/link and lucide-react, and the @testing-library/jest-dom matchers — all re-usable.)*

## Sources

### Primary (HIGH confidence)
- Codebase direct reads — `convex/leads.ts`, `src/app/contact/page.tsx`, `src/app/page.tsx`, `src/components/home/*.tsx`, `tailwind.config.ts`, `package.json`, `jest.config.js` — full picture of established patterns and installed versions
- `package.json` — exact installed versions: react-hook-form@7.54.0, zod@4.3.6, @hookform/resolvers@5.2.2, convex@1.17.0

### Secondary (MEDIUM confidence)
- react-hook-form + @hookform/resolvers documented integration pattern — well-established, consistent with installed versions
- Zod v4 API compatibility assessment — based on package version and known Zod v4 changelog; core API unchanged for this use case

### Tertiary (LOW confidence)
- None — all claims are grounded in direct codebase inspection or installed package versions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in package.json; versions match
- Architecture: HIGH — ConversionSection pattern is a direct extension of existing home section components; "use client" island pattern is established
- Pitfalls: HIGH — import path issue (Pitfall 1) verified by inspecting project tsconfig; Convex mock gap (Pitfall 4) verified by checking src/__mocks__/ contents; others derived from direct code inspection
- Test mapping: HIGH — jest.config.js and existing homepage.test.tsx fully inspected; gaps are concrete and enumerated

**Research date:** 2026-03-13
**Valid until:** 2026-06-13 (stable stack — Next.js 14, react-hook-form, Zod; no fast-moving dependencies for this phase)
