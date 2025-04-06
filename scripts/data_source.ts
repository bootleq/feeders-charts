import * as R from 'ramda';
import fs from "fs";
import fsp from 'node:fs/promises';
import path from "path";
import crypto from 'crypto';
import { shelter_reports_table, jsonMetaReviver } from '@/lib/resource';

export const DATA_DIR = 'data';

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

export const downloadableSources: Sources = {
  population: {
    title: '年度犬貓統計表',
    docUrl: 'https://data.gov.tw/dataset/41771',
    name: 'population',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=ccezNvv4oYbO',
    extname: 'json',
    normalizer: 'population_jq',
  },
  ...shelter_reports,
  shelter_details: {
    title: '全國公立動物收容所收容處理情形統計表(細項)',
    docUrl: 'https://data.gov.tw/dataset/73396',
    name: 'shelter_details',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=p9yPwrCs2OtC',
    extname: 'json',
    normalizer: 'jq',
  },
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

type MetaScope = '' | 'tainan';

async function metaFilePath(scope: MetaScope) {
  if (!['', 'tainan'].includes(scope)) {
    throw new Error(`Unexpected scope '${scope}'`);
  }
  const metaFile = path.resolve(`${DATA_DIR}/${scope ? `${scope}.` : ''}meta.json`);
  if (!fs.existsSync(metaFile)) {
    await fsp.writeFile(metaFile, '{}');
  }
  return metaFile;
}

export async function readMeta(scope: MetaScope, metaPath: string[]) {
  const metaFile = await metaFilePath(scope);
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'), jsonMetaReviver);

  return R.path(metaPath, meta);
}

export async function writeMeta(scope: MetaScope, metaPath: string[], value: string|number) {
  const metaFile = await metaFilePath(scope);
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'));
  const newMeta = R.assocPath(metaPath, value, meta);

  await fsp.writeFile(metaFile, JSON.stringify(newMeta, null, 2));
}

export async function readSourceTime(resourceName: string) {
  const scope = resourceName.startsWith('tainan_tnvr_report') ? 'tainan' : '';
  return await readMeta(scope, [resourceName, 'sourceCheckedAt']);
}

export async function writeSourceTime(resourceName: string, givenTime?: Date) {
  const time = givenTime || new Date();
  const scope = resourceName.startsWith('tainan_tnvr_report') ? 'tainan' : '';
  await writeMeta(scope, [resourceName, 'sourceCheckedAt'], time.toJSON());
}
