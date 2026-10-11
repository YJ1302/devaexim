// Quick quality checks on the built site (run after the build):
//   node _src/check.mjs
// Checks every HTML page for duplicate IDs, broken internal links and images,
// images without alt text, exactly one <h1>, and label/ARIA references that
// point at IDs that do not exist.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['_src', 'docs', 'node_modules', '.claude', '.git', '.github', 'dist']);

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (SKIP.has(name)) return [];
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return name.endsWith('.html') ? [full] : [];
  });
}

const problems = [];
const report = (file, msg) => problems.push(`${relative(ROOT, file).replace(/\\/g, '/')}: ${msg}`);
const isExternal = (u) => /^(https?:|mailto:|tel:|data:|\/\/)/.test(u);

let pages = 0, links = 0;
for (const file of htmlFiles(ROOT)) {
  pages++;
  const html = readFileSync(file, 'utf8')
    .replace(/<script type="application\/(ld\+)?json"[\s\S]*?<\/script>/g, ''); // ignore data islands
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const is404 = rel === '404.html';

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) { if (seen.has(id)) report(file, `duplicate id "${id}"`); seen.add(id); }

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) report(file, `${h1} <h1> elements (expected 1)`);

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\salt="/.test(m[0])) report(file, `image without alt: ${m[0].slice(0, 80)}`);
  }

  for (const m of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    const url = m[2].replace(/&amp;/g, '&');
    if (isExternal(url)) continue;
    links++;
    if (url.startsWith('#')) {
      if (url.length > 1 && !seen.has(url.slice(1))) report(file, `in-page link to missing #${url.slice(1)}`);
      continue;
    }
    const path = url.split(/[?#]/)[0];
    if (!path) continue;
    const target = is404 && path.startsWith('/') ? join(ROOT, path) : join(dirname(file), path);
    if (!existsSync(target)) report(file, `broken ${m[1]}: ${url}`);
  }

  for (const m of html.matchAll(/\s(for|aria-labelledby|aria-describedby|aria-controls|list)="([^"]+)"/g)) {
    for (const id of m[2].split(/\s+/)) if (!seen.has(id)) report(file, `${m[1]} points at missing id "${id}"`);
  }
}

// CSS url() references
const css = readFileSync(join(ROOT, 'assets/css/styles.css'), 'utf8');
for (const m of css.matchAll(/url\("?([^")]+)"?\)/g)) {
  if (isExternal(m[1])) continue;
  if (!existsSync(join(ROOT, 'assets/css', m[1]))) problems.push(`styles.css: missing ${m[1]}`);
}

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} problem(s) in ${pages} pages.`);
  process.exit(1);
}
console.log(`OK: ${pages} pages, ${links} internal links and assets checked, no problems found.`);
