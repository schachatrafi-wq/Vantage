import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'agent-twitter-client',
    'rss-parser',
    '@anthropic-ai/sdk',
  ],
};

export default nextConfig;
