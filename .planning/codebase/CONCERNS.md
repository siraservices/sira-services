# Codebase Concerns

**Analysis Date:** 2026-03-12

## Security Issues

**Admin Dashboard Lacks Access Control:**
- Issue: Admin routes (`/admin`, `/admin/leads`, `/admin/posts`) are not protected. Anyone with the URL can access sensitive lead data and modify blog posts.
- Files: `src/app/admin/page.tsx`, `src/app/admin/leads/page.tsx`, `src/app/admin/posts/page.tsx`, `middleware.ts`
- Impact: Unauthorized users can view all leads (names, emails, companies, messages), change lead statuses, delete leads, create/edit/delete blog posts without authentication.
- Current mitigation: None. Only middleware protection is for signup paths.
- Fix approach: Add authentication checks in admin layout or middleware. Restrict `api.leads.*` and `api.posts.*` mutations to authenticated users only. Validate user permissions in Convex mutations before allowing modifications.

**Backend Mutations Lack Authorization:**
- Issue: Convex mutations for leads and posts have no authentication/authorization checks. Anyone with access to the Convex API can submit leads, modify statuses, and manage posts.
- Files: `convex/leads.ts`, `convex/posts.ts`
- Impact: Public users can submit leads, but more critically, admin mutations are unprotected if the frontend auth is bypassed.
- Fix approach: Add auth context checks in Convex mutation handlers. Use `ctx.auth.getUserIdentity()` to verify user is authenticated before allowing admin operations.

**Form Validation Incomplete:**
- Issue: Contact form in `src/app/contact/page.tsx` uses HTML5 required attributes but no server-side validation of email format or message content.
- Files: `src/app/contact/page.tsx`, `convex/leads.ts`
- Impact: Invalid or malicious data could be stored in leads database.
- Fix approach: Add email validation in `leads.submit` mutation handler. Sanitize message content to prevent stored XSS if data is later displayed unsanitized.

**Error Messages Expose Internal State:**
- Issue: Console.error statements log raw error objects without sanitization. Authentication errors are caught and logged to console.
- Files: `src/app/signin/page.tsx` (lines 19, 30), `src/app/signup/page.tsx`, `src/app/contact/page.tsx` (line 33)
- Impact: Error details exposed in browser console and potentially in logs. Could leak sensitive information.
- Fix approach: Catch auth errors, display generic user-facing messages, and log sanitized details server-side for debugging.

## Tech Debt

**Duplicate SignOut Logic:**
- Issue: Sign out handler is defined inline in Navigation component without error handling or user feedback.
- Files: `src/components/Navigation.tsx` (lines 30-32)
- Impact: If sign out fails silently, user may be confused about their session state.
- Fix approach: Wrap `signOut()` in try-catch with error feedback. Consider extracting to custom hook.

**Hardcoded Color Values:**
- Issue: Multiple hardcoded color strings throughout codebase (e.g., `#1A1A1A`, `#FFD700`, `#666666`) instead of using consistent Tailwind config or CSS variables.
- Files: `src/app/page.tsx`, `src/app/contact/page.tsx`, `src/app/services/page.tsx`, `src/components/Navigation.tsx`
- Impact: Difficult to maintain consistent branding. Updates require changes across many files.
- Fix approach: Extract all colors to `tailwind.config.ts` or CSS custom properties. Use semantic names (e.g., `text-primary-dark` instead of `text-[#1A1A1A]`).

**Navigation Auth State Load Delay:**
- Issue: Navigation component shows loading state while fetching auth user, but UX could flicker on page loads.
- Files: `src/components/Navigation.tsx` (lines 70, 132)
- Impact: Visual flicker when user info loads. Not broken but jarring.
- Fix approach: Persist auth state to localStorage or use SuspenseBoundary to wait for auth before rendering navigation.

## Performance Bottlenecks

**Large LiquidButton Component:**
- Issue: `LiquidButton` component is 382 lines with complex SVG filter effects, metal button variants, and multiple event handlers.
- Files: `src/components/ui/liquid-glass-button.tsx`
- Impact: Potential render performance issues with many buttons on page. Complex shadow/blur calculations on every render.
- Fix approach: Memoize component with React.memo. Extract SVG filter to static asset. Consider using CSS-in-JS or external library for glass-morphism effects.

**Full Admin Post Listing Without Pagination:**
- Issue: `api.posts.listAll` returns all posts without pagination or limits.
- Files: `src/app/admin/posts/page.tsx`, `convex/posts.ts`
- Impact: In-memory data grows with every blog post. Queries become slow at scale.
- Fix approach: Implement pagination in Convex query with `skip` and `take` parameters. Add limit to frontend list display.

**Full Leads History Without Filtering:**
- Issue: `api.leads.list` returns all leads without pagination. Admin page loads and renders all leads in DOM.
- Files: `src/app/admin/leads/page.tsx`, `convex/leads.ts`
- Impact: With hundreds of leads, page becomes slow to load and difficult to navigate.
- Fix approach: Add pagination, search/filter by status or date range, implement virtual scrolling.

## Fragile Areas

**Contact Form Error Recovery:**
- Issue: If lead submission fails, form stays in loading state. User has no way to retry or see error message.
- Files: `src/app/contact/page.tsx` (lines 20-37)
- Impact: User may reload page thinking form didn't submit, potentially submitting duplicate leads.
- Fix approach: Add error state display. Show toast/alert with error message. Allow user to retry without losing form data.

**Missing Loading States:**
- Issue: Admin dashboard and leads page show loading UI but it's minimal (`animate-pulse`). No clear indication of what's loading if network is slow.
- Files: `src/app/admin/leads/page.tsx` (lines 36-40), `src/app/admin/posts/page.tsx`
- Impact: Users may think page is frozen on slow connections.
- Fix approach: Add skeleton loaders matching card layout. Show detailed loading states for each section.

