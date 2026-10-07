import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // tesseract.js : paquet externe — son worker (worker_threads) et ses
  // scripts internes ne doivent pas être bundlés par Next
  serverExternalPackages: ["z-ai-web-dev-sdk", "tesseract.js"],
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
