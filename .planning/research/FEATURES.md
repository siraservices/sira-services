# Feature Research

**Domain:** AI/ML Consulting Service Landing Page (B2B)
**Researched:** 2026-03-13
**Confidence:** HIGH (multiple verified sources, cross-referenced patterns)

## Feature Landscape

### Table Stakes (Users Expect These)

Features a B2B visitor expects on any consulting website. Missing these and the site reads as unfinished or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section with headline + sub-headline + CTA | First thing visitors see; immediately answers "what do you do, for whom, and why should I care?" | LOW | Outcome-focused headline (problem solved or transformation) outperforms feature-focused; CTA must be above the fold |
| Services overview / grid | Visitors scan for whether the firm does what they need; missing this = confused exit | LOW | Three services already defined: AI Consulting/Strategy, Data Pipeline, Computer Vision. Keep descriptions short, outcome-focused |
| Social proof (testimonials) | B2B buyers need credibility signals before contacting; ~83% trust peer recommendations | LOW | At minimum one real testimonial with name + company; generic "great service" quotes underperform specific outcome quotes |
| Contact / lead capture form | Visitors who want to reach out need a low-friction mechanism | LOW | Name, email, company, project description — four fields is the maximum before drop-off increases. Existing Convex leads table covers this |
| Clear primary CTA button | Every B2B homepage must have an unmistakable next step | LOW | "Book a Consultation" is the right CTA for a consulting business; must appear above the fold and again at page bottom |
| Mobile-responsive layout | 80%+ of B2B buyers research on mobile; broken mobile = instant bounce | LOW | Tailwind's responsive utilities handle this; thumb-friendly tap targets, single-column form on small screens |
| Fast page load (< 3s) | B2B buyers leave slow pages; performance is trust signal | MEDIUM | Next.js image optimization, avoid heavy embeds blocking initial paint |
| Navigation with clear route to contact | Visitors who don't convert on hero still need a path to contact | LOW | Existing Navigation component; ensure "Contact" link is visible and labeled unambiguously |
| Professional visual design | Design signals maturity and competence; poor design = low trust with enterprise buyers | MEDIUM | Dark + techy aesthetic already scoped; gradient accents, consistent spacing, polished typography |
| Footer with contact info | Standard credibility signal; visitors look here to validate legitimacy | LOW | Existing Footer component; ensure email or contact link is present |

### Differentiators (Competitive Advantage)

Features that separate Sira Services from generic freelancing profiles and low-end consultants. These should align directly with the value proposition of deep AI/CV expertise.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Specific domain credibility signals in hero | "AI/ML/Computer Vision" named explicitly distinguishes from generic IT consultants; niche authority signals command higher rates | LOW | Headline or sub-headline should name the specific disciplines — not "technology consulting" but "AI, machine learning, and computer vision" |
| Metrics / results bar ("impact numbers") | Concrete figures (e.g., "X hours automated", "Y% defect reduction") build trust faster than prose; creates scannable visual anchors against dark background | LOW | Needs placeholder or real figures; even one real metric (from Performance Meal Prep pipeline) is more persuasive than three fabricated ones |
| Mini case study or outcome snippet | Shows real-world application, not theoretical capability; differentiates from consultants who list skills without proof | MEDIUM | Performance Meal Prep inventory pipeline is the one confirmed case. One real case study > three vague testimonials |
| "How we work" / process section | Reduces buyer anxiety about what happens after contacting; B2B buyers need to visualize the engagement before committing | LOW | 3–4 step process (Discovery → Proposal → Build → Handoff or similar); directly addresses the "how does this work?" objection |
| Dual-track CTA: form + calendar booking | Captures two buyer types simultaneously — those not ready to commit (form) and those ready to book now (Calendly link) | MEDIUM | 30–70% conversion lift reported for embedded scheduling vs. form-only. Both routes feed the leads pipeline; calendar booking is the faster close path |
| Industry context in services descriptions | Naming specific industries (manufacturing, food production, ecommerce) in service copy makes the offering concrete for buyers in those verticals | LOW | Computer Vision description should mention quality inspection / manufacturing; Data Pipeline should mention inventory/operations; already supported by Performance Meal Prep case |
| "Why Sira Services" differentiator block | Explicitly names what makes this firm different vs. large agencies or offshore shops (direct access to engineer, fast turnaround, practical builds vs. slide decks) | LOW | One short paragraph or 3-icon list; avoids the common consulting cliché of "partnership" and "synergy" language |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Live chat widget | Appears to add responsiveness and reduce bounce | Adds third-party script weight, creates support obligation, distracts visitors from primary CTA, rarely staffed in a solo consultancy | Calendly link for "book time now"; async form for "send message"; clear email address in footer |
| ROI calculator / interactive tool | Seems like a high-value lead magnet | High build complexity, requires maintenance, buyers distrust self-reported numbers, delays action vs. driving it | A single concrete case study metric ("automated 167+ hours/month") is more credible and requires no interaction |
| Blog / content hub on homepage | Content marketing seems like free SEO and authority | The existing blog is already separate; embedding it in the homepage increases scroll depth without increasing conversion; blog visitors and buyer visitors are different funnels | Keep blog link in navigation; add one "Latest Insight" teaser at most in a secondary section — but only after primary conversion elements |
| Pricing section | Seems like it removes friction | B2B consulting pricing is project-specific; publishing rates either attracts price-shoppers or loses premium buyers; eliminates discovery call which is the real sales tool | Use "Contact for custom pricing" or let the consultation booking handle this; pricing pages work for productized services, not custom consulting |
| Video background in hero | Looks impressive in mockups | Dramatically increases load time; autoplaying video on mobile often disabled by OS; dark overlay usually makes underlying video pointless; no evidence of conversion lift for consulting | A high-quality static dark background with CSS gradient achieves the same aesthetic at zero performance cost |
| Popup / exit-intent overlay | Standard lead capture tactic | Annoying on consulting sites where buyers are already evaluating trust; signals desperation, undermines premium positioning | One sticky "Book a Call" button in the header navigation is sufficient secondary capture without harming trust |
| Full-site redesign in one pass | Seems efficient | Scope creep kills delivery; the homepage is the highest-leverage single page; other pages (services, about) can be updated in subsequent milestones | Phase the work: homepage first, validate conversion lift, then extend design system to services/about pages |

