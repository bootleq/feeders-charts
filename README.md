# Feeders Charts

Interactive charts in [feeders.pages.dev][] ([repo][feeders repo]).

These pages were built with static export, thus can be deployed elsewhere.



## Getting Started

Prepare data source:

- `pnpm data:download`: Download raw data from simple data sources
- `pnpm data:human_pop`: Fetch and transform human_population data
- `pnpm data:shelter_pet`: Fetch and transform shelter detail data
- `pnpm data:heat_map`: Fetch and transform heat map data
- `pnpm data:manually`: Transform manually collected (built-in in repo) data
- `pnpm data:tainan`: Fetch and transform Tainan population data
- `pnpm data:reduce`: Normalize and combine all processed data (except tainan's)
- `pnpm data:serve`: Copy transformed data to `public/` folder to really use them in app.

Above tasks have hash/time check so will stop processing when considering no change.

Use `DATA_CONTINUE_WHEN_SAME_HASH=1` or append `:force` to each script (e.g., `pnpm data:download:force`) to force continue.

Copy `.env.sample` to `.env.development`, you can set dev-server PORT here.

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



## Data Sources

- 年度犬貓統計表
  https://data.gov.tw/dataset/41771

  其中 90 年的遊蕩犬資料可能為誤植，一般公布的年度是 93 年，故處理時程式會特別將 90 年遊蕩犬移到 93 年，
  以符合「93年全國流浪狗狗數及92年公立動物收容所收容數總表」
  https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000198?parentID=Tab0000004

- 公立動物收容所統計（97 ~ 113 年，只採用到 107 年）
  https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3

  「動物保護資訊網」每年公布的統計數字，多為 Excel 檔案

  因後述「詳表」較完整，所以這邊只採用 97 ~ 107 年的資料

- 動物收容統計表（詳表）（108 ~ 113 年）
  https://www.pet.gov.tw/AnimalApp/ReportAnimalsAcceptFront.aspx

  來自「全國動物收容管理系統」的詳細資料

- 戶籍登記人口數(人)
  https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx

  來自「中華民國統計資訊網 - 縣市重要統計指標查詢系統」的「人口概況 - 戶籍登記人口數(人)」

  取前一年 12 月的數字和今年遊蕩犬數字比較，例如 2024 的每百人遊蕩犬數，是以 2023 年底人口數為準

  註：人口資料和動保資訊網提供的數字略有落差

- 遊蕩犬熱區圖 (2023 ~ 2024)
  https://www.pet.gov.tw/Wandering/HeatMapV1.aspx


以下為人工收集資料，並建檔於 `data` 目錄中：

- 112年度全國家犬貓數量調查結果統計表
  https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000817?parentID=Tab0000143

  2023 年的「家犬」資料還未加入「年度犬貓統計表」，故先手動處理

  `data/populations_112.csv`

- 113年各縣市遊蕩犬估計數調查結果
  https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000864?parentID=Tab0000143

  2024 年的「遊蕩犬」資料還未加入「年度犬貓統計表」，故先手動處理

  `data/populations_113.csv`

- 民國 96 年以前的資料

  「收容所資料」未找到正式來源，故採用台灣之心 HOTAC 網站[整理數字][HOTAC 2020]，其資料來源為「行政院農委會動植物防疫檢疫局-統計年報」

  另有與動社的「從生命到垃圾」網站[整理數字][EAST 2009]比較，其來源為農委會防檢局提供立委資料，兩者差距不大

  其他含 88 年遊蕩犬資料等，CSV 統整資料取自[個人文章][全國遊蕩犬數量整理成圖表]附錄的 [google doc 文件][年度資料 gdoc]

  `data/countrywide.csv`



以下有機會處理，但最終未使用：

- 全國公立動物收容所收容處理情形統計表 (106 ~ 113 年)
  https://data.gov.tw/dataset/41236

  和動保資訊網提供的數字對不起來，年度也不齊全

- 全國公立動物收容所收容處理情形統計表(細項) (106 ~ 113 年)
  https://data.gov.tw/dataset/73396

  比起「全國動物收容管理系統」，資料較不齊全，所以不採用

  部分欄位在前幾年並沒有資料：

  - 出所：回置從 107 開始
  - 可留容最大值從 109 開始



## Tainan

台南市有自己調查各行政區的數量，因不易與全國縣市整合呈現，所以做成獨立的圖表頁面

- 臺南市遊蕩犬調查情形 (108 ~ 112 年)
  https://data.tainan.gov.tw/dataset/straydogs

  採用檔案如：108 年臺南市各行政區執行流浪犬TNVR成果表，我們使用 CSV 格式



## Test

Tests were running on dev server.

- `pnpm test`: Run all tests
- `pnpm test:shots`: Update screenshots



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



# Deployment

This project will be deployed as a sub path under [feeders][feeders repo],
use `pnpm push:out` to push built assets to a intermediate repo (not public available now),
then feeders should manage following tasks.



[feeders.pages.dev]: https://feeders.pages.dev/
[feeders repo]: https://github.com/bootleq/feeders
[HOTAC 2020]: https://www.hotac.org.tw/news-4169
[EAST 2009]: https://www.east.org.tw/sites/east/files/content/upload/File/2009-ISSUES/20091104.pdf
[全國遊蕩犬數量整理成圖表]: https://bootleq.blogspot.com/2024/09/taiwan-roaming-dog-populations-chart.html
[年度資料 gdoc]: https://docs.google.com/spreadsheets/d/1ajrN-ok3wnSI8X2-ntRRX9W8B2rXIz5ScnZWyUzt-G4/edit?gid=0#gid=0
