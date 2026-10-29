import { defineConfig } from "vitest/config";

// Convex function tests (convex-test). Jest still runs everything in src/__tests__.
export default defineConfig({
  test: {
    environment: "edge-runtime",
    include: ["convex/**/*.test.ts"],
    server: { deps: { inline: ["convex-test"] } },
  },
});