## Feature Dependencies

```
Lead Capture Form
    └──requires──> Convex leads mutation (already exists)
    └──requires──> Form validation (react-hook-form already available)

Calendar Booking (Calendly)
    └──requires──> Calendly account + event type configured externally
    └──enhances──> Lead Capture Form (dual-track conversion)

Social Proof Section
    └──requires──> At least one real testimonial (Jesse Batt confirmed)
    └──enhanced by──> Mini Case Study (Performance Meal Prep)
    └──enhanced by──> Metrics bar (if real numbers available)

Metrics / Results Bar
    └──requires──> At least one real data point (Performance Meal Prep pipeline)
    └──falls back to──> Placeholder figures (clearly marked for future replacement)

"How We Work" Process Section
    └──enhances──> Services Grid (pairs service description with clear engagement model)
    └──no external dependencies

Hero CTA ("Book a Consultation")
    └──requires──> Either lead form anchor OR Calendly link as destination
    └──conflicts with──> Multiple competing CTAs in same viewport (dilutes conversion)

Dark Tech Design System
    └──requires──> Tailwind config extension (primary color #2563eb already configured)
    └──required by──> All sections (design is cross-cutting, not a standalone feature)
```

### Dependency Notes

- **Lead Capture Form requires Convex leads mutation:** The backend already exists (`convex/leads.ts`). Form submission can wire directly to the existing mutation with no schema changes required unless new fields are added.
- **Calendar Booking requires external Calendly setup:** This is the one external dependency that cannot be built in code alone. A Calendly account with a configured event type must exist before the embed or link can go live. A fallback (direct email link) should be the default until Calendly is configured.
- **Hero CTA conflicts with multiple CTAs:** Having both "Book a Call" and "View Services" and "Read Our Blog" as equal-weight buttons in the hero viewport kills conversion. One primary CTA, one secondary ghost/text link at most.
- **Metrics Bar enhanced by real data:** Placeholder numbers are acceptable to ship, but a real metric (even one) materially outperforms invented figures. The Performance Meal Prep inventory pipeline has a quantifiable outcome ("hours automated per month") that should be the first real metric populated.

## MVP Definition

### Launch With (v1)

Minimum viable homepage that communicates expertise and captures leads.

- [ ] Hero section — outcome headline, sub-headline naming AI/ML/CV disciplines, single primary CTA ("Book a Consultation"), dark gradient background
- [ ] Services grid (3 cards) — AI Consulting/Strategy, Data Pipeline Implementation, Custom Computer Vision Systems, with brief outcome-focused descriptions
- [ ] Social proof section — Jesse Batt testimonial (real, confirmed), 2–3 placeholder testimonial slots clearly structured
- [ ] Lead capture form — Name, email, company, project description; submits to existing Convex leads table
- [ ] Calendly CTA — Link or inline embed to book a call; appears alongside form as the "ready now" conversion path
- [ ] Dark tech visual design — dark background, gradient accents, consistent typography with existing Tailwind config

