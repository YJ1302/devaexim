// Shared layout and components.
import { html, raw, plain, text, join, esc } from './lib.mjs';
import { site, products, categories } from './data.mjs';

export const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
export const categoryName = (id) => categories.find((c) => c.id === id).name;

// ---------- icons & logo ----------

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  list: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3"/>',
  chat: '<path d="M20 11.5a8.5 8.5 0 0 1-12.4 7.6L4 20l1.1-3.3A8.5 8.5 0 1 1 20 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.4"/>',
  phone: '<path d="M5.5 4h3l1.6 4.1-2 1.4a11 11 0 0 0 5.4 5.4l1.4-2 4.1 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 6.2 2 2 0 0 1 5.5 4z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>',
  pin: '<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"/>',
  print: '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
};

export const icon = (name, cls = 'icon') =>
  raw(`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`);

/** The official logo, on a light plate so it reads on the dark header and footer. */
export const brandLogo = (ctx) =>
  raw(`<img class="brand-logo" src="${ctx.root}assets/img/logo.png" alt="Deva Exim INC" width="556" height="160">`);

// ---------- URLs & images ----------

export const productUrl = (p) => `products/${p.slug}.html`;
export const productImg = (p) => p.photo || `assets/img/placeholders/${p.slug}.svg`;
export const productThumb = (p) => p.photoSmall || productImg(p);
export const productAlt = (p) =>
  p.photo ? p.photoAlt || p.name : `Illustration of ${p.name.toLowerCase()} in a brass bowl`;
export const botanicalShort = (p) => plain(p.botanicalShort || p.botanical);
export const shareImg = (p) => p.share || null;

// Card and product-page images. Photos get a srcset (800 and 1600 px wide).
export const SIZES = {
  card: '(min-width: 1240px) 280px, (min-width: 560px) 45vw, 92vw',
  hero: '(min-width: 1240px) 520px, (min-width: 900px) 42vw, 92vw',
};
export function productImage(ctx, p, { sizes, alt = productAlt(p), lazy = true, priority = false } = {}) {
  const srcset = p.photo && p.photoSmall
    ? ` srcset="${esc(ctx.root + p.photoSmall)} 800w, ${esc(ctx.root + p.photo)} 1600w" sizes="${esc(sizes)}"`
    : '';
  return raw(`<img src="${esc(ctx.root + (p.photoSmall || productImg(p)))}"${srcset} alt="${esc(alt)}" width="800" height="1000"` +
    `${lazy ? ' loading="lazy"' : ''} decoding="async"${priority ? ' fetchpriority="high"' : ''}>`);
}

export const waLink = (message) => `https://wa.me/${plain(site.whatsapp)}?text=${encodeURIComponent(message)}`;

// ---------- small components ----------

export const dot = (hex) => html`<span class="dot" style="--c:${hex}" aria-hidden="true"></span>`;

export function enquireButton(p, cls = 'btn-text') {
  return html`<button class="${cls}" type="button" data-enquire="${p.slug}" aria-pressed="false">
    <span class="when-idle">${icon('plus')}Add to enquiry</span>
    <span class="when-added">${icon('check')}Added to enquiry</span>
    <span class="visually-hidden">: ${p.name}</span>
  </button>`;
}

export function productCard(ctx, p, headingLevel = 'h2') {
  const keywords = [p.name, p.short, text(p.botanical), p.sanskritLatin, p.sanskrit, ...(p.aka || []), categoryName(p.category), p.part].join(' ');
  const H = raw(headingLevel);
  return html`<article class="card" data-card data-cat="${p.category}" data-keywords="${keywords}" data-name="${p.name}" style="--c:${p.hex}">
    <a class="card__media" href="${ctx.root}${productUrl(p)}" tabindex="-1" aria-hidden="true">
      ${productImage(ctx, p, { sizes: SIZES.card, alt: '' })}
    </a>
    <div class="card__text">
      <span class="card__deva" lang="sa">${p.sanskrit}</span>
      <${H} class="card__title"><a href="${ctx.root}${productUrl(p)}">${p.name}</a></${H}>
      <p class="card__bot"><i>${botanicalShort(p)}</i></p>
      <p class="card__meta"><span><b>Part</b> ${p.part}</span><span><b>MOQ</b> 25 kg</span><span><b>HS</b> ${p.hs}</span></p>
    </div>
    ${enquireButton(p)}
  </article>`;
}