**Unvalidated Slug in Blog Posts:**
- Issue: Blog post slug is a user-editable text field with no validation. Duplicate slugs would cause query to return wrong post.
- Files: `src/app/admin/posts/page.tsx`, `src/app/blog/[slug]/page.tsx`
- Impact: If user creates post with duplicate slug, first match is returned. No conflict detection.
- Fix approach: Add slug uniqueness validation in Convex mutation. Generate slug from title if not manually set. Show preview of final URL.

**Form State Not Reset on Success:**
- Issue: Admin post form's `resetForm()` called but formData in state still contains old values temporarily.
- Files: `src/app/admin/posts/page.tsx` (lines 28-39, 68)
- Impact: If user submits form twice quickly, second submission might use old data.
- Fix approach: Add success feedback before clearing form. Disable submit button during mutation. Use optimistic updates.

## Missing Critical Features

**No Rate Limiting on Lead Submission:**
- Issue: Contact form endpoint (`convex/leads.ts:submit`) has no rate limiting or spam protection.
- Files: `src/app/contact/page.tsx`, `convex/leads.ts`
- Impact: Endpoint can be flooded with spam leads or bot submissions.
- Recommendation: Implement IP-based or email-based rate limiting. Add CAPTCHA or honeypot field. Validate lead quality before storing.

**No Email Notifications:**
- Issue: When new lead is submitted, no notification is sent. Admin must manually visit dashboard to see new leads.
- Files: `convex/leads.ts`
- Impact: Response time to leads slows down. Leads may be lost if admin forgets to check.
- Recommendation: Add email notification on new lead submission. Consider webhook integration for CRM sync.

**No Audit Trail:**
- Issue: Admin actions (creating posts, changing lead status) are not logged. No record of who did what or when.
- Files: `src/app/admin/leads/page.tsx`, `src/app/admin/posts/page.tsx`, `convex/leads.ts`, `convex/posts.ts`
- Impact: Cannot track who modified a lead or post. No accountability for admin actions.
- Recommendation: Add audit log table to schema. Log all mutations with user ID, timestamp, and changes.

**No Draft Auto-Save:**
- Issue: Blog post form has no auto-save. If user navigates away mid-edit, all content is lost.
- Files: `src/app/admin/posts/page.tsx`
- Impact: Large form loss frustration. Users may avoid creating longer posts.
- Recommendation: Auto-save to localStorage. Show unsaved changes warning. Use IndexedDB for larger content.

## Dependencies at Risk

**WorkOS AuthKit Integration:**
- Risk: SSO provider is tightly coupled. Provider parameter for Google/other providers is passed as query param after getting sign-in URL from WorkOS.
- Impact: If WorkOS API changes or goes down, entire auth flow breaks. Provider override logic is fragile.
- Files: `src/app/actions/auth.ts`, `src/app/signin/page.tsx`, `src/app/signup/page.tsx`
- Mitigation: Currently handled but relies on WorkOS supporting provider query params.
- Recommendation: Document provider override behavior. Test provider-specific flows. Have fallback auth method.

**Convex Schema Tight Coupling:**
- Risk: Schema directly tied to frontend via generated types. Any schema change requires frontend rebuild.
- Impact: Breaking changes propagate immediately. No versioning strategy.
- Files: `convex/schema.ts`, `convex/_generated/api.d.ts`
- Recommendation: Version API endpoints. Use adapter pattern for schema migrations. Document breaking changes.

## Test Coverage Gaps

**Admin Routes Untested:**
- What's not tested: Admin dashboard access control, authorization checks
- Files: `src/app/admin/page.tsx`, `src/app/admin/leads/page.tsx`, `src/app/admin/posts/page.tsx`
- Risk: Authorization bypass could go unnoticed. No tests prevent regressions.
- Priority: High - Security-critical

**Convex Mutations Untested:**
- What's not tested: Leads and posts mutations. No mutation tests exist.
- Files: `convex/leads.ts`, `convex/posts.ts`
- Risk: Database-level errors, validation failures not caught in testing.
- Priority: High

**Form Error Handling Untested:**
- What's not tested: Contact form error states, retry logic, validation
- Files: `src/app/contact/page.tsx`
- Risk: Broken form recovery could strand users.
- Priority: Medium

**Blog Slug Collision Not Tested:**
- What's not tested: Duplicate slug handling, slug generation logic
- Files: `src/app/blog/[slug]/page.tsx`
- Risk: Data corruption from slug collisions.
- Priority: Medium

## Known Bugs

**Navigation Mobile Menu Doesn't Close on Link Click in Desktop Mode:**
- Symptoms: After opening mobile menu, clicking a navigation link closes menu. But if you resize window to desktop, menu state isn't reset.
- Files: `src/components/Navigation.tsx` (line 114)
- Trigger: Open mobile menu on small screen, then resize to desktop breakpoint
- Workaround: Hard refresh browser
- Recommendation: Listen to breakpoint changes with media query listener. Close menu when window resizes past `md` breakpoint.

**Blog Post Slug Query Returns First Match:**
- Symptoms: If multiple posts have the same slug, visiting blog post shows first one in database order
- Files: `src/app/blog/[slug]/page.tsx`, `convex/posts.ts` (lines 18-25)
- Trigger: Create two published posts with identical slugs
- Workaround: Ensure all slugs are unique
- Recommendation: Add unique constraint to schema if possible, or validate slug uniqueness in mutation.

---

*Concerns audit: 2026-03-12*
