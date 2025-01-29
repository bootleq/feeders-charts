import fs from 'node:fs/promises';
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";
import { format } from "date-fns";

const BUILD_DIR = 'scripts/build';

const sources = {
  population: {
    title: '年度犬貓統計表',
    docUrl: 'https://data.gov.tw/dataset/41771',
    name: 'population',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=ccezNvv4oYbO',
  },
  shelter: {
    title: '全國公立動物收容所收容處理情形統計表(細項)',
    docUrl: 'https://data.gov.tw/dataset/73396',
    name: 'shelter',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=p9yPwrCs2OtC',
  },
}

async function calculateHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return response.text();
}

async function writeTimestamp(filePath) {
  const now = new Date();
  const text = format(now, "yyyyMMdd_HHmm");
  await fs.writeFile(filePath, text);
}

async function checkForUpdate(resourceName, remoteData) {
  const remoteHash = await calculateHash(remoteData);
  const hashFile = path.resolve(`${BUILD_DIR}/${resourceName}.hash`)
  const timeFile = path.resolve(`${BUILD_DIR}/${resourceName}.time`)

  try {
    const localHash = await fs.readFile(hashFile, "utf-8");
    if (localHash === remoteHash) {
      console.log(`Remote data for '${resourceName}' has no change.`);
      return false;
    }
  } catch {
    // local hash not found, let's just download new data
  }

  await fs.writeFile(hashFile, remoteHash);
  await writeTimestamp(timeFile);
  return true;
}

async function saveData(resourceName, data) {
  try {
    const parsed = JSON.parse(data); // ensure JSON format
    const filePath = path.resolve(`${BUILD_DIR}/${resourceName}.json`)

    await fs.writeFile(filePath, JSON.stringify(parsed, null, 2));
    console.log(`Resource data saved in ${filePath}`);
  } catch (error) {
    console.error(`Fail saving resource for ${resourceName}：`, error.message);
    throw error;
  }
}

async function download(resourceName, title) {
  console.log(`Download resource from ${title} (${resourceName}) ...`);

  try {
    const { name, url } = sources[resourceName];
    const remoteData = await fetchData(url);
    const needsUpdate = await checkForUpdate(name, remoteData);

    if (needsUpdate) {
      await saveData(name, remoteData);
    }
  } catch (error) {
    console.error("Error：", error.message);
  }

  console.log('');
}

(async function main() {
  for (const [resourceName, { title }] of Object.entries(sources)) {
    await download(resourceName, title);
  }

  console.log("\nDone.");
})();
