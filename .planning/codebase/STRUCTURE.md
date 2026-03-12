# Codebase Structure

**Analysis Date:** 2026-03-12

## Directory Layout

```
sira-services/
├── src/
│   ├── app/                    # Next.js App Router pages and routes
│   │   ├── layout.tsx          # Root layout wrapping entire app with providers
│   │   ├── page.tsx            # Home page (hero, services, CTA)
│   │   ├── actions/            # Server actions (auth flows)
│   │   │   └── auth.ts         # getSignInUrlAction, getSignUpUrlAction
│   │   ├── auth/               # WorkOS auth callback handling
│   │   │   └── [...auth]/
│   │   │       └── route.ts    # Dynamic route handler for OAuth callback
│   │   ├── callback/           # Additional callback routes
│   │   │   └── route.ts        # Generic callback endpoint
│   │   ├── blog/               # Blog section
│   │   │   ├── page.tsx        # Blog listing page (queries published posts)
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Individual blog post detail page
│   │   ├── admin/              # Admin dashboard
│   │   │   ├── page.tsx        # Admin hub (links to sub-sections)
│   │   │   ├── posts/
│   │   │   │   └── page.tsx    # Blog post management (CRUD)
│   │   │   └── leads/
│   │   │       └── page.tsx    # Contact leads management
│   │   ├── about/
│   │   │   └── page.tsx        # About page
│   │   ├── services/
│   │   │   └── page.tsx        # Services overview page
│   │   ├── contact/
│   │   │   └── page.tsx        # Contact form page
│   │   ├── signin/
│   │   │   └── page.tsx        # Sign in page (WorkOS auth form)
│   │   ├── signup/
│   │   │   └── page.tsx        # Sign up page (WorkOS auth form)
│   │   ├── globals.css         # Global styles
│   ├── components/             # Shared React components
│   │   ├── Navigation.tsx       # Header/navigation bar
│   │   ├── Footer.tsx          # Footer component
│   │   ├── ConvexClientProvider.tsx  # Convex context provider
│   │   └── ui/                 # UI component library
│   │       └── liquid-glass-button.tsx  # Custom button component
│   ├── lib/                    # Utility functions and helpers
│   │   └── utils.ts            # Tailwind class merge utility (cn function)
│   ├── __tests__/              # Test files (co-located by feature)
│   │   ├── auth-actions.test.ts         # Tests for auth server actions
│   │   ├── middleware.test.ts           # Tests for auth middleware
│   │   ├── navigation-auth.test.tsx     # Tests for Navigation component auth
│   │   ├── signin-page.test.tsx         # Tests for sign in page
│   │   └── signup-page.test.tsx         # Tests for sign up page
│   └── __mocks__/              # Jest mock files for external libraries
│       └── @workos-inc/        # Mocks for WorkOS library
│           ├── authkit-nextjs.ts
│           └── authkit-nextjs/
│               └── components.ts
├── convex/                     # Convex backend
│   ├── schema.ts               # Database schema (posts, leads tables)
│   ├── posts.ts                # Post queries and mutations
│   ├── leads.ts                # Lead/contact queries and mutations
│   ├── seed.ts                 # Initial data seeding
│   ├── _generated/             # Auto-generated types (do not edit)
│   │   ├── api.d.ts           # Type-safe API exports
│   │   ├── dataModel.d.ts     # Database type definitions
│   │   └── server.d.ts        # Server SDK types
│   └── tsconfig.json           # TypeScript config for Convex
├── design-system/              # Design system documentation and assets
├── .planning/                  # GSD planning documents
│   └── codebase/              # Auto-generated architecture docs
├── middleware.ts               # WorkOS auth middleware (request interceptor)
├── next.config.mjs             # Next.js build configuration
├── next-env.d.ts               # Next.js type definitions
├── tsconfig.json               # TypeScript compiler config
├── tailwind.config.ts          # Tailwind CSS theme extensions
├── jest.config.js              # Jest test runner config
├── jest.setup.ts               # Jest setup (test environment hooks)
├── tsconfig.jest.json          # TypeScript config for Jest
├── postcss.config.js           # PostCSS configuration
├── package.json                # Project dependencies and scripts
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore rules
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and routes
- Contains: Page components (`.tsx`), route handlers (`route.ts`), layouts
- Key files: `layout.tsx` (root), `page.tsx` (route entry points)

**`src/components/`:**
- Purpose: Reusable React components shared across pages
- Contains: Navigation, Footer, UI library, Convex client provider
- Key files: `Navigation.tsx`, `ConvexClientProvider.tsx`

**`src/lib/`:**
- Purpose: Utility functions and helper modules
- Contains: Utility functions for styling, formatting, validation
- Key files: `utils.ts` (class merge utility)

**`src/__tests__/`:**
- Purpose: Jest test files co-located with source code
- Contains: Unit tests for pages, components, server actions
- Key files: `auth-actions.test.ts`, `*-page.test.tsx`

**`src/__mocks__/`:**
- Purpose: Jest mock implementations for external libraries
- Contains: Mocked versions of WorkOS SDK
- Key files: `@workos-inc/authkit-nextjs.ts`, `components.ts`

**`convex/`:**
- Purpose: Backend database and business logic
- Contains: Schema definitions, queries, mutations
- Key files: `schema.ts`, `posts.ts`, `leads.ts`

**`convex/_generated/`:**
- Purpose: Auto-generated type definitions (do not edit)
- Contains: TypeScript types for API, data model, server SDK
- Key files: `api.d.ts` (type-safe Convex API exports)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout, provider wrapping, Navigation and Footer shell
- `src/app/page.tsx`: Home page with hero section, services cards, CTA
- `middleware.ts`: Auth middleware intercepting all requests

**Configuration:**
- `tsconfig.json`: TypeScript settings, path aliases (`@/*` → `src/*`)
- `tailwind.config.ts`: Theme colors, custom extensions
- `jest.config.js`: Test runner setup with module mapping
- `package.json`: Dependencies, scripts (dev, build, lint, test)

**Core Logic:**
- `convex/schema.ts`: Database schema for `posts` and `leads` tables with indexes
- `convex/posts.ts`: Post queries (`listPublished`, `getBySlug`, `listAll`) and mutations
- `convex/leads.ts`: Lead submission and management

**Public Pages:**
- `src/app/blog/page.tsx`: Blog listing (queries `api.posts.listPublished`)
- `src/app/blog/[slug]/page.tsx`: Blog post detail (queries `api.posts.getBySlug`)
- `src/app/contact/page.tsx`: Contact form (mutates `api.leads.submit`)

**Admin Pages:**
- `src/app/admin/page.tsx`: Dashboard hub
- `src/app/admin/posts/page.tsx`: Blog management (CRUD operations)
- `src/app/admin/leads/page.tsx`: Lead management

**Authentication:**
- `src/app/actions/auth.ts`: Server actions for auth URL generation
- `src/app/signin/page.tsx`: Sign in UI
- `src/app/signup/page.tsx`: Sign up UI
- `src/app/auth/[...auth]/route.ts`: WorkOS callback handler

**Styling:**
- `src/app/globals.css`: Global CSS, Tailwind directives, animations
- `src/components/ui/liquid-glass-button.tsx`: Custom themed button component

**Testing:**
- `jest.config.js`: Test configuration with module path mapping
- `jest.setup.ts`: Test environment initialization
- `src/__tests__/`: Test files matching patterns `*.test.ts(x)`

## Naming Conventions

**Files:**
- Page components: `page.tsx` (Next.js convention)
- Route handlers: `route.ts`
- Server actions: `auth.ts` (action modules in `app/actions/`)
- Components: PascalCase (e.g., `Navigation.tsx`, `Footer.tsx`)
- Utilities: camelCase (e.g., `utils.ts`)
- Tests: `*.test.ts` or `*.test.tsx`
- Mocks: Mirror source path under `__mocks__/`

**Directories:**
- Feature directories: lowercase kebab-case (e.g., `admin`, `blog`, `contact`)
- Dynamic segments: `[param]` or `[...catchAll]` (Next.js convention)
- Component directories: PascalCase for internal structure (e.g., `ui/`)
- Test directories: `__tests__/` (Jest convention)
- Mock directories: `__mocks__/` (Jest convention)

**Functions:**
- Server actions: camelCase ending with `Action` (e.g., `getSignInUrlAction`)
- Mutations: camelCase or verb form (e.g., `submitLead`, `updatePost`)
- Queries: camelCase (e.g., `listPublished`, `getBySlug`)
- Handlers: camelCase starting with `handle` (e.g., `handleSubmit`, `handleEdit`)

**Variables:**
- State variables: camelCase (e.g., `formData`, `isLoading`)
- Boolean flags: `is*` or `has*` prefix (e.g., `isLoading`, `published`)
- Type names: PascalCase (e.g., `Post`, `Lead`)

**Types:**
- Table types: PascalCase (inferred from schema, e.g., `Post`, `Lead`)
- Database IDs: `Id<"tableName">` (Convex convention)

## Where to Add New Code

**New Feature (Page + Form + Backend):**
- Create page: `src/app/[feature]/page.tsx`
- Create Convex mutation in: `convex/[feature].ts`
- Add schema to: `convex/schema.ts` (if new table needed)
- Add tests: `src/__tests__/[feature]-page.test.tsx`, `src/__tests__/[feature]-actions.test.ts`

**New Component/Module:**
- Shared component: `src/components/[ComponentName].tsx`
- UI components: `src/components/ui/[component-name].tsx`
- Feature-specific: `src/app/[feature]/[ComponentName].tsx` (optional, not co-located with pages)

**Utilities:**
- Shared helpers: `src/lib/[utility].ts`
- Tailwind utils: `src/lib/utils.ts` (already exists, add to `cn` function if needed)

**Tests:**
- Unit/integration tests: `src/__tests__/[module].test.ts` or `.test.tsx`
- Mocks for new libraries: `src/__mocks__/[library-path]/[module].ts`

**Styling:**
- Global styles: `src/app/globals.css`
- Component styles: Tailwind utilities inline in JSX
- Custom components: `src/components/ui/[component].tsx` with Tailwind classes

## Special Directories

**`convex/_generated/`:**
- Purpose: Auto-generated Convex type definitions
- Generated: Yes (by Convex CLI)
- Committed: Yes (checked into git)
- Action: Never edit manually; regenerated on schema changes

**`src/__mocks__/`:**
- Purpose: Jest mock implementations
- Generated: No (manually created)
- Committed: Yes (checked into git)
- Action: Update when mocking new external libraries

**`src/__tests__/`:**
- Purpose: Test files (Jest looks for `*.test.ts(x)`)
- Generated: No (manually created)
- Committed: Yes (checked into git)
- Action: Add tests for new features

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (by Next.js build)
- Committed: No (in `.gitignore`)
- Action: Ignore, never edit

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (by npm install)
- Committed: No (in `.gitignore`)
- Action: Ignore, run `npm install` to restore

**`.planning/`:**
- Purpose: GSD planning documents
- Generated: Yes (by GSD tools)
- Committed: Yes (checked into git)
- Action: Ignore, auto-updated by orchestrator

---

*Structure analysis: 2026-03-12*
