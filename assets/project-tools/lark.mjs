// Shared helper for the project tools: finds lark-cli, reads the project config and calls Preview functions.
// Copied into <app>/tools/ by lark-base-site-builder (scripts/copy_project_tools.mjs). Dev machine only; never shipped.
//
//   import { invoke, project } from './lark.mjs';
//   const result = await invoke('whoami', {});   // → { ok, code, msg, data, logId, raw }
//
// Environment overrides: LARK_CLI (absolute path to lark-cli), LARK_PROFILE (lark-cli profile), APP_ROOT (project dir),
// FUNCTION_ENV (preview | prod, default preview).
import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(process.env.APP_ROOT ?? join(here, '..'));

/** Parses JSONC (comments + trailing commas), as written by base-database-cli. */
export function parseJsonc(text) {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (ch === '\\') { out += next ?? ''; i += 1; } else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; out += ch; continue; }
    if (ch === '/' && next === '/') { while (i < text.length && text[i] !== '\n') i += 1; out += '\n'; continue; }
    if (ch === '/' && next === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i += 1; i += 1; continue; }
    out += ch;
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'));
}

export function readProject() {
  const file = join(ROOT, 'base-database.jsonc');
  if (!existsSync(file)) throw new Error(`Không thấy ${file}. Chạy công cụ từ thư mục dự án app (hoặc đặt APP_ROOT).`);
  const config = parseJsonc(readFileSync(file, 'utf8'));
  if (!config.appToken) throw new Error('base-database.jsonc thiếu appToken.');
  return config;
}
export const project = readProject();

let cachedCli;
/** lark-cli executable: $LARK_CLI → global npm install (native exe on Windows) → PATH. */
export function larkCli() {
  if (cachedCli) return cachedCli;
  if (process.env.LARK_CLI) return (cachedCli = { file: process.env.LARK_CLI, shell: false });
  try {
    const root = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const native = join(root, '@larksuite', 'cli', 'bin', process.platform === 'win32' ? 'lark-cli.exe' : 'lark-cli');
    if (existsSync(native)) return (cachedCli = { file: native, shell: false });
  } catch {
    /* npm not on PATH: fall back to PATH lookup */
  }
  return (cachedCli = { file: 'lark-cli', shell: process.platform === 'win32' });
}

/** Runs lark-cli with the project's profile; resolves { code, stdout, stderr }. */
export function runLark(args, { cwd = ROOT } = {}) {
  const cli = larkCli();
  const profile = process.env.LARK_PROFILE ?? project.larkProfile;
  const full = profile ? ['--profile', profile, ...args] : args;
  return new Promise((done) => {
    const child = spawn(cli.file, full, { cwd, shell: cli.shell, env: { ...process.env, MSYS_NO_PATHCONV: '1' } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (error) => done({ code: -1, stdout, stderr: String(error) }));
    child.on('close', (code) => done({ code, stdout, stderr }));
  });
}

let seq = 0;
/**
 * Calls a published function the way the page does (named params). `body` is either the params object or a full
 * request body ({ params, messages } for AI, { batch } for Mutation batches).
 */
export async function invoke(functionId, body = {}, { env = process.env.FUNCTION_ENV ?? 'preview', includeInternal = true } = {}) {
  const request = body && (body.params || body.batch || body.messages || body.input) ? body : { params: body ?? {} };
  const tmpDir = join(ROOT, '.base-database-cli', 'state', 'tmp');
  mkdirSync(tmpDir, { recursive: true });
  const file = join(tmpDir, `invoke-${process.pid}-${seq++}.json`);
  writeFileSync(file, JSON.stringify(request));
  const rel = relative(ROOT, file).split('\\').join('/'); // newer lark-cli only accepts relative request files
  const query = JSON.stringify(includeInternal ? { env, includeInternal: true } : { env });
  const run = await runLark(['api', 'POST', `/open-apis/base/v3/sites/${project.appToken}/functions/${functionId}/invoke`, '--params', query, '--data', `@${rel}`, '--as', 'user']);
  try { unlinkSync(file); } catch { /* ignore */ }
  let parsed = null;
  try { parsed = JSON.parse(run.stdout); } catch { try { parsed = JSON.parse(run.stderr); } catch { parsed = null; } }
  if (!parsed) return { ok: false, code: null, msg: (run.stderr || run.stdout || 'no output').slice(0, 400), data: null, raw: run };
  if (parsed.ok) {
    const envelope = parsed.data ?? {};
    // lark-cli unwraps one level: data is the function's { code, msg, data } envelope or the business data itself.
    const hasEnvelope = envelope && typeof envelope === 'object' && 'code' in envelope && 'data' in envelope;
    return { ok: true, code: hasEnvelope ? envelope.code : 0, msg: hasEnvelope ? envelope.msg : 'success', data: hasEnvelope ? envelope.data : envelope, raw: parsed };
  }
  const message = String(parsed.error?.message ?? parsed.msg ?? 'error');
  const logId = message.match(/LogID:\s*([A-Za-z0-9]+)/)?.[1] ?? null;
  return { ok: false, code: Number(parsed.error?.code ?? parsed.code) || null, msg: message.slice(0, 600), data: null, logId, raw: parsed };
}

/** Rows of a Database Function result (`data.rows`), or null when the shape is unexpected. */
export const rowsOf = (result) => (Array.isArray(result?.data?.rows) ? result.data.rows : null);
