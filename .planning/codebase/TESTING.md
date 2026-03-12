# Testing Patterns

**Analysis Date:** 2026-03-12

## Test Framework

**Runner:**
- Jest 29.7.0
- Config: `jest.config.js` at project root
- TypeScript support via ts-jest 29.4.6

**Assertion Library:**
- Jest matchers (built-in)
- @testing-library/jest-dom 6.9.1 for DOM matchers

**Run Commands:**
```bash
npm run test              # Run all tests with verbose output
```

Jest is configured to run with `--verbose` flag by default, showing individual test results.

## Test File Organization

**Location:**
- Co-located in `src/__tests__/` directory (separate from source but within src/)
- Not co-located with source files (centralized test directory)

**Naming:**
- Pattern: `[feature].test.ts` or `[feature].test.tsx`
- Examples: `auth-actions.test.ts`, `signin-page.test.tsx`, `navigation-auth.test.tsx`, `middleware.test.ts`

**Structure:**
```
src/__tests__/
├── auth-actions.test.ts          # Server action tests
├── signin-page.test.tsx          # Component tests
├── signup-page.test.tsx          # Component tests
├── navigation-auth.test.tsx      # Component behavior tests
└── middleware.test.ts            # Middleware configuration tests
```

## Test Structure

**Suite Organization:**
```typescript
// File-level JSDoc explaining test purpose
/**
 * Tests for authentication server actions
 */

// Imports at top
import { getSignInUrlAction } from "@/app/actions/auth";
import { getSignInUrl } from "@workos-inc/authkit-nextjs";

// Setup: Type cast mocked functions
const mockedGetSignInUrl = getSignInUrl as jest.MockedFunction<
  typeof getSignInUrl
>;

// Main describe block
describe("Auth Server Actions", () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Grouped by feature/function
  describe("getSignInUrlAction", () => {
    it("returns a sign-in URL without options", async () => {
      // Setup
      mockedGetSignInUrl.mockResolvedValue("https://auth.workos.com/signin?client_id=test");

      // Execute
      const url = await getSignInUrlAction();

      // Assert
      expect(mockedGetSignInUrl).toHaveBeenCalledWith({ loginHint: undefined });
      expect(url).toBe("https://auth.workos.com/signin?client_id=test");
    });
  });
});
```

**Patterns:**
- Setup pattern: `beforeEach(() => { jest.clearAllMocks(); })` clears mocks between tests
- Nested `describe()` blocks group related tests by function/feature
- Each test uses AAA pattern: Arrange (setup), Act (execute), Assert (verify)
- Teardown: `jest.clearAllMocks()` in beforeEach is sufficient for cleanup

## Mocking

**Framework:** Jest's built-in mocking (`jest.fn()`, `jest.mock()`)

**Patterns:**

Import-level mocking for external modules:
```typescript
const mockGetSignInUrlAction = jest.fn();
jest.mock("@/app/actions/auth", () => ({
  getSignInUrlAction: (...args: unknown[]) => mockGetSignInUrlAction(...args),
}));
```

Mock type casting for type safety:
```typescript
const mockedGetSignInUrl = getSignInUrl as jest.MockedFunction<
  typeof getSignInUrl
>;
// Use: mockedGetSignInUrl.mockResolvedValue(...)
```

Manual mock modules at `src/__mocks__/@workos-inc/`:
- `src/__mocks__/@workos-inc/authkit-nextjs.ts` - Mocks WorkOS auth SDK
- `src/__mocks__/@workos-inc/authkit-nextjs/components.ts` - Mocks WorkOS components
- Automatically mapped in `jest.config.js` via `moduleNameMapper`

Mock hook libraries:
```typescript
jest.mock("lucide-react", () => ({
  Menu: () => <span data-testid="menu-icon">Menu</span>,
  X: () => <span data-testid="x-icon">X</span>,
  LogIn: () => <span data-testid="login-icon">LogIn</span>,
  // ... other icons
}));
```

Mock Next.js modules:
```typescript
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));
```

**What to Mock:**
- External SDKs (WorkOS AuthKit)
- Next.js modules (Link, usePathname)
- Third-party hooks (useAuth)
- Icon libraries (lucide-react)

**What NOT to Mock:**
- React internals (hooks like useState, useEffect)
- React components from @testing-library/react
- Custom utility functions (cn())
- Application code being tested (unless testing in isolation)

## Fixtures and Factories

**Test Data:**
- Inline mock values in test cases
- Example from `signin-page.test.tsx`:
```typescript
mockGetSignInUrlAction.mockResolvedValue(
  "https://auth.workos.com/signin?client_id=test"
);
```

- User object example from `navigation-auth.test.tsx`:
```typescript
mockUseAuth.mockReturnValue({
  user: {
    firstName: "John",
    email: "john@example.com",
  },
  loading: false,
  signOut: mockSignOut,
});
```

