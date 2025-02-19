import * as R from 'ramda';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from "path";
import chalk from 'chalk';

import {
  downloadableSources,
  buildingPath,
  readSourceTime,
  checkUpdateHash,
  writeMeta,
  DATA_DIR,
} from './data_source';

import { jqProcess, testSamplesExist } from './utils';
import { normalizeShelterXLSX } from './normalizers/shelter_xlsx';
import { normalizeByJq } from './normalizers/jq';
import { normalizePopulation } from './normalizers/population_jq';

const manuallyResources = [
  'populations_112',
  'populations_113',
  'countrywide',
  'human_population',
  'heat_map',
  'shelter_pet',
];

async function normalize( resourceName ) {
  const { normalizer } = downloadableSources[resourceName];

  switch (normalizer) {
    case 'jq':
      return normalizeByJq(resourceName);
      break;
    case 'shelter_xlsx':
      return normalizeShelterXLSX(resourceName);
      break;
    case 'population_jq':
      return normalizePopulation(resourceName);
      break;

    default:
      break;
  }

  // No normalizer
  return false;
}

async function combine( resourceNames ) {
  console.log('Combile resources...');

  const inFiles = resourceNames.map(name => buildingPath(name, 'json'));

  for (const file of inFiles) {
    if (!fs.existsSync(file)) {
      console.error(`Aborted, missing file ${file}`);
      return false;
    }
  }

  try {
    const script = path.resolve('scripts/combine.jq');
    return await jqProcess(script, inFiles);
  } catch (error) {
    console.error('Fail combining：', error.message);
    throw error;
  }
}

function validate(resourceName, items) {
  const validators = {
    population: (data) => {
      if (data.some(({ year, roaming, domestic }) => {
        if (year > 111) {
          console.error(`Unexpected data, we assume 112 (2023), 113 (2024) population data not included yet.`);
          return true;
        }

        if (year === 90) {
          if (roaming || !domestic) {
            console.error(`Unexpected data,  year 90 (2001) should only contain "roaming".`);
            return true;
          }
        } else if (year === 93) {
          if (!roaming || domestic) {
            console.error(`Unexpected data, year 93 (2004) should only contain "domestic".`);
            return true;
          }
        }
      })) {
        return false;
      }

      return true;
    },
    shelter_details: (data) => { // NOTE: unused, use shelter_pet instead
      // Note doesn't 100% match below sources:
      // https://www.pet.gov.tw/AnimalApp/ReportAnimalsAcceptFront.aspx
      // https://data.gov.tw/dataset/73396
      const samples = [
        { year: 113, city: 'City000002', room: 840, return: 0, miss: 5, occupy: 722.4 },    // 臺北市 2024，犬在養率 86% (近 722.4 / 860 = 84%)
        { year: 111, city: 'City000010', room: 239, return: 0, miss: 110, occupy: 160.13 }, // 彰化縣 2022，犬在養率 67% (近 160.13 / 239 = 67%)
        { year: 107, city: "City000004", room: 0, return: 871, miss: 270, occupy: 0 },      // 桃園市 2018，犬在養率無法計算（缺最大留容數資料）
      ];
      return testSamplesExist(samples, data);
    },
  }

  const validator = validators[resourceName];

  if (R.type(validator) === 'Function') {
    return validator(items);
  }

  return true;
}

(async function main() {
  for (const [resourceName] of Object.entries(downloadableSources)) {
    const data = await normalize(resourceName);

    if (!validate(resourceName, data)) {
      console.log('Aborted.');
      return;
    }
  }

  const allResources = Object.keys(downloadableSources).concat(manuallyResources);

  // Collect source checked (download latest change) time
  for (const rc of allResources) {
    const sourceTime = await readSourceTime(rc);
    if (!sourceTime) {
      console.error(`Error: missing sourceCheckedAt record for '${rc}'`);
      console.log('Aborted.');
      return;
    }
  }

  const combined = await combine(allResources);

  if (combined) {
    const newContent = JSON.stringify(combined, null, 2);
    const needsUpdate = await checkUpdateHash('combined', newContent);
    const outFile = path.resolve(`${DATA_DIR}/combined.json`);
    const now = new Date();

    if (needsUpdate) {
      console.log(`Write file to ${outFile}...`);
      await fsp.writeFile(outFile, newContent);
      await writeMeta('', ['combined', 'builtAt'], now.toJSON());
    } else {
      console.log(`Combined data has no change.`);
      if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
        console.log(chalk.yellow.bold('but still save data per request ') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
        console.log(`Write file to ${outFile}...`);
        await fsp.writeFile(outFile, newContent);
      } else {
        return;
      }
    }

    console.log("\nDone.");
  }
})();
