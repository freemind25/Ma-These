import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Use relative asset prefix so static assets load correctly in Electron (local filesystem)
  assetPrefix: process.env.NODE_ENV === "production" ? "./" : undefined,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["z-ai-web-dev-sdk"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
