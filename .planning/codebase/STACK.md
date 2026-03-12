# Technology Stack

**Analysis Date:** 2026-03-12

## Languages

**Primary:**
- TypeScript 5 - Full codebase in strict mode
- JavaScript - Configuration files, some utilities

**Secondary:**
- CSS/Tailwind - Styling via Tailwind CSS utility classes

## Runtime

**Environment:**
- Node.js (latest LTS implied, no explicit version pinned)

**Package Manager:**
- npm 10.x (via package-lock.json format)
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Next.js 14.2.26 - App Router-based frontend framework with server components and server actions
- React 18.3.0 - Component library

**Backend/Database:**
- Convex 1.17.0 - Backend-as-a-service with real-time database, schema-first approach

**Testing:**
- Jest 29.7.0 - Test runner and assertion framework
- ts-jest 29.4.6 - TypeScript transpiler for Jest
- Testing Library (React 16.3.2, User Event 14.6.1, Jest DOM 6.9.1) - DOM testing utilities

**Build/Dev:**
- Autoprefixer 10.4.20 - CSS vendor prefixer
- PostCSS 8.4.49 - CSS transformation pipeline
- Tailwind CSS 3.4.15 - Utility-first CSS framework
- npm-run-all 4.1.5 - Concurrent task runner for dev/backend startup

## Key Dependencies

**Critical:**
- @workos-inc/authkit-nextjs 2.13.0 - Authentication and authorization middleware (WorkOS integration)
- convex 1.17.0 - Backend database and serverless functions
- react-hook-form 7.54.0 - Form state management and validation
- lucide-react 0.460.0 - Icon library

**UI/Styling:**
- tailwindcss 3.4.15 - Utility-first CSS
- class-variance-authority 0.7.1 - Component variant management
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Tailwind class merging for overrides
- @radix-ui/react-slot 1.2.4 - Primitive for component slot composition

**Utilities:**
- date-fns 4.1.0 - Date manipulation and formatting
- next 14.2.26 - Web framework and bundler

**Development:**
- typescript 5 - Type checking
- eslint 8 with eslint-config-next 14.2.0 - Code linting
- @types/node 20, @types/react 18, @types/react-dom 18, @types/jest 29.5.14 - Type definitions
- jest-environment-jsdom 29.7.0 - Browser-like DOM environment for tests

## Configuration

**Environment:**
- `.env.local` file (not tracked in git) contains:
  - `NEXT_PUBLIC_CONVEX_URL` - Convex backend deployment URL
  - `WORKOS_API_KEY` - WorkOS authentication API key
  - `WORKOS_CLIENT_ID` - WorkOS application client ID
  - Other environment-specific configs

**Build:**
- `tsconfig.json` - Main TypeScript configuration with path aliases (@/*)
- `tsconfig.jest.json` - Jest-specific TypeScript overrides
- `jest.config.js` - Jest test runner configuration at `<rootDir>/jest.config.js`
- `next.config.mjs` - Next.js build configuration (currently minimal)
- `postcss.config.js` - PostCSS pipeline setup (tailwindcss, autoprefixer)
- `tailwind.config.ts` - Tailwind theme extensions and custom colors

## Platform Requirements

**Development:**
- Node.js (latest stable recommended)
- npm 10+
- Requires Convex account and `npx convex dev` backend process

**Production:**
- Deployed on Vercel (Next.js native) or Node.js compatible platform
- Convex backend hosted at Convex cloud (via `NEXT_PUBLIC_CONVEX_URL`)
- WorkOS account for authentication

---

*Stack analysis: 2026-03-12*
