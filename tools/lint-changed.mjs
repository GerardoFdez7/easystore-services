import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Usage: node tools/lint-changed.mjs [--fix]
// Runs eslint and prettier over every uncommitted file (staged, unstaged, untracked).
const fix = process.argv.includes('--fix');
const PRETTIER_EXTENSIONS = /\.(js|jsx|ts|tsx|json|css|md|prisma)$/;
const ESLINT_FILES = /(\.(js|jsx|mjs|cjs|ts|tsx)|schema\.gql)$/;

const git = (args) =>
  execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean);

const files = [
  ...new Set([
    ...git(['diff', '--name-only', '--diff-filter=d', 'HEAD']),
    ...git(['ls-files', '--others', '--exclude-standard']),
  ]),
].filter(
  (file) =>
    (PRETTIER_EXTENSIONS.test(file) || ESLINT_FILES.test(file)) &&
    existsSync(file),
);

if (files.length === 0) {
  console.log('No uncommitted files to lint.');
  process.exit(0);
}

console.log(`Linting ${files.length} uncommitted file(s)...`);

const run = (args) => spawnSync('npx', args, { stdio: 'inherit' }).status ?? 1;

const eslintFiles = files.filter((file) => ESLINT_FILES.test(file));
const prettierFiles = files.filter((file) => PRETTIER_EXTENSIONS.test(file));

const eslintStatus = eslintFiles.length
  ? run([
      'eslint',
      '--no-warn-ignored',
      ...(fix ? ['--fix'] : []),
      ...eslintFiles,
    ])
  : 0;
const prettierStatus = prettierFiles.length
  ? run(['prettier', fix ? '--write' : '--check', ...prettierFiles])
  : 0;

process.exit(eslintStatus || prettierStatus);
