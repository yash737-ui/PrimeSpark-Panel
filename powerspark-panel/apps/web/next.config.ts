import type { NextConfig } from "next";

/**
 * PowerSpark Panel - Web App
 * Base Next.js configuration. Kept intentionally minimal at the
 * foundation stage; feature-specific config (rewrites, headers,
 * image domains, etc.) will be added alongside the features that need them.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@powerspark/ui", "@powerspark/types"],
};

export default nextConfig;
