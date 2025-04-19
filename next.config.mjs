// Loại bỏ next-intl plugin để sử dụng cấu trúc thư mục đơn giản

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

  // Additional headers for cross-origin requests and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000'
          }
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
          }
        ],
      },
      {
        source: '/api/batch/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=600, s-maxage=7200, stale-while-revalidate=86400'
          }
        ],
      },
      {
        // Add cache headers for RSC requests
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'RSC',
            value: '1'
          }
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000'
          }
        ],
      },
      {
        // Add cache headers for RSC requests with _rsc parameter
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: '_rsc'
          }
        ],
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000'
          }
        ],
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'phimimg.com',
      },
      {
        protocol: 'https',
        hostname: 'phimapi.com',
      },
      {
        protocol: 'https',
        hostname: 'img.phimapi.com',
      },
    ],
    // Optimize image quality and formats
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    workerThreads: false,
    // Optimize for static rendering where possible
    serverMinification: true,
    // Optimize RSC payload size
    optimizePackageImports: ['react', 'react-dom', 'next', 'embla-carousel-react'],
    // Optimize RSC
    optimizeServerReact: true,
  },

  // External packages for server components
  serverExternalPackages: [],

  // Thêm cấu hình cho static generation
  staticPageGenerationTimeout: 180,

  // Cấu hình webpack để xử lý các thư viện
  webpack: (config, { isServer }) => {
    // Thêm cấu hình để xử lý các thư viện client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Thêm cấu hình để xử lý các thư viện có vấn đề với Next.js
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
};

export default nextConfig;
