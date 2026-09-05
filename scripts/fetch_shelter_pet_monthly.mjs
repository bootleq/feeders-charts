// 執行方式：pnpm exec tsx scripts/fetch_shelter_pet_monthly.mjs --city <縣市名或代碼> [--start YYYY-MM]
//   --city   必填，接受「臺中市」或「City000009」等形式
//   --start  選填，起始年月，預設 2021-03（新版報表格式起始月份）
// 輸出：data/build/shelter_pet_monthly_<縣市名>.csv

import { parseArgs } from 'node:util';
import fsp from 'node:fs/promises';
import fetch from 'node-fetch';
import https from 'https';
import { cityLookup, CITY_MAPPING } from '@/lib/model';
import { buildingPath } from './data_source';

const DEFAULT_START = { year: 2021, month: 3 };

const API_URL = 'https://www.pet.gov.tw/handler/AnimalsCore.ashx';

function parseCliOptions() {
  let values;
  try {
    ({ values } = parseArgs({
      options: {
        city: { type: 'string' },
        start: { type: 'string' },
      },
    }));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  if (!values.city) {
    console.error('缺少必要參數 --city <縣市名或代碼>');
    process.exit(1);
  }

  let cityName;
  try {
    // --city 可傳名稱或代碼，統一解析成正規縣市名（fetchMonthRow 用來比對 API 的 cityName）
    const code = CITY_MAPPING[values.city] ? values.city : cityLookup(values.city);
    cityName = CITY_MAPPING[code];
  } catch {
    console.error(`未知的縣市：${values.city}`);
    process.exit(1);
  }

  let start = { ...DEFAULT_START };
  if (values.start !== undefined) {
    const matched = /^(\d{4})-(\d{2})$/.exec(values.start.trim());
    if (!matched) {
      console.error(`--start 格式錯誤（需為 YYYY-MM）：${values.start}`);
      process.exit(1);
    }
    start = { year: Number(matched[1]), month: Number(matched[2]) };
    if (start.month < 1 || start.month > 12) {
      console.error(`--start 月份超出範圍：${values.start}`);
      process.exit(1);
    }
  }

  const now = new Date();
  const current = { year: now.getFullYear(), month: now.getMonth() + 1 };
  if (start.year > current.year || (start.year === current.year && start.month > current.month)) {
    console.error(`--start（${start.year}-${pad2(start.month)}）晚於當前月份`);
    process.exit(1);
  }

  return { cityName, start };
}

const unsafeAgent = new https.Agent({
  rejectUnauthorized: false,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(params, retriesLeft = 3) {
  let result;

  const fetchOptions = {
    agent: unsafeAgent,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `Method=AnimalsFront&Param=${JSON.stringify(params)}`,
    method: 'POST',
  };

  let response;
  try {
    response = await fetch(API_URL, fetchOptions);
  } catch (error) {
    if (retriesLeft > 0) {
      console.error(`Fetch error (${error.message}), retrying... (${retriesLeft} left)`);
      await sleep(2000);
      return request(params, retriesLeft - 1);
    }
    throw error;
  }

  if (!response.ok) throw new Error(`Failed to fetch ${API_URL}: ${response.statusText}`);

  try {
    result = await response.json();
  } catch (error) {
    console.error(`Fail parsing response：`, error.message);
    throw error;
  }

  if (result['Success']) {
    return JSON.parse(result['Message']);
  } else {
    // API 偶爾對正常查詢回「查無資料」（疑似負載/限流），非真的沒資料，故先重試
    if (retriesLeft > 0) {
      console.error(`Request failed (${result['ErrorMessage']}), retrying... (${retriesLeft} left)`);
      await sleep(2000);
      return request(params, retriesLeft - 1);
    }
    console.error('Request failed, message:', result['ErrorMessage']);
    throw new Error('Request failed');
  }
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function nextMonth({ year, month }) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function isAfter(a, b) {
  return a.year !== b.year ? a.year > b.year : a.month > b.month;
}

async function fetchMonthRow(year, month, cityName) {
  const beginDate = `${year}-${pad2(month)}-01`;
  const endDate = `${year}-${pad2(month)}-${pad2(lastDayOfMonth(year, month))}`;

  const params = {
    action: 'AnimalsAccepReportFront',
    rType: '4',
    DataS: beginDate,
    DataE: endDate,
  };

  console.log(`Getting data ${year}-${pad2(month)}, params:`, params);
  const res = await request(params);

  return res.find((item) => item.cityName && item.cityName.replace(/^\d+\.\s*/, '') === cityName);
}

function sum(...values) {
  return values.reduce((acc, v) => acc + (v || 0), 0);
}

(async function main() {
  console.log("Fetch monthly shelter detail data from pet.gov.tw ...\n");

  const { cityName, start } = parseCliOptions();
  console.log(`City: ${cityName}, start from ${start.year}-${pad2(start.month)}\n`);

  const now = new Date();
  const current = { year: now.getFullYear(), month: now.getMonth() + 1 };

  const rows = [];
  let cursor = { ...start };

  while (!isAfter(cursor, current)) {
    const row = await fetchMonthRow(cursor.year, cursor.month, cityName);

    if (!row) {
      if (rows.length === 0) {
        console.log(`No data for ${cursor.year}-${pad2(cursor.month)} (${cityName}) yet, skipping.`);
        cursor = nextMonth(cursor);
        await sleep(300);
        continue;
      }
      console.log(`No data found for ${cursor.year}-${pad2(cursor.month)} (${cityName}), stop here.`);
      break;
    }

    rows.push({
      yearMonth: `${cursor.year}-${pad2(cursor.month)}`,
      stay: row.TotalA2,
      pressure: Number(String(row.APD).replace('%', '')),
      humaneKill: sum(row.L1, row.L2, row.L3, row.L4),
      death: sum(row.D1, row.D2, row.D3),
    });

    cursor = nextMonth(cursor);
    await sleep(300);
  }

  if (rows.length === 0) {
    throw new Error('No data fetched at all');
  }

  const twoMonthsAgo = (() => {
    let { year, month } = current;
    month -= 2;
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    return { year, month };
  })();

  const lastRow = rows[rows.length - 1];
  const [lastYear, lastMonth] = lastRow.yearMonth.split('-').map(Number);

  if (isAfter(twoMonthsAgo, { year: lastYear, month: lastMonth })) {
    throw new Error(
      `Latest fetched month (${lastRow.yearMonth}) is older than expected minimum (${twoMonthsAgo.year}-${pad2(twoMonthsAgo.month)}). Data source may be incomplete or API changed.`
    );
  }

  const header = ['年月', '在養數', '收容壓力', '人道處理數', '所內死亡數'];
  const csvLines = [
    header.join(','),
    ...rows.map((r) => [r.yearMonth, r.stay, r.pressure, r.humaneKill, r.death].join(',')),
  ];
  const csvContent = csvLines.join('\n') + '\n';

  const outFile = buildingPath(`shelter_pet_monthly_${cityName}`, 'csv');
  await fsp.writeFile(outFile, csvContent);
  console.log(`\nSuccessfully wrote ${rows.length} rows to ${outFile}\n`);
})();
