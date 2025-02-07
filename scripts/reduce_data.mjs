import * as R from 'ramda';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from "path";

import {
  sources,
  buildingPath,
} from '@/lib/data_source';

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
];

async function normalize( resourceName ) {
  const { normalizer } = sources[resourceName];

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
    const outFile = buildingPath('combined', 'json');
    const result = await jqProcess(script, inFiles);
    console.log(`Write file to ${outFile}...`);
    await fsp.writeFile(outFile, JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('Fail combining：', error.message);
    throw error;
  }
}

function validate(resourceName, items) {
  const validators = {
    population: (data) => {
      const item112 = data.find(({ year, roaming }) => {
        return year > 111 && roaming;
      });

      if (item112) {
        console.error(`Unexpected data, we assume 112 (2023), 113 (2024) population data not included yet.`);
        return false;
      }

      return true;
    },
    shelter_details: (data) => {
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
  for (const [resourceName] of Object.entries(sources)) {
    const data = await normalize(resourceName);

    if (!validate(resourceName, data)) {
      console.log('Aborted.');
      return;
    }
  }

  const allResources = Object.keys(sources).concat(manuallyResources);

  if (await combine(allResources)) {
    console.log("\nDone.");
  }
})();
