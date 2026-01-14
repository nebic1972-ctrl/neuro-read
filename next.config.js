/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Hataları görmezden gel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Hataları görmezden gel
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;