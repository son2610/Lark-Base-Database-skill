// Copies shared FaaS libraries (server/lib/<name>.ts) into every function directory that imports './<name>.js'.
// FaaS functions are built independently and cannot import across directories.
//   node tools/sync-faas-lib.mjs
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lark.mjs';

const libDir = join(ROOT, 'server', 'lib');
const fnDir = join(ROOT, 'server', 'functions');
if (!existsSync(libDir) || !existsSync(fnDir)) {
  console.log('Không có server/lib hoặc server/functions — bỏ qua.');
  process.exit(0);
}
let copies = 0;
for (const lib of readdirSync(libDir).filter((f) => f.endsWith('.ts'))) {
  const name = lib.replace(/\.ts$/, '');
  const source = readFileSync(join(libDir, lib), 'utf8');
  const header = `// GENERATED COPY of server/lib/${lib} — edit the source and run \`node tools/sync-faas-lib.mjs\`.\n`;
  for (const fn of readdirSync(fnDir)) {
    const dir = join(fnDir, fn);
    const index = join(dir, 'index.ts');
    if (!statSync(dir).isDirectory() || !existsSync(index)) continue;
    if (!readFileSync(index, 'utf8').includes(`'./${name}.js'`)) continue;
    writeFileSync(join(dir, lib), header + source);
    copies += 1;
  }
}
console.log(`đã chép ${copies} bản thư viện`);
