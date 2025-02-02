import type { NextConfig } from "next";
import type { webpack } from 'next/dist/compiled/webpack/webpack'

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isDev ? '' : process.env.NEXT_PUBLIC_BASE_PATH,
  transpilePackages: ["echarts", "zrender"],

  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: webpack.RuleSetUseItem) => rule.test?.test?.(".svg"));

    config.module.rules = [
      ...config.module.rules,
      {
        ...fileLoaderRule,
        test: /icon.svg$/,
      },
      {
        test: /\.svg$/,
        exclude: /icon.svg$/,
        issuer: /\.[jt]sx?$/,
        use: ["@svgr/webpack"],
      },
    ];

    return config;
  },
};

export default nextConfig;
