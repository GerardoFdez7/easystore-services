const { readFileSync } = require('node:fs');
const { dirname, join, resolve } = require('node:path');
const { spawn } = require('node:child_process');

const envFilePath = resolve(__dirname, '..', '.env');
const envFile = readFileSync(envFilePath, 'utf8');
const match = envFile.match(/^\s*DATABASE_URL_POSTGRES\s*=\s*(.*)\s*$/m);

if (!match || match[1].trim() === '') {
  throw new Error(`DATABASE_URL_POSTGRES is missing in ${envFilePath}`);
}

const rawValue = match[1].trim();
const databaseUrl = rawValue.replace(/^(['"])(.*)\1$/, '$2');
const npxEntryPoint = process.platform === 'win32'
  ? join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npx-cli.js')
  : 'npx';
const child = spawn(
  process.platform === 'win32' ? process.execPath : npxEntryPoint,
  process.platform === 'win32'
    ? [npxEntryPoint, '--quiet', '-y', '@modelcontextprotocol/server-postgres', databaseUrl]
    : ['--quiet', '-y', '@modelcontextprotocol/server-postgres', databaseUrl],
  {
    env: { ...process.env, DATABASE_URL_POSTGRES: databaseUrl },
    stdio: 'inherit',
  },
);

child.on('error', (error) => {
  process.stderr.write(`Unable to start PostgreSQL MCP: ${error.message}\n`);
  process.exitCode = 1;
});

child.on('close', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
