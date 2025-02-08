import * as R from 'ramda';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from "path";
import { jqProcess } from '../utils';
import type { CountryItem } from '@/lib/model';
import { downloadPath, buildingPath } from '@/lib/data_source';

// Same as "jq" normalizer but has special fix filter

// Original year 90 seems incorrect if we agree the number is for year 93
// https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000198?parentID=Tab0000004
function fixYear93(items: CountryItem[]) {
  return R.pipe(
    R.map(
      R.when(
        R.propEq(90, 'year'),
        R.juxt([
          R.dissoc('roaming'), // this keeps 90's domestic data
          R.pipe(R.dissoc('domestic'), R.assoc('year', 93)), // then add another entry for 93
        ]),
      ),
    ),
    R.flatten,
  )(items);
}

export async function normalizePopulation(resourceName: string) {
  const script = path.resolve(`scripts/${resourceName}.jq`);

  if (!fs.existsSync(script)) {
    throw new Error(`Normalizer requires jq script: ${script}.`);
  }

  console.log(`Normalize resource '${resourceName}' ...`);
  try {
    const inFile = downloadPath(resourceName, 'raw.json');
    const outFile = buildingPath(resourceName, 'json');
    const result = await jqProcess(script, inFile);

    const result93 = fixYear93(result);

    await fsp.writeFile(outFile, JSON.stringify(result93, null, 2));
    return result93;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Fail normalizing ${resourceName}：`, error.message);
    }
    throw error;
  }
}