- No dedicated factory functions or fixture files detected
- Test data created inline per test case

**Location:**
- Test data created inline within test cases
- No separate fixtures directory

## Coverage

**Requirements:** None enforced (coverage target not configured)

**View Coverage:**
```bash
npm run test -- --coverage
```

No coverage thresholds are configured in jest.config.js.

## Test Types

**Unit Tests:**
- Scope: Individual functions and server actions
- Approach: Test function inputs and outputs directly
- Example: `auth-actions.test.ts` tests server action functions with mocked external SDK
- File: `src/__tests__/auth-actions.test.ts` (lines 14-114)

**Integration Tests:**
- Scope: Component behavior with mocked dependencies
- Approach: Render component and test user interactions via @testing-library/react
- Example: `signin-page.test.tsx` renders SignInPage and tests form submission flow
- Example: `navigation-auth.test.tsx` tests Navigation component with mocked auth state
- Files: `src/__tests__/signin-page.test.tsx`, `src/__tests__/signup-page.test.tsx`, `src/__tests__/navigation-auth.test.tsx`

**E2E Tests:**
- Framework: Not used
- No end-to-end test setup detected (no Cypress, Playwright, etc.)

## Common Patterns

**Async Testing:**
```typescript
it("submits email SSO form and redirects", async () => {
  const user = userEvent.setup();
  render(<SignInPage />);

  const emailInput = screen.getByLabelText("Email");
  await user.type(emailInput, "user@example.com");

  const ssoButton = screen.getByText("Continue with SSO");
  await user.click(ssoButton);

  // Use waitFor for async operations
  await waitFor(() => {
    expect(mockGetSignInUrlAction).toHaveBeenCalledWith({
      loginHint: "user@example.com",
    });
  });
});
```

Pattern: Use `async/await`, `userEvent.setup()`, `waitFor()` for async assertions.

**Error Testing:**
```typescript
it("handles sign-in error gracefully", async () => {
  const consoleError = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});
  mockGetSignInUrlAction.mockRejectedValue(new Error("Auth failed"));

  const user = userEvent.setup();
  render(<SignInPage />);

  const googleButton = screen.getByText("Continue with Google");
  await user.click(googleButton);

  await waitFor(() => {
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to get sign in URL:",
      expect.any(Error)
    );
  });

  // Verify recovery
  await waitFor(() => {
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });

  consoleError.mockRestore();
});
```

Pattern: Mock rejected promises, spy on console methods, verify error handling and recovery.

**Loading State Testing:**
```typescript
it("shows loading state while submitting SSO", async () => {
  // Make the action hang to observe loading state
  mockGetSignInUrlAction.mockImplementation(
    () => new Promise(() => {}) // never resolves
  );

  const user = userEvent.setup();
  render(<SignInPage />);

  // Interact with component
  const emailInput = screen.getByLabelText("Email");
  await user.type(emailInput, "user@example.com");
  await user.click(screen.getByText("Continue with SSO"));

  // Verify loading UI appears
  await waitFor(() => {
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

Pattern: Mock async functions with infinite promises to test loading states.

## Testing Utilities

**@testing-library/react:**
- `render()` - Mount React component in test environment
- `screen` - Query rendered elements
- `fireEvent`, `waitFor()` - Handle async operations
- `userEvent.setup()` - Realistic user interaction simulation

**Jest utilities:**
- `jest.mock()` - Mock modules at import time
- `jest.fn()` - Create mock functions
- `jest.spyOn()` - Spy on existing implementations
- `jest.clearAllMocks()` - Reset all mocks
- `mockResolvedValue()` - Mock async success
- `mockRejectedValue()` - Mock async error
- `mockReturnValue()` - Mock sync return
- `mockImplementation()` - Custom mock behavior

**Setup Files:**
- `jest.setup.ts` - Imports `@testing-library/jest-dom` for extended matchers
- Applied globally to all tests via `setupFilesAfterEnv` in jest.config.js

## Environment Configuration

**Test Environment:**
- jsdom (browser-like environment for DOM testing)
- Set in jest.config.js: `testEnvironment: "jsdom"`

**Module Mapping:**
```javascript
moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
  "^@workos-inc/authkit-nextjs$": "<rootDir>/src/__mocks__/@workos-inc/authkit-nextjs.ts",
  "^@workos-inc/authkit-nextjs/components$": "<rootDir>/src/__mocks__/@workos-inc/authkit-nextjs/components.ts",
}
```

Maps path aliases and external modules to mock implementations.

**TypeScript Configuration:**
- `tsconfig.jest.json` - Extends base tsconfig for Jest tests
- Overrides: `jsx: "react-jsx"`, `module: "commonjs"`, `moduleResolution: "node"`

---

*Testing analysis: 2026-03-12*
