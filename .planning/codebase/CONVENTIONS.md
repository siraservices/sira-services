# Coding Conventions

**Analysis Date:** 2026-03-12

## Naming Patterns

**Files:**
- Component files: PascalCase for exported components (e.g., `Navigation.tsx`, `ConvexClientProvider.tsx`, `LiquidButton.tsx`)
- Page files: lowercase with hyphens (e.g., `page.tsx` in route directories)
- Server action files: lowercase with hyphenated names (e.g., `auth.ts` in `src/app/actions/`)
- Utility files: lowercase (e.g., `utils.ts`)
- Schema files: lowercase (e.g., `schema.ts` in `convex/`)

**Functions:**
- Exported functions and components: PascalCase for components, camelCase for utilities
- Server actions: camelCase with "Action" suffix (e.g., `getSignInUrlAction`, `getSignUpUrlAction`)
- Event handlers: camelCase with "handle" prefix (e.g., `handleSignOut`, `handleScroll`)
- Helper functions: camelCase (e.g., `cn()` for className utility)

**Variables:**
- State variables: camelCase (e.g., `mobileMenuOpen`, `scrolled`, `isPressed`)
- Constants: camelCase, declared as const at module level (e.g., `navLinks`)
- React hooks: camelCase with "use" prefix (e.g., `useState`, `useEffect`, `useAuth`)
- Event parameters: camelCase (e.g., `pathname`, `user`)

**Types:**
- Interface/Type names: PascalCase (e.g., `ButtonProps`, `MetalButtonProps`, `MetalButtonVariants`)
- Type definitions: Use `interface` for object shapes, `type` for unions/aliases
- Conditional types: PascalCase (e.g., `ColorVariant`)

## Code Style

**Formatting:**
- No explicit formatter configured (ESLint config not present)
- TypeScript strict mode enabled in `tsconfig.json`
- JSX preserved (not transformed to React.createElement)
- Consistent use of template literals for dynamic strings
- Indentation: 2 spaces (inferred from source files)

**Linting:**
- ESLint enabled via Next.js (eslint v8)
- Next.js ESLint configuration used (eslint-config-next 14.2.0)
- Explicit disable comment used when needed: `// eslint-disable-next-line @typescript-eslint/no-var-requires`

## Import Organization

**Order:**
1. React imports (e.g., `import React from "react"`, `import { useState } from "react"`)
2. Next.js imports (e.g., `import Link from "next/link"`, `import type { Metadata }`)
3. Third-party library imports (e.g., `import { Menu, X } from "lucide-react"`)
4. Internal utility imports (e.g., `import { cn } from "@/lib/utils"`)
5. Internal component imports (e.g., `import { Navigation } from "@/components/Navigation"`)
6. Side-effect imports (e.g., `import "@testing-library/jest-dom"`)

**Path Aliases:**
- `@/*` maps to `./src/*` - use this for all relative imports within src/
- Avoid relative paths (../) in favor of path aliases

## Error Handling

**Patterns:**
- Server actions use try-catch internally (not shown in `auth.ts` examples, but implied by async nature)
- Components use console.error for client-side error logging
- Example from tests: `mockGetSignInUrlAction.mockRejectedValue(new Error("Auth failed"))` shows error propagation pattern
- Async operations check for errors via `.catch()` or `try-catch` in components

## Logging

**Framework:** Console methods (console.error, console.log) for client-side; Server actions handle errors internally

**Patterns:**
- Error logging: `console.error("Failed to get sign in URL:", error)`
- No dedicated logging framework detected
- Error messages are prefixed with context (e.g., "Failed to get sign in URL:")

## Comments

**When to Comment:**
- JSDoc-style comments for test suites: `/** * Tests for [feature] */` at file start
- Inline comments explain complex logic or non-obvious behavior
- Comments explain the "why" rather than "what"
- Example: `// If provider is specified, add it as a query parameter` explains intent

**JSDoc/TSDoc:**
- Used sparingly
- Test files include file-level JSDoc comments explaining the test suite purpose
- Function parameter documentation not used (relies on TypeScript types)

## Function Design

**Size:**
- Most functions are concise and focused
- Server actions are simple wrappers around external SDK calls (5-20 lines)
- Component functions typically under 80 lines (excluding inline JSX styling)

**Parameters:**
- Use object destructuring for multiple parameters: `{ children, ...props }`
- Event handlers use arrow functions with typed parameters
- Optional parameters defined as object properties: `options?: { loginHint?: string; provider?: string }`

**Return Values:**
- Explicit return type annotations on functions and components
- Server actions return Promise<string> for URLs
- React components return JSX.Element implicitly
- Async functions explicitly typed: `async function getSignInUrlAction()`

## Module Design

**Exports:**
- Named exports preferred (e.g., `export function Navigation()`, `export { Button, LiquidButton, MetalButton }`)
- Default exports used for pages (Next.js convention): `export default function RootLayout()`
- Component exports with full names (PascalCase)

**Barrel Files:**
- Not used extensively
- Each component file exports its own symbols
- UI components grouped in `/src/components/ui/` directory

## TypeScript Strictness

**Strict Mode:**
- Enabled in `tsconfig.json` with `"strict": true`
- All types explicitly specified, no implicit `any`
- React types imported with `type` keyword: `import type { Metadata } from "next"`
- Union types used for discriminated unions: `variant?: ColorVariant` with explicit type definition

**Type Safety:**
- Props interfaces defined inline or as standalone types
- Convex schema uses typed value definitions: `v.string()`, `v.optional()`, `v.array()`
- React ForwardRef properly typed: `React.forwardRef<HTMLButtonElement, ButtonProps>`

## React Patterns

**Functional Components:**
- All components are functional (no class components)
- "use client" directive for client components: `"use client";` at top of file
- "use server" directive for server actions: `"use server";` at top of file

**Hooks:**
- `useState` for local state management
- `useEffect` for side effects with proper cleanup
- Custom hooks from external libraries: `useAuth()` from WorkOS
- Hook dependencies specified explicitly: `useEffect(() => {...}, [])`

**Styling:**
- Tailwind CSS utility classes (primary tool)
- Class variance authority (CVA) for component variants: `cva()` function
- clsx and tailwind-merge for conditional classes: `cn()` utility
- Inline style objects for dynamic calculations: `style={{ transform: isPressed ? "scale(0.97)" : "scale(1)" }}`

---

*Convention analysis: 2026-03-12*
