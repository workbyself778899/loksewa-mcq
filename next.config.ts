import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Skip static generation for admin routes
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
