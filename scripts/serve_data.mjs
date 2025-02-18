import fs from 'node:fs';
import chalk from 'chalk';

(async function main() {
  console.log(`Copy ${chalk.yellow('combined.json')} and ${chalk.yellow('meta.json')} to "public" folder...`);
  fs.copyFileSync('data/combined.json', 'public/combined.json');
  fs.copyFileSync('data/meta.json', 'public/meta.json');

  console.log("\nDone.");
})();
