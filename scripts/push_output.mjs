import os from 'os';
import path from 'path';
import fs from 'node:fs/promises';
import confirm from '@inquirer/confirm';
import { execSync, spawnSync } from "child_process";

// Sync static export output (`out` dir) to intermediate repo's `charts` dir.
// And make a commit as a version.
//
// The repo can be later fetched by feeders project, deployed as static pages
// in its sub path.

const OUT_REPO = expandHome(process.env.OUT_REPO);
const STAMP_FILE = `${OUT_REPO}/BUILD`;

function expandHome(aPath) {
  if (typeof aPath === 'string' && aPath.startsWith('~')) {
    return path.join(os.homedir(), aPath.slice(1));
  }
  return aPath;
}

async function writeMeta() {
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  const [hash, author, msg] = execSync('git log -1 --pretty=format:"%H%n%as %an%n%s"', { encoding: 'utf8' }).trim().split("\n");
  const stamp = [hash, ` [${branch}] `, author, "\n", msg].join('');
  await fs.writeFile(STAMP_FILE, stamp);
}

async function makeCommit() {
  let result;

  result = spawnSync('git', ['add', '.'], { encoding: 'utf8', cwd: OUT_REPO });
  if (result.status !== 0) {
    console.error('git add failed.');
    console.error(result.error);
    return;
  }

  const now = execSync('date +"%Y-%m-%d %H:%M:%S"', { encoding: 'utf8' }).trim();
  result = spawnSync('git', ['commit', '-m', `Auto build ${now}`], { encoding: 'utf8', cwd: OUT_REPO });
  if (result.status !== 0) {
    console.error('git commit failed.');
    console.error(result.error);
    return;
  }
}

async function main() {
  let result, cmd, yes;

  if (!OUT_REPO) {
    console.error('Variable "OUT_REPO" not set, aborted.');
    return;
  }

  result = spawnSync('diff', ['-qr', 'out', `${OUT_REPO}/charts`], { encoding: 'utf8' });
  if (result.status === 0) {
    console.log('Intermediate repo `charts/` already up to date.');
    return;
  }

  yes = await confirm({
    message: `Sync built output to ${OUT_REPO}?`,
    default: false,
  });
  if (!yes) {
    console.log('Aborted.');
    return;
  }

  console.log(`\nSync "out" assets to intermediate repo...`);
  cmd = `rsync -az --info=stats2 --delete --delete-excluded --prune-empty-dirs out/ ${OUT_REPO}/charts`;
  execSync(cmd, { stdio: 'inherit' });

  await writeMeta();
  await makeCommit();

  console.log("\nDone");
}

await main();
