// Archived, not used: O302 numbers of past years keep changing, see
// README. For reference only. Run with:
//  tsx scripts/archive/pet_registration/fetch_pet_registration.mjs

import * as R from 'ramda';
import fsp from 'node:fs/promises';
import fetch from 'node-fetch';
import https from 'https';
import chalk from 'chalk';
import { cityLookup } from '@/lib/model';
import { buildingPath, checkUpdateHash, writeSourceTime } from '../../data_source';

const basename = 'pet_registration';

const API_URL = 'https://www.pet.gov.tw/Handler/PostData.ashx';

const FIRST_YEAR = 1999;

// Server rejects requests sent too frequently (查詢間隔過短，請稍待片刻。)
const REQUEST_INTERVAL = 6000;
const MAX_RETRIES = 3;

const unsafeAgent = new https.Agent({
  rejectUnauthorized: false,
});

const REPORT_FIELDS = {
  // There is no API doc available, we wrote this by observation
  AreaName: 'city', // 縣市
  fld01:    null,   // 登記單位數
  fld02:    'A',    // 登記數(A)
  fld03:    'B',    // 除戶數(B)
  fld05:    null,   // 轉讓數(C)
  fld06:    null,   // 變更數(D)
  fld04:    'E',    // 絕育數(E)
  fld08:    'F',    // 絕育除戶數(F)
  fld07:    'G',    // 免絕育數(G)
  fld10:    'H',    // 免絕育除戶數(H)
};

// Same as how the source website computes (in percent, with 2 decimals).
// We can't compute these afterwards, since F and H are not saved.
function computeRates({ A, B, E, F, G, H }) {
  if (A - B === 0) {
    return { neuterRate: 0, manageRate: 0 };
  }
  return {
    neuterRate: Number(((E - F) / (A - B) * 100).toFixed(2)),           // 絕育率 (E-F)/(A-B)
    manageRate: Number(((E - F + (G - H)) / (A - B) * 100).toFixed(2)), // 繁殖管理率 ((E-F)+(G-H))/(A-B)
  };
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function request(params) {
  let result;

  const fetchOptions = {
    agent: unsafeAgent,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ Method: 'O302_2', Param: JSON.stringify(params) }).toString(),
    method: 'POST',
  };

  const response = await fetch(API_URL, fetchOptions);

  if (!response.ok) throw new Error(`Failed to fetch ${API_URL}: ${response.statusText}`);

  const text = await response.text();
  try {
    result = JSON.parse(text);
  } catch (error) {
    console.error(`Fail parsing response：`, text.slice(0, 100));
    throw error;
  }

  if (result['Success']) {
    return JSON.parse(result['Message']);
  } else {
    console.error('Request failed, message:', result['ErrorMessage'] || result['Message']);
    throw new Error('Request failed')
  }
}

async function requestWithRetry(params) {
  for (let i = 0; ; i++) {
    try {
      return await request(params);
    } catch (error) {
      if (i >= MAX_RETRIES) throw error;
      console.log(chalk.yellow(`Retry (${i + 1}/${MAX_RETRIES}) after ${REQUEST_INTERVAL}ms...`));
      await wait(REQUEST_INTERVAL);
    }
  }
}

function translateFields(reportItems, year) {
  return reportItems.reduce((acc, item) => {
    const raw = {};
    const rocYear = year - 1911;

    Object.entries(item).forEach(([key, value]) => {
      const field = REPORT_FIELDS[key];
      if (field) {
        raw[field] = field === 'city' ? cityLookup(value) : value;
      }
    });

    const { neuterRate, manageRate } = computeRates(raw);

    acc.push({
      year: rocYear,
      city: raw.city,
      pet_reg: raw.A,               // 登記數
      pet_dereg: raw.B,             // 除戶數
      pet_neuter: raw.E,            // 絕育數
      pet_exempt: raw.G,            // 免絕育數
      pet_neuter_rate: neuterRate,  // 絕育率
      pet_manage_rate: manageRate,  // 繁殖管理率
    });

    return acc;
  }, []);
}

function validate(items, year) {
  if (items.length !== 22) {
    console.error(`Validation failed, expect 22 items for ${year}, got ${items.length}`);
    return false;
  }

  const invalid = items.find(({ year, city, ...values }) => {
    return Object.values(values).some(v => !Number.isFinite(v) || v < 0);
  });
  if (invalid) {
    console.error(`Validation failed, unexpected value:`, invalid);
    return false;
  }

  return true;
}

async function fetchYearData(year) {
  const params = {
    SDATE: `${year}/01/01`,
    EDATE: `${year}/12/31`,
    Animal: '0', // 狗
  };

  console.log(`Getting data ${year}, params:`, params);
  const res = await requestWithRetry(params);
  const data = translateFields(res, year);

  if (!validate(data, year)) {
    throw new Error('Validation failed')
  }
  return data;
}

(async function main() {
  console.log("Fetch pet registration data from pet.gov.tw ...\n");

  // Only take years already passed
  const lastYear = new Date().getFullYear() - 1;
  const years = R.range(FIRST_YEAR, lastYear + 1);

  const results = [];
  for (const year of years) {
    if (results.length) await wait(REQUEST_INTERVAL);
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
