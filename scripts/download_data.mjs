import fs from 'node:fs/promises';
import fetch from "node-fetch";
import chalk from 'chalk';

import {
  downloadableSources,
  downloadPath,
  checkUpdateHash,
  writeSourceTime,
} from './data_source';

async function fetchData(url, extname) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  if (extname === 'json') {
    return response.text();
  } else {
    return response.arrayBuffer();
  }
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
    const { name, url, extname } = downloadableSources[resourceName];
    const remoteData = await fetchData(url, extname);
    const needsUpdate = await checkUpdateHash(resourceName, remoteData);

    if (needsUpdate) {
      await saveData(name, remoteData, extname);
      await writeSourceTime(resourceName);
    } else {
      console.log(`Remote data for '${resourceName}' has no change.`);

      if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
        console.log(chalk.yellow.bold('but still save data per request ') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
        await saveData(name, remoteData, extname);
      }
    }
  } catch (error) {
    console.error("Error：", error.message);
  }
}

(async function main() {
  for (const [resourceName, { title, url }] of Object.entries(downloadableSources)) {
    if (!url) {
      continue;
    }
    await download(resourceName, title);
  }

  console.log("\nDone.");
})();
