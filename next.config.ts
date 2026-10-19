import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained server (used by the Dockerfile)
  output: "standalone",
  images: {
    domains: ['cdn.sanity.io']
  }
};

export default nextConfig;
