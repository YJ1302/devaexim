// Builds the static site into the project root.
//   node _src/build.mjs
// No dependencies. Re-run after editing anything in _src/ or adding product photos.

import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import { plain, text, tbcLog, setCurrentPage } from './lib.mjs';
import { site, products, languages } from './data.mjs';
import { page, assetVersion } from './templates.mjs';
import * as pages from './pages.mjs';
import {
  createTranslator, loadDictionary, translateHtml, makeTagFn, switcherHtml, localizeShell,
  localePath, relativeHref, jsStrings,
} from './i18n.mjs';
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

const base = plain(site.url);
const today = new Date().toISOString().slice(0, 10);

const rendered = routes.map((r) => {
  setCurrentPage(r.path);
  const ctx = { path: r.path, root: r.root, nav: r.nav };
  return { r, html: page(ctx, r.fn(ctx)) };
});

// 3b. Languages. English is the source; every other language is the same page, translated.
const mainJs = readFileSync(join(ROOT, 'assets/js/main.js'), 'utf8');
const JS_KEYS = jsStrings(mainJs);
const keepFile = join(ROOT, '_src/i18n/_keep.json');
const keepSet = new Set(existsSync(keepFile) ? JSON.parse(readFileSync(keepFile, 'utf8')) : []);
for (const l of languages) { keepSet.add(l.name); keepSet.add(l.short); }
for (const p of products) {
  // names that are the same in every language: Latin botanical names, authorities, families, Sanskrit names, trade names
  for (const v of [text(p.botanical), p.botanicalShort, p.authority, p.family, text(p.hs), p.aka.join(', '), p.sanskrit, p.sanskritLatin]) if (v) keepSet.add(String(v));
}
for (const v of ['Emblica officinalis', 'Terminalia chebula', 'Terminalia bellirica', 'T. bellirica', 'amla', 'haritaki', 'bibhitaki', 'देव', '25 kg']) keepSet.add(v);
for (const k of [site.name, site.shortName, plain(site.phone.display), plain(site.email), site.gstin, 'Deva Exim', 'WhatsApp', 'GSTIN', 'IEC', 'HS', 'MOQ', 'COA', 'FCL', 'LCL', 'EXW', 'FOB', 'CFR', 'CIF', 'JNPT', 'L/C', 'T/T']) keepSet.add(k);

const gaps = new Map();       // code -> Map(key -> Set(pages))
const dictProblems = [];
const noteText = 'This page is translated for convenience. Specifications, prices and terms are as confirmed in English.';

for (const lang of languages) {
  const dict = loadDictionary(lang.code);
  const tr = createTranslator(dict, keepSet);
  const missing = new Map();
  gaps.set(lang.code, missing);
  let currentPath = '';
  const note = (k) => { if (!missing.has(k)) missing.set(k, new Set()); missing.get(k).add(currentPath); };
  const tagFn = lang.code === 'en' ? undefined : makeTagFn(tr, { prefixAssets: true, onMissing: note });

  for (const { r, html: enHtml } of rendered) {
    const strip = (s) => s.replace(/<!--LANG:\w+-->/g, '');
    if (r.noSitemap) {                     // the 404 page stays English only
      if (lang.code === 'en') out(r.path, strip(enHtml));
      continue;
    }
    let html = enHtml
      .replace('<!--LANG:header-->', switcherHtml({ languages, current: lang.code, enPath: r.path, variant: 'header' }))
      .replace('<!--LANG:menu-->', switcherHtml({ languages, current: lang.code, enPath: r.path, variant: 'menu' }))
      .replace('<!--LANG:note-->', lang.code === 'en' ? '' : `<p class="translation-note">${noteText}</p>`);
    html = localizeShell(html, { lang: lang.code, languages, enPath: r.path, siteUrl: base });

    if (lang.code !== 'en') {
      currentPath = r.path;
      const res = translateHtml(html, tr, tagFn);
      html = res.html;
      for (const k of res.missing) note(k);

      // product names used by the scripts (enquiry list, search, thali caption)
      html = html.replace(/(<script type="application\/json" id="deva-catalogue">)([\s\S]*?)(<\/script>)/, (m, a, json, c) => {
        const list = JSON.parse(json);
        for (const p of list) for (const f of ['name', 'short', 'part']) p[f] = tr.lookup(p[f]) ?? p[f];
        return a + JSON.stringify(list).replace(/</g, '\\u003c') + c;
      });
      // keep search working in every language: the translated name joins the search keywords
      html = html.replace(/(data-keywords="[^"]*)("[^>]*data-name=")([^"]*)(")/g, (m, a, b, name, d) => {
        const t = tr.lookup(name.replace(/&amp;/g, '&')) ?? name;
        return `${a} ${t}${b}${name}${d}`;
      });
      // strings the scripts show (toasts, form errors...)
      const jsDict = {};
      for (const k of JS_KEYS) {
        const v = tr.lookup(k);
        if (v === null) { currentPath = 'assets/js/main.js'; note(`js: ${k}`); }
        else if (v !== k) jsDict[k] = v;
      }
      html = html.replace('</body>', `<script type="application/json" id="deva-i18n">${JSON.stringify(jsDict).replace(/</g, '\\u003c')}</script>\n</body>`);
    } else {
      // a gentle "also available in..." offer for visitors whose browser language we support
      const offers = languages.filter((x) => x.code !== 'en').map((x) => {
        const d = loadDictionary(x.code);
        return d.__banner_text ? { code: x.code, lang: x.htmlLang, name: x.name, text: d.__banner_text, cta: d.__banner_cta, href: relativeHref(r.path, localePath(x.code, r.path)) } : null;
      }).filter(Boolean);
      html = html.replace('</body>', `<script type="application/json" id="deva-langs">${JSON.stringify(offers).replace(/</g, '\\u003c')}</script>\n</body>`);
    }
    out(localePath(lang.code, r.path), html);
  }
  for (const p of tr.problems) dictProblems.push(`${lang.code}: ${p}`);
}

