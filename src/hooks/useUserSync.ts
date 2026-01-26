"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useEffect, useRef } from "react";

export function useUserSync() {
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

  return { user, loading };
}
