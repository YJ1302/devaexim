// Translation engine. It takes the finished English HTML of a page and returns the page in
// another language, so no page template has to know about languages.
//
//   - The HTML is split into "units": a run of text and inline tags such as <i>, <span>, <a>.
//     A unit is looked up in _src/i18n/<code>.json by its English text. Inline tags inside a
//     unit are written as [1], [2]... so the translation can move them where the grammar needs.
//   - Keys may contain {name} placeholders, for example "Get a quote for {name}". The matched
//     part is translated on its own, which keeps dynamic text (product names, years) manageable.
//   - A unit with no translation stays in English and is listed in docs/translation-gaps.md.
//   - Attributes alt, title, aria-label, placeholder and the meta description are translated too.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------- helpers ----------

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const encText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const encAttr = (s) => encText(s).replace(/"/g, '&quot;');
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasLetters = (s) => /\p{L}/u.test(s);
const placeholders = (s) => (s.match(/\[\d+\]|\{\w+\}/g) || []).sort().join(',');

export function loadDictionary(code) {
  const file = join(HERE, 'i18n', `${code}.json`);
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
}

// ---------- tokenizer ----------

// Only these stay inside a sentence. Everything else (spans, links, buttons, <i> for botanical
// names, <b> labels) separates one piece of text from the next, so each piece is translated alone.
// The one span that stays inline is class="tbc" (a detail still to be confirmed with the client).
const INLINE = new Set(['br', 'em', 'strong', 'small', 'code']);
const TOKEN = /(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<[^>]+>)|([^<]+)/g;

function tokenize(html) {
  const out = [];
  const spans = [];                                  // is each open <span> a tbc span?
  TOKEN.lastIndex = 0;
  let m;
  while ((m = TOKEN.exec(html))) {
    if (m[1] === undefined) { out.push({ kind: 'text', raw: m[2] }); continue; }
    const raw = m[1];
    if (raw.startsWith('<!') || /^<(script|style)\b/i.test(raw)) { out.push({ kind: 'opaque', raw }); continue; }
    const nm = /^<\/?\s*([a-zA-Z][\w:-]*)/.exec(raw);
    const name = nm ? nm[1].toLowerCase() : '';
    const closing = raw.startsWith('</');
    const tok = { kind: 'tag', raw, name, closing, inline: INLINE.has(name) };
    if (name === 'span') {
      if (!closing) { const t = /\bclass="[^"]*\btbc\b/.test(raw); spans.push(t); tok.inline = t; }
      else tok.inline = spans.pop() === true;
    }
    out.push(tok);
  }
  return out;
}

// ---------- translator ----------

export function createTranslator(dict, keepSet = new Set()) {
  const exact = new Map();
  const templates = [];
  for (const [k, v] of Object.entries(dict)) {
    if (k.startsWith('__') || typeof v !== 'string') continue;
    exact.set(k, v);
    if (/\{\w+\}/.test(k)) {
      const names = [];
      const src = k.split(/(\{\w+\})/).map((part) => {
        const nm = /^\{(\w+)\}$/.exec(part);
        if (nm) { names.push(nm[1]); return '(.+?)'; }
        return escRe(part);
      }).join('');
      templates.push({ re: new RegExp(`^${src}$`), names, value: v, key: k, len: k.length });
    }
  }
  templates.sort((a, b) => b.len - a.len);

  const problems = [];
  const ok = (key, value) => {
    if (placeholders(key) === placeholders(value)) return true;
    problems.push(`placeholders differ: "${key.slice(0, 60)}"`);
    return false;
  };

  function lookupCore(key) {
    if (!hasLetters(key) || keepSet.has(key) || /^\S+@\S+$/.test(key) || /^https?:/.test(key)) return key;
    if (exact.has(key)) { const v = exact.get(key); return ok(key, v) ? v : null; }
    for (const t of templates) {
      const m = t.re.exec(key);
      if (!m) continue;
      let out = t.value;
      t.names.forEach((n, i) => { out = out.split(`{${n}}`).join(lookup(m[i + 1]) ?? m[i + 1]); });
      return out;
    }
    return null;
  }

  // Punctuation around a unit (", rhizome", "(amla)") is kept as it is, and only the words are looked up.
  function lookup(key) {
    const direct = lookupCore(key);
    if (direct !== null) return direct;
    const PUNCT = '[\\s,.:;()\\-–—|/·]*';
    const tries = [
      new RegExp(`^(${PUNCT})([\\s\\S]*?)()$`),            // only leading punctuation
      new RegExp(`^()([\\s\\S]*?)(${PUNCT})$`),            // only trailing punctuation
      new RegExp(`^(${PUNCT})([\\s\\S]*?)(${PUNCT})$`),    // both
    ];
    for (const re of tries) {
      const m = re.exec(key);
      if (m && m[2] && (m[1] || m[3])) {
        const inner = lookupCore(m[2]);
        if (inner !== null) return m[1] + inner + m[3];
      }
    }
    return null;
  }

  return { lookup, problems, has: (k) => lookup(k) !== null };
}

