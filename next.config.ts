import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow image domains if needed in the future
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
