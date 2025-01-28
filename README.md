# Charts



## Getting Started

Prepare data source:

```bash
pnpm fetch:country
```

Then serve output data file with available URL, for example move it to `public/`.

Copy `.env.sample` to `.env` and set:
`NEXT_PUBLIC_SRC_COUNTRY_URL=http://localhost:3000/country.json`

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Data Sources

- 年度犬貓統計表
  https://data.gov.tw/dataset/41771



## Build

Static export to `out` directory.

```bash
pnpm fetch:country
```

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

