#!/usr/bin/env node
// Installs this skill into the skills folder of each coding agent (paths in agent-targets.mjs).
//   node scripts/install.mjs                                  agents found on this machine (auto-detect)
//   node scripts/install.mjs --target claude,codex,antigravity one or more targets, or `all`
//   node scripts/install.mjs --project [dir] --target codex    project folder (.claude/skills, .agents/skills…)
//   node scripts/install.mjs --dir <skills root>              any folder
//   node scripts/install.mjs --list                           targets, detection, installed versions
//   node scripts/install.mjs --uninstall [--target …]         remove this skill again
// Options: --force (replace an existing copy), --with-official (also copy the official lark-base-database skill where
// it is missing, e.g. Antigravity), --with-evals, --dry-run.
// Copies the skill folder as `lark-base-site-builder/`. Existing folders are replaced or removed only when their
// SKILL.md says `name: lark-base-site-builder`.
import { cpSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AGENTS, LEGACY_ROOTS, detectAgents, resolveAgent } from './agent-targets.mjs';

const NAME = 'lark-base-site-builder';
const OFFICIAL = 'lark-base-database';
const skillDir = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'));
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const value = (f) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const dryRun = flag('--dry-run');
const version = (dir) => readFileSync(join(dir, 'SKILL.md'), 'utf8').match(/^\s*version:\s*(\S+)/m)?.[1] ?? '?';
const isThisSkill = (dir) => existsSync(join(dir, 'SKILL.md')) && new RegExp(`^name:\\s*${NAME}\\s*$`, 'm').test(readFileSync(join(dir, 'SKILL.md'), 'utf8'));
const officialVersion = (dir) => {
  try { return JSON.parse(readFileSync(join(dir, 'base-database-version.json'), 'utf8')).version ?? '?'; } catch { return existsSync(join(dir, 'SKILL.md')) ? '?' : null; }
};
const cmp = (a, b) => {
  const pa = String(a).split('.').map((x) => Number.parseInt(x, 10) || 0);
  const pb = String(b).split('.').map((x) => Number.parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i += 1) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};

if (flag('--help') || flag('-h')) {
  console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

const found = detectAgents();
if (flag('--list')) {
  console.log(`${'đích'.padEnd(12)} ${'agent'.padEnd(24)} ${'có trên máy'.padEnd(12)} ${'skill này'.padEnd(10)} thư mục`);
  for (const [key, agent] of Object.entries(AGENTS)) {
    const dest = join(agent.global, NAME);
    console.log(`${key.padEnd(12)} ${agent.label.padEnd(24)} ${(found.includes(key) ? 'có' : '-').padEnd(12)} ${(isThisSkill(dest) ? `v${version(dest)}` : '-').padEnd(10)} ${agent.global}`);
  }
  console.log('\nTên khác: agents=codex, claude-code=claude, codebuddy=workbuddy, gemini-cli=gemini, github-copilot=copilot.');
  process.exit(0);
}

// Which targets
const requested = args.flatMap((a, i) => (args[i - 1] === '--target' ? a.split(',') : [])).map((t) => t.trim()).filter(Boolean);
let keys;
if (requested.includes('all')) keys = Object.keys(AGENTS);
else if (requested.length) {
  const unknown = requested.filter((t) => !resolveAgent(t));
  if (unknown.length) {
    console.error(`Không biết đích: ${unknown.join(', ')}. Dùng: ${Object.keys(AGENTS).join(', ')}, all (xem --list).`);
    process.exit(2);
  }
  keys = [...new Set(requested.map(resolveAgent))];
} else if (!flag('--dir')) {
  keys = found;
  if (!keys.length) {
    console.error('Không phát hiện agent nào trên máy. Chọn đích: --target claude|codex|antigravity|… (xem --list) hoặc --dir <thư mục>.');
    process.exit(2);
  }
  console.log(`Tự phát hiện: ${keys.map((k) => AGENTS[k].label).join(', ')}`);
} else keys = [];

// Where
const projectDir = flag('--project') ? resolve(value('--project') ?? '.') : null;
const roots = new Map(); // root -> labels
const addRoot = (root, label) => roots.set(root, [...(roots.get(root) ?? []), label]);
if (value('--dir')) addRoot(resolve(value('--dir')), '--dir');
for (const key of keys) addRoot(projectDir ? join(projectDir, AGENTS[key].project) : AGENTS[key].global, AGENTS[key].label);

// Official skill source for --with-official: the newest copy among every known folder.
let official = null;
if (flag('--with-official') && !flag('--uninstall')) {
  const candidates = [...Object.values(AGENTS).map((a) => a.global), ...Object.values(LEGACY_ROOTS)].map((r) => join(r, OFFICIAL));
  for (const dir of candidates) {
    const v = officialVersion(dir);
    if (v && (!official || cmp(v, official.version) > 0)) official = { dir, version: v };
  }
  if (!official) console.warn(`! Chưa có ${OFFICIAL} ở đâu để chép. Cài trước: npx @lark-base-open/base-database-cli@latest skill install --target all --force`);
}

const skip = new Set(['.git', '.github', 'node_modules', ...(flag('--with-evals') ? [] : ['evals'])]);
const results = [];
for (const [root, labels] of roots) {
  const dest = join(root, NAME);
  const who = labels.join(', ');
  if (resolve(dest) === skillDir) { results.push([who, dest, 'bỏ qua (đây là thư mục nguồn)']); continue; }
  if (flag('--uninstall')) {
    if (!existsSync(dest)) results.push([who, dest, 'không có']);
    else if (!isThisSkill(dest)) results.push([who, dest, 'chặn: thư mục không phải skill này']);
    else {
      if (!dryRun) rmSync(dest, { recursive: true, force: true });
      results.push([who, dest, dryRun ? 'sẽ gỡ' : 'đã gỡ']);
    }
    continue;
  }
  if (existsSync(dest)) {
    if (!isThisSkill(dest)) { results.push([who, dest, 'chặn: thư mục có sẵn không phải skill này']); continue; }
    if (!flag('--force')) { results.push([who, dest, `đã có v${version(dest)} — thêm --force để thay`]); continue; }
    if (!dryRun) rmSync(dest, { recursive: true, force: true });
  }
  if (!dryRun) cpSync(skillDir, dest, { recursive: true, filter: (src) => !skip.has(basename(src)) });
  results.push([who, dest, dryRun ? 'sẽ cài' : 'đã cài']);

  const officialDest = join(root, OFFICIAL);
  if (!officialVersion(officialDest)) {
    if (official && resolve(official.dir) !== resolve(officialDest)) {
      if (!dryRun) cpSync(official.dir, officialDest, { recursive: true });
      results.push([who, officialDest, `${dryRun ? 'sẽ chép' : 'đã chép'} ${OFFICIAL} v${official.version}`]);
    } else if (!official) {
      results.push([who, officialDest, `thiếu ${OFFICIAL} (thêm --with-official)`]);
    }
  }
}

for (const [who, dest, status] of results) console.log(`${status.padEnd(44)} ${dest}  [${who}]`);
if (!flag('--uninstall') && results.some(([, , s]) => /cài/.test(s))) {
  console.log(`\n${NAME} v${version(skillDir)}. Mở phiên mới của agent để nạp skill.`);
  console.log(`Kiểm môi trường: node "${join([...roots.keys()][0], NAME, 'scripts', 'preflight.mjs')}"`);
}
process.exit(results.some(([, , s]) => s.startsWith('chặn')) ? 1 : 0);
