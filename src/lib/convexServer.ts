import { ConvexHttpClient } from "convex/browser";

/**
 * Server-side Convex client for use in Server Components, `generateMetadata`,
 * and `sitemap.ts`/`robots.ts` where the React `useQuery` hook is unavailable.
 *
 * The custom `fetch` forces `no-store` so Convex reads bypass Next.js's
 * persistent Data Cache. Without this, a query result (e.g. a not-yet-published
 * slug returning null) gets cached across deployments and keeps serving stale
 * metadata even after the underlying content changes.
 */
export const convexServer = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!,
  {
    fetch: (input: RequestInfo | URL, init?: RequestInit) =>
      fetch(input, { ...init, cache: "no-store" }),
  },
);
