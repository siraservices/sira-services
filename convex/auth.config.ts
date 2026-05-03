// Convex auth configuration for WorkOS AuthKit.
// Allows Convex mutations/queries to verify the caller's identity via the
// WorkOS-issued access token (JWT) that is forwarded by ConvexClientProvider.
export default {
  providers: [
    {
      domain: "https://api.workos.com",
      applicationID: process.env.WORKOS_CLIENT_ID as string,
    },
  ],
};
