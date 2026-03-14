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
};
