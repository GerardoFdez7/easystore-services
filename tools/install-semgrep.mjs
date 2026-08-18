import { spawnSync } from 'node:child_process';

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  process.exit(0);
}

const run = (command, args) =>
  spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

const isAvailable = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'ignore', shell: process.platform === 'win32' });
  return result.status === 0;
};

if (isAvailable('semgrep', ['--version'])) {
  process.exit(0);
}

if (isAvailable('pipx', ['--version'])) {
  const result = run('pipx', ['install', 'semgrep']);
  if (result.status === 0 && isAvailable('semgrep', ['--version'])) {
    process.exit(0);
  }
}

const pythonCommands = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];

for (const command of pythonCommands) {
  if (!isAvailable(command, ['--version'])) {
    continue;
  }

  const result = run(command, ['-m', 'pip', 'install', '--user', 'semgrep']);
  if (result.status === 0 && isAvailable('semgrep', ['--version'])) {
    process.exit(0);
  }
}

process.stderr.write(
  'Unable to install Semgrep. Install Python or pipx, then run `npm run install:semgrep` again.\n',
);
process.exit(1);
