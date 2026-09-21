import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The Turbopack build cache twice served a previous build's stylesheet
    // alongside new HTML (locally and on Vercel): new markup shipped
    // without its CSS. The build is fast enough not to need the cache.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
