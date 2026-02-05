# Feeders Charts

Interactive charts in [feeders.fyi][] ([repo][feeders repo]).

Visit online: https://feeders.fyi/charts/

This app is built as static export, thus can be deployed elsewhere.



## Getting Started

Copy `.env.sample` to `.env.development`.

Prepare data sources in `public` folder, run `pnpm data:serve`.

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.



## Data Preparation

Latest data is committed into `data` directory.

Use below scripts to reassemble, update:

- `pnpm data:download`: Download raw data from simple data sources
- `pnpm data:human_pop`: Fetch and transform human_population data
- `pnpm data:shelter_pet`: Fetch and transform shelter detail data
- `pnpm data:heat_map`: Fetch and transform heat map data
- `pnpm data:law`: Fetch and transform animal protect act enforcement data
- `pnpm data:worker`: Fetch and transform workforce data
- `pnpm data:manually`: Transform manually collected (already built-in in repo) data
- `pnpm data:tainan`: Fetch and transform Tainan TNVR report data
- `pnpm data:reduce`: Normalize and combine all processed data (except Tainan's)
- `pnpm data:serve`: Copy transformed data to `public/` folder to really use them in app

Above scripts have hash/time checking so will stop if detect no change.
Use `DATA_CONTINUE_WHEN_SAME_HASH=1` or append `:force` to each script (e.g., `pnpm data:download:force`) to force continue.



## Data Sources

- 年度犬貓統計表  
  https://data.gov.tw/dataset/41771

  特殊調整：

  - 90 年的遊蕩犬資料有特別調整，一般公布的年度是 93 年，故處理時程式會將 90 年遊蕩犬移到 93 年，
    以符合「93年全國流浪狗狗數及92年公立動物收容所收容數總表」  
    https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000198?parentID=Tab0000004

  - 109 年有 6 個縣市遊蕩犬數字誤植，程式也會特別調整掉，見 [#3][]

- 公立動物收容所統計（97 ~ 113 年，只採用到 107 年）  
  https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3

  「動物保護資訊網」每年公布的統計數字，多為 Excel 檔案

  因後述「詳表」較完整，所以這邊只採用：

  - 97 ~ 107 年的資料
  - 106 ~ 108 年的「最大留容數」和「在養數」資料有用，但為求簡便，這部分以人工方式整理（見後述 `data/shelter_occupy_106_108.csv`），而非自動解析報表

- 動物收容統計表（詳表）（108 ~ 113 年）  
  https://www.pet.gov.tw/AnimalApp/ReportAnimalsAcceptFront.aspx

  來自「全國動物收容管理系統」的詳細資料

  已知問題：部分收容所「在養量」未反映現實，見 [#4][]

- 全國公立動物收容所收容處理情形統計表(細項) (106 ~ 113 年)  
  https://data.gov.tw/dataset/73396

  比起前述「動物收容統計表（詳表）」，資料較不齊全  
  所以只採用該詳表需要訂正的部分，即「(犬) 可留容最大值」和「(犬) 在養占可留容比例」；
  另仍有部分年度（~ 108）是缺失的，改為人工整理補上（見 `data/shelter_occupy_106_108.csv`）

  部分欄位在前幾年並沒有資料：

  - 出所：回置從 107 開始
  - 可留容最大值從 109 開始

- 戶籍登記人口數(人)  
  https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx

  來自「中華民國統計資訊網 - 縣市重要統計指標查詢系統」的「人口概況 - 戶籍登記人口數(人)」

  取前一年 12 月的數字和今年遊蕩犬數字比較，例如 2024 的每百人遊蕩犬數，是以 2023 年底人口數為準

  註：人口資料和動保資訊網提供的數字略有落差

- 遊蕩犬熱區圖 (2023 ~ 2024)  
  https://www.pet.gov.tw/Wandering/HeatMapV1.aspx

  名叫熱區圖，其實是農業部「遊蕩犬管控精進策略」的成績資料

- 各縣市政府執行動物保護法案件情形 (2022 ~ 2025)  
  https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab10

  原資料有分四個季度，但我們合併為各年度

- 各縣市動物保護業務人力 (2021 ~ 2024)  
  https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab4


### 以下為人工收集資料，並建檔於 `data` 目錄中：

- 民國 106 ~ 108 年的「最大容留數」和「在養數」資料

  這三年的收容資料並未包含在 data.gov.tw 或 pet.gov.tw，應該是因為當年沒有將犬／貓分開計算，
  但可以在 animal.moa.gov.tw 找到零星資料，所以手動整理到[個人文章][全國遊蕩犬數量整理成圖表]附錄的 [google doc 文件][年度資料 gdoc]  
  https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3

  但仍無法區分犬／貓，而會是合併的數字

  `data/shelter_occupy_106_108.csv`

- 民國 96 年以前的資料

  「收容所資料」未找到正式來源，故採用台灣之心 HOTAC 網站[整理數字][HOTAC 2020]，其資料來源為「行政院農委會動植物防疫檢疫局-統計年報」

  另有與動社的「從生命到垃圾」網站[整理數字][EAST 2009]比較，其來源為農委會防檢局提供立委資料，兩者差距不大

  其他含 88 年遊蕩犬資料等，CSV 統整資料取自[個人文章][全國遊蕩犬數量整理成圖表]附錄的 [google doc 文件][年度資料 gdoc]

  `data/countrywide.csv`


### 以下有機會處理，但最終未使用：

- 全國公立動物收容所收容處理情形統計表 (106 ~ 113 年)  
  https://data.gov.tw/dataset/41236

  和動保資訊網提供的數字對不起來，年度也不齊全



## Tainan

台南市有調查各行政區的 TNVR 成果，因不易與全國縣市整合呈現，所以做成獨立的圖表頁面

https://feeders.fyi/charts/tainan

- 臺南市遊蕩犬調查情形 (108 ~ 112 年)  
  https://data.tainan.gov.tw/DataSet/Detail/b8109af1-650c-42d0-9633-d75b9eff1ce1

  採用檔案如：108 年臺南市各行政區執行流浪犬TNVR成果表，我們使用 CSV 格式



## Test

Tests were running on dev server.

- `pnpm test`: Run all tests
- `pnpm test:shots`: Update screenshots



## Build

Do static export to `out` directory.

To preview, serve it with web server like nginx, follow `basePath` in `.env`, e.g.,:
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



[feeders.fyi]: https://feeders.fyi/
[feeders repo]: https://github.com/bootleq/feeders
[#3]: https://github.com/bootleq/feeders-charts/issues/3
[#4]: https://github.com/bootleq/feeders-charts/issues/4
[HOTAC 2020]: https://www.hotac.org.tw/news-4169
[EAST 2009]: https://www.east.org.tw/sites/east/files/content/upload/File/2009-ISSUES/20091104.pdf
[全國遊蕩犬數量整理成圖表]: https://bootleq.blogspot.com/2024/09/taiwan-roaming-dog-populations-chart.html
[年度資料 gdoc]: https://docs.google.com/spreadsheets/d/1ajrN-ok3wnSI8X2-ntRRX9W8B2rXIz5ScnZWyUzt-G4/edit?gid=0#gid=0
[縣市執法情況 - 100 年]: https://www.moa.gov.tw/theme_data.php?theme=news&sub_theme=agri&id=4380
[縣市執法情況 - 101 年]: https://www.moa.gov.tw/theme_data.php?theme=news&sub_theme=agri&id=4621
