// Tiny, dependency-free HTML templating for the Deva Exim static site.
//
//   html`<p>${value}</p>`   escapes interpolations unless they are raw() or html`` results.
//   tbc(value, note)        marks content that still needs the client's confirmation.
//                           In text it renders as <span class="tbc" data-tbc="note">, which
//                           the site highlights in review mode (?review). Inside attributes it
//                           renders as the plain value.

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

class Tbc {
  constructor(value, note) { this.value = value; this.note = note; }
  toString() { return String(this.value); }
}

class Frag {
  constructor(strings, values) { this.strings = strings; this.values = values; }
  render() { return html(this.strings, ...this.values); }
}

export const raw = (s) => new Raw(String(s));
export const tbc = (value, note) => new Tbc(value, note);
export const isTbc = (v) => v instanceof Tbc;
/** A sentence with embedded tbc() values, rendered lazily so review notes are tracked per page. */
export const frag = (strings, ...values) => new Frag(strings, values);

/** Plain string value of anything (unwraps tbc). */
export const plain = (v) => (v instanceof Tbc ? String(v.value) : v == null ? '' : String(v));

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ENTITIES[c]);

// Every tbc() rendered during a build is recorded here so the build can write a checklist.
export const tbcLog = [];
let currentPage = '';
export const setCurrentPage = (p) => { currentPage = p; };

function renderText(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return v.s;
  if (v instanceof Frag) return v.render().s;
  if (Array.isArray(v)) return v.map(renderText).join('');
  if (v instanceof Tbc) {
    tbcLog.push({ page: currentPage, value: String(v.value), note: v.note });
    return `<span class="tbc" data-tbc="${esc(v.note)}">${esc(v.value)}</span>`;
  }
  return esc(v);
}

function renderAttr(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Raw) return esc(v.s);
  if (v instanceof Frag) return esc(text(v));
  if (Array.isArray(v)) return v.map(renderAttr).join('');
  return esc(plain(v));
}

/** Plain text of anything, including fragments (for meta tags, JSON-LD, mailto bodies). */
export function text(v) {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Frag) return v.strings.reduce((out, s, i) => out + s + (i < v.values.length ? text(v.values[i]) : ''), '');
  if (Array.isArray(v)) return v.map(text).join('');
  return plain(v);
}

// True when the template text so far ends inside an open attribute value: foo="...
const inAttribute = (s) => /=\s*"[^"]*$/.test(s) || /=\s*'[^']*$/.test(s);

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    out += inAttribute(out) ? renderAttr(values[i]) : renderText(values[i]);
    out += strings[i + 1];
  }
  return new Raw(out);
}

/** Join a list of html`` fragments. */
export const join = (list, sep = '') => raw(list.map((x) => renderText(x)).join(sep));

/** Deterministic PRNG (mulberry32) seeded from a string, for repeatable artwork. */
export function rng(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Colour helpers for generated artwork. */
export function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}
export function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A.map((x, i) => x + (B[i] - x) * t));
}
export const shade = (hex, t) => mix(hex, '#000000', t);
export const tint = (hex, t) => mix(hex, '#ffffff', t);
