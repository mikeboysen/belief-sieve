import type { NextConfig } from "next";

/**
 * Venture Proof at app.jtbd.one/venture-proof (gateway keeps the prefix).
 * Platform landing lives on jtbd-gateway at app.jtbd.one/.
 */
const nextConfig: NextConfig = {
  basePath: "/venture-proof",
};

export default nextConfig;
