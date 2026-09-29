import { delimiter, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { candidatePaths } from './resolve.mjs';
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
const dir = mkdtempSync(join(tmpdir(), 'easystore-services-semgrep-'));
const env = {
  ...process.env,
  SEMGREP_SETTINGS_FILE: join(dir, 'settings.yml'),
  SEMGREP_LOG_FILE: join(dir, 'semgrep.log'),
  SEMGREP_SEND_METRICS: 'off',
  SEMGREP_ENABLE_VERSION_CHECK: '0',
  XDG_CACHE_HOME: join(dir, 'cache'),
  XDG_CONFIG_HOME: join(dir, 'config'),
  XDG_DATA_HOME: join(dir, 'data'),
};
writeFileSync(
  env.SEMGREP_SETTINGS_FILE,
  'has_shown_metrics_notification: true\nanonymous_user_id: 00000000-0000-4000-8000-000000000000\n',
);
for (const name of ['cache', 'config', 'data']) mkdirSync(join(dir, name));

const probe = (command, args) =>
  spawnSync(command, args, { env, stdio: 'ignore' });
const candidates = candidatePaths({ path: process.env.PATH });
const pipx = spawnSync('pipx', ['environment', '--value', 'PIPX_BIN_DIR'], {
  env,
  stdio: 'pipe',
  encoding: 'utf8',
});
if (pipx.status === 0) candidates.push(join(pipx.stdout.trim(), 'semgrep'));
for (const python of ['python3', 'python']) {
  const base = spawnSync(python, ['-m', 'site', '--user-base'], {
    stdio: 'pipe',
    env,
    encoding: 'utf8',
  });
  if (base.status === 0)
    candidates.push(join(base.stdout.trim(), 'bin', 'semgrep'));
}
const executable = candidates.find(
  (candidate) => probe(candidate, ['--version']).status === 0,
);
if (!executable)
  throw new Error(
    'Semgrep is not available. Run `npm run install:semgrep` or provide it on PATH.',
  );
const result = spawnSync(executable, process.argv.slice(2), {
  env,
  stdio: 'inherit',
});
if (result.error) throw result.error;
rmSync(dir, { recursive: true, force: true });
process.exit(result.status ?? 1);
