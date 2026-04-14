/** @type {import('next').NextConfig} */
const isStaticBuild = process.env.NEXT_STATIC === "true";

const nextConfig = {
  // Enable static export for Capacitor mobile builds.
  // The mobile app calls the production API via NEXT_PUBLIC_API_URL.
  // Web builds use Next.js server-side API routes normally.
  ...(isStaticBuild && { output: "export" }),

  images: {
    // Static export requires unoptimized images (no Next.js server to transform them)
    unoptimized: isStaticBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
