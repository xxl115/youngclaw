import type { NextConfig } from "next";
import { execSync } from "child_process";
import withPWA from "@ducanh2912/next-pwa";

function getGitSha(): string {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  sw: "sw.js",
  scope: "/",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "online-cache",
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:js|css|html|json|png|jpg|jpeg|svg|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-cache",
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
};

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
      };
      config.externals = config.externals || [];
      config.externals.push({
        'zlib-sync': 'commonjs zlib-sync',
      });
      if (!config.module) config.module = {};
      config.module.noParse = config.module.noParse || [];
      config.module.noParse.push(/zlib-sync/);
      config.resolve.alias = {
        ...config.resolve.alias,
        'zlib-sync': false,
      };
    }
    return config;
  },
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  turbopack: {},
  env: {
    NEXT_PUBLIC_GIT_SHA: getGitSha(),
    NEXT_PUBLIC_WS_PORT: String((Number(process.env.PORT) || 3456) + 1),
  },
  serverExternalPackages: [
    'ws',
    'highlight.js', 'better-sqlite3',
    'discord.js', '@discordjs/ws', '@discordjs/rest',
    'grammy',
    '@slack/bolt', '@slack/web-api', '@slack/socket-mode',
    '@whiskeysockets/baileys',
    'qrcode',
  ],
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
  ],
  async rewrites() {
    const views = 'agents|chatrooms|schedules|memory|tasks|secrets|providers|skills|connectors|webhooks|mcp-servers|knowledge|plugins|usage|runs|logs|settings|projects|activity'
    return [
      {
        source: `/:view(${views})`,
        destination: '/',
      },
      {
        source: `/:view(${views})/:id`,
        destination: '/',
      },
    ]
  },
};

export default withPWA(pwaConfig)(nextConfig);
