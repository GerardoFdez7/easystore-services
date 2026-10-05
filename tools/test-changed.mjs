import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Usage: node tools/test-changed.mjs [extra jest args]
// Runs only the Jest tests related (via the import graph) to uncommitted
// changes: staged, unstaged and untracked source files.
const SOURCE_FILES = /^src\/.*\.(ts|tsx)$/;

const git = (args) =>
  execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);

const files = [
  ...new Set([
    ...git(['diff', '--name-only', '--diff-filter=d', 'HEAD']),
    ...git(['ls-files', '--others', '--exclude-standard']),
  ]),
].filter((file) => SOURCE_FILES.test(file) && existsSync(file));

if (files.length === 0) {
  console.log('No uncommitted source files to test.');
  process.exit(0);
}

console.log(`Running tests related to ${files.length} uncommitted file(s)...`);

const result = spawnSync(
  'npx',
  [
    'jest',
    '--passWithNoTests',
    ...process.argv.slice(2),
    '--findRelatedTests',
    ...files,
  ],
  {
    shell: process.platform === 'win32',
    stdio: 'inherit',
  },
);

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
