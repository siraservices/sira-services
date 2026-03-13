# Phase 3: Conversion Layer - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

A visitor who is ready to engage can either book a call directly via Google Booking Page (new tab) or submit a lead form — and the full homepage works flawlessly on mobile, tablet, and desktop. This phase delivers the interactive conversion section, wires it into the existing page composition, and ensures responsive QA across all sections.

</domain>

<decisions>
## Implementation Decisions

### Conversion section layout
- Two-column layout: booking CTA card on the left (visually dominant), lead form on the right
- Section has a centered header above both columns with headline + supporting subtext
- Booking card gets distinct treatment (darker bg or subtle orange accent border) to emphasize it as the primary path
- Booking card contains: headline ("Ready to get started?"), 1-2 lines of subtext about the free consultation, then the orange CTA button
- "Book a Consultation" button opens Google Booking Page in a new tab (external link)
- An "or" divider separates the two paths (visible on desktop between columns, horizontal with centered "or" text on mobile between stacked cards)

### Lead form design
- Fields: Name (required), Email (required), Company (optional with "(optional)" hint), "Tell us about your project" (required, maps to `message` in Convex)
- Name and Email side-by-side on desktop/tablet, full-width stacked on mobile
- Company and project description are always full-width
- Validation: Zod schema + react-hook-form with inline error text below each invalid field
- Submit button: ghost/outline style (white/light border, transparent bg) — clearly secondary to the orange booking CTA
- Submit button shows "Sending..." and is disabled during mutation
- Form submits to existing `leads.submit` mutation with source: "homepage"

### Success & error states
- On success: form fields clear, success message replaces form within the same card (checkmark + "Thanks! We'll be in touch within 24-48 hours")
- One submission only — no reset/resubmit option
- On error: inline error message above submit button ("Something went wrong. Please try again."), all field values preserved
- Loading state: button text changes to "Sending..." and button is disabled

### Responsive behavior
- Mobile (375px): booking CTA card stacks on top, form below — primary action first
- All form inputs full-width on mobile (including Name/Email which are side-by-side on desktop)
- Subtle horizontal "or" divider between stacked cards on mobile
- Full-page responsive QA: verify all homepage sections (hero, services, testimonials, CTA banner, conversion) at 375px mobile, tablet, and desktop — not just the new section
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `convex/leads.ts` — `submit` mutation ready with name, email, company (optional), message, source fields
- `src/app/contact/page.tsx` — Working form pattern with Convex mutation, loading state, success view (reference for logic, but uses light theme)
- `LiquidButton` (src/components/ui/liquid-glass-button.tsx) — Available for the booking CTA if appropriate
- Zod + react-hook-form + @hookform/resolvers — Already installed from Phase 1
- `lucide-react` — Icons for form, success state, booking CTA

### Established Patterns
- Dark-first styling: bg-surface base, #ff9900 orange accent, no `dark:` prefix
- Alternating section backgrounds (#333e48 / slightly darker variant) for visual rhythm
- Native anchor tags for #booking scroll targets (not next/link)
- Poppins for headings/display, Open Sans for body text
- Subtle hover effects (-translate-y-1 on cards)

### Integration Points
- `src/app/page.tsx` — Has empty `<section id="booking">` placeholder ready to receive conversion component
- Hero CTA and CTA Banner already link to `#booking` — smooth scroll target
- `ConvexClientProvider` wraps the app — useMutation available in client components
- The conversion section component will be a "use client" component (form interactivity) composed into the otherwise RSC page

</code_context>

<specifics>
## Specific Ideas

- Booking CTA should feel visually dominant — filled orange button, accented card background — while the lead form feels like a quieter secondary path
- Contact page form logic is a reference for the Convex mutation pattern, but the homepage form should use Zod + react-hook-form for proper validation (contact page uses basic HTML required attributes)
- The "or" divider between booking and form should feel natural, not forced — a common conversion pattern that clearly communicates two paths

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-conversion-layer*
*Context gathered: 2026-03-13*
