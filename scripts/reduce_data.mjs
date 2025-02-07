import * as R from 'ramda';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from "path";

import {
  sources,
  buildingPath,
} from '@/lib/data_source';

import { jqProcess } from './utils';
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
