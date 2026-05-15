import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      // Server Actions need 6mb because landing page logo uploads allow 5mb plus multipart overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
