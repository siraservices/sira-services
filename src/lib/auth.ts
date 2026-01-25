import { getSignInUrl, getSignUpUrl, signOut as workosSignOut, withAuth } from "@workos-inc/authkit-nextjs";

export async function getCurrentUser() {
  const { user } = await withAuth();
  return user;
}

export async function getAuthUrls() {
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();
  return { signInUrl, signUpUrl };
}

export async function signOut() {
  await workosSignOut();
}
