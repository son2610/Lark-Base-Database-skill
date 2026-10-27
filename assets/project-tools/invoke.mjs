// Calls one published Preview function and prints the result.
//   node tools/invoke.mjs <functionId> ['{"param":"value"}'] [--rows|--raw]
// Database Functions print rows; FaaS/Mutation print the business data. AI: pass '{"params":{…},"messages":[…]}'.
import { invoke, rowsOf } from './lark.mjs';

const [functionId, rawParams = '{}', flag] = process.argv.slice(2);
if (!functionId) {
  console.error('usage: node tools/invoke.mjs <functionId> [paramsJson] [--rows|--raw]');
  process.exit(2);
}
let body;
try {
  body = JSON.parse(rawParams);
} catch {
  console.error('paramsJson is not valid JSON (on Windows PowerShell, wrap it in single quotes).');
  process.exit(2);
}
const result = await invoke(functionId, body);
if (!result.ok || result.code !== 0) {
  console.log(JSON.stringify({ ok: false, code: result.code, msg: result.msg, logId: result.logId ?? null }, null, 1));
  process.exit(1);
}
if (flag === '--raw') {
  console.log(JSON.stringify(result.raw, null, 1));
} else {
  const rows = rowsOf(result);
  if (rows) {
    console.log(`rows=${rows.length}`);
    for (const row of rows) console.log(JSON.stringify(row).slice(0, flag === '--rows' ? 4000 : 400));
  } else {
    console.log(JSON.stringify(result.data, null, 1).slice(0, 8000));
  }
}
