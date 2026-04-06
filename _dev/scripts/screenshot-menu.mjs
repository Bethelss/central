import { existsSync } from 'fs';
let puppeteer;
const p = `C:/Users/${process.env.USERNAME}/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer`;
if(existsSync(p)) puppeteer = (await import('file:///' + p.replaceAll('\\', '/'))).default;
else puppeteer = (await import('puppeteer')).default;

const browser = await puppeteer.launch({headless:'new', args:['--no-sandbox']});
const page = await browser.newPage();
await page.setViewport({width:1440, height:800, deviceScaleFactor:1});
await page.goto('http://localhost:3000', {waitUntil:'networkidle2'});
const menuTop = await page.evaluate(() => {
  const el = document.getElementById('menu');
  document.documentElement.style.scrollBehavior = 'auto';
  return el.offsetTop;
});
console.log('menuTop:', menuTop);
await page.evaluate((top) => { window.scrollY; document.documentElement.scrollTop = top; }, menuTop);
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({path:'temporary screenshots/screenshot-276-menu-section.png', fullPage: false});
await browser.close();
console.log('done');
