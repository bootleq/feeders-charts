# Charts



## Getting Started

Prepare data source:

- `pnpm data:download`: Download raw data from data sources
- `pnpm data:reduce`: Transform downloaded data
- `pnpm data:dev_serve`: Copy transformed data to `public/` folder for development convenience.


Make data source available for development:
Copy `.env.sample` to `.env` and set: `NEXT_PUBLIC_RESOURCE_URL=http://localhost:3000/dev.combined.json`

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Data Sources

- 年度犬貓統計表
  https://data.gov.tw/dataset/41771

- 全國公立動物收容所收容處理情形統計表(細項)
  https://data.gov.tw/dataset/73396


## Build

We do static export to `out` directory.

To preview, serve it with web server like nginx, follow `basePath` in `.env`, e.g,:
`NEXT_PUBLIC_BASE_PATH=/feeders-charts`

Example nginx config:

```nginx
location /feeders-charts {
  alias /path/to/feeders-charts/out;
  index index.html;
  try_files $uri $uri.html $uri/ =404;
}
```

