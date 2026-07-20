import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Override via NEXT_PUBLIC_BASE_PATH env var
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  /**
   * app.jtbd.one hosts Venture Proof (this app) at the domain root.
   * Proxy Job Mapper Express under /job-mapper (matches its Next basePath).
   */
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/job-mapper",
          destination: "https://job-map-express.vercel.app/job-mapper",
        },
        {
          source: "/job-mapper/:path*",
          destination: "https://job-map-express.vercel.app/job-mapper/:path*",
        },
      ],
    };
  },

  async redirects() {
    return [
      {
        source: "/jobmapper",
        destination: "/job-mapper",
        permanent: true,
      },
      {
        source: "/jobmapper/:path*",
        destination: "/job-mapper/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
