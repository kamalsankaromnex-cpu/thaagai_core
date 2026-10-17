import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      // Legacy, alternate spelling, and alias redirects
      {
        source: "/chudidhar",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/churidar",
        destination: "/category/churidars",
        permanent: true,
      },
      {
        source: "/churidars",
        destination: "/category/churidars",
        permanent: true,
      },
      {
        source: "/products",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/categories",
        destination: "/shop",
        permanent: true,
      },
      {
        source: "/kurtis",
        destination: "/category/kurtis",
        permanent: true,
      },
      {
        source: "/sarees",
        destination: "/category/sarees",
        permanent: true,
      },
      {
        source: "/dupattas",
        destination: "/category/dupattas",
        permanent: true,
      },
      {
        source: "/sets",
        destination: "/category/sets",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Product feeds
      { source: "/google-shopping.xml", destination: "/api/feeds/google-shopping" },
      { source: "/feeds/google-shopping.xml", destination: "/api/feeds/google-shopping" },
      // API rewrites
      { source: "/auth/:path*", destination: "/api/auth/:path*" },
      { source: "/customers/:path*", destination: "/api/customers/:path*" },
      { source: "/postal-codes/:path*", destination: "/api/postal-codes/:path*" },
      { source: "/orders", destination: "/api/orders" },
      { source: "/orders/:path*", destination: "/api/orders/:path*" },
    ];
  },
};

export default nextConfig;
