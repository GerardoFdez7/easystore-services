import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { candidatePaths } from './resolve.mjs';
const isolatedDir = mkdtempSync(join(tmpdir(), 'easystore-services-semgrep-'));
const settings = join(isolatedDir, 'settings.yml');
writeFileSync(
  settings,
  'has_shown_metrics_notification: true\nanonymous_user_id: 00000000-0000-4000-8000-000000000000\n',
);
for (const name of ['cache', 'config', 'data'])
  mkdirSync(join(isolatedDir, name));
const env = {
  ...process.env,
  SEMGREP_SETTINGS_FILE: settings,
  SEMGREP_LOG_FILE: join(isolatedDir, 'semgrep.log'),
  SEMGREP_SEND_METRICS: 'off',
  SEMGREP_ENABLE_VERSION_CHECK: '0',
  XDG_CACHE_HOME: join(isolatedDir, 'cache'),
  XDG_CONFIG_HOME: join(isolatedDir, 'config'),
  XDG_DATA_HOME: join(isolatedDir, 'data'),
};
const run = (command, args, options = {}) =>
  spawnSync(command, args, {
    env,
    timeout: 10000,
    stdio: options.stdio ?? 'ignore',
    shell: false,
    encoding: 'utf8',
  });
const available = (command) => run(command, ['--version']).status === 0;
const candidates = new Set(candidatePaths({ path: process.env.PATH }));
const addCandidate = (value) => {
  if (value)
    candidates.add(
      join(
        value.trim(),
        process.platform === 'win32' ? 'semgrep.exe' : 'semgrep',
      ),
    );
};
const findSemgrep = () => {
  for (const candidate of ['semgrep', ...candidates])
    if (run(candidate, ['--version']).status === 0) return candidate;
  return null;
};
if (findSemgrep()) {
  rmSync(isolatedDir, { recursive: true, force: true });
  process.exit(0);
}
if (available('pipx')) {
  const result = run('pipx', ['install', 'semgrep'], { stdio: 'inherit' });
  addCandidate(run('pipx', ['environment', '--value', 'PIPX_BIN_DIR']).stdout);
  if (result.status === 0 && findSemgrep()) {
    rmSync(isolatedDir, { recursive: true, force: true });
    process.exit(0);
  }
}
const pythonCommands =
  process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];
for (const command of pythonCommands) {
  if (!available(command)) continue;
  const baseResult = run(command, ['-m', 'site', '--user-base'], {
    stdio: 'pipe',
  });
  const base = (baseResult.stdout ?? '').trim();
  if (process.platform !== 'win32' && base) addCandidate(join(base, 'bin'));
  const result = run(command, ['-m', 'pip', 'install', '--user', 'semgrep'], {
    stdio: 'inherit',
  });
  if (result.status === 0 && findSemgrep()) {
    rmSync(isolatedDir, { recursive: true, force: true });
    process.exit(0);
  }
}
process.stderr.write(
  'Unable to install Semgrep. Install pipx or provide Semgrep on PATH, then run `npm run install:semgrep` again.\n',
);
rmSync(isolatedDir, { recursive: true, force: true });
process.exit(1);
