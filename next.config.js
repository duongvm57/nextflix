const createNextIntlPlugin = require('next-intl/plugin');

// Use next-intl plugin
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack as it's now stable
  turbopack: {
    // Optional: Add any specific Turbopack configurations here
  },
  distDir: '.next',
  // Disable ESLint during builds to prevent build failures
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during builds
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Allow cross-origin requests from all domains in development mode
  allowedDevOrigins: ['*'],

  // Additional headers for cross-origin requests
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'phim.nguonc.com',
      },
      {
        protocol: 'https',
        hostname: 'img.phim.nguonc.com',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
