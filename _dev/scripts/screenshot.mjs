/**
 * screenshot.mjs — скриншот страницы через Puppeteer
 * Использование: node screenshot.mjs <url> [label]
 * Пример:        node screenshot.mjs http://localhost:3000 hero
 * Сохраняет в:   ./temporary screenshots/screenshot-N[-label].png
 */
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join }  from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const url   = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

// ── Папка для скриншотов ──────────────────────────────
const outDir = join(__dirname, 'temporary screenshots');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

// Находим следующий номер файла
function nextIndex() {
  const files = existsSync(outDir) ? readdirSync(outDir) : [];
  const nums  = files.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0')).filter(n => !isNaN(n));
  return nums.length ? Math.max(...nums) + 1 : 1;
}
const idx      = nextIndex();
const filename = label ? `screenshot-${idx}-${label}.png` : `screenshot-${idx}.png`;
const outPath  = join(outDir, filename);

// ── Поиск Puppeteer ───────────────────────────────────
const candidates = [
  // локальный в проекте
  join(__dirname, 'node_modules', 'puppeteer'),
  // пути из CLAUDE.md (на случай окружения nateh)
  'C:/Users/nateh/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer',
  // текущий пользователь
  `C:/Users/${process.env.USERNAME}/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer`,
  // глобальный npm
  join(process.env.APPDATA || '', 'npm/node_modules/puppeteer'),
];

let puppeteer;
for (const p of candidates) {
  if (existsSync(p)) {
    try { puppeteer = (await import('file:///' + p.replace(/\\/g, '/'))).default; break; }
    catch {}
  }
}

if (!puppeteer) {
  // Последняя попытка — просто import('puppeteer') из глобального окружения
  try { puppeteer = (await import('puppeteer')).default; }
  catch {
    console.error('❌  Puppeteer не найден. Установите: npm i puppeteer');
    process.exit(1);
  }
}

// ── Скриншот ──────────────────────────────────────────
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page    = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 800)); // ждём анимации
await page.screenshot({ path: outPath, fullPage: false });
await browser.close();

console.log(`✓  Скриншот сохранён: temporary screenshots/${filename}`);
