// Dev-machine workaround for older base-database-cli builds on Node 24 / Windows (never shipped with the app).
// The CLI's isolated SDK codegen starts `node --experimental-permission ...`; Node 24 renamed that flag to
// `--permission` and rejects the old one ("bad option"), so `contracts generate` / `check` fail with
// SDK_CODEGEN_FAILED. Preload with NODE_OPTIONS="--require <this file>" to rewrite the flag for child processes.
// Also normalises path.relative() to "/" on Windows (CLI 1.5.0 artifact-path check; harmless if already fixed).
const childProcess = require('node:child_process');
const path = require('node:path');
const major = Number(process.versions.node.split('.')[0]);
if (major >= 23) {
  const rewrite = (args) =>
    Array.isArray(args) ? args.map((arg) => (arg === '--experimental-permission' ? '--permission' : arg)) : args;
  for (const name of ['execFileSync', 'execFile', 'spawn', 'spawnSync']) {
    const original = childProcess[name];
    childProcess[name] = function patched(file, args, ...rest) {
      return original.call(this, file, rewrite(args), ...rest);
    };
  }
}
if (process.platform === 'win32') {
  const original = path.relative;
  path.relative = (from, to) => original(from, to).split(path.sep).join('/');
}
require('node:module').syncBuiltinESMExports();
