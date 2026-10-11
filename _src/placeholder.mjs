// Generates the product illustrations used until real product photography exists:
// a top-down brass katori filled with the powder in its true colour, a little spill,
// and a garnish of the raw material (roots, leaves, fruits or rhizomes).
// Output: 800 x 1000 SVG (4:5), deterministic per product.

import { rng, mix, shade, tint } from './lib.mjs';

const W = 800, H = 1000, CX = 400, CY = 500, RIM = 272;
const f = (n) => Math.round(n * 10) / 10;

function grainFilter(id, seed, freq = 0.62, strength = 1.6) {
  const b = f(1 - strength / 2);
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="t"/>
    <feColorMatrix in="t" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="g"/>
    <feComponentTransfer in="g" result="k">
      <feFuncR type="linear" slope="${strength}" intercept="${b}"/>
      <feFuncG type="linear" slope="${strength}" intercept="${b}"/>
      <feFuncB type="linear" slope="${strength}" intercept="${b}"/>
    </feComponentTransfer>
    <feBlend in="SourceGraphic" in2="k" mode="multiply" result="m"/>
    <feComposite in="m" in2="SourceGraphic" operator="in"/>
  </filter>`;
}

// ---------- geometry helpers ----------

const bez = (p, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
};
const bezD = (p, t) => {
  const u = 1 - t;
  return [0, 1].map((k) => 3 * u * u * (p[1][k] - p[0][k]) + 6 * u * t * (p[2][k] - p[1][k]) + 3 * t * t * (p[3][k] - p[2][k]));
};

/** Closed outline of a body that follows a cubic bezier, with width given by widthAt(t). */
function body(p, widthAt, offset = 0, steps = 28) {
  const L = [], R = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [x, y] = bez(p, t);
    const [dx, dy] = bezD(p, t);
    const n = Math.hypot(dx, dy) || 1;
    const nx = -dy / n, ny = dx / n, w = widthAt(t) / 2;
    L.push([x + nx * (w + offset * w), y + ny * (w + offset * w)]);
    R.push([x - nx * (w - offset * w), y - ny * (w - offset * w)]);
  }
  const pts = [...L, ...R.reverse()];
  return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L') + 'Z';
}

const spindle = (wmax, pow = 0.75) => (t) => wmax * Math.pow(Math.sin(Math.PI * t), pow) + 0.6;
const taper = (w0, w1 = 1) => (t) => w0 + (w1 - w0) * Math.pow(t, 0.8);

function leafPath(len, wid) {
  return `M0 0 C${f(len * 0.28)} ${f(-wid)} ${f(len * 0.72)} ${f(-wid)} ${len} 0 C${f(len * 0.72)} ${f(wid)} ${f(len * 0.28)} ${f(wid)} 0 0Z`;
}

function leaf(x, y, rot, len, wid, colour) {
  const light = tint(colour, 0.28);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">
    <path d="${leafPath(len, wid)}" fill="${colour}"/>
    <path d="${leafPath(len, wid)}" fill="url(#leafSheen)" opacity=".6"/>
    <path d="M${f(len * 0.04)} 0 C${f(len * 0.4)} ${f(-wid * 0.08)} ${f(len * 0.7)} ${f(-wid * 0.06)} ${f(len * 0.95)} 0" fill="none" stroke="${light}" stroke-width="2" stroke-linecap="round" opacity=".75"/>
  </g>`;
}

function pinnate({ pairs, len, wid, gap, colour, stem, angle = 55, shrink = 0.04, tip = true }) {
  const total = pairs * gap + (tip ? len * 0.8 : 0);
  let out = `<path d="M-24 0 L${total} 0" stroke="${stem}" stroke-width="4.5" stroke-linecap="round"/>`;
  for (let i = 0; i < pairs; i++) {
    const px = i * gap + gap * 0.4, s = 1 - i * shrink;
    out += leaf(px, -2, -angle, len * s, wid * s, colour);
    out += leaf(px, 2, angle, len * s, wid * s, shade(colour, 0.08));
  }
  if (tip) out += leaf(pairs * gap + gap * 0.2, 0, 0, len * 0.85, wid * 0.85, colour);
  return out;
}

