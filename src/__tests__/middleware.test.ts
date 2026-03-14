/**
 * Tests for authentication middleware configuration
 */
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

// Import middleware to trigger its side-effect (calling authkitMiddleware)
import "../../middleware";

describe("Auth Middleware", () => {
  it("configures authkitMiddleware with correct signUpPaths", () => {
    expect(authkitMiddleware).toHaveBeenCalledWith({
      signUpPaths: ["/signup"],
    });
  });

  it("has correct route matcher configuration", () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { config } = require("../../middleware");

    expect(config.matcher).toBeDefined();
    expect(config.matcher).toHaveLength(1);
    const matcherPattern = config.matcher[0];
    expect(matcherPattern).toContain("_next/static");
    expect(matcherPattern).toContain("_next/image");
    expect(matcherPattern).toContain("favicon.ico");
  });
});
