# Phase 1: Foundation - Context

**Gathered:** 2026-03-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Dark design tokens, library installs, component directory scaffolding, and site cleanup so every subsequent component builds on a consistent visual language. Remove unused pages, restyle the global layout to the new dark palette, and prepare the homepage component structure.

</domain>

<decisions>
## Implementation Decisions

### Color palette
- Primary accent: #ff9900 (orange) — replaces both gold (#FFD700) and blue-600 entirely
- Dark base: #333e48 (blue-gray) with a darker variant (e.g., #2a323a) for alternating section backgrounds
- Headings: #ffffff (pure white)
- Body text: soft off-white (e.g., #e0e4e8) for readability on dark backgrounds
- No gold, no blue anywhere — orange is the sole accent color

### CTA buttons
- Solid orange (#ff9900) fill with dark text — high contrast, strong conversion signal
- No outline-style CTAs for primary actions

### Background treatment
- Alternating section backgrounds between #333e48 and a slightly darker shade for visual rhythm
- No single flat tone — sections distinguished by background shade

### Visual effects
- Minimal — no blur orbs, no radial glows, no neon effects
- Flat dark surfaces, content-driven design
- Subtle lift/scale hover effects on cards and buttons (keep existing -translate-y-1 pattern)

### Text effects & animations
- Claude's Discretion: whether to keep gradient text (updated for new palette) or go solid-only
- Claude's Discretion: whether to keep existing CSS keyframe animations or consolidate with motion library

### Fonts
- Keep current pairing: Poppins (headings/display) + Open Sans (body)
- No font changes

### LiquidButton component
- Restyle with new orange/dark palette — do not replace with a new component
- Keep existing component API

### Site cleanup
- Remove unused pages: about, services, signin, signup
- Keep: homepage, blog, contact, admin
- Update Nav and Footer to remove links to deleted pages

### Global dark scope
- Whole site goes dark — body, Nav, Footer all use dark tokens
- No need to fix readability on removed pages
- Blog, contact, and admin pages should remain usable with the new dark globals

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `LiquidButton` (src/components/ui/liquid-glass-button.tsx): Restyle with new palette, keep API
- `clsx`, `tailwind-merge`, `class-variance-authority`: Already installed, use for component styling
- `lucide-react`: Icon library already in use — continue using for service icons etc.
- Existing CSS animations (fade-up, fade-in, slide-in, pulse-slow): Available in Tailwind config

### Established Patterns
- Tailwind config uses semantic token groups (primary, cta, surface, text) — restructure for new palette
- Font variables loaded via next/font/google in layout.tsx (--font-poppins, --font-opensans)
- `globals.css` has custom utilities (.text-gradient, .stagger-*, prose styles, scrollbar, selection)
- Body class in layout.tsx sets base background and text color globally

### Integration Points
- `src/app/layout.tsx`: Body class needs dark background/text tokens
- `tailwind.config.ts`: All color tokens need replacement
- `src/app/globals.css`: Custom utilities need palette update (scrollbar, selection, prose, text-gradient)
- `src/components/Navigation.tsx`: Remove links to deleted pages, restyle for dark
- `src/components/Footer.tsx`: Remove links to deleted pages, restyle for dark
- `src/components/home/`: New directory for homepage section components (Phase 2+)

</code_context>

<specifics>
## Specific Ideas

- User provided exact hex values: #ff9900, #333e48, #ffffff — use these as the canonical palette anchors
- Minimal visual effects — the user explicitly wants flat, content-driven dark surfaces with no decorative blur/glow effects
- The site should feel professional consulting, not flashy startup
- **Key reference:** The homepage first impression should feel like a user's first interaction with Claude.ai or ChatGPT — clean, centered, focused, welcoming. That "what can I help you with?" landing experience. (Primarily affects Phase 2 hero/content, but the foundation tokens should support this aesthetic.)

</specifics>

<deferred>
## Deferred Ideas

- Removing or redesigning individual page content (blog, contact, admin) — future milestones
- About/services page recreation if needed later — separate scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-13*