// ---------- garnishes, drawn around the origin ----------

function ashwagandhaRoots(rand) {
  let out = '';
  const roots = [
    [[-150, -20], [-60, -50], [40, -10], [150, 40], 34],
    [[-140, 20], [-40, 0], [60, 50], [150, 110], 28],
    [[-150, -70], [-70, -110], [30, -100], [130, -60], 24],
  ];
  for (const [a, b, c, d, w] of roots) {
    const col = mix('#c09a6a', '#94704a', rand() * 0.6);
    const p = [a, b, c, d];
    out += `<path d="${body(p, taper(w, 4))}" fill="${col}" stroke="${shade(col, 0.3)}" stroke-width="1.5"/>`;
    out += `<path d="${body(p, taper(w * 0.38, 1.5), -0.9)}" fill="${tint(col, 0.35)}" opacity=".75"/>`;
    for (const t of [0.2, 0.4, 0.62, 0.82]) {
      const [x, y] = bez(p, t);
      out += `<path d="M${f(x - 10)} ${f(y - 2)} q10 4 20 0" stroke="${shade(col, 0.3)}" stroke-width="1.5" fill="none" opacity=".6"/>`;
    }
    const [x, y] = bez(p, 0.55), [dx, dy] = bezD(p, 0.55), n = Math.hypot(dx, dy);
    out += `<path d="M${f(x)} ${f(y)} q${f((dy / n) * 22 + (dx / n) * 10)} ${f((-dx / n) * 22 + (dy / n) * 10)} ${f((dy / n) * 30 + (dx / n) * 34)} ${f((-dx / n) * 30 + (dy / n) * 34)}" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  return out;
}

function shatavariRoots(rand) {
  let out = '';
  const tubers = [
    [[-130, 20], [-60, -10], [30, -20], [110, 0], 64],
    [[-90, 90], [-20, 70], [60, 90], [130, 120], 54],
    [[-80, -70], [-20, -100], [50, -100], [110, -80], 48],
  ];
  for (const [a, b, c, d, w] of tubers) {
    const col = mix('#e3cf9f', '#c9aa6e', rand() * 0.5);
    const p = [a, b, c, d];
    out += `<path d="${body(p, spindle(w, 0.55))}" fill="${col}" stroke="${shade(col, 0.32)}" stroke-width="1.6"/>`;
    out += `<path d="${body(p, spindle(w * 0.42, 0.6), -0.95)}" fill="${tint(col, 0.5)}" opacity=".85"/>`;
    out += `<path d="${body(p, spindle(w * 0.32, 0.6), 1.25)}" fill="${shade(col, 0.2)}" opacity=".55"/>`;
    for (const t of [0.28, 0.46, 0.64, 0.8]) {
      const [x, y] = bez(p, t), [dx, dy] = bezD(p, t), n = Math.hypot(dx, dy);
      const nx = (-dy / n) * w * 0.32, ny = (dx / n) * w * 0.32;
      out += `<path d="M${f(x + nx)} ${f(y + ny)} Q${f(x + (dx / n) * 6)} ${f(y + (dy / n) * 6)} ${f(x - nx)} ${f(y - ny)}" stroke="${shade(col, 0.28)}" stroke-width="1.6" fill="none" opacity=".5"/>`;
    }
  }
  return out;
}

function rhizome(skin, flesh, cut) {
  // A "hand" of rhizome: a main body with fingers branching off it.
  const parts = [
    [[-130, 10], [-60, -10], [20, -10], [90, 10], 66],
    [[-20, -6], [10, -50], [40, -90], [64, -122], 46],
    [[30, 4], [70, 30], [110, 56], [150, 62], 42],
    [[-90, 8], [-100, 40], [-110, 70], [-118, 104], 38],
  ];
  let out = '';
  for (const [a, b, c, d, w] of parts) {
    const p = [a, b, c, d];
    out += `<path d="${body(p, spindle(w, 0.4))}" fill="${skin}" stroke="${shade(skin, 0.3)}" stroke-width="1.5"/>`;
    out += `<path d="${body(p, spindle(w * 0.4, 0.6), -0.9)}" fill="${tint(skin, 0.3)}" opacity=".6"/>`;
    for (const t of [0.2, 0.38, 0.56, 0.74]) {
      const [x, y] = bez(p, t), [dx, dy] = bezD(p, t), n = Math.hypot(dx, dy);
      const nx = (-dy / n) * w * 0.48, ny = (dx / n) * w * 0.48;
      out += `<path d="M${f(x + nx)} ${f(y + ny)} Q${f(x + dx / n * 5)} ${f(y + dy / n * 5)} ${f(x - nx)} ${f(y - ny)}" stroke="${shade(skin, 0.28)}" stroke-width="1.8" fill="none" opacity=".55"/>`;
    }
  }
  if (cut) {
    out += `<g transform="translate(-190 -70)">
      <circle r="38" fill="${shade(skin, 0.1)}"/><circle r="33" fill="${flesh}"/>
      <circle r="21" fill="none" stroke="${tint(flesh, 0.35)}" stroke-width="2.5" opacity=".7"/>
      <circle r="33" fill="url(#fruitSheen)" opacity=".5"/>
    </g>`;
  }
  return out;
}

function fruits() {
  return `
    <g transform="translate(-60 -40) rotate(-20)">
      <ellipse rx="58" ry="40" fill="#9a7440"/>
      ${[-32, -11, 11, 32].map((x) => `<path d="M${x} -36 q${x > 0 ? 8 : -8} 36 0 72" stroke="#6e5129" stroke-width="2.4" fill="none" opacity=".55"/>`).join('')}
      <ellipse rx="58" ry="40" fill="url(#fruitSheen)"/>
    </g>
    <g transform="translate(80 40)">
      <circle r="46" fill="#7b5a3a"/>
      <path d="M-20 -26 q20 -10 40 0" stroke="#a5825c" stroke-width="2.4" fill="none" opacity=".6"/>
      <circle r="46" fill="url(#fruitSheen)"/>
    </g>
    <g transform="translate(-80 90) rotate(30)">
      <path d="M0 -40 C32 -40 46 -8 40 14 C34 36 8 42 0 42 C-8 42 -34 36 -40 14 C-46 -8 -32 -40 0 -40Z" fill="#4f3b27"/>
      <path d="M0 -40 L0 42 M-30 -20 Q0 2 30 -20" stroke="#2f2216" stroke-width="2.4" fill="none" opacity=".55"/>
      <path d="M0 -40 C32 -40 46 -8 40 14" fill="none" stroke="#7a5e40" stroke-width="3" opacity=".7"/>
    </g>`;
}

function tulsiSprig() {
  return `
    <path d="M-150 120 C-80 50 -10 -20 90 -110" stroke="#5b4a2a" stroke-width="6" fill="none" stroke-linecap="round"/>
    ${leaf(-90, 62, -150, 92, 42, '#557a2c')}${leaf(-76, 52, -22, 98, 44, '#4d7228')}
    ${leaf(-10, -6, -140, 80, 36, '#5f852f')}${leaf(2, -14, -12, 84, 38, '#4f7529')}
    ${leaf(56, -72, -150, 60, 27, '#6a8f36')}${leaf(62, -78, -22, 62, 28, '#5a8230')}
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${f(92 + i * 7)}" cy="${f(-112 - i * 10)}" r="${f(5 - i * 0.35)}" fill="${i % 2 ? '#8a6a8c' : '#6f5072'}"/>`).join('')}`;
}

const GARNISH = {
  roots: (p, rand) => (p.slug.startsWith('shatavari') ? shatavariRoots(rand) : ashwagandhaRoots(rand)),
  neem: () => `<g transform="translate(-150 60) rotate(-32)">${pinnate({ pairs: 7, len: 92, wid: 15, gap: 40, colour: '#4c6b2a', stem: '#6b5a2e', angle: 58 })}</g>`,
  tulsi: () => tulsiSprig(),
  brahmi: () => `<g transform="translate(-150 70) rotate(-36)">${pinnate({ pairs: 7, len: 38, wid: 19, gap: 36, colour: '#6f8f3e', stem: '#7d8a4a', angle: 70, shrink: 0.02 })}</g>`,
  moringa: () => `
    <g transform="translate(-160 60) rotate(-30)">${pinnate({ pairs: 9, len: 36, wid: 21, gap: 32, colour: '#5f9032', stem: '#7a8b45', angle: 64, shrink: 0.03 })}</g>
    <g transform="translate(-70 120) rotate(-62)">${pinnate({ pairs: 6, len: 32, wid: 19, gap: 30, colour: '#6a9a3a', stem: '#7a8b45', angle: 64, shrink: 0.03 })}</g>`,
  fruits: () => fruits(),
  turmeric: () => rhizome('#c27c2c', '#f2a11a', true),
  ginger: () => rhizome('#cfb57f', '#ecdcae', false),
};

function garnish(p, rand) {
  const draw = GARNISH[p.garnish];
  if (!draw) return '';
  return `<g transform="translate(600 205) scale(1.08)" filter="url(#drop)">${draw(p, rand)}</g>`;
}

// ---------- contents of the bowl ----------

function powderFill(p) {
  return `<circle cx="${CX}" cy="${CY}" r="232" fill="${p.hex}" filter="url(#grain)"/>
    <circle cx="${CX}" cy="${CY}" r="232" fill="url(#mound)"/>
    <circle cx="${CX}" cy="${CY}" r="232" fill="url(#contact)"/>`;
}

function leafFill(p, rand) {
  const greens = ['#5e8a2f', '#6d9a39', '#4e7a27', '#7fa347', '#879c3a', '#557f2b'];
  let out = `<clipPath id="bowlClip"><circle cx="${CX}" cy="${CY}" r="234"/></clipPath>
    <g clip-path="url(#bowlClip)"><circle cx="${CX}" cy="${CY}" r="234" fill="${shade(p.hex, 0.35)}"/><g filter="url(#leafDrop)">`;
  for (let i = 0; i < 230; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 236;
    const x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d;
    const c = greens[Math.floor(rand() * greens.length)];
    out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(15 + rand() * 7)}" ry="${f(9 + rand() * 4)}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="${c}"/>`;
  }
  out += `</g></g><circle cx="${CX}" cy="${CY}" r="234" fill="url(#contact)"/>`;
  return out;
}

function spill(p, rand) {
  if (p.leaves) {
    let out = '<g filter="url(#leafDrop)">';
    for (let i = 0; i < 9; i++) {
      const x = 150 + rand() * 240, y = 830 + rand() * 110;
      out += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(16 + rand() * 6)}" ry="${f(10 + rand() * 3)}" transform="rotate(${f(rand() * 180)} ${f(x)} ${f(y)})" fill="${['#5e8a2f', '#6d9a39', '#7fa347'][i % 3]}"/>`;
    }
    return out + '</g>';
  }
  let specks = '';
  for (let i = 0; i < 46; i++) {
    const x = 110 + rand() * 330, y = 830 + rand() * 140;
    specks += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.2 + rand() * 3.2)}" fill="${rand() > 0.5 ? p.hex : shade(p.hex, 0.12)}" opacity="${f(0.55 + rand() * 0.45)}"/>`;
  }
  return `<g filter="url(#spill)">
      <ellipse cx="250" cy="896" rx="118" ry="42" fill="${p.hex}"/>
      <ellipse cx="352" cy="930" rx="46" ry="17" fill="${p.hex}"/>
    </g>
    ${specks}`;
}

