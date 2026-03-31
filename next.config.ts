import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'agent-twitter-client',
    'rss-parser',
    '@anthropic-ai/sdk',
    'twitter-api-v2',
  ],
};

export default nextConfig;
