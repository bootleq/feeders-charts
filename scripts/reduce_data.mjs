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
  'countrywide',
  'human_population',
  'heat_map',
  'shelter_pet',
  'workforce',
  'law_enforce',
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
    shelter_details: (data) => { // NOTE: only pick "room" related fields, otherwise use shelter_pet instead
      let valid = true;
      // Note doesn't 100% match below sources:
      // https://www.pet.gov.tw/AnimalApp/ReportAnimalsAcceptFront.aspx
      // https://data.gov.tw/dataset/73396
      const samples = [
        { year: 113, city: 'City000002', room:  840, occupy: 722.4 },   // 臺北市 2024，犬在養率  86% (近 722.4 / 860 = 84%)
        { year: 112, city: 'City000002', room:  450, occupy: 729 },     // 臺北市 2024，犬在養率 162% (近 729   / 450 = 162%)
        { year: 111, city: 'City000010', room:  239, occupy: 160.13 },  // 彰化縣 2022，犬在養率  67% (近 160.13 / 239 = 67%)
        { year: 109, city: 'City000003', room: 1615, occupy: 1308.15 }, // 新北市 2018，犬在養率  81% (近 1308.15 / 1615 = 81%)
      ];
      if (!testSamplesExist(samples, data)) valid = false;

      if (valid && data.some(({ year, city }) => {
        if (year < 109) {
          console.error(`Unexpected data, should only pick year >= 109 (2010).`);
          return true;
        } else if (year === 108 && city === 'City000004') {
          console.error(`Unexpected data, should not take 桃園市 2017 (City000004 /108) record because lacking of 最大留容數 data.`);
          return true;
        }
      })) {
        valid = false;
      }

      return valid;
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
