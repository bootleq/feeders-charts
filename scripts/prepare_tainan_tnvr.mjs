import * as R from 'ramda';
import fs from "fs";
import fsp from 'node:fs/promises';
import fetch from "node-fetch";
import csv from "csv-parser";
import chalk from 'chalk';

import {
  downloadPath,
  buildingPath,
  checkUpdateHash,
  writeSourceTime,
  writeMeta,
} from './data_source';

// https://data.tainan.gov.tw/dataset/straydogs
// or
// https://data.gov.tw/dataset/53927

const resourceName = 'tainan_tnvr_report'; // this script also spawns "sub" resources, e.g., tainan_tnvr_report_108
const endpoint = 'https://data.tainan.gov.tw/dataset/';

// ${year}年臺南市各行政區執行流浪犬TNVR成果表
const sources = [
  [108, '135c14a3-e407-4a9e-8600-f91e7b2446a8/resource/b1849d56-7022-43c7-a9cc-8f8698232485/download/b1b0cffb-a6cf-4881-bee4-a96cbdfd5ef4.csv'],
  [109, '135c14a3-e407-4a9e-8600-f91e7b2446a8/resource/72105f03-eb43-4122-b052-b46964dfb23a/download/fbc8f594-7639-4a78-8d63-01b3c132f209.csv'],
  [110, '135c14a3-e407-4a9e-8600-f91e7b2446a8/resource/b150ef6c-0c44-4fa3-bee9-a7c2cac159e9/download/7c016a3b-44f3-4b23-a749-1e1959c433ea.csv'],
  [111, '135c14a3-e407-4a9e-8600-f91e7b2446a8/resource/bac40aa0-c902-4f92-9603-92c5dfd22782/download/2cff600c-8ae3-4e32-81da-96ba2dcdb630.csv'],
  [112, '135c14a3-e407-4a9e-8600-f91e7b2446a8/resource/429164e7-c659-4327-a5c6-1cc307952bc7/download/de8f726c-6eac-45d6-a8dd-fada446c4ee8.csv'],
];

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return response.text();
}

async function saveData(subResourceName, data) {
  try {
    const filePath = downloadPath(subResourceName, `raw.csv`);
    const buffer = Buffer.from(data);
    await fsp.writeFile(filePath, buffer);
    console.log(`Data saved in ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`Fail saving resource for ${subResourceName}：`, error.message);
    throw error;
  }
}

async function parseCSV(file, csvOptions = {}) {
  return new Promise((resolve, reject) => {
    const result = [];
    const stream = fs.createReadStream(file).pipe(csv(csvOptions));

    stream.on('data', (row) => {
      result.push(row);
    }).on('end', () => {
      resolve(result);
    }).on('error', (err) => {
      reject(err);
    });
  });
}

const parserOptions = {
  mapHeaders: (({ header }) => {
    const mapping = {
      行政區: 'city', // 為減少程式改動，先使用不正確的名稱 city，而非 district
      公犬: 'male',
      母犬: 'female',
      總計: 'total',
      隻數: 'total',
    };
    return mapping[header] || null;
  }),
  mapValues: ({ header, value }) => {
    switch (header) {
      case 'city':
        return value; // NOTE: 郵遞區號不一定有，事後再移除，這邊不理會
        break;
      default:
        return Number(value);
        break;
    }
  }
};

async function download(subResourceName, downloadPath) {
  console.log(`Download data for ${subResourceName} ...`);
  const url = `${endpoint}${downloadPath}`;

  const remoteData = await fetchData(url);
  const needsUpdate = await checkUpdateHash(subResourceName, remoteData);

  if (needsUpdate) {
    const file = await saveData(subResourceName, remoteData);
    await writeSourceTime(subResourceName);
    return file;
  } else {
    console.log(`Remote data for '${subResourceName}' has no change.`);

    if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
      console.log(chalk.yellow.bold('but still save data per request ') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
      return await saveData(subResourceName, remoteData);
    }
  }
}

// 將行政區一律轉為帶有郵遞區號的形式
// "737鹽水區" => "737 鹽水區"
// "鹽水區"    => "737 鹽水區"
function normalizeDistricts(items) {
  const allNames = R.uniq(R.pluck('city', items));

  // Mapping of shape { "鹽水區": "737 鹽水區" }
  const dict = allNames.reduce((acc, name) => {
    const [, postCode, shortName] = name.match(/^(\d+)?(.+)/);
    if (postCode) {
      acc[shortName.trim()] = `${postCode.trim()} ${shortName.trim()}`;
    }
    return acc;
  }, {});

  return items.map(item => {
    const { city } = item;
    const [,, shortName] = city.match(/^(\d+)?(.+)/);
    const translated = dict[shortName];
    if (translated) {
      return { ...item, city: translated };
    } else {
      throw new Error(`Unexpected district '${city}'.`);
    }
    return item;
  });
}

(async function main() {
  let data = [];

  for (const [year, downloadPath] of sources) {
    const basename = `tainan_tnvr_report_${year}`;
    const csv = await download(basename, downloadPath);

    if (!csv) {
      return;
    }

    let yearData = await parseCSV(csv, parserOptions);
    yearData = yearData.map(R.assoc('year', year))
    data = [...data, ...yearData];
  }

  data = data.filter(({ city }) => (city !== '合計'));
  data = normalizeDistricts(data);

  const outFile = buildingPath(resourceName, 'json');
  const now = new Date();
  await fsp.writeFile(outFile, JSON.stringify(data, null, 2));
  console.log(`Successfully wrote file to ${outFile}\n`);

  await writeMeta('tainan', ['combined', 'builtAt'], now.toJSON());

  console.log("\nDone.");
})();

