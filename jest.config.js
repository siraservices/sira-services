/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@workos-inc/authkit-nextjs$": "<rootDir>/src/__mocks__/@workos-inc/authkit-nextjs.ts",
    "^@workos-inc/authkit-nextjs/components$": "<rootDir>/src/__mocks__/@workos-inc/authkit-nextjs/components.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  // Ignore node_modules (jest default) and non-source artifacts like leftover
  // git worktrees under .claude/, which otherwise get scanned as duplicate,
  // untransformed test suites and fail the run. See SIR-2342.
  testPathIgnorePatterns: ["/node_modules/", "/.claude/", "/.next/"],
  // Keep leftover worktrees out of the haste map so they don't trigger
  // "duplicate manual mock" warnings for the mocks under src/__mocks__.
  modulePathIgnorePatterns: ["/.claude/", "/.next/"],
};
