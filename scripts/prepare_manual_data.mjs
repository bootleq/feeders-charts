import fs from "fs";
import fsp from 'node:fs/promises';
import path from "path";
import csv from "csv-parser";
import { buildingPath } from '@/lib/data_source';
import { CITY_MAPPING } from '@/lib/model';

const DATA_DIR = path.resolve('data');
const cityCodeMapping = new Map(Object.entries(CITY_MAPPING).map(([code, name]) => [name, code]));

const population113 = path.resolve(`${DATA_DIR}/populations_113.csv`);
const population113CSVOptions = {
  skipLines: 1,
  headers: ['city', 'roaming'],
  mapValues: ({ header, value }) => {
    switch (header) {
      case 'city':
        return cityCodeMapping.get(value) || ''; // there are invalid cities like "全國"
        break;
      case 'roaming':
        return Number(value.toString().replaceAll(',', ''));
        break;
      default:
        break;
    }
  }
};

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

async function writeJSON(data) {
  const outFile = buildingPath('population113', 'json');

  console.log(`Write file to ${outFile}...`);
  await fsp.writeFile(outFile, JSON.stringify(data, null, 2));
}

function validate(data) {
  const samples = [
    {year: 113, city: 'City000003', roaming: 9982}, // 新北市 https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000864?parentID=Tab0000143
    {year: 113, city: 'City000001', roaming: 3112}, // 基隆市
  ];

  console.log('validating data...');

  return samples.every(sample => {
    const found = data.find(obj => {
      return Object.entries(sample).every(([k, v]) => obj[k] === v);
    });

    if (!found) {
      console.error('validation failed, missing data:', sample);
      return false;
    }

    return true;
  });
}

(async function main() {
  console.log('Prepare manually maintained data...');
  let data;

  if (!fs.existsSync(population113)) {
    throw new Error('missing data file population113')
  }

  try {
    data = await parseCSV(population113, population113CSVOptions);
  } catch (error) {
    console.error('Fail parsing CSV：', error.message);
    throw error;
  }

  data = data.reduce((acc, obj) => {
    if (obj['city'].length) {
      obj['year'] = 113;
      acc.push(obj);
    }
    return acc;
  }, []);

  if (validate(data)) {
    await writeJSON(data);

    console.log("\nDone.");
  } else {
    console.error('Aborted, validation failed.');
  }
})();
