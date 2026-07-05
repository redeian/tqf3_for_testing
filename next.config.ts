import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" disabled for V1 — enables `next start` for E2E tests
  // Re-enable when configuring Docker standalone deployment
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
