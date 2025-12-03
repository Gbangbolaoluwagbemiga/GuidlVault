import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore optional wallet connector dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      porto: false,
      "porto/internal": false,
      "@metamask/sdk": false,
      "@gemini-wallet/core": false,
      "@coinbase/wallet-sdk": false,
      "pino-pretty": false,
    };

    // Use IgnorePlugin to ignore these modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp:
          /^(porto|@metamask\/sdk|@gemini-wallet\/core|@coinbase\/wallet-sdk|pino-pretty)$/,
      })
    );

    return config;
  },
};

export default nextConfig;
