// All site content lives here. Edit this file, then run:  node _src/build.mjs
// Anything wrapped in tbc(value, note) is unconfirmed: it shows normally on the site,
// is highlighted in review mode (open any page with ?review), and is listed in
// docs/content-to-confirm.md after each build.

import { tbc, frag } from './lib.mjs';

// Shared review notes, so one decision shows up once in docs/content-to-confirm.md.
export const NOTES = {
  samples: 'Samples: confirm the sample size (100 to 250 g assumed) and whether courier charges apply.',
  payment: 'Payment terms: placeholder. Confirm.',
  leadTime: 'Lead time: placeholder. Confirm.',
  organic: 'Organic: the directory listing says "Organic: Yes". Certified organic (NPOP, USDA NOP, EU) needs certificates. Confirm before launch.',
  privateLabel: 'Private label and retail packs: confirm the client offers these, and in which sizes.',
  incoterms: 'Incoterms on offer: confirm.',
  particle: 'Particle size: 60 to 80 mesh is a typical value, not from the client. Confirm per product.',
  microbes: 'Microbial limits: typical values. Confirm.',
};

export const site = {
  name: 'Deva Exim INC',
  shortName: 'Deva Exim',
  // Used for canonical URLs, sitemap and social previews. No trailing slash.
  url: tbc('https://www.devaexim.co.in', 'Domain: devaexim.co.in does not resolve at the moment (DNS). Confirm the client still owns it, or choose the new domain, then update site.url.'),
  founded: 2023,
  businessType: 'Supplier, exporter, trader and distributor',
  contactPerson: 'Mr. Milind Joshi',
  phone: {
    display: tbc('+91 94038 89604', 'Phone: the old website showed +91 94038 89604; directory listings show other numbers that belong to the directory itself. Confirm the sales number.'),
    tel: '+919403889604',
  },
  whatsapp: tbc('919403889604', 'WhatsApp: assumed to be the same number as the phone. Confirm.'),
  email: tbc('info@devaexim.co.in', 'Email: no address was found online. This is a placeholder on the (unconfirmed) domain.'),
  hours: tbc('Monday to Saturday, 10:00 to 18:30 IST', 'Business hours: placeholder.'),
  responseTime: tbc('within one working day', 'Reply time promise: placeholder. Only keep it if the team can meet it.'),
  gstin: '27AHGPT6052Q1ZJ',
  iec: tbc('Shared with quotations', 'IEC (Import Export Code): add the number, or keep this wording.'),
  legalForm: tbc('Proprietorship', 'Legal form: inferred from the GSTIN (the 4th character of the embedded PAN is P, an individual). Confirm.'),
  address: {
    line1: 'Flat A-18, 4th floor, Shreevihar Society',
    line2: 'Manaji Nagar, near Dnyandeep Nursery School',
    locality: 'Narhe, Pune',
    region: 'Maharashtra',
    postalCode: '411041',
    country: 'India',
  },
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Shreevihar Society, Manaji Nagar, Narhe, Pune 411041'),
  // Optional: a form backend (Formspree, Web3Forms, Getform...). Leave empty to send
  // enquiries through the visitor's email app or WhatsApp instead.
  formEndpoint: '',
};

export const categories = [
  { id: 'herbal', name: 'Herbal powders', blurb: 'Classical Ayurvedic herbs, milled from dried roots, leaves and fruits.' },
  { id: 'spice', name: 'Spice powders', blurb: 'Two staples of the Indian kitchen, ground for food and wellness brands.' },
  { id: 'leaves', name: 'Dried leaves', blurb: 'Leaves for infusions, further milling and extraction.' },
];

const MOQ = '25 kg';
const PACK = tbc('25 kg bags with a food-grade liner, or packed to your specification', 'Packaging: the listing says "plastic bag or as per requirement". Confirm bag types and sizes.');
const MESH = tbc('60 to 80 mesh', NOTES.particle);
const MOISTURE = tbc('8% or less', 'Moisture limit: typical value, not from the client. Confirm per product.');
const SHELF = tbc('24 months, sealed, in a cool and dry store', 'Shelf life: typical value. Confirm per product.');
const CULTIVATION = tbc('Organically grown', NOTES.organic);
const HS_NOTE = 'HS code: indicative only. Confirm classification with the customs broker.';

