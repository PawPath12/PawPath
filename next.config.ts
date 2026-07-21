import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow medical-record uploads (a few files) through the Vetspire booking flow.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
