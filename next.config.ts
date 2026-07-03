import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  images: {
    // Auto-serve WebP/AVIF instead of the original format — major bandwidth saving
    formats: ["image/avif", "image/webp"],
    // Allow Next.js <Image> to optimise Supabase-hosted product photos
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Longer cache TTL for optimised images (default is 60s)
    minimumCacheTTL: 3600,
  },
  async headers() {
    return [
      {
        // Long-lived cache for all static assets (/_next/static/)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache public files (images, fonts, etc.) for 1 day
        source: "/(.*)\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|mp3|pdf)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
