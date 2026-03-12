# External Integrations

**Analysis Date:** 2026-03-12

## APIs & External Services

**Authentication:**
- WorkOS AuthKit - User authentication and authorization
  - SDK/Client: @workos-inc/authkit-nextjs 2.13.0
  - Auth: env vars `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`
  - Implementation: Middleware-based auth at `middleware.ts`, sign-in/up pages at `src/app/signin/` and `src/app/signup/`
  - Server actions for auth flows: `src/app/actions/auth.ts` (getSignInUrlAction, getSignUpUrlAction)

## Data Storage

**Databases:**
- Convex (cloud-hosted backend)
  - Connection: `NEXT_PUBLIC_CONVEX_URL` environment variable
  - Client: ConvexReactClient from convex/react package
  - Provider: `src/components/ConvexClientProvider.tsx` wraps app with Convex context
  - Schema: `convex/schema.ts` defines `posts` and `leads` tables

**Database Tables:**
- `posts` - Blog content (title, slug, content, excerpt, tags, published status, timestamps)
  - Indexes: by_slug, by_published
  - Queries: `convex/posts.ts` (listPublished, getBySlug, listAll)
  - Mutations: create, update, remove posts

- `leads` - Contact form submissions (name, email, company, message, source, status)
  - Indexes: by_status, by_email
  - Queries: `convex/leads.ts` (list, filter by status)
  - Mutations: submit lead, updateStatus, remove

**File Storage:**
- No persistent file storage detected
- Cover images referenced by URL strings in posts table (no upload service integrated)

**Caching:**
- None detected; Convex provides real-time reactivity via subscriptions

## Authentication & Identity

**Auth Provider:**
- WorkOS AuthKit (external auth-as-a-service)
  - Implementation: Middleware at `middleware.ts` protects routes
  - Sign-up paths configured: `/signup`
  - Client-side auth URL generation in `src/app/actions/auth.ts`
  - Provider component wraps app: `AuthKitProvider` from @workos-inc/authkit-nextjs/components in `src/app/layout.tsx`
  - Admin pages require WorkOS authentication (implicit via middleware)

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Standard console logging (no external logging service integrated)
- Node.js/Next.js default logging

## CI/CD & Deployment

**Hosting:**
- Designed for Vercel (Next.js native framework)
- Convex backend deployed to Convex cloud (managed service)

**CI Pipeline:**
- No CI/CD configuration detected (GitHub Actions, etc.)

**Build Process:**
- `npm run build` produces Next.js optimized production build
- `npm run start` runs production server

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL (public, prefixed with NEXT_PUBLIC_)
- `WORKOS_API_KEY` - WorkOS API key for server-side auth operations (secret)
- `WORKOS_CLIENT_ID` - WorkOS client ID for auth redirect and sign-up/in flows (can be public)

**Secrets location:**
- `.env.local` (git-ignored, not tracked)
- Secrets managed via deployment platform (Vercel environment variables for production)

## Webhooks & Callbacks

**Incoming:**
- WorkOS redirects auth callback to Next.js app via middleware handling

**Outgoing:**
- No outgoing webhooks detected
- Contact form submissions stored in Convex leads table (no external notification system)

## Font & Static Resources

**Google Fonts:**
- Poppins (weights 400, 500, 600, 700) - Display font via next/font/google
- Open Sans - Body font via next/font/google
- Fonts self-hosted via Next.js font optimization (no external CDN)

**Icons:**
- lucide-react 0.460.0 - Icon library as React components

---

*Integration audit: 2026-03-12*