// Hero thali: 8 katoris around a centre bowl.
const RING = ['moringa-powder', 'shatavari-powder', 'neem-powder', 'ashwagandha-powder', 'tulsi-powder', 'ginger-powder', 'brahmi-powder', 'triphala-powder'];
const CENTRE = 'turmeric-powder';

// Set by the build: path of the photographic tray, when it exists. Bowl photos are p.thaliImg.
export const thaliAssets = { plate: null };

export function thali(ctx) {
  const r = 32.3;
  const bowls = RING.map((slug, i) => {
    const a = (-90 + i * 45) * (Math.PI / 180);
    return { p: bySlug[slug], x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a), i: i + 1 };
  });
  const centre = bySlug[CENTRE];
  const bowl = ({ p, x, y, i }, extra = '') => html`<button class="katori${raw(extra)}${raw(p.thaliImg ? ' katori--photo' : '')}" type="button" data-slug="${p.slug}"
      style="--x:${x.toFixed(2)}%;--y:${y.toFixed(2)}%;--c:${p.hex};--i:${i}" aria-pressed="false" aria-describedby="thali-hint">
      ${p.thaliImg ? html`<img class="katori__img" src="${ctx.root}${p.thaliImg}" alt="" width="400" height="400" decoding="async">` : html`<span class="katori__powder"></span>`}<span class="visually-hidden">${p.name}</span>
    </button>`;
  return html`<div class="hero-art">
    <div class="thali" data-thali data-initial="${CENTRE}" role="group" aria-label="Our products, as powders in brass bowls">
      ${thaliAssets.plate
        ? html`<div class="thali__plate thali__plate--photo" aria-hidden="true"><img src="${ctx.root}${thaliAssets.plate}" alt="" width="1200" height="1200" decoding="async"></div>`
        : html`<div class="thali__plate" aria-hidden="true"></div>`}
      ${bowl({ p: centre, x: 50, y: 50, i: 0 }, ' katori--center')}
      ${bowls.map((b) => bowl(b))}
    </div>
    <div class="thali-caption" data-thali-caption aria-live="polite">
      <p class="deva" lang="sa" data-cap-deva>${centre.sanskrit}</p>
      <p class="thali-caption__name" data-cap-name>${centre.name}</p>
      <p class="thali-caption__bot" data-cap-bot><i>${plain(centre.botanical)}</i>, ${centre.part.toLowerCase()}</p>
      <a href="${ctx.root}${productUrl(centre)}" data-cap-link>See the ${centre.short} specification</a>
    </div>
    <p class="thali-hint" id="thali-hint">Hover over or tap a bowl to see what is in it. Select it again to open the product.</p>
  </div>`;
}

export function routeDiagram() {
  return raw(`<svg class="route" viewBox="0 0 560 210" role="img" aria-labelledby="route-title route-desc">
    <title id="route-title">Shipping route</title>
    <desc id="route-desc">Goods travel about 140 km by road from Narhe, Pune to JNPT (Nhava Sheva) port, then by sea to your port. Urgent orders and samples fly from Mumbai air cargo.</desc>
    <path d="M40 120 C 120 60, 200 60, 270 110" fill="none" stroke="#e4a11b" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>
    <path d="M270 110 C 350 165, 440 160, 520 96" fill="none" stroke="#eef0e6" stroke-opacity=".55" stroke-width="2.5" stroke-dasharray="14 10" stroke-linecap="round"/>
    <circle cx="40" cy="120" r="9" fill="#e4a11b"/><circle cx="40" cy="120" r="17" fill="none" stroke="#e4a11b" stroke-opacity=".35" stroke-width="2"/>
    <circle cx="270" cy="110" r="9" fill="#eef0e6"/>
    <circle cx="520" cy="96" r="9" fill="none" stroke="#eef0e6" stroke-width="2.5"/>
    <text x="40" y="160" text-anchor="middle" font-size="17" font-weight="600">Pune</text>
    <text class="route__sub" x="40" y="181" text-anchor="middle" font-size="13">Narhe</text>
    <text x="270" y="150" text-anchor="middle" font-size="17" font-weight="600">JNPT</text>
    <text class="route__sub" x="270" y="171" text-anchor="middle" font-size="13">Nhava Sheva</text>
    <text x="520" y="70" text-anchor="middle" font-size="17" font-weight="600">Your port</text>
    <text class="route__sub" x="155" y="52" text-anchor="middle" font-size="13">about 140 km by road</text>
    <text class="route__sub" x="405" y="190" text-anchor="middle" font-size="13">sea freight, LCL or FCL</text>
  </svg>`);
}

// ---------- page chrome ----------

