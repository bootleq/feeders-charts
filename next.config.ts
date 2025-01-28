import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  transpilePackages: ["echarts", "zrender"],
};

export default nextConfig;
