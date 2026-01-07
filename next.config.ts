import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 忽略 ESLint 检查（不检查语法格式）
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 忽略 TypeScript 错误（不检查类型定义）
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;