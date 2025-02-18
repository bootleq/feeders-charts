import * as R from 'ramda';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import * as XLSX from 'xlsx';

import { CITY_MAPPING, LEGACY_CITY_MAPPING } from '@/lib/model';
import { sources, downloadPath, buildingPath } from '../data_source';

type ExcelRow = Record<string, string|number>;

const PARSED_ROW_KEYS = [
  'city',
  'year',
  'accept',
  'adopt',
  'kill',
  'die',
] as const;

type ParsedRow = {
  city: string,     // 縣市代碼
  year: number,     // 年度
  accept: number,   // 收容
  adopt: number,    // 認領
  kill: number,     // 人道處理
  die: number,      // 所內死亡
};

const FIELDS_MAP = {
  cityName: '縣市別',
  accept: '收容隻數',
  adopt: '認養隻數',
  kill: '依法人道處理數',
  die: '所內死亡數',
};

const cityCodeMapping = new Map(Object.entries(CITY_MAPPING).map(([code, name]) => [name, code]));
const legacyCityCodeMapping = new Map(Object.entries(LEGACY_CITY_MAPPING).map(([code, name]) => [name, code]));

function validate(items: ParsedRow[], year: number) {
  // Check 1, expect 22 cities
  if (items.length !== 22) {
    const cities = R.pluck('city', items);
    const missing = R.difference(Object.keys(CITY_MAPPING), cities);
    throw new Error(`Validation failed, expected 22 cities, missing ${JSON.stringify(missing)}`);
    // throw new Error(`Validation failed, expected 22 cities, missing ${JSON.stringify(missing)}`);
  }

  // Check 2, expect each key at least appear once in final data
  let targets = new Set(PARSED_ROW_KEYS);
  if (year <= 102) {
    targets.delete('die'); // 舊資料沒有統計所內死亡
  }

  for (let idx = 0; idx < items.length; idx++) {
    if (targets.size === 0) {
      return true;
    }

    const item = items[idx];
    const itemKeys = new Set(Object.keys(item));
    targets = new Set([...targets].filter(x => !itemKeys.has(x)));
  }

  throw new Error(`Validation failed, can't find ${JSON.stringify(Array.from(targets))} in year ${year}`);
}

export async function normalizeShelterXLSX(resourceName: string) {
  const { name, extname } = sources[resourceName];
  const inFile = downloadPath(name, `raw.${extname}`);
  const outFile = buildingPath(name, 'json');
  const year = Number(name.match(/_(\d+)$/)?.pop());
  let items;

  if (R.type(year) !== 'Number' && year > 0) {
    throw new Error(`Normalizer requires resourceName ending with digits (year), got ${resourceName}.`);
  }

  if (!fs.existsSync(inFile)) {
    throw new Error(`Missing file: ${inFile}`);
  }

  console.log(`Normalize resource '${name}' ...`);

  try {
    const wb = XLSX.readFile(inFile);
    const ws = wb.Sheets[wb.SheetNames[0]];
    items = XLSX.utils.sheet_to_json(ws, {
      range: 1,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Fail reading XLSX ${inFile}：`, error.message);
    }
    throw error;
  }

  items = (items as ExcelRow[]).reduce((acc: ParsedRow[], obj: ExcelRow) => {
    const cityName = obj[FIELDS_MAP['cityName']]?.toString()?.replace(/^\d+\.\s*/, '');
    const city = cityCodeMapping.get(cityName) || legacyCityCodeMapping.get(cityName);

    if (city) {
      const pairs = R.toPairs(FIELDS_MAP).reduce<[string, string | number][]>((memo, [key, fieldName]) => {
        if (key !== 'cityName') {
          const value = Object.keys(obj).includes(fieldName) ?
            obj[fieldName] :
            Object.entries(obj).find(([k]) => {
              if (k.startsWith(fieldName)) { // 特例，欄位名稱有多餘的換行等字元
                return true;
              } else if (key === 'kill') {
                if (
                  k === '依法' ||            // 特例，109 年 xls 欄位合併兩列造成的問題
                  k.startsWith('人道處理數') // 特例，100 年 xls 欄位名稱不同
                ) {
                  return true;
                }
              } else if (key === 'adopt' && k.startsWith('認領養數')) { // 特例，100 年欄位名稱不同
                return true;
              }
            })?.pop();

          if (value) {
            memo.push([key, value]);
          }
        }
        return memo;
      }, []);

      const item = {
        city,
        year,
        ...(R.fromPairs(pairs)),
      } as ParsedRow;
      acc.push(item);
    }

    return acc;
  }, []);

  validate(items, year);

  console.log(`Write file to ${outFile}...`);
  await fsp.writeFile(outFile, JSON.stringify(items, null, 2));
}
