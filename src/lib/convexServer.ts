import { getFunctionName } from "convex/server";
import type { FunctionReference, FunctionReturnType, OptionalRestArgs } from "convex/server";

const CONVEX_URL = (process.env.NEXT_PUBLIC_CONVEX_URL ?? "").replace(/\/$/, "");

/**
 * Server-side Convex query helper for Server Components, `generateMetadata`,
 * and `sitemap.ts` where the React `useQuery` hook is unavailable.
 *
 * Uses a direct HTTP fetch to the Convex HTTP API rather than ConvexHttpClient
 * so it is not subject to client-bundle initialisation ordering issues.
 */
async function convexQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: OptionalRestArgs<Query>
): Promise<FunctionReturnType<Query>> {
  const path = getFunctionName(query);
  const queryArgs = args[0] ?? {};

  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args: queryArgs, format: "json" }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Convex HTTP error ${res.status} for ${path}`);
  }

  const data = (await res.json()) as
    | { status: "success"; value: FunctionReturnType<Query> }
    | { status: "error"; errorMessage: string };

  if (data.status === "error") {
    throw new Error(`Convex query error for ${path}: ${data.errorMessage}`);
  }

  return data.value;
}

export const convexServer = { query: convexQuery };
