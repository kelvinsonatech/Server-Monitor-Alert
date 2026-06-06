import type { NextConfig } from "next";

const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath,
  transpilePackages: ["@workspace/db"],
  serverExternalPackages: ["pg", "undici"],
};

export default nextConfig;
