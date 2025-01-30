import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isDev ? '' : process.env.NEXT_PUBLIC_BASE_PATH,
  transpilePackages: ["echarts", "zrender"],
};

export default nextConfig;
