import { execFileSync } from 'node:child_process';
import { shouldInstallSemgrep } from './semgrep/resolve.mjs';
if (shouldInstallSemgrep(process.env))
  execFileSync(process.execPath, ['tools/semgrep/install-semgrep.mjs'], {
    stdio: 'inherit',
  });
