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
    // Plafond de transport du body cloné (next/server/body-streams.js :
    // DEFAULT_BODY_CLONE_SIZE_LIMIT = 10 Mo sans config — tronquait les imports
    // > 10 Mo, cf. cycle import-size-limit). 64 Mo = plafond applicatif
    // MAX_IMPORT_BYTES (50 Mo) + en-têtes multipart + marge. Nombre attendu.
    // NB : l'ancienne clé middlewareClientMaxBodySize est dépréciée.
    proxyClientMaxBodySize: 64 * 1024 * 1024,
  },
  // Tauri: image optimization not needed for desktop builds
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
