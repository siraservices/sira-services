import { authkitMiddleware } from "@workos-inc/authkit-nextjs";
import { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

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

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return adminMiddleware(req, event);
  }
  return publicMiddleware(req, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
