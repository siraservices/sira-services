import { authkitMiddleware } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";
import type { NextFetchEvent } from "next/server";
import { AUTH_ENABLED } from "@/lib/auth-config";

// NOTE: this file must live in `src/` because the app uses `src/app`.
// A root-level middleware.ts is silently ignored by Next.js in that setup,
// which left AuthKit's `withAuth` uncovered and made every page load fire a
// 500 from the auth server action.

// Admin routes require authentication — unauthenticated requests are redirected
// to the WorkOS auth flow.
const adminMiddleware = authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [],
  },
});

const publicMiddleware = authkitMiddleware({
  signUpPaths: ["/signup"],
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");

  // No WorkOS credentials in this environment: serve public pages untouched
  // and keep the admin area closed.
  if (!AUTH_ENABLED) {
    return isAdmin
      ? new NextResponse("Admin sign-in is not configured for this environment.", {
          status: 503,
        })
      : NextResponse.next();
  }

  try {
    return await (isAdmin ? adminMiddleware : publicMiddleware)(req, event);
  } catch (error) {
    // Never let an auth misconfiguration take the public marketing pages down.
    console.error("AuthKit middleware failed", error);
    if (isAdmin) {
      return new NextResponse("Authentication is temporarily unavailable.", {
        status: 503,
      });
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
