import assert from 'node:assert/strict';
import test from 'node:test';
import { candidatePaths, shouldInstallSemgrep } from './resolve.mjs';
test('resolves spaced PATH, pipx, and python user base on Linux/macOS', () => {
  for (const platform of ['linux', 'darwin']) {
    const paths = candidatePaths({
      path: '/tmp/with spaces',
      pipxBinDir: '/tmp/pipx bin',
      userBase: '/tmp/python base',
      platform,
    });
    assert.ok(paths.includes('/tmp/with spaces/semgrep'));
    assert.ok(paths.includes('/tmp/pipx bin/semgrep'));
    assert.ok(paths.includes('/tmp/python base/bin/semgrep'));
  }
});
test('postinstall skips production and omitted dev dependencies', () => {
  assert.equal(shouldInstallSemgrep({}), true);
  assert.equal(shouldInstallSemgrep({ NODE_ENV: 'production' }), false);
  assert.equal(shouldInstallSemgrep({ npm_config_production: 'true' }), false);
  assert.equal(
    shouldInstallSemgrep({ npm_config_omit: 'optional,dev' }),
    false,
  );
});
