import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Override via NEXT_PUBLIC_BASE_PATH env var
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};

export default nextConfig;
