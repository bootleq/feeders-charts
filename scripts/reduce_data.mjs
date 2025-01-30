import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from "path";
import { spawn } from 'child_process';

import {
  sources,
  buildingPath,
} from '@/lib/data_source';

async function jqProcess(jqScript, inputFiles) {
  const files = Array.isArray(inputFiles) ? inputFiles : [inputFiles];
  const filesArg = files.length > 1 ? ['--slurp', ...files] : files;
  const process = spawn('jq', ['-f', jqScript, ...filesArg]);
  let output = '';
  let error = '';

  for await (const chunk of process.stdout) { output += chunk; }
  for await (const chunk of process.stderr) { error += chunk; }

  const exitCode = await new Promise((resolve) => process.on('close', resolve));

  if (exitCode !== 0) throw new Error(`jq error: ${error}`);

  return JSON.parse(output);
}

async function normalize( resourceName ) {
  const script = path.resolve(`scripts/${resourceName}.jq`);

  if (!fs.existsSync(script)) return false;

  console.log(`Normalize resource '${resourceName}' ...`);
  try {
    const inFile = buildingPath(resourceName, 'raw.json');
    const outFile = buildingPath(resourceName, 'json');
    const result = await jqProcess(script, inFile);
    await fsp.writeFile(outFile, JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error(`Fail normalizing ${resourceName}：`, error.message);
    throw error;
  }
}

async function combine( resourceNames ) {
  console.log('Combile resources...');

  try {
    const script = path.resolve('scripts/combine.jq');
    const inFiles = resourceNames.map(name => buildingPath(name, 'json'));
    const outFile = buildingPath('combined', 'json');
    const result = await jqProcess(script, inFiles);
    await fsp.writeFile(outFile, JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Fail combining：', error.message);
    throw error;
  }
}

(async function main() {
  const normalized = [];

  for (const [resourceName] of Object.entries(sources)) {
    const done = await normalize(resourceName);
    if (done) {
      normalized.push(resourceName);
    }
  }

  await combine(normalized);

  console.log("\nDone.");
})();
