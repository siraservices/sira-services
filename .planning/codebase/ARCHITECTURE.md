# Architecture

**Analysis Date:** 2026-03-12

## Pattern Overview

**Overall:** Full-stack Next.js 14 application with Convex backend, following a client-server architecture pattern with clear separation between frontend pages, server actions, and backend queries/mutations.

**Key Characteristics:**
- App Router-based frontend with server and client components
- Convex for real-time backend with schema-first database design
- WorkOS AuthKit for authentication and user management
- Content-centric structure (blog posts, leads/contacts)
- API-driven communication via Convex React hooks

## Layers

**Presentation Layer (Frontend):**
- Purpose: User-facing interface for browsing content, submitting forms, and admin management
- Location: `src/app/` and `src/components/`
- Contains: Page components (`.tsx`), UI components, navigation, and layouts
- Depends on: Convex client library, Next.js hooks, WorkOS auth hooks
- Used by: Browser clients

**Business Logic Layer (Server Actions & Handlers):**
- Purpose: Handle server-side authentication flows and route handlers
- Location: `src/app/actions/`, `src/app/auth/`, `src/app/callback/`
- Contains: Auth server actions, Next.js route handlers for WorkOS callbacks
- Depends on: WorkOS SDK, Next.js server APIs
- Used by: Frontend pages and auth flows

**Backend Data Layer (Convex):**
- Purpose: Manage database schema, queries, mutations, and business logic
- Location: `convex/`
- Contains: Schema definitions, query/mutation handlers for posts and leads
- Depends on: Convex server SDK
- Used by: Frontend via Convex React client

**Middleware Layer:**
- Purpose: Authentication guard and request interception
- Location: `middleware.ts`
- Contains: WorkOS auth middleware configuration
- Depends on: WorkOS AuthKit middleware
- Used by: All requests

## Data Flow

**Blog Reading Flow:**

1. User navigates to `/blog`
2. `src/app/blog/page.tsx` mounts as client component
3. Component calls `api.posts.listPublished` via `useQuery` hook
4. Convex backend executes `convex/posts.ts:listPublished` query
5. Query fetches published posts from `posts` table indexed by `published`
6. Results return to component, rendered with `format()` from date-fns
7. User clicks post, routes to `/blog/[slug]`
8. Detail page queries `api.posts.getBySlug` with slug parameter
9. Convex executes indexed lookup on `posts` table by `slug` index
10. Post content rendered with `dangerouslySetInnerHTML` (HTML stored in DB)

**Contact Form Submission Flow:**

1. User navigates to `/contact`
2. `src/app/contact/page.tsx` (client component) displays contact form
3. User fills form and submits
4. `handleSubmit` calls `submitLead` mutation from Convex
5. `convex/leads.ts:submit` mutation receives form data
6. Mutation inserts record into `leads` table with status "new"
7. Form clears, success message displays
8. Admin can view leads at `/admin/leads` (uses `api.leads.list` query)

**Admin Blog Management Flow:**

1. Admin navigates to `/admin/posts`
2. Component mounts, queries `api.posts.listAll` (includes drafts)
3. Admin can create new post via form
4. `createPost` mutation saves to database with metadata
5. Admin can edit posts via `updatePost` mutation
6. Admin can toggle `published` boolean via `togglePublished`
7. `publishedAt` timestamp auto-set on first publish
8. Deletions via `deletePost` mutation

**Authentication Flow:**

1. Unauthenticated user clicks "Sign In" link
2. Routes to `/signin` page (client component)
3. User enters email or clicks Google button
4. `handleSSO` or `handleGoogleSignIn` calls `getSignInUrlAction` (server action)
5. Server action calls WorkOS `getSignInUrl()` to get auth endpoint
6. User redirected to WorkOS auth page
7. After auth, WorkOS redirects to `/auth/[...auth]/route.ts` (route handler)
8. Route handler processes WorkOS callback
9. User state available via `useAuth()` hook from WorkOS provider
10. Navigation component displays user info or Sign In button based on `useAuth()`

**State Management:**

- **Client State:** React hooks (`useState`, `useQuery`, `useMutation`)
- **Authentication State:** WorkOS `useAuth()` hook (provides `user`, `loading`, `signOut`)
- **Database State:** Convex real-time subscriptions via `useQuery` (returns `undefined` while loading, `null` if not found, data if found)
- **Form State:** Local component state with `useState` (form data, loading, submitted flags)

