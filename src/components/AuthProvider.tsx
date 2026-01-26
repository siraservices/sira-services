"use client";

import { AuthKitProvider, useAuth } from "@workos-inc/authkit-nextjs/components";
import { ReactNode, useEffect, useRef } from "react";

function UserSyncWrapper({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    async function syncUser() {
      if (user && !hasSynced.current) {
        hasSynced.current = true;
        try {
          await fetch("/api/user/sync", { method: "POST" });
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
    }

    if (!loading && user) {
      syncUser();
    }
  }, [user, loading]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthKitProvider>
      <UserSyncWrapper>{children}</UserSyncWrapper>
    </AuthKitProvider>
  );
}
