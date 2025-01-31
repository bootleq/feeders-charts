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

- 公立動物收容所統計（97 ~ 113 年）
  https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3

  「動物保護資訊網」每年公布的統計數字，多為 Excel 檔案

- 戶籍登記人口數(人)
  https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx

  需手動下載：

  1. 中華民國統計資訊網 - 縣市重要統計指標查詢系統
  2. 改制後 - 人口概況 - 戶籍登記人口數(人) - 完成挑選
  3. 「指標」與「期間」全選，「縣市」除「台灣地區」外全選 - 繼續
  4. 下載 CSV
  5. 存檔到 `HUMAN_POPULATION_CSV_PATH`，預設位置為 `scripts/build/human_population.csv`

  註：人口資料和動保資訊網提供的數字略有落差

- 112年度全國家犬貓數量調查結果統計表
  https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000817?parentID=Tab0000143

  2023 年的「家犬」資料還未加入「年度犬貓統計表」，故手動將數字以 CSV 格式放在 `data` 目錄中

  `data/populations_112.csv`

- 113年各縣市遊蕩犬估計數調查結果
  https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000864?parentID=Tab0000143

  2024 年的「遊蕩犬」資料還未加入「年度犬貓統計表」，故手動將數字以 CSV 格式放在 `data` 目錄中

  `data/populations_113.csv`


以下有機會處理，但最終未使用：

- 全國公立動物收容所收容處理情形統計表 (106 ~ 113 年)
  https://data.gov.tw/dataset/41236

  和動保資訊網提供的數字對不起來，年度也不齊全

- 全國公立動物收容所收容處理情形統計表(細項)
  https://data.gov.tw/dataset/73396

  年度不齊全



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