### Add After Validation (v1.x)

Add once homepage is live and conversion baseline is established.

- [ ] "How we work" process section — add when initial bounce rate analysis suggests visitors aren't converting due to uncertainty about engagement model
- [ ] Metrics / results bar — add when real figures from client projects are confirmed (Performance Meal Prep outcome data)
- [ ] Mini case study block — Performance Meal Prep inventory pipeline; add when case study copy is written and client approves use
- [ ] Client logos bar — add when 3+ logos are available; placeholder "trusted by" copy is weaker than no logos section at all

### Future Consideration (v2+)

Defer until homepage conversion is validated and subsequent milestones are scoped.

- [ ] Services page redesign — next milestone; homepage scope is homepage only
- [ ] About page redesign — future milestone; existing about page is functional
- [ ] Animated/interactive hero elements — only if A/B testing reveals static design underperforms; don't pre-optimize
- [ ] Video testimonials — high conversion lift when available, but requires production work; not MVP

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero (headline + CTA) | HIGH | LOW | P1 |
| Services grid | HIGH | LOW | P1 |
| Lead capture form | HIGH | LOW | P1 |
| Dark design system | HIGH | MEDIUM | P1 |
| Testimonial section | HIGH | LOW | P1 |
| Calendly CTA / booking link | HIGH | LOW | P1 |
| Mobile responsiveness | HIGH | LOW | P1 |
| "How we work" process section | MEDIUM | LOW | P2 |
| Metrics / results bar | MEDIUM | LOW | P2 |
| Mini case study block | HIGH | MEDIUM | P2 |
| Client logos bar | MEDIUM | LOW | P2 |
| Sticky "Book a Call" header button | MEDIUM | LOW | P2 |
| Animated section transitions | LOW | MEDIUM | P3 |
| Video testimonials | HIGH | HIGH | P3 |
| ROI calculator | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

Reference patterns from comparable AI/ML consulting and B2B tech services firms.

| Feature | BigVision.ai / Width.ai style | Generic IT Consulting | Sira Services Approach |
|---------|-------------------------------|----------------------|------------------------|
| Hero headline | Feature-heavy ("AI, CV, Deep Learning services") | Generic ("We deliver results") | Outcome-first ("We build the AI systems that [solve specific problem]") |
| Social proof | Client logos grid, case study links | Generic testimonial quotes | Named testimonial with real case + metrics placeholder |
| Services | Long prose descriptions with technical jargon | Broad service categories | Three focused, named services with industry-specific outcome sentences |
| CTA | "Contact us" form only | "Get a quote" | Dual-track: form for async inquiries + Calendly for immediate booking |
| Design | Professional light/dark, enterprise-feel | Cookie-cutter bootstrap | Dark + techy, gradient-forward, signals cutting-edge without overdoing animation |
| Process clarity | Often absent or buried | Absent | Explicit "how we work" process section (v1.x) |
| Pricing | Absent (custom project pricing) | Absent or packages | Absent; consultation booking handles scoping |

## Sources

- [9 B2B Landing Page Lessons From 2025 to Drive More Conversions in 2026 — Instapage](https://instapage.com/blog/b2b-landing-page-best-practices)
- [B2B Landing Page Conversion Rates: 2026 Report — First Page Sage](https://firstpagesage.com/seo-blog/b2b-landing-page-conversion-rates/)
- [15 B2B Technology Website Examples — Caffeine Marketing](https://www.caffeinemarketing.com/blog/15-b2b-technology-website-examples)
- [10 Steps to Building a Client-Generating Consulting Website — Consulting Success](https://www.consultingsuccess.com/consulting-website)
- [Hero Section Design Best Practices 2026 — Perfect Afternoon](https://www.perfectafternoon.com/2025/hero-section-design/)
- [Boosting website leads by 30-70% using Calendly forms — Webgate](https://webgate.digital/use-cases/boosting-website-leads-using-calendly-forms/)
- [Mastering Social Proof in 2026 — Kacerr](https://www.kacerr.com/social-proof-marketing-guide-2026-2/)
- [The 10 Best B2B Homepage Examples in 2026 — Blend B2B](https://www.blendb2b.com/blog/the-10-best-b2b-homepage-examples)
- [I've Studied 50+ Hero Section Examples — Thrive Themes](https://thrivethemes.com/hero-section-examples/)
- [How to Turn Your Freelance Website into a Lead-Generating Machine — Millo](https://millo.co/how-to-turn-your-freelance-website-into-a-lead-generating-machine)

---
*Feature research for: AI/ML Consulting Service Landing Page*
*Researched: 2026-03-13*
