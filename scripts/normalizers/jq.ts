import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from "path";
import { jqProcess } from '../utils';
import { downloadPath, buildingPath } from '@/lib/data_source';

export async function normalizeByJq(resourceName: string) {
  const script = path.resolve(`scripts/${resourceName}.jq`);

  if (!fs.existsSync(script)) {
    throw new Error(`Normalizer requires jq script: ${script}.`);
  }

  console.log(`Normalize resource '${resourceName}' ...`);
  try {
    const inFile = downloadPath(resourceName, 'raw.json');
    const outFile = buildingPath(resourceName, 'json');
    const result = await jqProcess(script, inFile);
    await fsp.writeFile(outFile, JSON.stringify(result, null, 2));
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Fail normalizing ${resourceName}：`, error.message);
    }
    throw error;
  }
}
