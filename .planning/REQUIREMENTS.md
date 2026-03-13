# Requirements: Sira Services Landing Page

**Defined:** 2026-03-13
**Core Value:** The homepage must clearly communicate what Sira Services does, build trust through social proof, and make it effortless for visitors to book a consultation.

## v1 Requirements

### Design & Theme

- [ ] **DSGN-01**: Page uses a dark, tech-forward color palette with custom Tailwind tokens (dark backgrounds, accent gradients)
- [ ] **DSGN-02**: Page is fully responsive and optimized for mobile, tablet, and desktop viewports
- [ ] **DSGN-03**: Mobile layout is a first-class experience with touch-friendly spacing, readable typography, and properly stacked sections

### Hero

- [ ] **HERO-01**: Hero section displays an outcome-focused headline that communicates what business problems Sira Services solves
- [ ] **HERO-02**: Hero includes supporting subtext explaining who the service is for and the value delivered
- [ ] **HERO-03**: Hero has a prominent "Book a Consultation" CTA button that scrolls to the booking/lead capture section

### Services

- [ ] **SRVC-01**: Services grid displays three cards: AI Consulting & Strategy, Data Pipeline Implementation, Custom Computer Vision Systems
- [ ] **SRVC-02**: Each service card has an icon, title, and benefit-oriented description focused on business outcomes

### Social Proof

- [ ] **PRUF-01**: Testimonial from Jesse Batt, Owner of Performance Meal Prep — "Amazing experience! Super fast at addressing issues. Always making suggestions to better our site. Would 100% recommend"
- [ ] **PRUF-02**: Testimonial from Kerry Johnson — "Julio, is a young vibrant individual who enjoys his work. Great communication, punctual and eager to learn."
- [ ] **PRUF-03**: Testimonial from Daniel — "Julio was very polite and professional. He asked great qualifying questions and we were able to dial in on the analysis that suited the project best. I would recommend his services and look forward to working with him in the future."

### Lead Capture

- [ ] **LEAD-01**: Lead form captures 4 fields: name, email, company, project description
- [ ] **LEAD-02**: Form has client-side validation with clear error messages (all fields required, valid email)
- [ ] **LEAD-03**: Form submits to existing Convex leads mutation with source "homepage"
- [ ] **LEAD-04**: Form shows success state after submission and clears fields

### Booking

- [ ] **BOOK-01**: "Book a Consultation" button links to Google Booking Page (external link, opens in new tab)
- [ ] **BOOK-02**: Booking CTA is visually primary; lead form is positioned as secondary/fallback option

### Final CTA

- [ ] **CTA-01**: Bottom-of-page CTA banner reinforces the consultation offer with a link to booking

## v2 Requirements

### Animations

- **ANIM-01**: Scroll-triggered entrance animations on sections (fade-in, slide-up) using motion/framer-motion

### Social Proof Enhancements

- **PRUF-04**: Trust metrics bar with numbers (projects completed, client satisfaction rate)
- **PRUF-05**: Case study callout block for Performance Meal Prep data pipeline project

### Process Section

- **PROC-01**: "How We Work" section showing 3-4 step engagement process

## Out of Scope

| Feature | Reason |
|---------|--------|
| Services page redesign | Future milestone — homepage only this round |
| Contact page replacement | Existing contact page works, keep as-is |
| About page changes | Future milestone |
| Real-time chat widget | Unnecessary complexity, low conversion value for consulting |
| Pricing page/section | Consulting pricing is custom — showing prices hurts more than helps |
| Video backgrounds | Performance killer, accessibility concern |
| Blog redesign | Existing blog system works fine |
| Dark/light mode toggle | Permanently dark design — no toggle needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | TBD | Pending |
| DSGN-02 | TBD | Pending |
| DSGN-03 | TBD | Pending |
| HERO-01 | TBD | Pending |
| HERO-02 | TBD | Pending |
| HERO-03 | TBD | Pending |
| SRVC-01 | TBD | Pending |
| SRVC-02 | TBD | Pending |
| PRUF-01 | TBD | Pending |
| PRUF-02 | TBD | Pending |
| PRUF-03 | TBD | Pending |
| LEAD-01 | TBD | Pending |
| LEAD-02 | TBD | Pending |
| LEAD-03 | TBD | Pending |
| LEAD-04 | TBD | Pending |
| BOOK-01 | TBD | Pending |
| BOOK-02 | TBD | Pending |
| CTA-01 | TBD | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 0
- Unmapped: 18 ⚠️

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after initial definition*
