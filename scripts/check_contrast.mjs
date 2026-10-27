#!/usr/bin/env node
// WCAG contrast check of design-token presets (light and dark).
//   node scripts/check_contrast.mjs [assets/design-tokens] [--json]
// Pairs: body text and secondary text on surfaces (4.5), button text on accent (4.5), accent on surface (3),
// status text on its soft background (4.5, used by 12 px badges). Exit 1 when any pair fails.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = resolve(join(dirname(fileURLToPath(import.meta.url)), '..'));
const dir = resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) ?? join(skillDir, 'assets', 'design-tokens'));
const asJson = process.argv.includes('--json');
const PAIRS = [['text', 'surface', 4.5], ['text-2', 'surface', 4.5], ['text-3', 'surface', 4.5], ['accent-text', 'accent', 4.5], ['accent', 'surface', 3], ['success', 'success-soft', 4.5], ['info', 'info-soft', 4.5], ['warning', 'warning-soft', 4.5], ['danger', 'danger-soft', 4.5], ['neutral', 'neutral-soft', 4.5], ['accent', 'accent-soft', 4.5]];

const luminance = (hex) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const report = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.css') && f !== 'base.css')) {
  const css = readFileSync(join(dir, file), 'utf8');
  const [light, dark = ''] = css.split(":root[data-theme='dark']");
  for (const [mode, block] of [['light', light], ['dark', dark]]) {
    const vars = Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
    const results = PAIRS.filter(([a, b]) => vars[a] && vars[b]).map(([a, b, min]) => ({ pair: `${a}/${b}`, ratio: Math.round(ratio(vars[a], vars[b]) * 100) / 100, min, pass: ratio(vars[a], vars[b]) >= min }));
    const missing = PAIRS.filter(([a, b]) => !vars[a] || !vars[b]).map(([a, b]) => `${a}/${b}`);
    report.push({ preset: file.replace('.css', ''), mode, failures: results.filter((r) => !r.pass), missing, checked: results.length });
  }
}
const failed = report.filter((r) => r.failures.length || r.missing.length);
if (asJson) console.log(JSON.stringify(report, null, 2));
else {
  for (const r of report) {
    const status = r.failures.length || r.missing.length ? 'FAIL' : 'pass';
    console.log(`${status} ${r.preset.padEnd(18)} ${r.mode.padEnd(5)} ${r.checked} cặp${r.failures.length ? ' — ' + r.failures.map((f) => `${f.pair}=${f.ratio}<${f.min}`).join(', ') : ''}${r.missing.length ? ' — thiếu biến: ' + r.missing.join(', ') : ''}`);
  }
  console.log(failed.length ? `\n${failed.length} chế độ chưa đạt` : `\nTất cả ${report.length} chế độ đạt WCAG AA cho ${PAIRS.length} cặp màu`);
}
process.exit(failed.length ? 1 : 0);
