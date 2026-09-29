/**
 * WorkOS AuthKit is only used for the /admin dashboard. When its server-side
 * credentials aren't configured for an environment (production currently
 * has none), the public site runs without AuthKit instead of firing a failing
 * auth server action on every page load.
 */
export const AUTH_ENABLED = Boolean(
  process.env.WORKOS_CLIENT_ID &&
    process.env.WORKOS_API_KEY &&
    process.env.WORKOS_COOKIE_PASSWORD,
);
