// Acceptance scenarios from block 10 of app-spec.md, run against Preview through the real functions.
//   node tools/acceptance.mjs            # all scenarios
//   node tools/acceptance.mjs 1 3        # only scenarios ① and ③
// Conventions: data created here is labelled "QA nghiệm thu"; scenarios are re-run aware (detect existing state and
// report SKIP with the reason instead of a false FAIL); every failure keeps code, message and LogID as evidence.
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { invoke, ROOT, rowsOf } from './lark.mjs';

/** Prefix for every record created by a scenario, so QA data is easy to find and clean up. */
export const LABEL = 'QA nghiệm thu';
const logFile = join(ROOT, 'tools', `.acceptance-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
mkdirSync(join(ROOT, 'tools'), { recursive: true });
const log = (line) => { appendFileSync(logFile, `${line}\n`); };

class Skip extends Error {}
const results = [];

/** Calls a function; returns { ok, code, msg, data, rows }. */
export async function call(functionId, params = {}) {
  const r = await invoke(functionId, params);
  const out = { ok: r.ok && r.code === 0, code: r.code, msg: r.msg, data: r.data, rows: rowsOf(r), logId: r.logId ?? null };
  log(`  ${functionId} ${JSON.stringify(params).slice(0, 300)} → ${out.ok ? 'ok' : `FAIL ${out.code} ${out.msg}`}`);
  return out;
}
export async function expectOk(functionId, params = {}) {
  const r = await call(functionId, params);
  if (!r.ok) throw new Error(`${functionId} lỗi ${r.code}: ${r.msg}${r.logId ? ` (LogID ${r.logId})` : ''}`);
  return r;
}
/** Expects a rejection, optionally with a specific business code (e.g. 40301 forbidden). */
export async function expectFail(functionId, params = {}, code) {
  const r = await call(functionId, params);
  if (r.ok) throw new Error(`${functionId} lẽ ra phải bị từ chối nhưng đã thành công`);
  if (code && !String(r.msg).includes(String(code)) && r.code !== code) throw new Error(`${functionId} bị từ chối nhưng sai mã: ${r.code} ${r.msg}`);
  return r;
}
export function check(condition, message) {
  if (!condition) throw new Error(message);
}
export function skip(reason) {
  throw new Skip(reason);
}
/** Switches the acting demo persona when the app has switchPersona (see 04-architecture-patterns.md#danh-tinh). */
export async function as(personaId) {
  await expectOk('switchPersona', { personaId });
}

export async function scenario(no, title, run) {
  const only = process.argv.slice(2).map(Number).filter(Boolean);
  if (only.length && !only.includes(no)) return;
  const name = `${'①②③④⑤⑥⑦⑧⑨⑩⑪⑫'[no - 1] ?? no} ${title}`;
  log(`\n# ${name}`);
  try {
    await run();
    results.push({ name, status: 'PASS', note: '' });
  } catch (error) {
    const status = error instanceof Skip ? 'SKIP' : 'FAIL';
    results.push({ name, status, note: error.message });
    log(`  ${status}: ${error.message}`);
  }
}

// ---------------------------------------------------------------- scenarios (replace with the app's own)

await scenario(1, 'Danh tính: whoami trả hồ sơ người đang đăng nhập', async () => {
  const me = await expectOk('whoami');
  check(me.rows && me.rows.length === 1, `whoami trả ${me.rows?.length ?? 0} dòng`);
});

// await scenario(2, 'Luồng chính: tạo → duyệt → hoàn thành', async () => {
//   const created = await expectOk('createRequest', { title: `${LABEL} — đơn mẫu`, amount: 1000000 });
//   ...
// });
// await scenario(3, 'Cô lập quyền: nhân viên không xem được đơn của người khác', async () => {
//   await as('<rec id hồ sơ nhân viên demo>');
//   await expectFail('getRequest', { requestId: '<rec của người khác>' }, 40301);
// });

// ---------------------------------------------------------------- summary

const width = Math.max(...results.map((r) => r.name.length), 10);
console.log(results.map((r) => `${r.status.padEnd(5)} ${r.name.padEnd(width)} ${r.note}`).join('\n'));
const failed = results.filter((r) => r.status === 'FAIL').length;
console.log(`\n${results.filter((r) => r.status === 'PASS').length} pass · ${results.filter((r) => r.status === 'SKIP').length} skip · ${failed} fail — log: ${logFile}`);
process.exit(failed ? 1 : 0);
