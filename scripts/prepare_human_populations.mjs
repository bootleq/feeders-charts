import fs from "fs";
import fsp from 'node:fs/promises';
import csv from "csv-parser";
import chalk from 'chalk';
import { chromium } from 'playwright';
import { downloadPath, buildingPath, writeSourceTime, checkUpdateHash } from './data_source';
import { CITY_MAPPING } from '@/lib/model';

// human_population: {
//   title: '戶籍登記人口數(人)',
//   docUrl: 'https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx',
//   name: 'human_population',
//   extname: 'csv',
//   // 中華民國統計資訊網 - 縣市重要統計指標查詢系統
//   // 資料來源：內政部
// },

const resourceName = 'human_population';
const cityCodeMapping = new Map(Object.entries(CITY_MAPPING).map(([code, name]) => [name, code]));

const sourcePaths = {
  tree:   'StateFile_ZWeb.aspx',
  form:   'Varval.aspx',
  result: 'ShowQuery.aspx**',
};

function sourceURL(pathType) {
  return `https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/${sourcePaths[pathType]}`;
}

const ExpectedSample = [
  {year: 113, city: 'City000003', human: 4041120}, // 新北市 https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000864?parentID=Tab0000143
  {year: 113, city: 'City000001', human: 362255},  // 基隆市
];

async function download() {
  // 模擬手動下載：
  // 1. 中華民國統計資訊網 - 縣市重要統計指標查詢系統
  // 2. 改制後 - 人口概況 - 戶籍登記人口數(人) - 完成挑選
  // 3. 「指標」與「期間」全選，「縣市」除「台灣地區」外全選 - 繼續
  // 4. 下載 CSV
  // 5. 存檔
  const csvFile = downloadPath(resourceName, 'csv');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  context.setDefaultTimeout(8_000);
  const page = await browser.newPage();

  console.log(`Download data for ${resourceName} ...`);

  await page.goto(sourceURL('tree'));

  await page.locator('span.easytree-node:has-text("戶籍登記人口數(人)")').locator('input[type="checkbox"]').dispatchEvent('click');
  await page.getByText('完成挑選').click();
  await page.waitForURL(sourceURL('form'));

  await page.locator('.panel-heading:has-text("指標")').getByLabel('全選').click();
  await page.locator('.panel-heading:has-text("期間")').getByLabel('全選').click();
  await page.locator('.panel-heading:has-text("縣市")').getByLabel('全選').click();
  await page.locator('.easytree-title:has-text("臺灣地區")').locator('input[type="checkbox"]').click();
  await page.getByText('繼續').click();
  await page.waitForURL(sourceURL('result'));

  const downloadPromise = page.waitForEvent('download');
  await page.getByText('下載CSV').click();
  const download = await downloadPromise;
  await download.saveAs(csvFile);

  await browser.close();
  return csvFile;
}

async function parseCSV(file) {
  const csvOptions = {
    skipLines: 2,
    headers: false,
  };

  return new Promise((resolve, reject) => {
    const result = [];
    let headers = [];
    let rowIndex = 0;

    const stream = fs.createReadStream(file).pipe(csv(csvOptions));

    stream.on('data', (row) => {
      rowIndex++;

      // 標題行
      if (rowIndex === 1) {
        headers = Object.values(row).slice(3, 25); // D ~ Y 欄（縣市名稱）
      }

      // 資料從第 3 行開始
      if (rowIndex >= 3) {
        const year = row[1]; // 第 B 欄為年度

        if (!year || !/^\d{4}$/.test(String(year))) {
          return;
        }

        const rocYear = Number(year) - 1911 + 1; // NOTE: 多加一年，因假設：遊蕩犬數量是和前一年人口資料做參考

        headers.forEach((cityName, index) => {
          const value = row[Object.keys(row)[index + 3]]; // D ~ Y 欄（數值）
          const city = cityCodeMapping.get(cityName);
          const record = { year: rocYear, city, human: Number(value.replaceAll(',', '')) };
          result.push(record);
        });
      }
    }).on('end', () => {
      resolve(result);
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function writeJSON(data) {
  const outFile = buildingPath(resourceName, 'json');

  console.log(`Write file to ${outFile}...`);
  await fsp.writeFile(outFile, JSON.stringify(data, null, 2));
}

function validate(data) {
  console.log('Validating data...');

  return ExpectedSample.every(sample => {
    const found = data.find(obj => {
      return Object.entries(sample).every(([k, v]) => obj[k] === v);
    });

    if (!found) {
      console.error('Validation failed, missing data:', sample);
      return false;
    }

    return true;
  });
}

(async function main() {
  let data;
  const csvFile = await download();

  if (!csvFile || !fs.existsSync(csvFile)) {
    console.error("Error, CSV file not found, aborted.");
    return;
  }

  const newContent = await fsp.readFile(csvFile, 'utf-8');
  const needsUpdate = await checkUpdateHash(resourceName, newContent);

  if (needsUpdate) {
    await writeSourceTime(resourceName);
  } else {
    console.log(`Source data for '${resourceName}' has no change.`);
    if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
      console.log(chalk.yellow.bold('but still process per request.') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
    } else {
      return;
    }
  }

  try {
    console.log('Parsing CSV file...');
    data = await parseCSV(csvFile);
  } catch (error) {
    console.error('Fail parsing CSV：', error.message);
    throw error;
  }

  if (validate(data)) {
    await writeJSON(data);

    console.log("\nDone.");
  } else {
    console.error('Aborted, validation failed.');
  }
})();
