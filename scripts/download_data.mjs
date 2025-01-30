import fs from 'node:fs/promises';
import crypto from "crypto";
import fetch from "node-fetch";
import { format } from "date-fns";

import {
  sources,
  buildingPath,
} from '@/lib/data_source';

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
  const hashFile = buildingPath(resourceName, 'hash');
  const timeFile = buildingPath(resourceName, 'time');

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
    const filePath = buildingPath(resourceName, 'raw.json');

    await fs.writeFile(filePath, JSON.stringify(parsed, null, 2));
    console.log(`Data saved in ${filePath}`);
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
