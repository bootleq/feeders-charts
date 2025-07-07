import * as R from 'ramda';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from "path";
import { jqProcess } from '../utils';
import { cityLookup } from '@/lib/model';
import type { CountryItem } from '@/lib/model';
import { downloadPath, buildingPath } from '../data_source';

// Same as "jq" normalizer but has special fix filters

// Original year 90 seems incorrect if we agree the number is for year 93
// https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000198?parentID=Tab0000004
const fixYear93 = R.map(
  R.when(
    R.propEq(90, 'year'),
    R.juxt([
      R.dissoc('roaming'), // this keeps 90's domestic data
      R.pipe(R.dissoc('domestic'), R.assoc('year', 93)), // then add another entry for 93
    ])
  )
);

// In year 109 there were 6 cities have qty misplaced
// https://github.com/bootleq/feeders-charts/issues/3
const YEAR_109_PLACE_CORRECTION: Record<string, number> = {
  'City000020': 1053,  // 澎湖縣
  'City000022':    0,  // 連江縣
  'City000021':  204,  // 金門縣
  'City000013': 1173,  // 嘉義市
  'City000006':  890,  // 新竹市
  'City000001': 3225   // 基隆市
};
const fixYear109Misplace = (items: CountryItem[]) => {
  return items.map(i => {
    if (i.year === 109 && Object.keys(YEAR_109_PLACE_CORRECTION).includes(i.city)) {
      const qty = YEAR_109_PLACE_CORRECTION[i.city];
      if (R.type(qty) !== 'Number') {
        throw new Error(`Unexpected year 109 correction of ${i.city}.`);
      }
      return {
        ...i,
        roaming: qty
      }
    }
    return i;
  })
  return items;
}

function patch(items: CountryItem[]) {
  return R.pipe(
    fixYear109Misplace,
    fixYear93,
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

    const patched = patch(result);

    await fsp.writeFile(outFile, JSON.stringify(patched, null, 2));
    return patched;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Fail normalizing ${resourceName}：`, error.message);
    }
    throw error;
  }
}
