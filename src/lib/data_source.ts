import * as R from 'ramda';
import fs from "fs";
import fsp from 'node:fs/promises';
import path from "path";
import crypto from 'crypto';

export const DATA_DIR = 'data';

const jsonMetaReviver = (key: string, value: any) => {
  if (key === 'sourceCheckedAt' && typeof value === 'string') {
    return new Date(value);
  }

  return value;
};

const shelter_reports_table = [
  // NOTE: 107 年之後改用「動物收容統計表（詳表）」資料，這邊不採用
  // [113, '113年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/250117114614324698T87CD.xlsx'],
  // [112, '112年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2402191131342031173DCLA.xlsx'],
  // [111, '111年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2304270146565611513V5GC2JATE.xlsx'],
  // [110, '110年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/220315063424098101XYJV5.xls'],
  // [109,   '109年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/210513043948020470N5CB8.xls'],
  // [108,   '108年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200215115223422925LT732.ods'],
  [107,   '107年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/download/resources/A20190100004_exl.xlsx'],
  [106,   '106年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/download/resources/A20170700007_exl.xlsx'],
  [105,   '105年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/1912170324497935458R4FW.xlsx'],
  [104,   '104年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/191217032334835687JFPVG.xlsx'],
  [103,   '103年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/1912170322142536496NFME.xlsx'],
  [102,   '102年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/191219102621856549UFLL6.xlsx'],
  [101,   '101年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200102112119455694TXAHC.xlsx'],
  [100,   '100年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200102112001361784JQJW1.xlsx'],
  [ 99,    '99年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2001021116496582852GF9V.xlsx'],
  [ 98,    '98年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200102111608251945H65FM.xlsx'],
  [ 97,    '97年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2001021115231581118SZFC.xlsx'],
] as const;

const shelter_reports = shelter_reports_table.reduce((acc, [year, title, url]) => {
  const name = `shelter_reports_${year}`;
  return {
    ...acc,
    ...{
      [name]: {
        title,
          docUrl: 'https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3',
          name,
          url,
          extname: path.extname(url).replace(/^\./, ''),
          normalizer: 'shelter_xlsx',
      },
    }};
}, {});

type Sources = Record<string, {
  title: string,
  docUrl: string,
  name: string,
  url?: string,
  extname: string,
  normalizer?: string,
}>;

// NOTE: Not all data were defined in `sources`, see README for full resource list.
export const sources: Sources = {
  population: {
    title: '年度犬貓統計表',
    docUrl: 'https://data.gov.tw/dataset/41771',
    name: 'population',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=ccezNvv4oYbO',
    extname: 'json',
    normalizer: 'population_jq',
  },
  ...shelter_reports,
}

export const unusedSources = {
  shelter: {
    title: '全國公立動物收容所收容處理情形統計表',
    docUrl: 'https://data.gov.tw/dataset/41236',
    name: 'shelter',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=DyplMIk3U1hf',
    extname: 'json',
    normalizer: 'jq',
  },
  shelter_details: {
    title: '全國公立動物收容所收容處理情形統計表(細項)',
    docUrl: 'https://data.gov.tw/dataset/73396',
    name: 'shelter_details',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=p9yPwrCs2OtC',
    extname: 'json',
    normalizer: 'jq',
  },
}

export function downloadPath(resourceName: string, extension: string) {
  return path.resolve(`${DATA_DIR}/download/${resourceName}.${extension}`);
}

export function buildingPath(resourceName: string, extension: string) {
  return path.resolve(`${DATA_DIR}/build/${resourceName}.${extension}`);
}

async function calculateHash(content: string|ArrayBuffer) {
  if (content instanceof ArrayBuffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", content);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } else {
    return crypto.createHash("sha256").update(content).digest("hex");
  }
}

export async function checkUpdateHash(hashFileBasename: string, newContent: string|ArrayBuffer) {
  const hashFile = path.resolve(`${DATA_DIR}/hash/${hashFileBasename}.hash`);
  const newHash = await calculateHash(newContent);
  try {
    const localHash = await fsp.readFile(hashFile, 'utf-8');
    if (localHash === newHash) {
      return false;
    }
  } catch {
    // local hash not found, let's just download new data
  }
  await fsp.writeFile(hashFile, newHash);
  return true;
}

async function metaFilePath() {
  const metaFile = path.resolve(`${DATA_DIR}/meta.json`);
  if (!fs.existsSync(metaFile)) {
    await fsp.writeFile(metaFile, '{}');
  }
  return metaFile;
}

export async function readMeta(metaPath: string[]) {
  const metaFile = await metaFilePath();
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'), jsonMetaReviver);

  return R.path(metaPath, meta);
}

export async function writeMeta(metaPath: string[], value: string|number) {
  const metaFile = await metaFilePath();
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
  const newMeta = R.assocPath(metaPath, value, meta);

  await fsp.writeFile(metaFile, JSON.stringify(newMeta, null, 2));
}

export async function readSourceTime(resourceName: string) {
  return await readMeta([resourceName, 'sourceCheckedAt']);
}

export async function writeSourceTime(resourceName: string, givenTime?: Date) {
  const time = givenTime || new Date();
  await writeMeta([resourceName, 'sourceCheckedAt'], time.toJSON());
}
