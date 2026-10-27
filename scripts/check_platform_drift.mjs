#!/usr/bin/env node
// Compares the latest published Base Database packages with platform-baseline.json.
//   node scripts/check_platform_drift.mjs            # versions only (npm view)
//   node scripts/check_platform_drift.mjs --fetch    # also download the newer packages to a temp dir, print the
//                                                    # CHANGELOG entries since the baseline and new/removed official
//                                                    # skill references (input for references/09-maintaining.md)
//   node scripts/check_platform_drift.mjs --json
// Network failures are reported, never fatal.
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const baselineArg = process.argv.indexOf('--baseline');
const baselineFile = baselineArg > 0 ? process.argv[baselineArg + 1] : join(skillDir, 'platform-baseline.json');
const baseline = JSON.parse(readFileSync(baselineFile, 'utf8'));
const fetch = process.argv.includes('--fetch');
const asJson = process.argv.includes('--json');

const cmp = (a, b) => {
  const pa = String(a).split(/[.-]/).map((x) => Number.parseInt(x, 10) || 0);
  const pb = String(b).split(/[.-]/).map((x) => Number.parseInt(x, 10) || 0);
  for (let i = 0; i < 3; i += 1) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};
const npm = (args) => execSync(`npm ${args}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000 }).trim();

/** CHANGELOG sections with version > from and <= to. Headings look like "## [1.7.0] - 2026-10-26" or "## 0.4.2 - …". */
function changelogSince(text, from, to) {
  const out = [];
  let keep = false;
  for (const line of text.split('\n')) {
    const m = line.match(/^##\s+\[?(\d+\.\d+\.\d+[^\]\s]*)\]?/);
    if (m) keep = cmp(m[1], from) > 0 && cmp(m[1], to) <= 0;
    if (keep) out.push(line);
  }
  return out.join('\n').trim();
}

const report = { baselineVerifiedOn: baseline.verifiedOn, packages: [] };
for (const [name, info] of Object.entries(baseline.packages)) {
  if (name === '@larksuite/cli') continue;
  const entry = { name, baseline: info.version, latest: null, status: 'unknown' };
  try {
    entry.latest = npm(`view ${name} version`);
    const d = cmp(entry.latest, info.version);
    entry.status = d > 0 ? 'newer' : d === 0 ? 'current' : 'older';
  } catch (error) {
    entry.error = String(error.stderr ?? error.message).split('\n')[0];
  }
  if (fetch && entry.status === 'newer') {
    const dir = join(tmpdir(), `lbsb-drift-${Date.now()}-${name.split('/').pop()}`);
    mkdirSync(dir, { recursive: true });
    try {
      const tgz = npm(`pack ${name}@${entry.latest} --pack-destination "${dir}"`).split('\n').pop();
      execFileSync('tar', ['-xzf', tgz], { cwd: dir, stdio: 'ignore' }); // relative path: GNU tar reads 'C:' as a host
      const pkg = join(dir, 'package');
      entry.extractedTo = pkg;
      if (existsSync(join(pkg, 'CHANGELOG.md'))) entry.changelog = changelogSince(readFileSync(join(pkg, 'CHANGELOG.md'), 'utf8'), info.version, entry.latest);
      const refs = join(pkg, 'skills', 'lark-base-database', 'references');
      if (existsSync(refs) && Array.isArray(baseline.officialReferences)) {
        const now = readdirSync(refs).filter((f) => f.endsWith('.md'));
        entry.referencesAdded = now.filter((f) => !baseline.officialReferences.includes(f));
        entry.referencesRemoved = baseline.officialReferences.filter((f) => !now.includes(f));
      }
    } catch (error) {
      entry.fetchError = String(error.message).split('\n')[0];
    }
  }
  report.packages.push(entry);
}
report.drift = report.packages.some((p) => p.status === 'newer');

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const p of report.packages) {
    const tag = p.status === 'newer' ? 'MỚI HƠN' : p.status === 'current' ? 'khớp' : p.status === 'older' ? 'cũ hơn (?)' : 'không kiểm được';
    console.log(`${p.name}: baseline ${p.baseline} · npm ${p.latest ?? '—'} → ${tag}${p.error ? ` (${p.error})` : ''}`);
    if (p.referencesAdded?.length) console.log(`  reference chính thức mới: ${p.referencesAdded.join(', ')}`);
    if (p.referencesRemoved?.length) console.log(`  reference chính thức bị bỏ: ${p.referencesRemoved.join(', ')}`);
    if (p.changelog) console.log(`\n${p.changelog}\n`);
    if (p.extractedTo) console.log(`  (gói đã giải nén: ${p.extractedTo})`);
    if (p.fetchError) console.log(`  không tải được gói: ${p.fetchError}`);
  }
  console.log(report.drift
    ? `\nCó bản mới hơn baseline ${baseline.verifiedOn}. Cập nhật skill theo references/09-maintaining.md (quy trình A)${fetch ? '' : '; chạy lại với --fetch để xem CHANGELOG'}.`
    : '\nSkill khớp phiên bản mới nhất đã phát hành (hoặc không kiểm được mạng).');
}
