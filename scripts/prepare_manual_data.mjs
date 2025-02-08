import * as R from 'ramda';
import fs from "fs";
import fsp from 'node:fs/promises';
import path from "path";
import csv from "csv-parser";
import { buildingPath } from '@/lib/data_source';
import { CITY_MAPPING } from '@/lib/model';
import { testSamplesExist } from './utils';

const DATA_DIR = path.resolve('data');
const cityCodeMapping = new Map(Object.entries(CITY_MAPPING).map(([code, name]) => [name, code]));

const resources = [
  {
    basename: 'populations_112',
    parserOptions: {
      skipLines: 1,
      headers: ['city', 'domestic'],
      mapValues: ({ header, value }) => {
        switch (header) {
          case 'city':
            return cityCodeMapping.get(value) || ''; // there are invalid cities like "全國"
            break;
          case 'domestic':
            return Number(value.toString().replaceAll(',', ''));
            break;
          default:
            break;
        }
      }
    },
    postProcess: (data) => {
      return data.reduce((acc, obj) => {
        if (obj['city'].length) {
          obj['year'] = 112;
          acc.push(obj);
        }
        return acc;
      }, []);
    },
    validator: (data) => {
      const samples = [
        {year: 112, city: 'City000002', domestic: 118739}, // 臺北市 https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000817?parentID=Tab0000143
        {year: 112, city: 'City000004', domestic: 150174}, // 桃園市
      ];
      return testSamplesExist(samples, data);
    },
  },
  {
    basename: 'populations_113',
    parserOptions: {
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
    },
    postProcess: (data) => {
      return data.reduce((acc, obj) => {
        if (obj['city'].length) {
          obj['year'] = 113;
          acc.push(obj);
        }
        return acc;
      }, []);
    },
    validator: (data) => {
      const samples = [
        {year: 113, city: 'City000003', roaming: 9982}, // 新北市 https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000864?parentID=Tab0000143
        {year: 113, city: 'City000001', roaming: 3112}, // 基隆市
      ];
      return testSamplesExist(samples, data);
    },
  },
  {
    basename: 'countrywide',
    parserOptions: {
      mapHeaders: (({ header }) => {
        const mapping = {
          民國: 'year',
          家犬: 'domestic',
          遊蕩犬: 'roaming',
          收容: 'accept',
          認領: 'adopt',
          人道處理: 'kill',
        };
        return mapping[header] || null;
      }),
      mapValues: ({ header, value }) => {
        if (header) {
          const qty = Number(value.toString().replaceAll(',', ''));
          return qty > 0 ? qty : null;
        }
      },
    },
    postProcess: (data) => {
      return data.reduce((acc, obj) => {
        const { year } = obj;

        if (year <= 96) { // 97 年以後已可由其他來源取得資料
          obj['city'] = '_';

          if (year >= 92) {
            delete obj['domestic'];
            delete obj['roaming'];
          }
          acc.push(obj);
        }

        return acc;
      }, []);
    },
    validator: (data) => {
      const samples = [
        {year: 88, city: '_', domestic: 2101493, roaming: 666594, kill: 70231, adopt: 5881},
        {year: 96, city: '_', adopt: 19348},
      ];
      return testSamplesExist(samples, data);
    },
  }
];

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

(async function main() {
  console.log("Prepare manually maintained data...\n");
  let data;
  let valid = true;

  for (const resource of resources) {
    const { basename, parserOptions, postProcess, validator } = resource;
    const csv = path.resolve(`${DATA_DIR}/${basename}.csv`);

    console.log(`Resource: ${basename}`);

    if (!fs.existsSync(csv)) {
      throw new Error(`missing data file: ${csv}`);
    }

    try {
      data = await parseCSV(csv, parserOptions);
    } catch (error) {
      console.error(`Fail parsing CSV ${csv}：`, error.message);
      throw error;
    }

    if (R.type(postProcess) === 'Function') {
      data = postProcess(data);
    }

    if (R.type(validator) === 'Function') {
      if (!validator(data)) {
        console.error('Aborted, validation failed.');
        valid = false;
        break;
      }
    }

    if (valid) {
      const outFile = buildingPath(basename, 'json');
      await fsp.writeFile(outFile, JSON.stringify(data, null, 2));
      console.log(`Successfully wrote file to ${outFile}\n`);
    }
  }

  if (valid && data) {
    console.log("\nDone.");
  }
})();
