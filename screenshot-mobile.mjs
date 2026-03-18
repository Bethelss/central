import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'mobile';
const outDir = join(__dirname, 'temporary screenshots');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
function nextIndex() {
  const files = existsSync(outDir) ? readdirSync(outDir) : [];
  const nums = files.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1;
}
const idx = nextIndex();
const filename = label ? `screenshot-${idx}-${label}.png` : `screenshot-${idx}.png`;
const outPath = join(outDir, filename);

const paths = [
  join(__dirname, 'node_modules', 'puppeteer'),
  'C:/Users/nateh/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer',
  `C:/Users/${process.env.USERNAME}/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer`,
];
let puppeteer;
for (const p of paths) {
  if (existsSync(p)) {
    try { puppeteer = (await import('file:///' + p.replace(/\\/g, '/'))).default; break; }
    catch {}
  }
}
if (!puppeteer) {
  try { puppeteer = (await import('puppeteer')).default; } catch {}
}
if (!puppeteer) { console.error('Puppeteer не найден'); process.exit(1); }

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();
console.log(`✓  Скриншот сохранён: temporary screenshots/${filename}`);
