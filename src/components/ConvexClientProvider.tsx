"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useCallback } from "react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Bridge between WorkOS AuthKit and Convex's auth interface.
// Forwards the WorkOS access token (JWT) to every Convex request so that
// ctx.auth.getUserIdentity() works inside Convex functions.
function useWorkOSAuth() {
  const { user, loading } = useAuth();
  const { getAccessToken } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) return null;
      if (forceRefreshToken) {
        // useAccessToken's getAccessToken always returns the freshest token
      }
      return (await getAccessToken()) ?? null;
    },
    [user, getAccessToken]
  );

  return {
    isLoading: loading,
    isAuthenticated: !!user,
    fetchAccessToken,
  };
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useWorkOSAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
