// Builds the static site into the project root.
//   node _src/build.mjs
// No dependencies. Re-run after editing anything in _src/ or adding product photos.

import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import { plain, tbcLog, setCurrentPage } from './lib.mjs';
import { site, products } from './data.mjs';
import { page, assetVersion } from './templates.mjs';
import * as pages from './pages.mjs';
import { placeholderSVG } from './placeholder.mjs';

// Optional deploy settings (the GitHub Pages workflow sets both for a project site):
//   SITE_URL   public address with no trailing slash, e.g. https://yj1302.github.io/devaexim
//   SITE_BASE  path the site is served from, e.g. /devaexim/ (default: /)
if (process.env.SITE_URL) site.url = process.env.SITE_URL.replace(/\/+$/, '');
const BASE = process.env.SITE_BASE ? `/${process.env.SITE_BASE.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/') : '/';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = (rel, content) => {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

// 1. Product photos: use a photo when one exists, otherwise the illustration.
//    _src/process-photos.py writes <slug>.webp (1600 px) and <slug>-800.webp next to it.
const PHOTO_EXT = ['.webp', '.avif', '.jpg', '.jpeg', '.png'];
const manifestFile = join(ROOT, '_src/photos/manifest.json');
const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')).images || {} : {};
let photos = 0;
for (const p of products) {
  const ext = PHOTO_EXT.find((e) => existsSync(join(ROOT, 'assets/img/products', p.slug + e)));
  p.photo = ext ? `assets/img/products/${p.slug}${ext}` : null;
  p.photoSmall = ext && existsSync(join(ROOT, 'assets/img/products', `${p.slug}-800${ext}`)) ? `assets/img/products/${p.slug}-800${ext}` : null;
  p.photoAlt = manifest[p.slug]?.alt || null;
  p.photoIsAi = manifest[p.slug]?.source === 'ai';
  // Social share card (1200 x 630) made by _src/make-images.mjs.
  const shareExt = ['.jpg', '.png'].find((e) => existsSync(join(ROOT, 'assets/img/share', p.slug + e)));
  p.share = shareExt ? `assets/img/share/${p.slug}${shareExt}` : null;
  if (ext) photos++;
  out(`assets/img/placeholders/${p.slug}.svg`, placeholderSVG(p));
}

// 2. Shared textures and icons.
out('assets/img/grain.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
<filter id="n" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/>
<feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1"/>
<feComponentTransfer><feFuncR type="linear" slope="1.7" intercept=".15"/><feFuncG type="linear" slope="1.7" intercept=".15"/><feFuncB type="linear" slope="1.7" intercept=".15"/></feComponentTransfer>
</filter>
<rect width="240" height="240" filter="url(#n)"/>
</svg>
`);

