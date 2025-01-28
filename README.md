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


## Build

Fetch data from [年度犬貓統計表](https://data.gov.tw/dataset/41771)

```bash
pnpm fetch:country
```


