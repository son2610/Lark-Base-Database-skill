#!/usr/bin/env node
// Read-only environment check for lark-base-site-builder. Installs nothing, prints no secrets.
//   node scripts/preflight.mjs [--json]
// Checks: Node version, lark-cli (path, version, login, brand, Base Database scopes), base-database-cli (global or npx),
// official lark-base-database skill copies and their versions vs platform-baseline.json, Git Bash, Playwright.
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENTS, LEGACY_ROOTS } from './agent-targets.mjs';

const skillDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseline = JSON.parse(readFileSync(join(skillDir, 'platform-baseline.json'), 'utf8'));
const baselineCli = baseline.packages['@lark-base-open/base-database-cli'].version;
const asJson = process.argv.includes('--json');
const checks = [];
const add = (name, status, detail, fix) => checks.push({ name, status, detail, ...(fix ? { fix } : {}) });

export function cmpVersion(a, b) {
  const pa = String(a).split(/[.-]/).map((x) => Number.parseInt(x, 10) || 0);
  const pb = String(b).split(/[.-]/).map((x) => Number.parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i += 1) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
}
const quiet = (cmd) => { try { return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20000 }).trim(); } catch { return null; } };

// Node
const node = process.versions.node;
const nodeMajor = Number(node.split('.')[0]);
if (nodeMajor >= 22) add('Node.js', 'ok', `v${node}`);
else if (cmpVersion(node, '20.19.0') >= 0) add('Node.js', 'warn', `v${node} — chỉ đủ cho dự án classic cũ`, 'Cài Node.js 22+ để tạo workspace mới (init yêu cầu Node 22).');
else add('Node.js', 'fail', `v${node}`, 'Cài Node.js 22 trở lên.');

// lark-cli
const npmRoot = quiet('npm root -g');
let lark = process.env.LARK_CLI ?? null;
if (!lark && npmRoot) {
  const native = join(npmRoot, '@larksuite', 'cli', 'bin', process.platform === 'win32' ? 'lark-cli.exe' : 'lark-cli');
  if (existsSync(native)) lark = native;
}
const runLark = (args) => {
  try {
    return execFileSync(lark ?? 'lark-cli', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000, shell: !lark && process.platform === 'win32' });
  } catch (error) {
    return error.stdout ? String(error.stdout) : null;
  }
};
const larkVersion = runLark(['--version'])?.match(/(\d+\.\d+\.\d+)/)?.[1];
if (!larkVersion) {
  add('lark-cli', 'fail', 'không tìm thấy', 'npx @larksuite/cli@latest install, rồi lark-cli config init và lark-cli auth login');
} else {
  add('lark-cli', 'ok', `v${larkVersion}${lark ? ` (${lark})` : ''}`);
  let status = null;
  try { status = JSON.parse(runLark(['auth', 'status']) ?? 'null'); } catch { status = null; }
  if (!status) {
    add('Đăng nhập Lark', 'warn', 'không đọc được auth status', 'lark-cli auth login');
  } else {
    const user = status.identities?.user;
    const scopes = String(user?.scope ?? '');
    const appmode = ['base:appmode:read', 'base:appmode:create', 'base:appmode:update'].filter((s) => !scopes.includes(s));
    if (!user?.available) add('Đăng nhập Lark', 'fail', 'chưa có danh tính người dùng', 'lark-cli auth login');
    else add('Đăng nhập Lark', user.status === 'ready' || user.status === 'needs_refresh' ? 'ok' : 'warn', `${user.userName ?? 'user'} · brand ${status.brand ?? '?'} · ${user.status}`);
    if (user?.available) {
      if (appmode.length) add('Scope Base Database', 'warn', `thiếu ${appmode.join(', ')}`, 'base-database-cli auth login (cùng profile)');
      else add('Scope Base Database', 'ok', 'base:appmode:read/create/update');
    }
  }
}

