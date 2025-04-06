import { spawn } from 'child_process';
import { diff } from 'jest-diff';

export async function jqProcess(jqScript: string, inputFiles: string|Array<string>) {
  const files = Array.isArray(inputFiles) ? inputFiles : [inputFiles];
  const filesArg = files.length > 1 ? ['--slurp', ...files] : files;
  const process = spawn('jq', ['-f', jqScript, ...filesArg]);

  process.stdout.setEncoding('utf-8');
  process.stderr.setEncoding('utf-8');

  let output = '';
  let error = '';

  for await (const chunk of process.stdout) { output += chunk; }
  for await (const chunk of process.stderr) { error += chunk; }

  const exitCode = await new Promise((resolve) => process.on('close', resolve));

  if (exitCode !== 0) throw new Error(`jq error: ${error}`);

  return JSON.parse(output);
}

type Sample = Record<string, string|number>;

function diffSample(sample: Sample, data: Record<string, any>[]) {
  const { year, city } = sample;
  const target = data.find(obj => {
    return obj.year === year && obj.city === city;
  });

  if (target) {
    const difference = diff(sample, target);
    console.log("\n", difference);
  }
}

export function testSamplesExist(samples: Sample[], data: Record<string, any>[]) {
  return samples.every(sample => {
    const found = data.find(obj => {
      return Object.entries(sample).every(([k, v]) => obj[k] === v);
    });

    if (!found) {
      console.error('validation failed, missing data:', sample);
      // Try print difference for certain year/city
      diffSample(sample, data);

      return false;
    }

    return true;
  });
}