out('assets/img/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
<rect width="40" height="40" rx="9" fill="#11241a"/>
<circle cx="20" cy="20" r="15.5" fill="none" stroke="#e4a11b" stroke-width="1.6"/>
<path d="M13 27C13 19 18.2 13 27 13C27 21 21.8 27 13 27Z" fill="#eef0e6"/>
<path d="M13.9 26.1L22.6 17.4" stroke="#11241a" stroke-width="1.2" stroke-linecap="round"/>
</svg>
`);

out('assets/img/products/README.txt', `The images in this folder are generated. Do not edit them here.

Originals live in _src/photos/ (one per product, named after the product slug).
To add or replace a product image:
  1. save the original as _src/photos/<slug>.jpg (or .png), for example:
     ${products.map((p) => `${p.slug}.jpg`).join('\n     ')}
  2. run: python _src/process-photos.py <slug>   (crops to 4:5 and writes <slug>.webp and <slug>-800.webp here)
  3. run: node _src/build.mjs
  4. optional, for the link-preview card: node _src/make-images.mjs

Mark real photographs as "photo" in _src/photos/manifest.json so the "Representative image" caption is dropped.
The build uses a photo when one exists here, and the illustration in ../placeholders/ when it does not.
`);

// 3. Pages.
const hash = (rel) => createHash('sha1').update(readFileSync(join(ROOT, rel))).digest('hex').slice(0, 8);
assetVersion.css = hash('assets/css/styles.css');
assetVersion.js = hash('assets/js/main.js');

const routes = [
  { path: 'index.html', root: '', nav: 'home', fn: pages.home },
  { path: 'products.html', root: '', nav: 'products', fn: pages.catalogue },
  ...products.map((p) => ({ path: `products/${p.slug}.html`, root: '../', nav: 'products', fn: (ctx) => pages.product(ctx, p) })),
  { path: 'quality.html', root: '', nav: 'quality', fn: pages.quality },
  { path: 'export.html', root: '', nav: 'export', fn: pages.exportPage },
  { path: 'about.html', root: '', nav: 'about', fn: pages.about },
  { path: 'contact.html', root: '', nav: 'contact', fn: pages.contact },
  { path: 'privacy.html', root: '', nav: '', fn: pages.privacy },
  { path: '404.html', root: BASE, nav: '', fn: pages.notFound, noSitemap: true },
];

for (const r of routes) {
  setCurrentPage(r.path);
  const ctx = { path: r.path, root: r.root, nav: r.nav };
  const opts = r.fn(ctx);
  out(r.path, page(ctx, opts));
}

// 4. SEO and app files.
const base = plain(site.url);
const today = new Date().toISOString().slice(0, 10);
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.filter((r) => !r.noSitemap).map((r) => `  <url><loc>${base}/${r.path === 'index.html' ? '' : r.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
out('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
out('site.webmanifest', JSON.stringify({
  name: site.name,
  short_name: site.shortName,
  description: 'Ayurvedic herbal and spice powders from Pune, India.',
  start_url: './index.html',
  display: 'browser',
  background_color: '#11241a',
  theme_color: '#11241a',
  icons: [
    { src: 'assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'assets/img/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}, null, 2) + '\n');

// 5. Content checklist for the client.
const byNote = new Map();
for (const { page: pg, value, note } of tbcLog) {
  if (!byNote.has(note)) byNote.set(note, { value, pages: new Set() });
  byNote.get(note).pages.add(pg);
}
out('docs/content-to-confirm.md', `# Content to confirm before launch

Generated by \`node _src/build.mjs\` on ${today}. Each item below is shown on the site but has not been confirmed by the client yet.
Open any page with \`?review\` (for example \`index.html?review\`) to see these highlighted in place.
Edit the values in \`_src/data.mjs\` (or the page text in \`_src/pages.mjs\`), then rebuild.

| # | What to confirm | Current text | Pages |
|---|---|---|---|
${[...byNote].map(([note, { value, pages: pg }], i) => `| ${i + 1} | ${note.replace(/\|/g, '\\|')} | ${value.length > 70 ? value.slice(0, 67).replace(/\|/g, '\\|') + '...' : value.replace(/\|/g, '\\|')} | ${[...pg].length > 4 ? `${[...pg].length} pages` : [...pg].join(', ')} |`).join('\n')}
`);

// 6. dist/: only the files a web host needs (no _src, docs or notes). Publish this folder.
const DIST = join(ROOT, 'dist');
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST);
const publicEntries = readdirSync(ROOT).filter((n) => n.endsWith('.html') || ['products', 'assets', 'robots.txt', 'sitemap.xml', 'site.webmanifest'].includes(n));
for (const name of publicEntries) {
  cpSync(join(ROOT, name), join(DIST, name), { recursive: true, filter: (src) => !src.endsWith('README.txt') });
}

console.log(`Built ${routes.length} pages, ${products.length} illustrations (${photos} product photo${photos === 1 ? '' : 's'} found).`);
console.log(`dist/ is ready to upload to any static host.`);
console.log(`${byNote.size} items to confirm: see docs/content-to-confirm.md`);
