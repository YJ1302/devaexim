// Page bodies. Each function returns { title, description, body, ... } for page().
import { html, raw, plain, text, tbc } from './lib.mjs';
import {
  site, products, categories, industries, journey, orderSteps, tradeTerms,
  documents, qualityParams, packaging, faq, commonSpec, NOTES,
} from './data.mjs';
import {
  bySlug, categoryName, icon, dot, enquireButton, productCard, thali, routeDiagram,
  pageHead, breadcrumb, ctaPanel, productUrl, productImg, productThumb, productImage, SIZES, shareImg,
  botanicalShort, waLink,
} from './templates.mjs';

const abs = (path) => `${plain(site.url)}/${path}`;

const orgLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': abs('#organization'),
  name: site.name,
  alternateName: site.shortName,
  url: abs(''),
  logo: abs('assets/img/icon-512.png'),
  foundingDate: String(site.founded),
  taxID: site.gstin,
  email: plain(site.email),
  telephone: site.phone.tel,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${site.address.line1}, ${site.address.line2}`,
    addressLocality: site.address.locality,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: 'IN',
  },
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', telephone: site.phone.tel, email: plain(site.email) }],
  description: 'Supplier, exporter, trader and distributor of Ayurvedic herbal powders and spice powders from Pune, India.',
});

const crumbLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});

// ======================================================================
// Home
// ======================================================================

export function home(ctx) {
  const groups = categories.map((c) => ({ c, items: products.filter((p) => p.category === c.id) }));

  const body = html`
<section class="hero dark">
  <div class="container hero-grid">
    <div class="hero-copy">
      <h1 class="display">The colours of India, finely ground.</h1>
      <p class="lede">Deva Exim supplies Ashwagandha, Moringa, Turmeric and seven more Ayurvedic herbs and spices to manufacturers, brands and distributors abroad. Orders start at 25 kg per product.</p>
      <div class="actions">
        <a class="btn btn--haldi" href="products.html">Browse the catalogue</a>
        <a class="btn btn--ghost" href="contact.html">Request a quote</a>
      </div>
      <dl class="hero-facts">
        <div><dt>GST registered</dt><dd>${site.gstin}</dd></div>
        <div><dt>Minimum order</dt><dd>25 kg per product</dd></div>
        <div><dt>Ships from</dt><dd>JNPT, Nhava Sheva</dd></div>
      </dl>
    </div>
    ${thali(ctx)}
  </div>
</section>

