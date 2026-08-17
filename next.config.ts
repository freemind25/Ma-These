import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Tauri: image optimization not needed for desktop builds
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
