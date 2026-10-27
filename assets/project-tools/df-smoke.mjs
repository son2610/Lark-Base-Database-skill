// Runtime smoke test of Database Functions on Preview. Deploy validation does not catch every runtime failure
// (error 800008904 "could not execute"), so run this after every SQL change and before building UI on a function.
//
//   node tools/df-smoke.mjs                 # every function in database-functions/ (except skipped)
//   node tools/df-smoke.mjs whoami listX    # only these
//
// Parameters per function come from tools/smoke-cases.json:
//   { "cases": { "listOrders": { "status": "all", "keyword": "%" } }, "skip": ["debugStats"] }
// Functions named srv* need the server key and are skipped unless a case is given.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { invoke, ROOT, rowsOf } from './lark.mjs';

const dfRoot = join(ROOT, 'database-functions');
const casesFile = join(ROOT, 'tools', 'smoke-cases.json');
const config = existsSync(casesFile) ? JSON.parse(readFileSync(casesFile, 'utf8')) : { cases: {}, skip: [] };
const cases = config.cases ?? {};
const skip = new Set(config.skip ?? []);

const all = existsSync(dfRoot)
  ? readdirSync(dfRoot).filter((name) => statSync(join(dfRoot, name)).isDirectory() && existsSync(join(dfRoot, name, 'main.sql')))
  : [];
const only = process.argv.slice(2);
const ids = (only.length ? only : all).filter((id) => only.length || (!skip.has(id) && (!id.startsWith('srv') || id in cases)));

function defaultParams(id) {
  // Fill declared params with neutral values when no case is given: TEXT → 'all', INT → 20, others → null.
  try {
    const meta = JSON.parse(readFileSync(join(dfRoot, id, 'meta.json'), 'utf8'));
    const params = meta.meta?.params ?? meta.params ?? [];
    return Object.fromEntries(params.map((p) => [p.name, p.kind === 'TEXT' ? 'all' : p.kind === 'INT' ? 20 : p.kind?.endsWith('[]') ? [] : null]));
  } catch {
    return {};
  }
}

const queue = [...ids];
const results = [];
await Promise.all(Array.from({ length: 5 }, async () => {
  while (queue.length) {
    const id = queue.shift();
    const params = cases[id] ?? defaultParams(id);
    const r = await invoke(id, params);
    const rows = rowsOf(r);
    if (r.ok && r.code === 0 && rows) results.push({ id, ok: true, line: `ok   ${id}: rows=${rows.length}` });
    else results.push({ id, ok: false, line: `FAIL ${id}: ${r.code ?? ''} ${String(r.msg ?? '').replace(/\s+/g, ' ').slice(0, 160)}` });
  }
}));
results.sort((a, b) => Number(a.ok) - Number(b.ok) || a.id.localeCompare(b.id));
console.log(results.map((r) => r.line).join('\n'));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} ok${failed ? ` — ${failed} FAIL` : ''}`);
process.exit(failed ? 1 : 0);
