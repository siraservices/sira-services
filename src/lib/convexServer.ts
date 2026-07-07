import { ConvexHttpClient } from "convex/browser";

/**
 * Server-side Convex client for use in Server Components, `generateMetadata`,
 * and `sitemap.ts`/`robots.ts` where the React `useQuery` hook is unavailable.
 */
export const convexServer = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
);