const NAV = [
  ['products.html', 'Products', 'products'],
  ['quality.html', 'Quality', 'quality'],
  ['export.html', 'Export', 'export'],
  ['about.html', 'About', 'about'],
  ['contact.html', 'Contact', 'contact'],
];

function header(ctx) {
  const items = NAV.map(([href, label, key]) =>
    html`<li><a href="${ctx.root}${href}"${raw(ctx.nav === key ? ' aria-current="page"' : '')}>${label}</a></li>`);
  return html`<header class="site-header" data-header>
  <div class="container header-row">
    <a class="brand" href="${ctx.root}index.html">${brandLogo(ctx)}<span class="visually-hidden">, home</span></a>
    <nav class="site-nav" aria-label="Main">
      <ul>${items}</ul>
    </nav>
    <div class="header-actions">
      <!--LANG:header-->
      <button class="list-btn" type="button" data-open-drawer aria-haspopup="dialog">
        ${icon('list')}<span class="list-btn__label">Enquiry list</span>
        <span class="count" data-count aria-hidden="true">0</span>
        <span class="visually-hidden">, <span data-count-label>0 products</span></span>
      </button>
      <a class="btn btn--haldi btn--sm header-cta" href="${ctx.root}contact.html">Request a quote</a>
      <button class="icon-btn menu-btn" type="button" data-open-menu aria-haspopup="dialog" aria-label="Open menu">${icon('menu')}</button>
    </div>
  </div>
</header>`;
}

function footer(ctx) {
  const productLinks = products.map((p) => html`<li><a href="${ctx.root}${productUrl(p)}">${p.name}</a></li>`);
  const year = new Date().getFullYear();
  return html`<footer class="site-footer dark">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a class="brand" href="${ctx.root}index.html">${brandLogo(ctx)}<span class="visually-hidden">, home</span></a>
      <p>Ayurvedic herb and spice powders from Pune, India. Supplier, exporter, trader and distributor since ${site.founded}.</p>
    </div>
    <nav aria-labelledby="footer-products">
      <h2 class="footer-h" id="footer-products">Products</h2>
      <ul class="footer-links">${productLinks}</ul>
    </nav>
    <nav aria-labelledby="footer-company">
      <h2 class="footer-h" id="footer-company">Company</h2>
      <ul class="footer-links">
        <li><a href="${ctx.root}quality.html">Quality</a></li>
        <li><a href="${ctx.root}export.html">Export</a></li>
        <li><a href="${ctx.root}about.html">About us</a></li>
        <li><a href="${ctx.root}contact.html">Request a quote</a></li>
        <li><a href="${ctx.root}privacy.html">Privacy</a></li>
      </ul>
    </nav>
    <div class="footer-contact">
      <h2 class="footer-h">Contact</h2>
      <address>${site.name}<br>${site.address.line1}<br>${site.address.line2}<br>${site.address.locality}, ${site.address.region} ${site.address.postalCode}, ${site.address.country}</address>
      <p><a href="tel:${site.phone.tel}">${site.phone.display}</a><br><a href="mailto:${site.email}">${site.email}</a></p>
      <p class="footer-gst">GSTIN ${site.gstin}
        <button class="copy-btn" type="button" data-copy="${site.gstin}">${icon('copy')}<span class="copy-label">Copy</span></button></p>
    </div>
  </div>
  <div class="container footer-base">
    <p>© ${year} ${site.name}. All rights reserved.</p>
    <p>Traditional uses described on this site are for information. They are not medical claims.</p>
    <!--LANG:note-->
  </div>
</footer>`;
}