<section class="section" id="catalogue">
  <div class="container">
    <div class="section-head">
      <h2>Ten products, one enquiry</h2>
      <p>Every product starts at 25 kg, and several can share one shipment. Open any of them for the full specification.</p>
    </div>
    <div class="index-groups" data-preview-list>
      ${groups.map(({ c, items }) => html`<div class="index-group">
        <h3>${c.name} <span>(${items.length})</span></h3>
        <ul class="index-list">
          ${items.map((p) => html`<li><a class="index-row" href="${productUrl(p)}" data-preview="${productThumb(p)}" style="--c:${p.hex}">
            <span class="index-row__swatch" aria-hidden="true"></span>
            <span class="index-row__name">${p.name}</span>
            <span class="index-row__deva" lang="sa">${p.sanskrit}</span>
            <span class="index-row__bot"><i>${botanicalShort(p)}</i></span>
            <span class="index-row__part">${p.part}</span>
          </a></li>`)}
        </ul>
      </div>`)}
    </div>
    <div class="preview-float" aria-hidden="true"><img src="${productThumb(products[0])}" alt="" width="800" height="1000"></div>
    <div class="actions" style="margin-top:2.5rem">
      <a class="btn btn--outline" href="products.html">Filter and search the catalogue</a>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container">
    <div class="section-head">
      <h2>Made for formulators, food makers and traders</h2>
      <p>Our powders end up in finished products across four industries. Each card lists the products that suit it best.</p>
    </div>
    <div class="industries">
      ${industries.map((ind) => html`<article class="industry">
        <h3>${ind.name}</h3>
        <p>${ind.text}</p>
        <ul class="chips">
          ${ind.products.map((slug) => html`<li><a class="chip" href="${productUrl(bySlug[slug])}">${dot(bySlug[slug].hex)}${bySlug[slug].short}</a></li>`)}
        </ul>
      </article>`)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <h2>From farm to freight</h2>
      <p>What happens to each lot between the field and your warehouse.</p>
    </div>
    <ol class="journey">
      ${journey.map((s, i) => html`<li class="journey__step">
        <span class="journey__num" aria-hidden="true">${i + 1}</span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
      </li>`)}
    </ol>
    <p style="margin-top:2.25rem"><a class="btn-text" href="quality.html">Specifications, testing and documents</a></p>
  </div>
</section>

<section class="section dark export-band">
  <div class="container export-grid">
    <div class="export-copy">
      <h2>Shipping from Pune to your port</h2>
      <p>Pune is about 140 km from JNPT (Nhava Sheva), one of India’s busiest container ports, and a similar drive from Mumbai’s air cargo terminal. We prepare the export documents your customs broker will ask for.</p>
      <div class="actions"><a class="btn btn--haldi" href="export.html">See how ordering works</a></div>
    </div>
    <div>
      ${routeDiagram()}
      <dl class="facts">
        <div><dt>Sea freight</dt><dd>LCL or FCL from JNPT</dd></div>
        <div><dt>Air freight and samples</dt><dd>Mumbai air cargo (CSMIA)</dd></div>
        <div><dt>Incoterms</dt><dd>${tbc('EXW, FOB, CFR and CIF', NOTES.incoterms)}</dd></div>
        <div><dt>Documents</dt><dd>COA, phytosanitary certificate, certificate of origin</dd></div>
      </dl>
    </div>
  </div>
</section>

${ctaPanel(ctx)}`;

  return {
    title: 'Deva Exim INC | Ayurvedic herb and spice powder exporter, Pune, India',
    description: 'Exporter of Ashwagandha, Moringa, Turmeric, Neem, Tulsi, Shatavari, Brahmi, Triphala and Ginger powders from Pune, India. From 25 kg, with COA and export documents.',
    body,
    jsonld: [
      orgLd(),
      { '@context': 'https://schema.org', '@type': 'WebSite', name: site.name, url: abs(''), publisher: { '@id': abs('#organization') } },
    ],
  };
}

// ======================================================================
// Catalogue
// ======================================================================

export function catalogue(ctx) {
  const count = (id) => products.filter((p) => p.category === id).length;
  const body = html`
${pageHead({
    title: 'Product catalogue',
    lede: 'Ten Ayurvedic herbs and spices, each available from 25 kg. Add the ones you need to your enquiry list and ask for one quotation for all of them.',
    crumbs: [['Home', 'index.html'], ['Products']],
  })}
<section class="section">
  <div class="container">
    <div class="toolbar">
      <div class="filters" role="group" aria-label="Filter by category">
        <button class="filter" type="button" data-filter="all" aria-pressed="true">All products <span class="n">${products.length}</span></button>
        ${categories.map((c) => html`<button class="filter" type="button" data-filter="${c.id}" aria-pressed="false">${c.name} <span class="n">${count(c.id)}</span></button>`)}
      </div>
      <div class="search">
        <label class="visually-hidden" for="catalogue-search">Search products</label>
        ${icon('search')}
        <input id="catalogue-search" type="search" data-search placeholder="Search, e.g. haldi, sonth or Withania" autocomplete="off" spellcheck="false">
      </div>
    </div>
    <p class="result-note" data-result-note aria-live="polite">Showing all ${products.length} products.</p>
    <div class="grid-cards" data-catalogue>
      ${products.map((p) => productCard(ctx, p))}
    </div>
    <div class="empty" data-empty hidden>
      <h2>No products match your search</h2>
      <p>Try a local name such as haldi or sonth, or a botanical name such as Curcuma. You can also show the whole catalogue again.</p>
      <button class="btn btn--outline btn--sm" type="button" data-reset>Show all products</button>
    </div>
    <div class="source-note">
      <h2>Looking for another herb?</h2>
      <p>${tbc('We focus on these ten products, but we can source other Ayurvedic herbs and spices on request. Send us the botanical name, the quantity and the specification you need.', 'Sourcing other herbs on request: confirm the client offers this.')}</p>
      <p><a class="btn-text" href="contact.html">Ask about another product</a></p>
    </div>
  </div>
</section>
${ctaPanel(ctx)}`;

  return {
    title: 'Product catalogue | Herbal and spice powders | Deva Exim INC',
    description: 'Ashwagandha, Shatavari, Neem, Tulsi, Brahmi, Triphala and Moringa powders, Moringa leaves, Turmeric and Ginger powder. Botanical names, HS codes and MOQ for each.',
    body,
    jsonld: [
      crumbLd([['Home', ''], ['Products', 'products.html']]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(productUrl(p)), name: p.name })),
      },
    ],
  };
}

// ======================================================================
// Product
// ======================================================================

function botanicalCell(p) {
  if (p.slug === 'triphala-powder') {
    return html`<i>Emblica officinalis</i> (amla), <i>Terminalia chebula</i> (haritaki), <i>Terminalia bellirica</i> (bibhitaki)`;
  }
  return html`<i>${p.botanical}</i> ${p.authority}`;
}

function specRows(p) {
  const { MOQ, PACK, MESH, MOISTURE, SHELF, CULTIVATION } = commonSpec;
  const rows = [
    ['Botanical name', botanicalCell(p)],
    ['Family', p.family],
    ['Part used', p.part],
    p.ratio && ['Ratio', p.ratio],
    ['Form', p.form],
    ['Colour', html`${dot(p.hex)}${p.colour}`],
    ['Odour and taste', 'Characteristic'],
    ['Particle size', p.leaves ? 'Not applicable' : MESH],
    ['Moisture', MOISTURE],
    p.curcumin && ['Curcumin', p.curcumin],
    ['Cultivation', CULTIVATION],
    ['Origin', 'India'],
    ['HS code', p.hs],
    ['Minimum order', MOQ],
    ['Packaging', PACK],
    ['Shelf life', SHELF],
    ['Also known as', p.aka.join(', ')],
  ].filter(Boolean);
  return rows.map(([k, v]) => html`<tr><th scope="row">${k}</th><td>${v}</td></tr>`);
}

function related(p) {
  const same = products.filter((x) => x.category === p.category && x.slug !== p.slug);
  const others = products.filter((x) => x.category !== p.category);
  return [...same, ...others].slice(0, 3);
}

export function product(ctx, p) {
  const cat = categoryName(p.category);
  const body = html`
<section class="product-hero dark">
  <div class="container">
    <div class="print-only letterhead">
      <div><img class="print-logo" src="${ctx.root}assets/img/logo.png" alt="Deva Exim INC" width="556" height="160"></div>
      <div>${site.address.line1}, ${site.address.line2}<br>${site.address.locality} ${site.address.postalCode}, ${site.address.region}, India<br>${plain(site.phone.display)}, ${plain(site.email)}, GSTIN ${site.gstin}</div>
    </div>
    ${breadcrumb([['Home', `${ctx.root}index.html`], ['Products', `${ctx.root}products.html`], [cat, `${ctx.root}products.html#${p.category}`], [p.name]])}
    <div class="product-hero__grid">
      <figure class="product-figure" style="--c:${p.hex}">
        ${productImage(ctx, p, { sizes: SIZES.hero, lazy: false, priority: true })}
        ${!p.photo ? html`<figcaption class="no-print">Illustration. Product photography coming soon.</figcaption>`
          : p.photoIsAi ? html`<figcaption class="no-print">Representative image</figcaption>` : ''}
      </figure>
      <div class="product-intro">
        <p class="deva" lang="sa">${p.sanskrit}</p>
        <h1>${p.name}</h1>
        <p class="botanical">${p.slug === 'triphala-powder' ? html`<i>${plain(p.botanicalShort)}</i>` : html`<i>${p.botanical}</i> <span>${p.authority}</span>`}</p>
        <p class="lede">${p.description}</p>
        <dl class="key-facts">
          <div><dt>Minimum order</dt><dd>25 kg</dd></div>
          <div><dt>Part used</dt><dd>${p.part}</dd></div>
          <div><dt>HS code</dt><dd>${p.hs}</dd></div>
          <div><dt>Colour</dt><dd>${dot(p.hex)}${p.colour}</dd></div>
        </dl>
        <div class="actions">
          ${enquireButton(p, 'btn btn--haldi')}
          <a class="btn btn--ghost" href="${ctx.root}contact.html?product=${p.slug}">Request a quote</a>
          <button class="btn-text" type="button" data-print>${icon('print')}Print the spec sheet</button>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section spec-section">
  <div class="container">
    <div class="spec-layout">
      <div class="spec">
        <h2>Specification</h2>
        <div class="spec-doc" style="--c:${p.hex}">
          <div class="spec-doc__head"><strong>${p.name}</strong><span>Typical values. Confirmed per lot on the COA.</span></div>
          <table class="spec-table">
            <caption class="visually-hidden">Specification of ${p.name}</caption>
            <tbody>${specRows(p)}</tbody>
          </table>
        </div>
        <p class="small spec-note">We agree final specifications with you before you order, and confirm them for each lot on the certificate of analysis.</p>
      </div>
      <aside class="spec-aside">
        <div>
          <h2>Used in</h2>
          <ul class="uses">${p.applications.map((a) => html`<li>${a}</li>`)}</ul>
        </div>
        <div class="tradition">
          <h2>In Ayurveda</h2>
          ${p.etymology ? html`<p class="etymology">${p.etymology}</p>` : ''}
          <p>${p.traditional}</p>
          <p class="small">Traditional use is described for information. It is not a medical claim.</p>
        </div>
      </aside>
    </div>
    <p class="print-only print-footer">Specification sheet from ${plain(site.url)}/${productUrl(p)}<span data-print-date></span>. Values are typical; final specifications are confirmed per lot on the certificate of analysis.</p>
  </div>
</section>

<section class="section section--tint related">
  <div class="container">
    <div class="section-head"><h2>You might also need</h2></div>
    <div class="grid-cards">${related(p).map((r) => productCard(ctx, r, 'h3'))}</div>
  </div>
</section>

${ctaPanel(ctx, { title: `Get a quote for ${p.name}`, product: p })}`;

  return {
    title: `${p.name} exporter from India | ${p.botanicalShort ? 'Triphala churna' : text(p.botanical)} | Deva Exim`,
    description: `${p.summary} Exported from Pune, India from 25 kg, HS ${text(p.hs)}, with COA and export documents.`,
    body,
    image: shareImg(p) || p.photo || undefined,
    ogType: 'product',
    waText: `Hello Deva Exim, I would like a quotation for ${p.name}.`,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description: p.description,
        image: abs(productImg(p)),
        url: abs(productUrl(p)),
        category: cat,
        brand: { '@type': 'Brand', name: site.shortName },
        countryOfOrigin: { '@type': 'Country', name: 'India' },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Botanical name', value: text(p.botanical) },
          { '@type': 'PropertyValue', name: 'Part used', value: p.part },
          { '@type': 'PropertyValue', name: 'Minimum order quantity', value: '25 kg' },
          { '@type': 'PropertyValue', name: 'HS code', value: text(p.hs) },
        ],
      },
      crumbLd([['Home', ''], ['Products', 'products.html'], [p.name, productUrl(p)]]),
    ],
  };
}

// ======================================================================
// Quality
// ======================================================================

const PACK_ART = {
  '25 kg HDPE woven bag': `<svg viewBox="0 0 240 180" aria-hidden="true"><defs><pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#e1e3d8" stroke-width="1.2"/></pattern></defs>
    <ellipse cx="120" cy="160" rx="60" ry="7" fill="#17211a" opacity=".12"/>
    <path d="M72 32 Q120 24 168 32 L174 152 Q120 162 66 152 Z" fill="#fbfbf6" stroke="#c4c8b9" stroke-width="1.5"/>
    <path d="M72 32 Q120 24 168 32 L174 152 Q120 162 66 152 Z" fill="url(#weave)"/>
    <path d="M74 41 Q120 33 166 41" stroke="#8d937f" stroke-width="1.6" stroke-dasharray="3 3" fill="none"/>
    <rect x="92" y="68" width="56" height="46" rx="3" fill="#11241a"/>
    <path d="M101 81h38M101 91h26M101 101h32" stroke="#e4a11b" stroke-width="3" stroke-linecap="round"/></svg>`,
  '25 kg kraft paper bag': `<svg viewBox="0 0 240 180" aria-hidden="true">
    <ellipse cx="120" cy="160" rx="58" ry="7" fill="#17211a" opacity=".12"/>
    <path d="M76 30 H164 L170 154 H70 Z" fill="#c9a46e"/>
    <path d="M76 30 H164 L166 44 H74 Z" fill="#b38d57"/>
    <path d="M86 44 L84 152 M154 44 L156 152" stroke="#a7834f" stroke-width="1.5"/>
    <rect x="96" y="76" width="48" height="40" rx="3" fill="#f7f2e6"/>
    <path d="M104 88h32M104 97h22M104 106h28" stroke="#2f5d3f" stroke-width="3" stroke-linecap="round"/></svg>`,
  'Fibre drum': `<svg viewBox="0 0 240 180" aria-hidden="true">
    <ellipse cx="120" cy="160" rx="54" ry="8" fill="#17211a" opacity=".12"/>
    <path d="M74 40 V148 A46 12 0 0 0 166 148 V40 Z" fill="#b98b55"/>
    <path d="M74 40 V148 A46 12 0 0 0 96 158 V48 A46 12 0 0 1 74 40Z" fill="#a37744" opacity=".7"/>
    <ellipse cx="120" cy="40" rx="46" ry="12" fill="#5c646b"/>
    <ellipse cx="120" cy="38" rx="42" ry="10" fill="#7d868d"/>
    <path d="M74 52 A46 12 0 0 0 166 52 M74 136 A46 12 0 0 0 166 136" stroke="#5c646b" stroke-width="4" fill="none"/>
    <rect x="100" y="80" width="40" height="34" rx="3" fill="#f7f2e6"/>
    <path d="M107 90h26M107 98h18M107 106h22" stroke="#2f5d3f" stroke-width="3" stroke-linecap="round"/></svg>`,
  'Retail and private label': `<svg viewBox="0 0 240 180" aria-hidden="true">
    <ellipse cx="120" cy="160" rx="46" ry="7" fill="#17211a" opacity=".12"/>
    <path d="M84 28 H156 Q162 28 162 34 L166 146 Q166 156 156 156 H84 Q74 156 74 146 L78 34 Q78 28 84 28Z" fill="#11241a"/>
    <path d="M80 44 H160" stroke="#2c4a39" stroke-width="3"/>
    <rect x="96" y="62" width="48" height="46" rx="23" fill="#e2a21c"/>
    <rect x="96" y="62" width="48" height="46" rx="23" fill="none" stroke="#f0c766" stroke-width="2"/>
    <path d="M98 122h44M104 132h32" stroke="#e4a11b" stroke-width="3" stroke-linecap="round"/></svg>`,
};

export function quality(ctx) {
  const body = html`
${pageHead({
    title: 'Quality you can check',
    lede: 'A herbal powder is only as good as the lot it comes from. Here is how each lot is handled, the specifications we work to and the documents you receive.',
    crumbs: [['Home', 'index.html'], ['Quality']],
  })}
<section class="section">
  <div class="container">
    <div class="section-head"><h2>How each lot is handled</h2><p>Six steps between the raw herb and a sealed, labelled bag.</p></div>
    <ol class="journey">
      ${journey.map((s, i) => html`<li class="journey__step"><span class="journey__num" aria-hidden="true">${i + 1}</span><h3>${s.title}</h3><p>${s.text}</p></li>`)}
    </ol>
  </div>
</section>

<section class="section section--tint">
  <div class="container">
    <div class="section-head">
      <h2>Typical specifications</h2>
      <p>Limits depend on the product and on the rules of your market. We agree them before you order and confirm them for each lot on the certificate of analysis.</p>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <caption class="visually-hidden">Typical quality parameters</caption>
        <thead><tr><th scope="col">Parameter</th><th scope="col">Typical specification</th><th scope="col">How it is checked</th></tr></thead>
        <tbody>${qualityParams.map((q) => html`<tr><th scope="row">${q.param}</th><td>${q.value}</td><td>${q.method}</td></tr>`)}</tbody>
      </table>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><h2>Documents you receive</h2><p>Prepared for each shipment, so your customs broker and quality team have what they need.</p></div>
    <ul class="doc-list">
      ${documents.map((d) => html`<li><h3>${d.name}</h3><p>${d.text}</p></li>`)}
    </ul>
  </div>
</section>

<section class="section section--tint">
  <div class="container">
    <div class="section-head"><h2>Packaging</h2><p>Every pack is sealed, labelled with the product, lot number and packing date, and palletised for export on request.</p></div>
    <div class="packs">
      ${packaging.map((k) => html`<article class="pack">${raw(PACK_ART[k.name])}<h3>${k.name}</h3><p>${k.text}</p><p><span class="size">${k.size}</span></p></article>`)}
    </div>
  </div>
</section>

<section class="section">
  <div class="container split split--even">
    <div class="prose">
      <h2>Test before you buy</h2>
      <p>${tbc('We send samples of 100 to 250 g per product by international courier, with a specification sheet, so you can test them in your own lab before a first order of 25 kg or more.', NOTES.samples)}</p>
      <p><a class="btn btn--leaf" href="contact.html?samples=1">Ask for samples</a></p>
    </div>
    <div class="prose">
      <h2>Ayurvedic Pharmacopoeia and your market</h2>
      <p>${tbc('For herbal powders we work to the identity and purity limits of the Ayurvedic Pharmacopoeia of India. If your market applies stricter limits, for example EU pesticide maximum residue levels, tell us at the enquiry stage and we will test against them.', 'Pharmacopoeia and market testing: confirm the client can commit to this.')}</p>
    </div>
  </div>
</section>
${ctaPanel(ctx)}`;

  return {
    title: 'Quality, testing and documents | Deva Exim INC',
    description: 'How Deva Exim cleans, mills, tests and packs herbal and spice powders. Typical specifications, certificates of analysis, phytosanitary certificates and export packaging.',
    body,
    jsonld: [crumbLd([['Home', ''], ['Quality', 'quality.html']])],
  };
}

// ======================================================================
// Export
// ======================================================================

export function exportPage(ctx) {
  const body = html`
${pageHead({
    title: 'Exporting with Deva Exim',
    lede: 'How an order works, the terms we trade on, and answers to the questions buyers ask first.',
    crumbs: [['Home', 'index.html'], ['Export']],
  })}
<section class="section">
  <div class="container">
    <div class="section-head"><h2>How ordering works</h2><p>From your first message to goods leaving the port.</p></div>
    <ol class="steps">
      ${orderSteps.map((s) => html`<li><h3>${s.title}</h3><p>${s.text}</p></li>`)}
    </ol>
  </div>
</section>

<section class="section dark export-band">
  <div class="container export-grid">
    <div class="export-copy">
      <h2>Trade terms</h2>
      <p>The usual terms are below. Everything can be discussed for regular orders.</p>
      ${routeDiagram()}
    </div>
    <dl class="def-list def-list--dark">
      ${tradeTerms.map((t) => html`<div><dt>${t.term}</dt><dd>${t.value}</dd></div>`)}
    </dl>
  </div>
</section>

<section class="section" id="faq">
  <div class="container">
    <div class="section-head"><h2>Questions buyers ask</h2></div>
    <div class="faq">
      ${faq.map((f, i) => html`<details${raw(i === 0 ? ' open' : '')}><summary>${f.q}</summary><div class="answer"><p>${f.a}</p></div></details>`)}
    </div>
  </div>
</section>
${ctaPanel(ctx)}`;

  return {
    title: 'Export terms, shipping and FAQ | Deva Exim INC',
    description: 'Minimum order 25 kg per product. Sea freight from JNPT (Nhava Sheva), air freight from Mumbai. Incoterms, payment terms, documents and answers to common buyer questions.',
    body,
    jsonld: [
      crumbLd([['Home', ''], ['Export', 'export.html']]),
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: text(f.a) } })),
      },
    ],
  };
}

// ======================================================================
// About
// ======================================================================

export function about(ctx) {
  const a = site.address;
  const body = html`
${pageHead({
    title: 'Rooted in Pune, supplying the world',
    lede: `${site.name} is a Pune-based supplier, exporter, trader and distributor of Ayurvedic herbal powders and spice powders, started in ${site.founded}.`,
    crumbs: [['Home', 'index.html'], ['About']],
  })}
<section class="section">
  <div class="container split">
    <div class="name-meaning">
      <p class="deva" lang="sa">देव</p>
      <p><strong>Deva</strong> is Sanskrit for divine. Long before they were commodities, the herbs we trade were treated as gifts. We want them to reach you that way: clean, honest and as nature made them.</p>
    </div>
    <div class="prose">
      <h2>Our story</h2>
      <p>${tbc(`Deva Exim began in ${site.founded} in Narhe, on the southern edge of Pune, with a simple aim: make it easy for buyers abroad to source authentic Indian herbs and spices from a partner who answers questions directly.`, 'Company story: written as a starting point. Replace with the client’s own story.')}</p>
      <p>${tbc('We keep a focused range of ten products so we can know each one well: how it should look and smell, which part of the plant it comes from, and what a good lot shows on a certificate of analysis.', 'Company story: written as a starting point. Replace with the client’s own story.')}</p>
      <p>Pune also makes shipping practical. JNPT (Nhava Sheva), one of India’s busiest container ports, is about 140 km away by expressway, and Mumbai’s air cargo terminal is a similar drive.</p>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="container split">
    <div class="section-head"><h2>Company details</h2><p>The facts our buyers’ compliance teams usually ask for.</p></div>
    <dl class="def-list">
      <div><dt>Legal name</dt><dd>${site.name}</dd></div>
      <div><dt>Legal form</dt><dd>${site.legalForm}</dd></div>
      <div><dt>Established</dt><dd>${site.founded}</dd></div>
      <div><dt>Business</dt><dd>${site.businessType}</dd></div>
      <div><dt>GSTIN</dt><dd>${site.gstin} <button class="copy-btn" type="button" data-copy="${site.gstin}">${icon('copy')}<span class="copy-label">Copy</span></button></dd></div>
      <div><dt>IEC</dt><dd>${site.iec}</dd></div>
      <div><dt>Contact person</dt><dd>${site.contactPerson}</dd></div>
      <div><dt>Address</dt><dd>${a.line1}, ${a.line2}, ${a.locality}, ${a.region} ${a.postalCode}, ${a.country}</dd></div>
    </dl>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><h2>How we work</h2></div>
    <div class="values">
      <div><h3>Specific, not vague</h3><p>Every product page lists the botanical name, the part used, the HS code and the parameters we check. If we do not know something yet, we say so.</p></div>
      <div><h3>Samples before promises</h3><p>We would rather you test our material than take our word for it. Ask for samples, then start with a trial order of 25 kg.</p></div>
      <div><h3>One contact, start to finish</h3><p>${tbc('You deal with the same person from quotation to delivery, by email, phone or WhatsApp.', 'Single point of contact: confirm.')}</p></div>
    </div>
  </div>
</section>
${ctaPanel(ctx)}`;

  return {
    title: 'About Deva Exim INC | Herbal powder exporter in Pune',
    description: `Deva Exim INC, Narhe, Pune: supplier, exporter, trader and distributor of Ayurvedic herbal and spice powders since ${site.founded}. GSTIN ${site.gstin}.`,
    body,
    jsonld: [orgLd(), crumbLd([['Home', ''], ['About', 'about.html']])],
  };
}

// ======================================================================
// Contact
// ======================================================================

const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Netherlands', 'France', 'Italy', 'Spain', 'Poland', 'Belgium', 'Ireland', 'Sweden', 'Denmark', 'Switzerland', 'Canada', 'Australia', 'New Zealand', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Israel', 'Turkey', 'Egypt', 'South Africa', 'Kenya', 'Nigeria', 'Singapore', 'Malaysia', 'Indonesia', 'Thailand', 'Vietnam', 'Philippines', 'Japan', 'South Korea', 'China', 'Sri Lanka', 'Bangladesh', 'Nepal', 'Brazil', 'Mexico', 'India'];

export function contact(ctx) {
  const a = site.address;
  const body = html`
${pageHead({
    title: 'Request a quote',
    lede: html`Tell us what you need and where it is going. We reply ${site.responseTime} with prices, lead time and freight options.`,
    crumbs: [['Home', 'index.html'], ['Contact']],
  })}
<section class="section">
  <div class="container contact-layout">
    <div>
      <form class="form" id="enquiry-form" novalidate data-endpoint="${site.formEndpoint}" data-email="${site.email}" data-whatsapp="${site.whatsapp}"
        method="post" action="${site.formEndpoint || `mailto:${plain(site.email)}?subject=Website%20enquiry`}"${raw(site.formEndpoint ? '' : ' enctype="text/plain"')}>
        <div class="form-step">
          <fieldset>
            <legend>What do you need?</legend>
            <p class="small" id="products-hint">Tick one or more products. Anything in your enquiry list is already ticked.</p>
            <div class="picker" role="group" aria-label="Products" aria-describedby="products-hint">
              ${products.map((p) => html`<label class="pick"><input type="checkbox" name="products" value="${p.slug}">${dot(p.hex)}<span>${p.name}</span>${icon('check', 'icon tick')}</label>`)}
            </div>
            <p class="error" data-error-for="products" hidden></p>
          </fieldset>
          <div class="field">
            <span class="label" id="qty-label">Quantities <span class="opt">(optional, minimum 25 kg each)</span></span>
            <div class="qty-list" data-qty-list role="group" aria-labelledby="qty-label"></div>
          </div>
        </div>

        <div class="form-step">
          <fieldset>
            <legend>Where is it going?</legend>
            <div class="form-grid form-grid--2">
              <div class="field">
                <label for="f-country">Destination country</label>
                <input id="f-country" name="country" list="country-list" autocomplete="country-name" required aria-describedby="err-country">
                <datalist id="country-list">${COUNTRIES.map((c) => html`<option value="${c}">`)}</datalist>
                <p class="error" id="err-country" data-error-for="country" hidden></p>
              </div>
              <div class="field">
                <label for="f-port">Port or city <span class="opt">(optional)</span></label>
                <input id="f-port" name="port" autocomplete="address-level2">
              </div>
              <div class="field">
                <label for="f-incoterm">Incoterm <span class="opt">(optional)</span></label>
                <select id="f-incoterm" name="incoterm">
                  <option value="">Not sure yet, please advise</option>
                  <option value="EXW Pune">EXW Pune</option><option value="FOB Nhava Sheva">FOB Nhava Sheva</option><option value="CFR">CFR</option><option value="CIF">CIF</option>
                </select>
              </div>
              <div class="field">
                <label for="f-packaging">Packaging <span class="opt">(optional)</span></label>
                <select id="f-packaging" name="packaging">
                  <option value="">Standard 25 kg bags</option>
                  <option value="Kraft paper bags">Kraft paper bags</option><option value="Fibre drums">Fibre drums</option><option value="Retail or private label packs">Retail or private label packs</option>
                </select>
              </div>
            </div>
            <label class="check"><input type="checkbox" name="samples" value="yes" data-samples> I would like samples before ordering</label>
          </fieldset>
        </div>

        <div class="form-step">
          <fieldset>
            <legend>How do we reach you?</legend>
            <div class="form-grid form-grid--2">
              <div class="field">
                <label for="f-name">Your name</label>
                <input id="f-name" name="name" autocomplete="name" required aria-describedby="err-name">
                <p class="error" id="err-name" data-error-for="name" hidden></p>
              </div>
              <div class="field">
                <label for="f-company">Company</label>
                <input id="f-company" name="company" autocomplete="organization" required aria-describedby="err-company">
                <p class="error" id="err-company" data-error-for="company" hidden></p>
              </div>
              <div class="field">
                <label for="f-email">Email</label>
                <input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="err-email" spellcheck="false">
                <p class="error" id="err-email" data-error-for="email" hidden></p>
              </div>
              <div class="field">
                <label for="f-phone">Phone or WhatsApp <span class="opt">(optional)</span></label>
                <input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="+44 20 7946 0000">
              </div>
            </div>
            <div class="field">
              <label for="f-message">Anything else? <span class="opt">(optional)</span></label>
              <textarea id="f-message" name="message" placeholder="Specifications, certificates you need, target price, delivery date"></textarea>
            </div>
            <label class="hp" aria-hidden="true">Leave this empty <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
          </fieldset>
        </div>

        <div class="form-actions">
          <button class="btn btn--leaf" type="submit">${icon('mail')}${site.formEndpoint ? 'Send enquiry' : 'Send enquiry by email'}</button>
          <button class="btn btn--outline" type="button" data-send-whatsapp>${icon('chat')}Send on WhatsApp</button>
        </div>
        <p class="form-status" role="status" aria-live="polite"></p>
        <p class="small">We use these details only to answer your enquiry. Read the <a href="privacy.html">privacy note</a>.</p>
      </form>

      <div class="sent" data-sent hidden tabindex="-1">
        <h2>Thank you</h2>
        <p data-sent-how></p>
        <p>We reply ${plain(site.responseTime)}. If your enquiry is urgent, call us on <a href="tel:${site.phone.tel}">${plain(site.phone.display)}</a>.</p>
        <button class="btn btn--haldi" type="button" data-new-enquiry>Send another enquiry</button>
      </div>
    </div>

    <aside class="contact-cards" aria-label="Contact details">
      <div class="contact-card">
        <span class="icon-wrap">${icon('phone')}</span>
        <h2>Call</h2>
        <a href="tel:${site.phone.tel}">${site.phone.display}</a>
        <p class="small">Ask for ${site.contactPerson}. ${site.hours}.</p>
      </div>
      <div class="contact-card">
        <span class="icon-wrap">${icon('chat')}</span>
        <h2>WhatsApp</h2>
        <a href="${waLink('Hello Deva Exim, I would like a quotation.')}" target="_blank" rel="noopener">Message us on WhatsApp</a>
        <p class="small">Good for quick questions and for sharing documents.</p>
      </div>
      <div class="contact-card">
        <span class="icon-wrap">${icon('mail')}</span>
        <h2>Email</h2>
        <a href="mailto:${site.email}">${site.email}</a>
        <p class="small">For detailed enquiries and specifications.</p>
      </div>
      <div class="contact-card">
        <span class="icon-wrap">${icon('pin')}</span>
        <h2>Office</h2>
        <address>${site.name}<br>${a.line1}<br>${a.line2}<br>${a.locality} ${a.postalCode}, ${a.region}, ${a.country}</address>
        <p class="small"><a href="${site.mapUrl}" target="_blank" rel="noopener">Open in Google Maps</a>. ${tbc('Visits by appointment.', 'Office visits: confirm whether buyers can visit, and on what terms.')}</p>
      </div>
      <div class="contact-card">
        <span class="icon-wrap">${icon('receipt')}</span>
        <h2>GSTIN</h2>
        <span class="value">${site.gstin}</span>
        <p><button class="copy-btn" type="button" data-copy="${site.gstin}">${icon('copy')}<span class="copy-label">Copy GSTIN</span></button></p>
      </div>
    </aside>
  </div>
</section>`;

  return {
    title: 'Request a quote | Contact Deva Exim INC, Pune',
    description: 'Send an enquiry for Ayurvedic herbal and spice powders. Choose products and quantities, tell us your destination, and get a quotation with freight options.',
    body,
    jsonld: [orgLd(), crumbLd([['Home', ''], ['Contact', 'contact.html']])],
  };
}

// ======================================================================
// Privacy & 404
// ======================================================================

export function privacy(ctx) {
  const updated = new Date().toISOString().slice(0, 10);
  const body = html`
${pageHead({ title: 'Privacy note', lede: `Last updated ${updated}.`, crumbs: [['Home', 'index.html'], ['Privacy']] })}
<section class="section">
  <div class="container">
    <div class="prose">
      <h2>What we receive</h2>
      <p>${site.formEndpoint
        ? 'When you send an enquiry, the form sends us the details you typed: your name, company, contact details, the products and quantities you need, and your message. The form is processed by our form service provider so that it can be delivered to our inbox.'
        : 'When you send an enquiry, your email app or WhatsApp sends us the details you typed: your name, company, contact details, the products and quantities you need, and your message. This website does not store them anywhere else.'}</p>
      <h2>Your enquiry list</h2>
      <p>Products you add to your enquiry list are saved in your browser’s local storage, on your own device, so the list stays while you browse. It leaves your device only when you send an enquiry. Removing products from the list deletes them.</p>
      <h2>Cookies and tracking</h2>
      <p>This site sets no cookies and uses no analytics or advertising trackers. Fonts are loaded from Google Fonts, which receives your IP address when the fonts download.</p>
      <h2>How we use enquiries</h2>
      <p>${tbc('Only to reply to you, prepare quotations and fulfil orders. We do not sell or share your details with anyone else, except service providers such as freight forwarders when you place an order.', 'Privacy commitments: confirm with the client.')}</p>
      <h2>Questions</h2>
      <p>Email <a href="mailto:${site.email}">${site.email}</a> to ask what we hold about you or to have it deleted.</p>
    </div>
  </div>
</section>`;
  return {
    title: 'Privacy note | Deva Exim INC',
    description: 'How Deva Exim INC handles the details you send with an enquiry. No cookies, no tracking.',
    body,
  };
}

export function notFound(ctx) {
  const body = html`
<section class="section dark" style="min-height:60vh;display:grid;align-items:center">
  <div class="container lost">
    <p class="deva" lang="sa" style="font-size:2rem;color:var(--haldi)">हरिद्रा</p>
    <h1 class="display">This page has gone to powder.</h1>
    <p class="lede">The link may be old or mistyped. The catalogue is a good place to start, or tell us what you were looking for.</p>
    <div class="actions">
      <a class="btn btn--haldi" href="${ctx.root}products.html">Browse the catalogue</a>
      <a class="btn btn--ghost" href="${ctx.root}contact.html">Contact us</a>
    </div>
  </div>
</section>`;
  return { title: 'Page not found | Deva Exim INC', description: 'This page could not be found.', body, noindex: true };
}
