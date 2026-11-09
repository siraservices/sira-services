/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Old case-study slugs (still linked from cached pages) -> live slugs.
    return [
      {
        source: "/case-studies/rowhome-magazine",
        destination: "/case-studies/rowhome-magazine-website-rebuild",
        permanent: true,
      },
      {
        source: "/case-studies/horseman-wellness-club",
        destination: "/case-studies/horseman-wellness-club-shopify",
        permanent: true,
      },
    ];
  },
  experimental: {
    // Ship the lead-magnet zip with the serverless function that serves it.
    outputFileTracingIncludes: {
      "/api/clips/download": ["./downloads/**"],
    },
  },
};

export default nextConfig;