/**
 * Walks the HTML, translating every unit it can. tagFn(rawTag, name, closing) may rewrite a tag
 * (used for attributes). Returns { html, missing: string[] } where missing are unit keys that
 * had no translation and stayed in English.
 */
export function translateHtml(html, translator, tagFn = (raw) => raw) {
  const tokens = tokenize(html);
  const proc = tokens.map((t) => {
    if (t.kind === 'tag') return tagFn(t.raw, t.name, t.closing);
    // <script src="..."> is opaque, but its opening tag still needs its path rewritten
    const open = t.kind === 'opaque' && /^<script\b[^>]*>/.exec(t.raw);
    return open ? tagFn(open[0], 'script', false) + t.raw.slice(open[0].length) : t.raw;
  });
  const out = proc.slice();
  const missing = [];
  let unit = [];

  const flush = () => {
    if (!unit.length) return;
    const idx = unit;
    unit = [];
    const textual = (i) => tokens[i].kind === 'text' && hasLetters(tokens[i].raw);
    const first = idx.findIndex(textual);
    if (first === -1) return;
    let last = first;
    idx.forEach((i, n) => { if (textual(i)) last = n; });
    const core = idx.slice(first, last + 1);

    const tags = [];
    let key = '';
    for (const i of core) {
      if (tokens[i].kind === 'text') key += decode(tokens[i].raw);
      else { tags.push(proc[i]); key += `[${tags.length}]`; }
    }
    const lead = /^\s*/.exec(tokens[core[0]].raw)[0];
    const trail = /\s*$/.exec(tokens[core[core.length - 1]].raw)[0];
    key = key.replace(/\s+/g, ' ').trim();

    const tr = translator.lookup(key);
    if (tr === null) { missing.push(key); return; }
    if (tr === key) return;
    const body = encText(tr).replace(/\[(\d+)\]/g, (m, n) => tags[Number(n) - 1] ?? m);
    out[core[0]] = lead + body + trail;
    for (const i of core.slice(1)) out[i] = '';
  };

  tokens.forEach((t, i) => {
    if (t.kind === 'text' || (t.kind === 'tag' && t.inline)) unit.push(i);
    else flush();
  });
  flush();
  return { html: out.join(''), missing };
}

// ---------- language switcher & page rewriting ----------

export const relativeHref = (fromFile, toFile) => posix.relative(posix.dirname(fromFile), toFile) || posix.basename(toFile);

const GLOBE = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5z"/></svg>';
const CHEVRON = '<svg class="icon lang__chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9.5l6 6 6-6"/></svg>';

/** Path of an English page inside a language (en lives at the root). */
export const localePath = (code, enPath) => (code === 'en' ? enPath : `${code}/${enPath}`);

