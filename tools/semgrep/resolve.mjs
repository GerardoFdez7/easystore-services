import { delimiter, join } from 'node:path';

export const shouldInstallSemgrep = (env) =>
  env.NODE_ENV !== 'production' &&
  env.npm_config_production !== 'true' &&
  !(env.npm_config_omit ?? '')
    .split(',')
    .map((v) => v.trim())
    .includes('dev');

export const candidatePaths = ({
  path = '',
  pipxBinDir,
  userBase,
  platform = process.platform,
}) => {
  const executable = platform === 'win32' ? 'semgrep.exe' : 'semgrep';
  const dirs = [
    ...path.split(delimiter).filter(Boolean),
    pipxBinDir,
    userBase && join(userBase, platform === 'win32' ? 'Scripts' : 'bin'),
  ].filter(Boolean);
  return [...new Set(['semgrep', ...dirs.map((dir) => join(dir, executable))])];
};
