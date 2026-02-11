import * as R from 'ramda';
import fs from "fs";
import fsp from 'node:fs/promises';
import path from "path";
import csv from "csv-parser";
import chalk from 'chalk';
import { buildingPath, checkUpdateHash, writeSourceTime } from './data_source';
import { CITY_MAPPING } from '@/lib/model';
import { testSamplesExist } from './utils';

const DATA_DIR = path.resolve('data');
const cityCodeMapping = new Map(Object.entries(CITY_MAPPING).map(([code, name]) => [name, code]));

const resources = [
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

          if (year == 90) {
            delete obj['domestic'];
          }
          if (year >= 92) { // 90 年的遊蕩犬數量，移到 93 年
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
  },
  {
    basename: 'shelter_occupy_106_108',
    parserOptions: {
      skipLines: 1,
      headers: [
        'city',
        '106_room', '106_occupy',
        '107_room', '107_occupy',
        '108_room', '108_occupy',
      ],
      mapValues: ({ header, value }) => {
        switch (header) {
          case 'city':
            return cityCodeMapping.get(value);
            break;
          default:
            return Number(value.toString().replaceAll(',', ''));
            break;
        }
      },
    },
    postProcess: (data) => {
      return data.reduce((acc, obj) => {
        [106, 107, 108].forEach(year => {
          const { city } = obj;
          const room = obj[`${year}_room`];
          const occupy = obj[`${year}_occupy`];
          acc.push({
            year,
            city,
            room,
            occupy,
          });
        });

        return acc;
      }, []);
    },
    validator: (data) => {
      const samples = [
        // https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3
        {year: 106, city: 'City000003', room: 1865, occupy: 1378}, // 新北市
        {year: 107, city: 'City000002', room:  610, occupy:  846}, // 台北市
        {year: 108, city: 'City000006', room:   90, occupy:  186}, // 新竹市
      ];
      return testSamplesExist(samples, data);
    },
  },
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
    const resourceName = basename;
    const csv = path.resolve(`${DATA_DIR}/${basename}.csv`);

    const newContent = await fsp.readFile(csv, 'utf-8');
    const needsUpdate = await checkUpdateHash(resourceName, newContent);

    if (needsUpdate) {
      await writeSourceTime(resourceName);
    } else {
      console.log(`Source data for '${resourceName}' has no change.`);
      if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
        console.log(chalk.yellow.bold('but still process per request.') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
      } else {
        continue;
      }
    }

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
