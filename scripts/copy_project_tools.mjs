#!/usr/bin/env node
// Copies the dev toolkit, page starter libs and a style preset into a Base Database app project.
//   node scripts/copy_project_tools.mjs <appDir> [--preset warm-gray] [--force] [--no-page-lib] [--dry-run]
// Never overwrites existing files unless --force. Prints what was copied and what was kept.
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'));
const args = process.argv.slice(2);
const appDir = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--preset');
const preset = args.includes('--preset') ? args[args.indexOf('--preset') + 1] : null;
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
if (!appDir) {
  console.error('usage: node scripts/copy_project_tools.mjs <appDir> [--preset <name>] [--force] [--no-page-lib] [--dry-run]');
  process.exit(2);
}
const app = resolve(appDir);
if (!existsSync(join(app, 'base-database.jsonc'))) console.warn(`! ${app} chưa có base-database.jsonc — vẫn chép, nhưng công cụ chỉ chạy được sau init/pull.`);

const copied = [];
const kept = [];
function copy(src, dest) {
  if (existsSync(dest) && !force) { kept.push(relative(app, dest)); return; }
  if (!dryRun) { mkdirSync(dirname(dest), { recursive: true }); copyFileSync(src, dest); }
  copied.push(relative(app, dest));
}
function copyTree(srcDir, destDir, rename = (n) => n) {
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name);
    if (statSync(src).isDirectory()) copyTree(src, join(destDir, name), rename);
    else copy(src, join(destDir, rename(name)));
  }
}

// tools/
copyTree(join(skillDir, 'assets', 'project-tools'), join(app, 'tools'), (n) => (n === 'smoke-cases.example.json' ? 'smoke-cases.json' : n));
// page/src/lib starters
if (!args.includes('--no-page-lib') && existsSync(join(app, 'page'))) copyTree(join(skillDir, 'assets', 'page-lib'), join(app, 'page', 'src', 'lib'));
// page/src/styles preset + base
if (preset) {
  const tokens = join(skillDir, 'assets', 'design-tokens');
  const presetFile = join(tokens, `${preset}.css`);
  if (!existsSync(presetFile)) {
    const names = readdirSync(tokens).filter((f) => f.endsWith('.css') && f !== 'base.css').map((f) => f.replace('.css', ''));
    console.error(`Không có preset "${preset}". Có: ${names.join(', ')}`);
    process.exit(2);
  }
  copy(presetFile, join(app, 'page', 'src', 'styles', `${preset}.css`));
  copy(join(tokens, 'base.css'), join(app, 'page', 'src', 'styles', 'base.css'));
}
// .gitignore entries for tool output
const gitignore = join(app, '.gitignore');
const wanted = ['tools/.acceptance-*.log', '.shots/'];
const current = existsSync(gitignore) ? readFileSync(gitignore, 'utf8') : '';
const missing = wanted.filter((w) => !current.split(/\r?\n/).includes(w));
if (missing.length && !dryRun) appendFileSync(gitignore, `${current.endsWith('\n') || !current ? '' : '\n'}${missing.join('\n')}\n`);

console.log(`${dryRun ? '[dry-run] ' : ''}Đã chép ${copied.length} file:${copied.map((f) => `\n  + ${f}`).join('')}`);
if (kept.length) console.log(`Giữ nguyên ${kept.length} file đã có (dùng --force để ghi đè):${kept.map((f) => `\n  = ${f}`).join('')}`);
if (missing.length) console.log(`.gitignore: thêm ${missing.join(', ')}`);
console.log(`\nTiếp theo:
  - Sửa tools/smoke-cases.json (tham số mẫu cho từng Database Function), tools/acceptance.mjs (kịch bản của spec).
  - ${preset ? `Import trong page/src/index.css: @import './styles/${preset}.css'; @import './styles/base.css';` : 'Chọn preset: --preset warm-gray|ivory-blue|slate-indigo|paper-terracotta|soft-lavender'}
  - Harness: npx vite --config tools/harness/vite.config.mjs (cần @vitejs/plugin-react + vite trong devDependencies của page).`);