## Key Abstractions

**Convex Client Provider:**
- Purpose: Initialize and wrap Convex client for real-time backend access
- Examples: `src/components/ConvexClientProvider.tsx`
- Pattern: Context provider that initializes `ConvexReactClient` with URL from env var

**Page Components (Server & Client):**
- Purpose: Route handlers and UI rendering
- Examples: `src/app/page.tsx`, `src/app/blog/page.tsx`, `src/app/contact/page.tsx`
- Pattern: "use client" for interactive pages, default server components for static pages

**Database Queries & Mutations:**
- Purpose: Type-safe backend operations
- Examples: `convex/posts.ts`, `convex/leads.ts`
- Pattern: Exported query/mutation handlers using Convex SDK with validation via `v` (values)

**Server Actions:**
- Purpose: Server-side logic callable from client components
- Examples: `src/app/actions/auth.ts`
- Pattern: Functions marked with "use server" that handle async operations

**Route Handlers:**
- Purpose: HTTP endpoints for specific routes
- Examples: `src/app/auth/[...auth]/route.ts` (WorkOS callback)
- Pattern: Next.js dynamic routes with explicit HTTP methods

## Entry Points

**Frontend Entry:**
- Location: `src/app/layout.tsx`
- Triggers: Browser navigation
- Responsibilities: Root layout wrapping app with providers (AuthKitProvider, ConvexClientProvider), rendering Navigation, main content, and Footer

**Blog Reading Entry:**
- Location: `src/app/blog/page.tsx`
- Triggers: Navigation to `/blog`
- Responsibilities: Query and display published posts with tags and dates

**Contact Submission Entry:**
- Location: `src/app/contact/page.tsx`
- Triggers: Navigation to `/contact`
- Responsibilities: Form UI, validation, submission via Convex mutation

**Admin Dashboard Entry:**
- Location: `src/app/admin/page.tsx`
- Triggers: Navigation to `/admin`
- Responsibilities: Menu linking to admin subpages (blog posts, leads)

**Authentication Entry:**
- Location: `src/app/signin/page.tsx`, `src/app/signup/page.tsx`
- Triggers: Navigation to auth routes or user interaction
- Responsibilities: OAuth form UI, redirects to WorkOS

## Error Handling

**Strategy:** Graceful degradation with loading states and fallback UI

**Patterns:**

- **Async Operations:** Try-catch blocks in handlers, errors logged to console
  - Example: `src/app/contact/page.tsx` catches submission errors, sets loading state back to false
  - Example: `src/app/admin/posts/page.tsx` confirms before delete operations

- **Convex Query Loading:** Three states handled
  - `undefined`: Loading state, show skeleton or loading indicator
  - `null`: Not found, show 404 or empty message
  - Data: Render successfully fetched data
  - Example: `src/app/blog/page.tsx` shows 3 skeleton cards while loading

- **Form Validation:** HTML5 validation + conditional submission
  - Required fields marked with `required` attribute
  - Email validation via `type="email"`
  - No explicit error messages in current implementation

- **Missing Data:** Fallback UI
  - Blog: Shows "No posts yet" message when list is empty
  - Post detail: Shows 404 message when post slug not found

## Cross-Cutting Concerns

**Logging:**
- Strategy: Basic `console.error()` for caught exceptions
- No centralized logging service
- Examples: Auth action failures, form submission errors

**Validation:**
- Client-side: HTML5 form validation (required, email type)
- Server-side: Convex `v` (values) schema validation on all mutations
- Example: `convex/posts.ts` uses `v.string()`, `v.array()`, etc.

**Authentication:**
- Strategy: WorkOS AuthKit middleware + provider hook
- Middleware protects routes (configured in `middleware.ts`)
- `/signup` marked as signup path in middleware config
- `useAuth()` hook checks user state and provides `signOut()` method
- Navigation component conditionally renders auth UI based on user state

**Styling:**
- Strategy: Tailwind CSS utility classes with custom theme extensions
- Design system integrated via `src/components/ui/liquid-glass-button.tsx`
- Custom CSS variables for theme colors defined in `tailwind.config.ts`

**Type Safety:**
- TypeScript strict mode enabled
- Convex auto-generates types in `convex/_generated/` (do not edit)
- Path aliases configured: `@/*` maps to `src/*`

---

*Architecture analysis: 2026-03-12*
