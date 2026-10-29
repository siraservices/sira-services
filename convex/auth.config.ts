// Convex auth configuration for WorkOS AuthKit.
// Lets Convex verify the WorkOS access token (JWT) forwarded by
// ConvexClientProvider, so ctx.auth.getUserIdentity() works in functions.
// Matches https://docs.convex.dev/auth/authkit (both WorkOS issuers).
const clientId = process.env.WORKOS_CLIENT_ID;

export default {
  providers: [
    {
      type: "customJwt",
      issuer: "https://api.workos.com/",
      algorithm: "RS256",
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
      applicationID: clientId,
    },
    {
      type: "customJwt",
      issuer: `https://api.workos.com/user_management/${clientId}`,
      algorithm: "RS256",
      jwks: `https://api.workos.com/sso/jwks/${clientId}`,
    },
  ],
};
