import { withAuth, getSignInUrl } from "@workos-inc/authkit-nextjs";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const { user } = await withAuth();
  const signInUrl = await getSignInUrl();

  return (
    <HeaderClient
      user={user ? { email: user.email || "" } : null}
      signInUrl={signInUrl}
    />
  );
}