// 4. SEO and app files.
const pageUrl = (code, path) => {
  const p = localePath(code, path);
  return `${base}/${p === 'index.html' ? '' : p.replace(/\/index\.html$/, '/')}`;
};
const sitemapRoutes = routes.filter((r) => !r.noSitemap);
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapRoutes.flatMap((r) => languages.map((l) => `  <url><loc>${pageUrl(l.code, r.path)}</loc><lastmod>${today}</lastmod>
${languages.map((x) => `    <xhtml:link rel="alternate" hreflang="${x.htmlLang.split('-')[0]}" href="${pageUrl(x.code, r.path)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en', r.path)}"/>
  </url>`)).join('\n')}
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
const publicEntries = readdirSync(ROOT).filter((n) => n.endsWith('.html') || ['products', 'assets', 'robots.txt', 'sitemap.xml', 'site.webmanifest', ...languages.map((l) => l.code).filter((c) => c !== 'en')].includes(n));
for (const name of publicEntries) {
  cpSync(join(ROOT, name), join(DIST, name), { recursive: true, filter: (src) => !src.endsWith('README.txt') });
}

// 7. Translation gaps: units that stayed in English. Fill them in _src/i18n/<code>.json.
const gapLines = [];
for (const l of languages.filter((x) => x.code !== 'en')) {
  const m = gaps.get(l.code);
  const asObj = Object.fromEntries([...m].map(([k, pg]) => [k, [...pg].slice(0, 3)]));
  out(`_src/i18n/_missing.${l.code}.json`, JSON.stringify(asObj, null, 1) + '\n');
  gapLines.push(`| ${l.name} (${l.code}) | ${Object.keys(loadDictionary(l.code)).filter((k) => !k.startsWith('__')).length} | ${m.size} |`);
}
out('docs/translation-gaps.md', `# Translation status

Generated by \`node _src/build.mjs\` on ${today}. Text that has no translation yet is shown in English.
Translations live in \`_src/i18n/<code>.json\` (English text on the left, translation on the right).
The exact missing strings are written to \`_src/i18n/_missing.<code>.json\` on every build.

| Language | Translated entries | Strings still in English |
|---|---|---|
${gapLines.join('\n')}
`);
for (const p of dictProblems) console.log(`translation problem: ${p}`);

console.log(`Built ${routes.length} pages in ${languages.length} languages, ${products.length} illustrations (${photos} product photo${photos === 1 ? '' : 's'} found).`);
for (const l of languages.filter((x) => x.code !== 'en')) console.log(`  ${l.code}: ${gaps.get(l.code).size} strings still in English`);
console.log(`dist/ is ready to upload to any static host.`);
console.log(`${byNote.size} items to confirm: see docs/content-to-confirm.md`);
