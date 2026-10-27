/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Ship the lead-magnet zip with the serverless function that serves it.
    outputFileTracingIncludes: {
      "/api/clips/download": ["./downloads/**"],
    },
  },
};

export default nextConfig;
