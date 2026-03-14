/**
 * Tests for authentication server actions
 */
import { getSignInUrlAction, getSignUpUrlAction } from "@/app/actions/auth";
import { getSignInUrl, getSignUpUrl } from "@workos-inc/authkit-nextjs";

const mockedGetSignInUrl = getSignInUrl as jest.MockedFunction<
  typeof getSignInUrl
>;
const mockedGetSignUpUrl = getSignUpUrl as jest.MockedFunction<
  typeof getSignUpUrl
>;

describe("Auth Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSignInUrlAction", () => {
    it("returns a sign-in URL without options", async () => {
      mockedGetSignInUrl.mockResolvedValue(
        "https://auth.workos.com/signin?client_id=test"
      );

      const url = await getSignInUrlAction();

      expect(mockedGetSignInUrl).toHaveBeenCalledWith({ loginHint: undefined });
      expect(url).toBe("https://auth.workos.com/signin?client_id=test");
    });

    it("passes loginHint to WorkOS getSignInUrl", async () => {
      mockedGetSignInUrl.mockResolvedValue(
        "https://auth.workos.com/signin?client_id=test"
      );

      await getSignInUrlAction({ loginHint: "user@example.com" });

      expect(mockedGetSignInUrl).toHaveBeenCalledWith({
        loginHint: "user@example.com",
      });
    });

    it("appends provider query parameter when specified", async () => {
      mockedGetSignInUrl.mockResolvedValue(
        "https://auth.workos.com/signin?client_id=test"
      );

      const url = await getSignInUrlAction({ provider: "GoogleOAuth" });

      expect(url).toBe(
        "https://auth.workos.com/signin?client_id=test&provider=GoogleOAuth"
      );
    });

    it("returns base URL when no provider is specified", async () => {
      const baseUrl = "https://auth.workos.com/signin?client_id=test";
      mockedGetSignInUrl.mockResolvedValue(baseUrl);

      const url = await getSignInUrlAction({ loginHint: "user@example.com" });

      expect(url).toBe(baseUrl);
    });

    it("handles both loginHint and provider together", async () => {
      mockedGetSignInUrl.mockResolvedValue(
        "https://auth.workos.com/signin?client_id=test"
      );

      const url = await getSignInUrlAction({
        loginHint: "user@example.com",
        provider: "GoogleOAuth",
      });

      expect(mockedGetSignInUrl).toHaveBeenCalledWith({
        loginHint: "user@example.com",
      });
      expect(url).toContain("provider=GoogleOAuth");
    });
  });

  describe("getSignUpUrlAction", () => {
    it("returns a sign-up URL without options", async () => {
      mockedGetSignUpUrl.mockResolvedValue(
        "https://auth.workos.com/signup?client_id=test"
      );

      const url = await getSignUpUrlAction();

      expect(mockedGetSignUpUrl).toHaveBeenCalled();
      expect(url).toBe("https://auth.workos.com/signup?client_id=test");
    });

    it("appends provider query parameter when specified", async () => {
      mockedGetSignUpUrl.mockResolvedValue(
        "https://auth.workos.com/signup?client_id=test"
      );

      const url = await getSignUpUrlAction({ provider: "GoogleOAuth" });

      expect(url).toBe(
        "https://auth.workos.com/signup?client_id=test&provider=GoogleOAuth"
      );
    });

    it("returns base URL when no provider is specified", async () => {
      const baseUrl = "https://auth.workos.com/signup?client_id=test";
      mockedGetSignUpUrl.mockResolvedValue(baseUrl);

      const url = await getSignUpUrlAction({});

      expect(url).toBe(baseUrl);
    });
  });
});
