import { spawn } from 'child_process';

export async function jqProcess(jqScript: string, inputFiles: string|Array<string>) {
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
