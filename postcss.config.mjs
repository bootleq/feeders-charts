/** @type {import('postcss-load-config').Config} */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const config = {
  plugins: [
    'tailwindcss',
    [
      'postcss-preset-env',
      {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
        features: {
          'custom-properties': false,
        },
      },
    ],
    [
      'postcss-url',
      {
        url: (asset) => {
          if (asset.url.startsWith('/')) {
            return `${basePath}${asset.url}`;
          }
          return asset.url;
        },
      },
    ],
  ],
};

export default config;