function dialogs(ctx) {
  const items = NAV.map(([href, label, key]) =>
    html`<li><a href="${ctx.root}${href}"${raw(ctx.nav === key ? ' aria-current="page"' : '')}>${label}</a></li>`);
  return html`<dialog class="drawer" id="enquiry-drawer" aria-labelledby="drawer-title">
  <div class="drawer__head">
    <h2 id="drawer-title">Your enquiry list</h2>
    <button class="icon-btn" type="button" data-close aria-label="Close enquiry list">${icon('close')}</button>
  </div>
  <div class="drawer__body" data-drawer-list></div>
  <div class="drawer__foot" data-drawer-foot>
    <a class="btn btn--leaf btn--block" href="${ctx.root}contact.html" data-continue>Continue to the enquiry form</a>
    <p class="small">Nothing is sent until you submit the form.</p>
  </div>
</dialog>
<dialog class="menu" id="site-menu" aria-label="Menu">
  <div class="menu__head">
    <a class="brand" href="${ctx.root}index.html">${brandLogo(ctx)}<span class="visually-hidden">, home</span></a>
    <button class="icon-btn" type="button" data-close aria-label="Close menu">${icon('close')}</button>
  </div>
  <nav class="menu__nav" aria-label="Main"><ul>${items}</ul></nav>
  <!--LANG:menu-->
  <div class="menu__foot">
    <a class="btn btn--haldi" href="${ctx.root}contact.html">Request a quote</a>
    <a class="btn btn--ghost" href="tel:${site.phone.tel}">${icon('phone')}Call ${plain(site.phone.display)}</a>
  </div>
</dialog>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;
}

function catalogueJson(ctx) {
  const data = products.map((p) => ({
    slug: p.slug, name: p.name, en: p.name, short: p.short, enShort: p.short, deva: p.sanskrit, bot: botanicalShort(p),
    part: p.part, hex: p.hex, cat: p.category, img: productThumb(p), url: productUrl(p),
  }));
  return raw(`<script type="application/json" id="deva-catalogue">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`);
}

// Set by the build: a short content hash appended to CSS/JS URLs so browsers fetch fresh copies after a change.
export const assetVersion = { css: '', js: '' };

// Devanagari glyphs used on the site, so Google Fonts can serve a tiny subset.
const DEVA_TEXT = [...new Set([...products.map((p) => p.sanskrit).join(''), ...'देव'])].join('');

export function page(ctx, opts) {
  const { title, description, body, jsonld = [], ogType = 'website', image } = opts;
  const base = plain(site.url);
  const canonical = `${base}/${ctx.path === 'index.html' ? '' : ctx.path}`;
  const ogImage = `${base}/${image || 'assets/img/og-image.png'}`;
  const waText = opts.waText || 'Hello Deva Exim, I would like to know more about your products.';
  const ld = jsonld.length
    ? raw(jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n'))
    : '';

  return `<!doctype html>
<!-- Generated by _src/build.mjs. Edit the files in _src/ and rebuild; changes made here will be overwritten. -->
<html lang="en-IN" data-root="${ctx.root}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${opts.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(canonical)}">`}
<meta name="theme-color" content="#11241a">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${ctx.root}assets/img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="${ctx.root}assets/img/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="${ctx.root}assets/img/apple-touch-icon.png">
<link rel="manifest" href="${ctx.root}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..600,0..100;1,9..144,300..600,0..100&family=Instrument+Sans:wght@400..600&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Sanskrit&display=swap&text=${encodeURIComponent(DEVA_TEXT)}">
<link rel="stylesheet" href="${ctx.root}assets/css/styles.css?v=${assetVersion.css}">
<script src="${ctx.root}assets/js/main.js?v=${assetVersion.js}" defer></script>
${ld}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${header(ctx)}
<main id="main">
${body}
</main>
${footer(ctx)}
${dialogs(ctx)}
<a class="wa-float" href="${esc(waLink(waText))}" target="_blank" rel="noopener" aria-label="Message us on WhatsApp">${icon('chat')}</a>
${catalogueJson(ctx)}
</body>
</html>
`;
}

export function pageHead({ title, lede, crumbs }) {
  return html`<section class="page-head dark">
  <div class="container">
    ${crumbs ? breadcrumb(crumbs) : ''}
    <h1 class="page-title">${title}</h1>
    ${lede ? html`<p class="lede">${lede}</p>` : ''}
  </div>
</section>`;
}

export function breadcrumb(crumbs) {
  return html`<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs.map(([label, href], i) =>
    i === crumbs.length - 1 ? html`<li aria-current="page">${label}</li>` : html`<li><a href="${href}">${label}</a></li>`)}</ol></nav>`;
}

export function ctaPanel(ctx, { title = 'Tell us what you need', textLine, product } = {}) {
  const wa = product ? `Hello Deva Exim, I would like a quotation for ${product.name}.` : 'Hello Deva Exim, I would like a quotation.';
  return html`<section class="section cta-section">
  <div class="container">
    <div class="cta-panel">
      <div>
        <h2>${title}</h2>
        <p>${textLine || html`Send the products, quantities and destination port. We reply ${site.responseTime} with prices, lead time and freight options.`}</p>
      </div>
      <div class="actions">
        <a class="btn btn--leaf" href="${ctx.root}contact.html${product ? `?product=${product.slug}` : ''}">Start an enquiry</a>
        <a class="btn btn--outline" href="${waLink(wa)}" target="_blank" rel="noopener">${icon('chat')}Message us on WhatsApp</a>
      </div>
    </div>
  </div>
</section>`;
}

export { join };
