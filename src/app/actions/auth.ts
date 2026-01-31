"use server";

import { getSignInUrl, getSignUpUrl } from "@workos-inc/authkit-nextjs";

export async function getSignInUrlAction(options?: {
  loginHint?: string;
  provider?: string;
}) {
  const url = await getSignInUrl({
    loginHint: options?.loginHint,
  });

  // If provider is specified, add it as a query parameter
  if (options?.provider) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("provider", options.provider);
    return urlObj.toString();
  }

  return url;
}

export async function getSignUpUrlAction(options?: {
  provider?: string;
}) {
  const url = await getSignUpUrl();

  // If provider is specified, add it as a query parameter
  if (options?.provider) {
    const urlObj = new URL(url);
    urlObj.searchParams.set("provider", options.provider);
    return urlObj.toString();
  }

  return url;
}
