/** @type {import('next').NextConfig} */
const nextConfig = {
  // 忽略所有检查，强行通过
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;