// Renders the social-share image (1200x630) and app icons to PNG with a headless
// Chromium browser (Edge or Chrome), using the site's own CSS and hero thali.
//   node _src/make-images.mjs
// Run after node _src/build.mjs. Only needed when the brand or hero changes.

import { writeFileSync, mkdtempSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

import { thali, logoMark } from './templates.mjs';
import { products } from './data.mjs';
import { plain } from './lib.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BROWSERS = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];
const browser = BROWSERS.find((b) => existsSync(b));
if (!browser) {
  console.error('No Chrome or Edge found. Install one, or create the PNGs in assets/img by hand.');
  process.exit(1);
}

const css = pathToFileURL(join(ROOT, 'assets/css/styles.css')).href;
const fonts = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..600,0..100;1,9..144,300..600,0..100&family=Instrument+Sans:wght@400..600&display=block';
const tmp = mkdtempSync(join(tmpdir(), 'deva-img-'));

const deva = 'https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit&display=block';

function shoot(name, width, height, body, extraCss = '', outDir = 'assets/img') {
  const file = join(tmp, `${name}.html`);
  writeFileSync(file, `<!doctype html><html data-root="../"><head><meta charset="utf-8">
<link rel="stylesheet" href="${fonts}"><link rel="stylesheet" href="${deva}"><link rel="stylesheet" href="${css}">
<style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}
*{animation:none!important;transition:none!important}${extraCss}</style></head><body>${body}</body></html>`);
  mkdirSync(join(ROOT, outDir), { recursive: true });
  const out = join(ROOT, outDir, `${name}.png`);
  execFileSync(browser, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${width},${height}`, '--virtual-time-budget=10000', '--allow-file-access-from-files',
    `--screenshot=${out}`, pathToFileURL(file).href,
  ], { stdio: 'ignore' });
  console.log(`${outDir}/${name}.png`);
  return out;
}

// Social share image: headline on the left, the thali on the right.
const og = `<div class="dark" style="position:relative;width:1200px;height:630px;box-sizing:border-box;padding:64px 72px;display:grid;grid-template-columns:1fr 470px;gap:40px;align-items:center;
  background:radial-gradient(700px 500px at 82% 50%,rgba(228,161,27,.16),transparent 62%),radial-gradient(500px 400px at 0% 100%,rgba(59,115,80,.35),transparent 70%),#11241a">
  <div style="display:grid;gap:28px;align-content:center">
    <div class="brand" style="gap:14px">${logoMark().s.replace('class="brand-mark"', 'class="brand-mark" style="width:52px;height:52px"')}<span class="brand-name" style="font-size:34px">Deva Exim</span></div>
    <h1 class="display" style="font-size:76px;line-height:1;max-width:11ch">The colours of India, finely ground.</h1>
    <p style="font-size:25px;color:#b9c4b4;margin:0;max-width:24ch;line-height:1.35">Ayurvedic herb and spice powders, exported from Pune from 25 kg.</p>
  </div>
  <div style="width:470px">${thali({ root: '../' }).s}</div>
</div>`;
shoot('og-image', 1200, 630, og, '.thali-caption,.thali-hint{display:none}.thali{width:470px}');

// App icons: the mark on forest green. iOS masks its own corners, so no radius here.
const icon = (size) => `<div style="width:${size}px;height:${size}px;display:grid;place-items:center;background:#11241a">
  <svg viewBox="0 0 40 40" width="${Math.round(size * 0.72)}" height="${Math.round(size * 0.72)}">
    <circle cx="20" cy="20" r="15.5" fill="none" stroke="#e4a11b" stroke-width="1.6"/>
    <path d="M13 27C13 19 18.2 13 27 13C27 21 21.8 27 13 27Z" fill="#eef0e6"/>
    <path d="M13.9 26.1L22.6 17.4" stroke="#11241a" stroke-width="1.2" stroke-linecap="round"/>
  </svg></div>`;
shoot('apple-touch-icon', 180, 180, icon(180));
shoot('icon-192', 192, 192, icon(192));
shoot('icon-512', 512, 512, icon(512));

// Per-product share cards (link previews on WhatsApp, LinkedIn, X...), for products with a photo.
const shared = [];
for (const p of products) {
  const photo = join(ROOT, 'assets/img/products', `${p.slug}.webp`);
  if (!existsSync(photo)) continue;
  const card = `<div class="dark" style="width:1200px;height:630px;display:grid;grid-template-columns:1fr 504px;
    background:radial-gradient(600px 420px at 0% 100%,rgba(59,115,80,.35),transparent 70%),#11241a">
    <div style="display:grid;align-content:space-between;padding:56px 56px 52px 64px">
      <div class="brand" style="gap:12px">${logoMark().s.replace('class="brand-mark"', 'class="brand-mark" style="width:44px;height:44px"')}<span class="brand-name" style="font-size:28px">Deva Exim</span></div>
      <div style="display:grid;gap:10px">
        <p class="deva" style="font-size:38px;color:#e4a11b;margin:0">${p.sanskrit}</p>
        <h1 style="font-size:74px;line-height:1;font-variation-settings:'SOFT' 100;margin:0">${p.name}</h1>
        <p style="font-family:var(--f-display);font-style:italic;font-size:27px;color:#b9c4b4;margin:6px 0 0">${plain(p.botanicalShort || p.botanical)}</p>
      </div>
      <p style="font-size:22px;color:#b9c4b4;margin:0">Exported from Pune, India. Orders from 25 kg.</p>
    </div>
    <img src="${pathToFileURL(photo).href}" style="width:504px;height:630px;object-fit:cover;display:block" alt="">
  </div>`;
  shared.push(shoot(p.slug, 1200, 630, card, '', 'assets/img/share'));
}

// PNG to JPEG (smaller, and accepted by every link-preview service) when Python with Pillow is available.
if (shared.length) {
  try {
    execFileSync('python', ['-c', `
import sys
from pathlib import Path
from PIL import Image
for f in sys.argv[1:]:
    p = Path(f)
    Image.open(p).convert('RGB').save(p.with_suffix('.jpg'), quality=84, optimize=True, progressive=True)
    p.unlink()
`, ...shared], { stdio: 'inherit' });
    console.log(`converted ${shared.length} share cards to JPEG`);
  } catch {
    console.log('Python with Pillow not found: share cards left as PNG.');
  }
}

rmSync(tmp, { recursive: true, force: true });
