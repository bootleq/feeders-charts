import fs from "fs";
import fsp from 'node:fs/promises';
import csv from "csv-parser";
import { buildingPath } from '@/lib/data_source';
import { CITY_MAPPING } from '@/lib/model';

const csvFile = process.env.HUMAN_POPULATION_CSV_PATH;
const cityCodeMapping = new Map(Object.entries(CITY_MAPPING).map(([code, name]) => [name, code]));

const ExpectedSample = [
  {year: 113, city: 'City000003', human: 4041120}, // 新北市 https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000864?parentID=Tab0000143
  {year: 113, city: 'City000001', human: 362255},  // 基隆市
];

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
  const outFile = buildingPath('human_population', 'json');

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

  if (!csvFile || !fs.existsSync(csvFile)) {
    console.error([
      "Error, CSV file does't exist, see README to make it manually.",
      "錯誤，找不到 CSV 檔案，請閱讀 README 以手動下載。",
    ].join("\n"));
    return;
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
