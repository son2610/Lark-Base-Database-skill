// Headless screenshots of harness pages; prints console errors and the visible text so results can be read without
// opening the image.
//   node tools/harness/shots.cjs <outDir> <hashPath> [width] [theme] [waitMs] [actionsJson]
//   node tools/harness/shots.cjs .shots "/" 1440 light
//   node tools/harness/shots.cjs .shots "/orders" 390 dark 6000 '[{"click":"Tạo đơn"},{"wait":800}]'
// Playwright: set PW_PATH to the playwright module, or install it in the project (npm i -D playwright &&
// npx playwright install chromium). PW_EXE may point to a specific Chromium executable. HARNESS_PORT defaults to 5299.
const fs = require('node:fs');
const path = require('node:path');

function loadPlaywright() {
  const candidates = [process.env.PW_PATH, 'playwright', 'playwright-core'].filter(Boolean);
  for (const id of candidates) {
    try { return require(id); } catch { /* try next */ }
  }
  console.error('Không tìm thấy Playwright. Cài: npm i -D playwright && npx playwright install chromium (hoặc đặt PW_PATH).');
  process.exit(2);
}

(async () => {
  const { chromium } = loadPlaywright();
  const [outDir = '.shots', rawHash = '/', width = '1440', theme = 'light', waitMs = '6000', actionsJson = '[]'] = process.argv.slice(2);
  // Git Bash rewrites a leading "/" argument into "C:/Program Files/Git/…" unless MSYS_NO_PATHCONV=1; undo that.
  const msys = rawHash.match(/^[A-Za-z]:[\\/].*?[\\/]Git([\\/].*)?$/);
  let hashPath = msys ? (msys[1] ?? '/').replace(/\\/g, '/') : rawHash;
  if (!hashPath.startsWith('/')) hashPath = `/${hashPath}`;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch(process.env.PW_EXE ? { executablePath: process.env.PW_EXE } : {});
  const page = await browser.newPage({ viewport: { width: Number(width), height: Number(width) < 600 ? 860 : 920 }, colorScheme: theme === 'dark' ? 'dark' : 'light' });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 300)}`));
  const port = process.env.HARNESS_PORT ?? '5299';
  await page.goto(`http://127.0.0.1:${port}/?theme=${theme}#${hashPath}`);
  await page.waitForTimeout(Number(waitMs));
  for (const action of JSON.parse(actionsJson)) {
    if (action.click) await page.getByText(action.click, { exact: action.exact ?? false }).first().click();
    if (action.role) await page.getByRole(action.role, { name: action.name }).first().click();
    if (action.fill) await page.getByLabel(action.fill).first().fill(action.value);
    if (action.press) await page.keyboard.press(action.press);
    if (action.wait) await page.waitForTimeout(action.wait);
    if (action.goto) await page.evaluate((h) => { window.location.hash = h; }, action.goto);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const name = `${hashPath.replace(/[^a-z0-9]+/gi, '_').slice(0, 60) || 'home'}-${width}-${theme}.png`;
  const file = path.join(outDir, name);
  await page.screenshot({ path: file, fullPage: true });
  const text = (await page.evaluate(() => document.body.innerText)).replace(/\n{2,}/g, '\n').slice(0, Number(process.env.TEXT_LIMIT ?? 1500));
  console.log(JSON.stringify({ file, horizontalOverflowPx: overflow, errors: errors.slice(0, 10), text }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
