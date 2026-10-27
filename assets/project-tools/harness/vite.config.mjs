// Local UI harness: serves the real page/ code with the SDK host bridge stubbed; function calls are proxied to the
// Preview app through lark-cli, so pages show real data and perform real writes.
//   npx vite --config tools/harness/vite.config.mjs        (from the project root; port HARNESS_PORT or 5299)
// Stop it (and any leftover `node … vite` process) before `base-database-cli check` / `deploy` on Windows.
import { join, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { invoke } from '../lark.mjs';

const project = resolve(import.meta.dirname, '../..');
const readBody = (req) => new Promise((done) => { let s = ''; req.on('data', (c) => (s += c)); req.on('end', () => done(s || '{}')); });

const proxy = {
  name: 'base-app-harness-proxy',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const fn = req.url?.match(/^\/__invoke\/([A-Za-z0-9_-]+)/)?.[1];
      const ai = req.url?.match(/^\/__ai\/([A-Za-z0-9_-]+)/)?.[1];
      if (!fn && !ai) return next();
      res.setHeader('content-type', 'application/json');
      let body;
      try { body = JSON.parse(await readBody(req)); } catch { body = {}; }
      if (fn) {
        const r = await invoke(fn, body);
        if (r.ok) return res.end(JSON.stringify({ code: r.code ?? 0, msg: r.msg ?? 'success', data: r.data }));
        return res.end(JSON.stringify({ code: r.code || 1, msg: r.msg || 'harness proxy error' }));
      }
      const r = await invoke(ai, { params: body.params ?? {}, messages: body.messages ?? [] });
      const text = r.data?.content ?? r.data?.data?.content;
      return res.end(JSON.stringify(typeof text === 'string' ? { ok: true, text } : { ok: false, message: r.msg || 'AI call failed' }));
    });
  },
};

export default defineConfig({
  root: join(project, 'page'),
  plugins: [react(), proxy],
  resolve: {
    alias: [
      { find: /^@lark-base-open\/base-database-app-sdk\/page\/styles\.css$/, replacement: join(project, 'tools/harness/empty.css') },
      { find: /^@lark-base-open\/base-database-app-sdk\/(page|components)$/, replacement: join(project, 'tools/harness/sdk-page-stub.tsx') },
    ],
  },
  server: { port: Number(process.env.HARNESS_PORT ?? 5299), strictPort: true, host: '127.0.0.1' },
});
