import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

// Defense-in-depth: verify session server-side on every admin render, in
// addition to the middleware check.  withAuth({ ensureSignedIn: true })
// redirects to the WorkOS auth flow if the session is absent or expired.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await withAuth({ ensureSignedIn: true });

  if (!user) {
    redirect("/signin");
  }

  return <>{children}</>;
}
