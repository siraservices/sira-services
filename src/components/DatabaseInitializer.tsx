"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";

export function DatabaseInitializer() {
  const seedBlogPosts = useMutation(api.posts.seedBlogPosts);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    seedBlogPosts().catch((error) => {
      // Silently handle errors - seed may have already run
      console.log("Database initialization:", error.message || "completed");
    });
  }, [seedBlogPosts]);

  return null;
}
