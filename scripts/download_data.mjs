import fs from 'node:fs/promises';
import crypto from "crypto";
import fetch from "node-fetch";
import { format } from "date-fns";

import {
  sources,
  downloadPath,
} from '@/lib/data_source';

async function calculateHash(content) {
  if (content instanceof ArrayBuffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", content);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } else {
    return crypto.createHash("sha256").update(content).digest("hex");
  }
}

async function fetchData(url, extname) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  if (extname === 'json') {
    return response.text();
  } else {
    return response.arrayBuffer();
  }
}

async function writeTimestamp(filePath) {
  const now = new Date();
  const text = format(now, "yyyyMMdd_HHmm");
  await fs.writeFile(filePath, text);
}

async function checkForUpdate(resourceName, remoteData) {
  const remoteHash = await calculateHash(remoteData);
  const hashFile = downloadPath(resourceName, 'hash');
  const timeFile = downloadPath(resourceName, 'time');

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

async function saveData(resourceName, data, extname) {
  try {
    const filePath = downloadPath(resourceName, `raw.${extname}`);

    switch (extname) {
      case 'json':
        const parsed = JSON.parse(data); // ensure JSON format
        await fs.writeFile(filePath, JSON.stringify(parsed, null, 2));
        break;
      case 'xlsx':
      case 'xls':
      case 'ods':
        const buffer = Buffer.from(data);
        await fs.writeFile(filePath, buffer);
        break;

      default:
        throw new Error(`Unexpected extname ${extname}`);
        break;
    }

    console.log(`Data saved in ${filePath}`);
  } catch (error) {
    console.error(`Fail saving resource for ${resourceName}：`, error.message);
    throw error;
  }
}

async function download(resourceName, title) {
  console.log(`Download resource from ${title} (${resourceName}) ...`);

  try {
    const { name, url, extname } = sources[resourceName];
    const remoteData = await fetchData(url, extname);
    const needsUpdate = await checkForUpdate(name, remoteData);

    if (needsUpdate) {
      await saveData(name, remoteData, extname);
      return true;
    }
  } catch (error) {
    console.error("Error：", error.message);
  }

  return false;
}

(async function main() {
  for (const [resourceName, { title, url }] of Object.entries(sources)) {
    if (!url) {
      continue;
    }
    await download(resourceName, title);
  }

  console.log("\nDone.");
})();