// hex = the real colour of the powder. It drives the swatches, artwork and accents.
export const products = [
  {
    slug: 'ashwagandha-powder',
    name: 'Ashwagandha powder',
    short: 'Ashwagandha',
    category: 'herbal',
    sanskrit: 'अश्वगन्धा', sanskritLatin: 'Ashwagandha',
    botanical: 'Withania somnifera', authority: '(L.) Dunal', family: 'Solanaceae',
    part: 'Root', form: 'Fine powder',
    colour: 'Creamy brown', hex: '#C9AE84',
    aka: ['Indian ginseng', 'Winter cherry', 'Asgandh'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Creamy-brown powder milled from the dried roots of Withania somnifera.',
    description: 'Milled from sun-dried Ashwagandha roots and sieved to a fine, even powder. One of the most requested Ayurvedic herbs worldwide, it goes into capsules, tablets, powdered drinks and herbal blends.',
    traditional: 'Ayurveda classes Ashwagandha as a rasayana, a rejuvenating herb, and traditionally uses it to support strength and vitality.',
    etymology: 'Sanskrit for “smell of a horse”, a nod to the root’s earthy aroma and the strength it is associated with.',
    applications: ['Capsules and tablets', 'Powdered drinks and lattes', 'Ayurvedic formulations', 'Sports and wellness blends'],
    garnish: 'roots',
  },
  {
    slug: 'shatavari-powder',
    name: 'Shatavari powder',
    short: 'Shatavari',
    category: 'herbal',
    sanskrit: 'शतावरी', sanskritLatin: 'Shatavari',
    botanical: 'Asparagus racemosus', authority: 'Willd.', family: 'Asparagaceae',
    part: 'Tuberous root', form: 'Fine powder',
    colour: 'Off-white', hex: '#EAE2CF',
    aka: ['Wild asparagus', 'Satavar'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Off-white powder from the dried tuberous roots of Asparagus racemosus.',
    description: 'Pale, almost white powder milled from the cleaned and dried tuberous roots of Shatavari. Its mild taste makes it easy to use in capsules, milk-based drinks and women’s wellness blends.',
    traditional: 'A classical rasayana of Ayurveda, traditionally used in preparations for women’s health.',
    etymology: '“Shata” means a hundred in Sanskrit, often read as a reference to the plant’s many roots.',
    applications: ['Women’s wellness formulations', 'Capsules and tablets', 'Milk and malt drinks', 'Ayurvedic formulations'],
    garnish: 'roots',
  },
  {
    slug: 'neem-powder',
    name: 'Neem powder',
    short: 'Neem',
    category: 'herbal',
    sanskrit: 'निम्ब', sanskritLatin: 'Nimba',
    botanical: 'Azadirachta indica', authority: 'A. Juss.', family: 'Meliaceae',
    part: 'Leaf', form: 'Fine powder',
    colour: 'Olive green', hex: '#66703A',
    aka: ['Indian lilac', 'Kadunimb', 'Nimba'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Olive-green powder of shade-dried Azadirachta indica leaves.',
    description: 'Neem leaves, dried away from direct sun to keep their colour, then milled to a fine olive-green powder. Bitter and aromatic, it is a staple of herbal skin, hair and oral care.',
    traditional: 'Valued in Ayurveda for its bitter taste, Neem is traditionally used in skin-care and cleansing preparations.',
    applications: ['Face packs and skin care', 'Herbal shampoos and hair care', 'Soaps and cleansers', 'Herbal tooth powders'],
    garnish: 'neem',
  },
  {
    slug: 'tulsi-powder',
    name: 'Tulsi powder',
    short: 'Tulsi',
    category: 'herbal',
    sanskrit: 'तुलसी', sanskritLatin: 'Tulasi',
    botanical: 'Ocimum tenuiflorum', authority: 'L.', family: 'Lamiaceae',
    part: 'Leaf', form: 'Fine powder',
    colour: 'Green', hex: '#72803F',
    aka: ['Holy basil', 'Tulas', 'Ocimum sanctum'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Aromatic green powder of dried holy basil leaves, Ocimum tenuiflorum.',
    description: 'Dried Tulsi leaves milled to an aromatic green powder with the clove-like scent of holy basil. Used in herbal teas, capsules and Ayurvedic blends, and in natural skin care.',
    traditional: 'Grown in courtyards across India, Tulsi is traditionally taken as a tea and used in Ayurvedic blends for the respiratory system.',
    etymology: 'Tulasi is usually translated as “the incomparable one”.',
    applications: ['Herbal and green tea blends', 'Capsules and tablets', 'Ayurvedic formulations', 'Natural skin care'],
    garnish: 'tulsi',
  },
  {
    slug: 'brahmi-powder',
    name: 'Brahmi powder',
    short: 'Brahmi',
    category: 'herbal',
    sanskrit: 'ब्राह्मी', sanskritLatin: 'Brahmi',
    botanical: tbc('Bacopa monnieri', 'Brahmi species: Bacopa monnieri assumed. Some suppliers sell Centella asiatica as Brahmi. Confirm with the client.'),
    authority: '(L.) Wettst.', family: 'Plantaginaceae',
    part: 'Whole herb (aerial parts)', form: 'Fine powder',
    colour: 'Greyish green', hex: '#7E8556',
    aka: ['Water hyssop', 'Bacopa'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Greyish-green powder of the dried herb Bacopa monnieri.',
    description: 'The dried aerial parts of Brahmi, a creeping herb of Indian wetlands, milled to a soft greyish-green powder. A core ingredient in cognitive-wellness formulations and herbal hair oils.',
    traditional: 'Ayurveda counts Brahmi among the medhya rasayanas, herbs traditionally used to support memory and a clear mind.',
    applications: ['Cognitive wellness capsules', 'Ayurvedic formulations', 'Hair oils and hair care', 'Herbal teas'],
    garnish: 'brahmi',
  },
  {
    slug: 'triphala-powder',
    name: 'Triphala powder',
    short: 'Triphala',
    category: 'herbal',
    sanskrit: 'त्रिफला', sanskritLatin: 'Triphala',
    botanical: 'Emblica officinalis, Terminalia chebula, Terminalia bellirica', authority: '', family: 'Phyllanthaceae and Combretaceae',
    botanicalShort: 'Emblica officinalis, Terminalia chebula, T. bellirica',
    part: 'Dried fruit, deseeded', form: 'Fine powder',
    colour: 'Light brown', hex: '#A9875A',
    aka: ['Amla, haritaki and bibhitaki', 'Three fruits'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Light-brown blend of three dried fruits: amla, haritaki and bibhitaki.',
    description: 'Equal parts of three deseeded, dried fruits (amla, haritaki and bibhitaki) milled together into a light-brown powder. One of the best-known Ayurvedic formulations, used as a churna, in tablets and in capsules.',
    traditional: 'Ayurveda traditionally uses Triphala to support digestion and gentle, regular cleansing.',
    etymology: '“Tri” means three and “phala” means fruit.',
    ratio: tbc('1 : 1 : 1 by weight', 'Triphala ratio: the classical equal-parts ratio is assumed. Confirm.'),
    applications: ['Digestive wellness capsules', 'Churna and tablets', 'Herbal teas', 'Hair and skin care'],
    garnish: 'fruits',
  },
  {
    slug: 'moringa-powder',
    name: 'Moringa powder',
    short: 'Moringa',
    category: 'herbal',
    sanskrit: 'शिग्रु', sanskritLatin: 'Shigru',
    botanical: 'Moringa oleifera', authority: 'Lam.', family: 'Moringaceae',
    part: 'Leaf', form: 'Fine powder',
    colour: 'Bright green', hex: '#6F9A34',
    aka: ['Drumstick tree', 'Sahjan', 'Shevga'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Vivid green powder of dried Moringa oleifera leaves.',
    description: 'Moringa leaves stripped from the stem, dried at low temperature and milled to a vivid green powder. Food and supplement brands use it in green blends, smoothies, capsules and fortified foods.',
    traditional: 'Shigru appears in classical Ayurvedic texts, and its leaves have long been eaten as a vegetable across India.',
    applications: ['Superfood and green blends', 'Capsules and tablets', 'Teas and smoothies', 'Bakery and food fortification'],
    garnish: 'moringa',
  },
  {
    slug: 'moringa-dried-leaves',
    name: 'Moringa dried leaves',
    short: 'Moringa leaves',
    category: 'leaves',
    sanskrit: 'शिग्रु पत्र', sanskritLatin: 'Shigru patra',
    botanical: 'Moringa oleifera', authority: 'Lam.', family: 'Moringaceae',
    part: 'Leaf', form: tbc('Whole dried leaflets or tea-cut', 'Moringa leaves: confirm the cuts on offer (whole, crushed, tea-cut).'),
    colour: 'Green', hex: '#5E8A2F',
    aka: ['Drumstick leaves', 'Sahjan patta', 'Shevga pane'],
    hs: tbc('1211.90', HS_NOTE),
    summary: 'Dried Moringa oleifera leaflets, whole or tea-cut.',
    description: 'Clean, dried Moringa leaflets with the stems removed. Supplied whole or tea-cut for herbal teas, or as raw material for milling and extraction.',
    traditional: 'Moringa leaves are cooked as a green vegetable in many Indian homes, especially in Maharashtra and the south.',
    applications: ['Herbal tea and infusions', 'Milling into powder', 'Extraction', 'Food service'],
    garnish: 'moringa',
    leaves: true,
  },
  {
    slug: 'turmeric-powder',
    name: 'Turmeric powder',
    short: 'Turmeric',
    category: 'spice',
    sanskrit: 'हरिद्रा', sanskritLatin: 'Haridra',
    botanical: 'Curcuma longa', authority: 'L.', family: 'Zingiberaceae',
    part: 'Rhizome', form: 'Fine powder',
    colour: 'Golden yellow', hex: '#E2A21C',
    aka: ['Haldi', 'Halad'],
    hs: tbc('0910.30', HS_NOTE),
    summary: 'Golden-yellow powder of boiled, dried turmeric rhizomes.',
    description: 'Turmeric fingers are boiled, sun-dried, polished and milled into a bright golden powder. Used as a spice and a natural colour, and as a source of curcumin for wellness products.',
    traditional: 'Known as Haridra in Sanskrit and Haldi at home, turmeric is part of Indian cooking, ceremonies and Ayurveda alike.',
    curcumin: tbc('Shared on request, per lot', 'Curcumin content: add a typical range (often 2 to 5%) once the source is fixed.'),
    applications: ['Spice blends and curry powders', 'Natural food colour', 'Golden milk and lattes', 'Nutraceuticals and cosmetics'],
    garnish: 'turmeric',
  },
  {
    slug: 'ginger-powder',
    name: 'Ginger powder',
    short: 'Ginger',
    category: 'spice',
    sanskrit: 'शुण्ठी', sanskritLatin: 'Shunthi',
    botanical: 'Zingiber officinale', authority: 'Roscoe', family: 'Zingiberaceae',
    part: 'Rhizome, dried', form: 'Fine powder',
    colour: 'Pale beige', hex: '#D7C094',
    aka: ['Sonth', 'Saunth', 'Sunth', 'Dry ginger'],
    hs: tbc('0910.12', HS_NOTE),
    summary: 'Pale beige powder of dried ginger rhizomes, known in India as sonth.',
    description: 'Peeled and dried ginger (sonth) milled to a pale, warming powder. Goes into spice mixes, bakery, beverages and teas, and into digestive wellness products.',
    traditional: 'Ayurvedic texts call dry ginger vishwabheshaj, “the universal medicine”.',
    applications: ['Spice blends and masalas', 'Bakery and confectionery', 'Teas and beverages', 'Nutraceuticals'],
    garnish: 'ginger',
  },
];

// Shared specification values (product-specific rows are added in the template).
export const commonSpec = { MOQ, PACK, MESH, MOISTURE, SHELF, CULTIVATION };

export const industries = [
  {
    name: 'Nutraceuticals and supplements',
    text: 'Capsules, tablets, gummies and powdered drinks.',
    products: ['ashwagandha-powder', 'moringa-powder', 'turmeric-powder', 'shatavari-powder', 'brahmi-powder', 'triphala-powder'],
  },
  {
    name: 'Ayurvedic manufacturers',
    text: 'Churnas, classical formulations and contract manufacturing.',
    products: ['ashwagandha-powder', 'shatavari-powder', 'triphala-powder', 'brahmi-powder', 'neem-powder', 'tulsi-powder'],
  },
  {
    name: 'Food and beverage',
    text: 'Teas, lattes, seasonings, bakery and fortified foods.',
    products: ['turmeric-powder', 'ginger-powder', 'moringa-powder', 'tulsi-powder', 'moringa-dried-leaves'],
  },
  {
    name: 'Cosmetics and personal care',
    text: 'Face packs, hair care, soaps and herbal cosmetics.',
    products: ['neem-powder', 'turmeric-powder', 'tulsi-powder', 'brahmi-powder', 'triphala-powder'],
  },
];

export const journey = [
  { title: 'Sourcing', text: tbc('Raw herbs are bought from growers and processing units in the regions where each plant grows best.', 'Sourcing: describe the real sourcing (regions, partners). This is a generic description.') },
  { title: 'Cleaning and drying', text: 'Stones, stems and foreign matter are removed, and the material is dried until it is shelf-stable.' },
  { title: 'Milling and sieving', text: frag`Dried material is ground and sieved to an even particle size, typically ${MESH}.` },
  { title: 'Checking', text: tbc('Every lot is checked for moisture, particle size, colour and aroma. Third-party lab reports are available on request.', 'Quality checks: confirm what is checked in-house and which lab is used.') },
  { title: 'Packing', text: 'Packed in food-grade liners inside 25 kg bags, each labelled with the product, lot number and packing date.' },
  { title: 'Shipping', text: 'Trucked from Pune to JNPT (Nhava Sheva) for sea freight, or to Mumbai air cargo, with export documents prepared.' },
];

export const orderSteps = [
  { title: 'Send your enquiry', text: 'Tell us the products, quantities, packaging and destination. The enquiry form or WhatsApp both work.' },
  { title: 'Get a quotation', text: frag`We reply ${site.responseTime} with prices, lead time and the Incoterm you asked for.` },
  { title: 'Approve samples', text: tbc('If you need samples, we courier 100 to 250 g of each product for testing.', NOTES.samples) },
  { title: 'Confirm the order', text: 'You confirm quantities and specifications; we issue a proforma invoice for payment.' },
  { title: 'Production and checks', text: 'Your lot is milled, checked and packed, and we send you the certificate of analysis.' },
  { title: 'Dispatch', text: 'Goods leave for the port with the shipping documents, and we share tracking details.' },
];

export const tradeTerms = [
  { term: 'Minimum order', value: '25 kg per product. Several products can share one shipment.' },
  { term: 'Incoterms', value: tbc('EXW Pune, FOB Nhava Sheva, CFR or CIF to your port', NOTES.incoterms) },
  { term: 'Payment', value: tbc('Bank transfer (T/T) in advance, or L/C at sight for larger orders', NOTES.payment) },
  { term: 'Lead time', value: tbc('Usually 7 to 15 days from confirmation to dispatch', NOTES.leadTime) },
  { term: 'Sea freight', value: 'From JNPT (Nhava Sheva), about 140 km from Pune. LCL for smaller orders, FCL for full containers.' },
  { term: 'Air freight', value: 'From Mumbai air cargo (CSMIA) for urgent consignments. Samples go by international courier.' },
];

export const documents = [
  { name: 'Commercial invoice and packing list', text: 'With every shipment.' },
  { name: 'Certificate of analysis (COA)', text: 'For each lot, listing the tested parameters.' },
  { name: 'Phytosanitary certificate', text: 'Issued by India’s plant quarantine authority for plant products.' },
  { name: 'Certificate of origin', text: 'For customs and preferential duty where it applies.' },
  { name: 'Safety data sheet', text: 'On request for each product.' },
  { name: 'Fumigation or other certificates', text: 'Arranged when your country or buyer requires them.' },
];

export const qualityParams = [
  { param: 'Moisture (loss on drying)', value: MOISTURE, method: 'Oven drying' },
  { param: 'Particle size', value: tbc('95% passes 60 to 80 mesh', NOTES.particle), method: 'Sieve analysis' },
  { param: 'Total ash and acid-insoluble ash', value: tbc('Within Ayurvedic Pharmacopoeia of India limits', 'Ash limits: confirm the reference standard.'), method: 'Gravimetric' },
  { param: 'Total plate count', value: tbc('100,000 cfu/g or less', NOTES.microbes), method: 'Third-party lab' },
  { param: 'Yeast and mould', value: tbc('1,000 cfu/g or less', NOTES.microbes), method: 'Third-party lab' },
  { param: 'E. coli and Salmonella', value: tbc('Absent', NOTES.microbes), method: 'Third-party lab' },
  { param: 'Heavy metals (Pb, As, Cd, Hg)', value: tbc('Within WHO and API limits for herbal material', 'Heavy metals: confirm limits and testing frequency.'), method: 'Third-party lab' },
  { param: 'Aflatoxins and pesticide residues', value: tbc('Tested to the buyer’s market limits on request', 'Aflatoxins and pesticides: confirm the testing offer.'), method: 'Third-party lab' },
];

export const packaging = [
  { name: '25 kg HDPE woven bag', text: 'With a sealed food-grade LDPE liner. The standard for export.', size: '25 kg' },
  { name: '25 kg kraft paper bag', text: 'Multi-wall paper with a liner, for buyers who prefer paper.', size: tbc('20 to 25 kg', 'Paper bag sizes: confirm.') },
  { name: 'Fibre drum', text: 'Rigid drums for powders that must not be crushed or exposed.', size: tbc('25 kg', 'Fibre drums: confirm availability.') },
  { name: 'Retail and private label', text: tbc('Pouches and jars printed with your brand, ready for shelves.', NOTES.privateLabel), size: tbc('100 g to 1 kg', NOTES.privateLabel) },
];

export const faq = [
  { q: 'What is the minimum order?', a: '25 kg per product. You can combine several products in one shipment, which keeps freight costs down for trial orders.' },
  { q: 'Can I get samples before I order?', a: tbc('Yes. We send 100 to 250 g of each product by international courier so you can test it first. Tell us the products and your delivery address.', NOTES.samples) },
  { q: 'Which Incoterms do you work with?', a: tbc('EXW Pune, FOB Nhava Sheva, CFR and CIF to your port. Ask for the one that suits your forwarder.', NOTES.incoterms) },
  { q: 'What documents come with a shipment?', a: 'A commercial invoice, packing list, certificate of analysis, phytosanitary certificate and certificate of origin. Fumigation and other certificates can be arranged when your country requires them.' },
  { q: 'Are your products organic?', a: tbc('Our herbs are organically grown. If you need certified organic material (NPOP, USDA NOP or EU), ask us which products are available with certificates.', NOTES.organic) },
  { q: 'Can you pack under our brand?', a: tbc('Yes. We can pack in retail pouches or jars printed with your brand, from 100 g upwards.', NOTES.privateLabel) },
  { q: 'How do I pay?', a: tbc('By bank transfer (T/T) in advance, or by L/C at sight for larger orders.', NOTES.payment) },
  { q: 'How long does an order take?', a: tbc('Usually 7 to 15 days from order confirmation to dispatch, depending on quantity and packaging. Sea transit time depends on your port.', NOTES.leadTime) },
];
