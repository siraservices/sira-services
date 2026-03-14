# CLAUDE.md — Sira Services

## Project Overview

Sira Services is a freelancing/consulting website built with **Next.js 14** (App Router) and **Convex** as the backend. It includes a blog, contact form, admin dashboard, and authentication via WorkOS AuthKit.

## Tech Stack

- **Framework:** Next.js 14 (App Router, `src/app/`)
- **Backend/Database:** Convex (`convex/`)
- **Auth:** WorkOS AuthKit (`@workos-inc/authkit-nextjs`)
- **Styling:** Tailwind CSS 3 (primary color: `#2563eb`)
- **Language:** TypeScript (strict mode)
- **Forms:** react-hook-form
- **Icons:** lucide-react

## Project Structure

```
src/
  app/              # Next.js App Router pages
    about/          # About page
    admin/          # Admin dashboard (leads, posts)
    auth/           # Auth route handler
    blog/           # Blog listing + [slug] detail
    contact/        # Contact form
    services/       # Services page
    signin/         # Sign in page
    signup/         # Sign up page
    actions/auth.ts # Server actions for auth
  components/       # Shared components (Navigation, Footer, ConvexClientProvider)
convex/
  schema.ts         # Database schema (posts, leads tables)
  posts.ts          # Post queries/mutations
  leads.ts          # Lead queries/mutations
  seed.ts           # Seed data
middleware.ts       # WorkOS authkit middleware
```

## Key Commands

- `npm run dev` — Start both frontend (Next.js) and backend (Convex) in parallel
- `npm run dev:frontend` — Next.js dev server only
- `npm run dev:backend` — Convex dev server only
- `npm run build` — Production build
- `npm run lint` — ESLint

## Conventions

- **Path alias:** `@/*` maps to `./src/*`
- **Components:** React functional components with TypeScript
- **Styling:** Tailwind utility classes; extended theme in `tailwind.config.ts`
- **Database:** Convex schema-first approach; all tables defined in `convex/schema.ts`
- **Auth:** WorkOS middleware protects routes; `/signup` is a sign-up path
- **Pages:** Each route is a `page.tsx` inside `src/app/<route>/`

## Working with Convex

- Schema lives in `convex/schema.ts` — always update schema first when adding tables
- Queries and mutations go in `convex/<tableName>.ts`
- Use `convex/_generated/` for auto-generated types (do not edit)
- Client provider wraps the app in `src/components/ConvexClientProvider.tsx`

## Important Notes

- Do not edit files in `convex/_generated/`
- Do not commit `.env.local` or any environment variable files
- The project uses `npm-run-all` to run frontend and backend concurrently in dev