export function placeholderSVG(p) {
  const rand = rng(p.slug);
  const seed = Math.floor(rand() * 900) + 10;
  const surfLight = mix('#f2f1ea', p.hex, 0.14);
  const surfDark = mix('#d9d6c8', p.hex, 0.28);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${p.name}</title>
  <defs>
    <radialGradient id="surface" cx="30%" cy="22%" r="95%">
      <stop offset="0" stop-color="${surfLight}"/><stop offset="1" stop-color="${surfDark}"/>
    </radialGradient>
    <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6dc96"/><stop offset=".38" stop-color="#cf9a41"/>
      <stop offset=".72" stop-color="#94621f"/><stop offset="1" stop-color="#5c3a10"/>
    </linearGradient>
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5a3910"/><stop offset=".45" stop-color="#9a6a26"/>
      <stop offset=".8" stop-color="#e2b764"/><stop offset="1" stop-color="#f3d28a"/>
    </linearGradient>
    <radialGradient id="mound" cx="42%" cy="38%" r="72%">
      <stop offset="0" stop-color="${tint(p.hex, 0.22)}" stop-opacity=".55"/>
      <stop offset=".45" stop-color="${tint(p.hex, 0.08)}" stop-opacity=".2"/>
      <stop offset=".66" stop-color="${p.hex}" stop-opacity="0"/>
      <stop offset="1" stop-color="${shade(p.hex, 0.45)}" stop-opacity=".55"/>
    </radialGradient>
    <radialGradient id="contact" cx="50%" cy="50%" r="50%">
      <stop offset=".84" stop-color="#2a1a05" stop-opacity="0"/><stop offset="1" stop-color="#2a1a05" stop-opacity=".42"/>
    </radialGradient>
    <linearGradient id="leafSheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".35"/><stop offset=".55" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity=".18"/>
    </linearGradient>
    <radialGradient id="fruitSheen" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".35"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity=".3"/>
    </radialGradient>
    ${grainFilter('grain', seed)}
    ${grainFilter('paper', seed + 7, 0.9, 0.5)}
    <filter id="spill" x="-40%" y="-80%" width="180%" height="260%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${seed + 3}" result="w"/>
      <feDisplacementMap in="SourceGraphic" in2="w" scale="46" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="3" seed="${seed}" result="t"/>
      <feColorMatrix in="t" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="g"/>
      <feComponentTransfer in="g" result="k">
        <feFuncR type="linear" slope="1.6" intercept=".2"/><feFuncG type="linear" slope="1.6" intercept=".2"/><feFuncB type="linear" slope="1.6" intercept=".2"/>
      </feComponentTransfer>
      <feBlend in="d" in2="k" mode="multiply" result="m"/>
      <feComposite in="m" in2="d" operator="in"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="8" dy="12" stdDeviation="8" flood-color="#2a1a05" flood-opacity=".3"/></filter>
    <filter id="leafDrop" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#14200a" flood-opacity=".45"/></filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#surface)" filter="url(#paper)"/>

  <ellipse cx="${CX + 30}" cy="${CY + 36}" rx="${RIM + 6}" ry="${RIM}" fill="#3b2508" opacity=".38" filter="url(#soft)"/>
  <circle cx="${CX}" cy="${CY}" r="${RIM}" fill="url(#rim)"/>
  <circle cx="${CX}" cy="${CY}" r="${RIM - 9}" fill="none" stroke="#fff4cf" stroke-opacity=".45" stroke-width="2"/>
  <circle cx="${CX}" cy="${CY}" r="${RIM - 14}" fill="url(#wall)"/>
  ${p.leaves ? leafFill(p, rand) : powderFill(p)}

  ${spill(p, rand)}
  ${garnish(p, rand)}
</svg>
`;
}
