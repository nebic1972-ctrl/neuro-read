import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Hataları görmezden gel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Hataları görmezden gel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;