// base-database-cli
const globalPkg = npmRoot ? join(npmRoot, '@lark-base-open', 'base-database-cli', 'package.json') : null;
const globalCli = globalPkg && existsSync(globalPkg) ? JSON.parse(readFileSync(globalPkg, 'utf8')).version : null;
if (globalCli) {
  const diff = cmpVersion(globalCli, baselineCli);
  add('base-database-cli', diff < 0 ? 'warn' : 'ok', `toàn cục v${globalCli} (baseline skill: ${baselineCli})`,
    diff < 0 ? `base-database-cli update --version ${baselineCli} --yes (cần người dùng đồng ý)` : diff > 0 ? 'CLI mới hơn baseline — xem references/09-maintaining.md (quy trình A)' : undefined);
} else {
  add('base-database-cli', 'warn', 'chưa cài toàn cục — sẽ dùng npx', `npx @lark-base-open/base-database-cli@${baselineCli} install --target claude`);
}

// Official skill copies (every agent folder, plus legacy ones the official installer still writes)
const roots = { ...Object.fromEntries(Object.entries(AGENTS).map(([key, agent]) => [key, agent.global])), ...LEGACY_ROOTS };
const copies = [];
for (const [target, root] of Object.entries(roots)) {
  const dir = join(root, 'lark-base-database');
  if (!existsSync(join(dir, 'SKILL.md'))) continue;
  let version = null;
  try { version = JSON.parse(readFileSync(join(dir, 'base-database-version.json'), 'utf8')).version; } catch { version = null; }
  copies.push(`${target}=${version ?? '?'}`);
  if (version && cmpVersion(version, baselineCli) < 0) {
    add(`Skill chính thức (${target})`, 'warn', `v${version} cũ hơn baseline ${baselineCli}`, 'base-database-cli update --version <mới nhất> --yes, hoặc skill install --target <đích> --force');
  }
}
if (!copies.length) add('Skill chính thức', 'fail', 'chưa cài lark-base-database', 'npx @lark-base-open/base-database-cli@latest skill install --target all --force (Antigravity, Gemini, Cursor…: chạy thêm node scripts/install.mjs --with-official)');
else add('Skill chính thức', 'ok', copies.join(', '));

// Environment hints
if (process.env.MSYSTEM) add('Git Bash', 'info', `MSYSTEM=${process.env.MSYSTEM}`, 'Đặt MSYS_NO_PATHCONV=1 khi gọi lark-cli api /open-apis/... (công cụ dự án tự đặt)');
let playwright = null;
try { playwright = await import('playwright'); } catch { playwright = null; }
if (!playwright && npmRoot && existsSync(join(npmRoot, '@playwright', 'cli', 'node_modules', 'playwright'))) playwright = 'global @playwright/cli';
add('Playwright (tùy chọn)', playwright ? 'ok' : 'info', playwright ? (typeof playwright === 'string' ? `có (${playwright}; đặt PW_PATH=${join(npmRoot, '@playwright', 'cli', 'node_modules', 'playwright')})` : 'có') : 'không có — harness chụp màn hình cần nó', playwright ? undefined : 'npm i -D playwright && npx playwright install chromium (trong dự án app)');

const summary = {
  ok: !checks.some((c) => c.status === 'fail'),
  baseline: { cli: baselineCli, sdk: baseline.packages['@lark-base-open/base-database-app-sdk'].version, verifiedOn: baseline.verifiedOn },
  checks,
};
if (asJson) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  const icon = { ok: '✔', warn: '!', fail: '✘', info: '·' };
  for (const c of checks) console.log(`${icon[c.status]} ${c.name.padEnd(26)} ${c.detail}${c.fix ? `\n    → ${c.fix}` : ''}`);
  console.log(`\n${summary.ok ? 'Sẵn sàng' : 'Cần xử lý mục ✘ trước khi dựng'} (baseline CLI ${baselineCli}, SDK ${summary.baseline.sdk}, ${baseline.verifiedOn})`);
}