export function switcherHtml({ languages, current, enPath, variant }) {
  const here = localePath(current, enPath);
  const links = languages.map((l) => {
    const href = relativeHref(here, localePath(l.code, enPath));
    const cur = l.code === current ? ' aria-current="true"' : '';
    return `<a lang="${l.htmlLang}" hreflang="${l.htmlLang}" href="${href}" data-lang-choice="${l.code}"${cur}>${l.name}</a>`;
  });
  if (variant === 'menu') {
    return `<div class="menu__lang" role="group" aria-label="Language">${links.join('')}</div>`;
  }
  const cur = languages.find((l) => l.code === current);
  return `<details class="lang" data-lang-menu>
  <summary class="lang__btn" aria-label="Language">${GLOBE}<span class="lang__cur">${cur.short}</span>${CHEVRON}</summary>
  <div class="lang__list" role="group" aria-label="Language">${links.join('')}</div>
</details>`;
}

/** Everything that differs between a page and its translation, apart from the text itself. */
export function localizeShell(html, { lang, languages, enPath, siteUrl }) {
  const l = languages.find((x) => x.code === lang);
  const base = String(siteUrl).replace(/\/+$/, '');
  const urlOf = (code) => {
    const p = localePath(code, enPath);
    return `${base}/${p === 'index.html' ? '' : p.replace(/\/index\.html$/, '/')}`;
  };

  if (lang !== 'en') {
    html = html.replace(/<html lang="[^"]*" data-root="([^"]*)">/, (m, root) =>
      `<html lang="${l.htmlLang}" dir="${l.dir}" data-root="${root}" data-assets="../${root}">`);
    html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${urlOf(lang)}$2`);
    html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${urlOf(lang)}$2`);
    html = html.replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${l.ogLocale}$2`);
    if (l.font) {
      html = html.replace('<link rel="stylesheet" href="', `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${l.font}&display=swap">\n<link rel="stylesheet" href="`);
    }
  }
  const alternates = languages.map((x) => `<link rel="alternate" hreflang="${x.htmlLang.split('-')[0]}" href="${urlOf(x.code)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${urlOf('en')}">`;
  html = html.replace('<meta name="theme-color"', `${alternates}\n<meta name="theme-color"`);
  return html;
}

/** Attribute rewriting for a translated page: translate text attributes, re-point assets. */
export function makeTagFn(translator, { prefixAssets, onMissing = () => {} }) {
  const TEXT_ATTR = /(\s(?:alt|title|aria-label|placeholder)=")([^"]*)(")/g;
  const META_TEXT = /^<meta\b[^>]*(?:name="(?:description|twitter:title|twitter:description)"|property="og:(?:title|description)")/;
  const one = (m, a, v, c) => {
    const key = decode(v).replace(/\s+/g, ' ').trim();
    if (!key) return m;
    const tr = translator.lookup(key);
    if (tr === null) { onMissing(key); return m; }
    return tr !== key ? a + encAttr(tr) + c : m;
  };
  return (raw, name, closing) => {
    if (closing) return raw;
    let r = raw;
    r = r.replace(TEXT_ATTR, one);
    if (name === 'meta' && META_TEXT.test(r)) r = r.replace(/(content=")([^"]*)(")/, one);
    if (prefixAssets) {
      r = r.replace(/((?:href|src|srcset|data-preview)=")([^"]*)(")/g, (m, a, v, c) =>
        a + v.replace(/(^|,\s*)((?:\.\.\/)*)(assets\/|site\.webmanifest)/g, '$1../$2$3') + c);
    }
    return r;
  };
}

/** The strings main.js passes to t('...'), so they can be translated and sent to the browser. */
export function jsStrings(mainJsSource) {
  const out = new Set();
  for (const m of mainJsSource.matchAll(/\bt\('((?:[^'\\]|\\.)*)'/g)) out.add(m[1].replace(/\\'/g, "'"));
  return [...out];
}
