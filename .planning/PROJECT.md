# Sira Services — Landing Page Enhancement

## What This Is

A conversion-focused homepage redesign for Sira Services, an AI/ML/computer vision consulting business. The existing Next.js + Convex site has a blog, contact form, and admin dashboard, but the homepage doesn't communicate expertise or drive leads. This project enhances the homepage into a high-converting landing page with a dark, tech-forward design that establishes authority and funnels general business visitors toward booking a consultation.

## Core Value

The homepage must clearly communicate what Sira Services does, build trust through social proof, and make it effortless for visitors to book a consultation.

## Requirements

### Validated

<!-- Existing capabilities confirmed from codebase -->

- ✓ Blog system with listing and detail pages — existing
- ✓ Contact form that submits leads to Convex database — existing
- ✓ Admin dashboard for managing posts and leads — existing
- ✓ Authentication via WorkOS AuthKit — existing
- ✓ Navigation and footer components — existing
- ✓ Services page — existing
- ✓ About page — existing

### Active

<!-- Enhancement scope for this milestone -->

- [ ] Hero section with strong headline, subtext, and prominent "Book a Consultation" CTA
- [ ] Services grid showcasing three core offerings: AI Consulting/Strategy, Data Pipeline Implementation, Custom Computer Vision Systems
- [ ] Social proof section with testimonials (initial: Jesse Batt, Performance Meal Prep)
- [ ] Lead capture form with name, email, company, and project description fields
- [ ] Calendar booking integration (Calendly embed or link) alongside lead form
- [ ] Dark, tech-forward visual design with gradients and modern styling
- [ ] Clear value messaging that explains what problems Sira Services solves

### Out of Scope

- Full site-wide redesign — only homepage in this round
- Services page redesign — future milestone
- Contact page replacement — keep existing for now
- About page changes — future milestone
- Real-time chat widget — unnecessary complexity
- Blog redesign — existing blog works fine

## Context

- Existing site built with Next.js 14 (App Router), Convex backend, Tailwind CSS, WorkOS auth
- Current homepage is generic and doesn't sell expertise in AI/ML/CV
- Target audience: general businesses that could benefit from AI/ML solutions
- Three core services: AI Consulting/Strategy, Data Pipeline Implementation, Custom Computer Vision Systems
- One confirmed testimonial: Jesse Batt, Owner of Performance Meal Prep — "Amazing experience! Super fast at addressing issues. Always making suggestions to better our site. Would 100% recommend"
- Case study angle: Built data pipelines for inventory management at Performance Meal Prep
- Booking flow: Lead form + Calendly (or similar) calendar link for direct scheduling
- Placeholder content needed for additional testimonials, client logos, and metrics

## Constraints

- **Tech stack**: Must use existing Next.js 14 + Tailwind CSS + Convex stack — no new frameworks
- **Design direction**: Dark + techy aesthetic — dark backgrounds, gradients, tech-forward feel
- **Leads backend**: Use existing Convex leads table and mutations for form submission
- **Content**: Mix of real content (testimonial, services) and realistic placeholders

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Enhance homepage only (not full site redesign) | Focused scope delivers value faster | — Pending |
| Dark + techy design direction | Signals cutting-edge AI expertise to business clients | — Pending |
| Lead form + Calendly dual CTA | Captures leads who aren't ready to book and those who are | — Pending |
| Placeholder content for missing social proof | Allows shipping now, replacing content later | — Pending |

---
*Last updated: 2026-03-12 after initialization*
