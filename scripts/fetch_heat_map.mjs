import * as R from 'ramda';
import fsp from 'node:fs/promises';
import fetch from 'node-fetch';
import https from 'https';
import chalk from 'chalk';
import { CITY_MAPPING } from '@/lib/model';
import { buildingPath, checkUpdateHash, writeSourceTime } from '@/lib/data_source';

const basename = 'heat_map';

const API_URL = 'https://www.pet.gov.tw/Handler/WanderingCore.ashx';
const unsafeAgent = new https.Agent({
  rejectUnauthorized: false,
});

const cityCodeMapping = new Map(Object.entries(CITY_MAPPING).map(([code, name]) => [name, code]));

const REPORT_FIELDS = {
  CountyName: 'city', // 縣市
  A:  'h_visit', // 家戶清查戶數
  A1: null,      // 家犬總隻數(A)
  B:  null,      // 已完成寵物登記隻數(B)
  C:  null,      //
  D:  null,      // 已完成絕育隻數(C)
  E:  null,
  F:  null,      // 已完成免絕育申報隻數(D)
  G:  null,
  G1: null,      // 宣導飼主責任戶數
  G2: null,      // 寵物登記裁罰數？
  G3: null,      // 寵物繁殖管理裁罰數？
  // '無主犬': '-',
  H:  'h_roam', // 清查總隻數(H)
  H1: null,     // 執行前已絕育
  I:  null,     // 完成絕育回置隻數(I)
  J:  null,     // 完成捕捉移除隻數(J)
  K:  'h_feed', // 餵食者總人數
  L:  'h_stop', // 疏導餵食者人數(不餵飼)
};

async function request(params) {
  let result;

  const fetchOptions = {
    agent: unsafeAgent,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `Method=WebReport&Param=${JSON.stringify(params)}`,
    method: 'POST',
  };

  const response = await fetch(API_URL, fetchOptions);

  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  try {
    result = await response.json();
  } catch (error) {
    console.error(`Fail parsing response：`, error.message);
    throw error;
  }

  if (result['Success']) {
    return JSON.parse(result['Message']);
  } else {
    console.error('Request failed, message:', result['ErrorMessage']);
    throw new Error('Request failed')
  }

  return result;
}

function translateFields(reportItems, year) {
  return reportItems.reduce((acc, item) => {
    const obj = {};
    const rocYear = year - 1911;

    Object.entries(item).forEach(([key, value]) => {
      const field = REPORT_FIELDS[key];
      if (field && value) {
        if (field === 'city') {
          const cityCode = cityCodeMapping.get(value) || '';
          if (cityCode) {
            obj.city = cityCode;
          }
        } else {
          obj[field] = value;
        }
      }
    });

    if (R.isNotEmpty(obj)) {
      acc.push({ ...obj, year: rocYear });
    }

    return acc;
  }, []);
}

function validate(items) {
  let valid = true;

  if (items.length !== 22) {
    console.error(`Validatoin failed, expect 22 items, got ${items.length}`);
  }

  return valid;
}

async function fetchYearData(year) {
  const params = {
    _Year: year,
  };

  console.log(`Getting data ${year}`);
  const res = await request(params);
  const data = translateFields(res, year);

  if (!validate(data)) {
    throw new Error('Validation failed')
  }
  return data;
}


(async function main() {
  console.log("Fetch heat map data from pet.gov.tw ...\n");

  const results = [];
  for (const year of [2023, 2024]) {
    results.push(await fetchYearData(year));
  }
  const data = R.unnest(results);

  const newContent = JSON.stringify(data);
  const needsUpdate = await checkUpdateHash(basename, newContent);
  if (needsUpdate) {
    await writeSourceTime(basename);
  } else {
    console.log(`Source data for '${basename}' has no change.`);
    if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
      console.log(chalk.yellow.bold('but still process per request.') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
    } else {
      return;
    }
  }

  const outFile = buildingPath(basename, 'json');
  await fsp.writeFile(outFile, JSON.stringify(data, null, 2));
  console.log(`Successfully wrote file to ${outFile}\n`);
})();
