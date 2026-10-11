import { pathToFileURL } from 'node:url';

// Prompts for the AI product photographs (model: gemini-3-pro-image-preview, 4:5, 2K).
// One locked template keeps the ten images consistent: same bowl, angle, light and layout.
// Print all prompts with:  node _src/photo-prompts.mjs

export const MODEL = { model: 'gemini-3-pro-image-preview', aspect_ratio: '4:5', image_size: '2K' };

export const TEMPLATE = ({ contents, garnish, spill, tint, colour }) => `Professional overhead product photograph for a premium Ayurvedic ingredient exporter's catalogue.

Composition: flat lay shot from directly above (camera at exactly 90 degrees, so the bowl appears as a perfect circle), portrait 4:5 frame. One round, hand-hammered brass katori (a small Indian bowl about 5 cm deep, with gently curved sides, a narrow rolled rim, visible hammer marks and a soft, warm golden patina; not a flat plate) sits in the centre of the frame. Medium-wide framing with generous empty margins: the bowl's outer rim spans only from about 20% to 80% of the frame width (the bowl is about 60% as wide as the frame), and its centre is at about 48% of the frame height. Leave clear space between the bowl and every edge of the frame.

Contents: ${contents}

Styling: at the upper right of the frame, partly overlapping the bowl rim, rests ${garnish}. A small, natural, loose spill of ${spill} sits on the surface at the lower left, with a few scattered particles. Nothing else is in the frame.

Surface: matte, warm off-white limestone with a very subtle natural texture and a faint ${tint} tint.

Light: soft, diffused natural daylight from the upper left, with gentle soft-edged shadows falling to the lower right. True-to-life natural colour: the ${colour} must look accurate, not oversaturated.

Quality: photorealistic, sharp focus across the whole frame, high detail, editorial ingredient photography.

Strictly no text, letters, numbers, labels, logos, packaging, spoons, cloth, hands, people or extra bowls.`;

const powder = (desc) => `the bowl is filled to the brim with ${desc}, forming a gentle, smooth, slightly domed mound with a fine matte powder texture.`;

export const PRODUCTS = {
  'ashwagandha-powder': {
    contents: powder('fine ashwagandha root powder, a creamy beige-brown colour'),
    garnish: 'three dried ashwagandha roots (thin, pale tan, slightly twisted and fibrous)',
    spill: 'the same ashwagandha powder', tint: 'warm sand', colour: 'creamy beige-brown colour of the powder',
  },
  'shatavari-powder': {
    contents: powder('fine shatavari root powder, an off-white cream colour'),
    garnish: 'three dried shatavari roots (plump, spindle-shaped, cream-coloured tuberous roots with fine wrinkles)',
    spill: 'the same shatavari powder', tint: 'ivory', colour: 'off-white cream colour of the powder',
  },
  'neem-powder': {
    contents: powder('fine neem leaf powder, a dull olive-green colour'),
    garnish: 'one fresh neem (Azadirachta indica) twig bearing a pinnate leaf of narrow, slightly curved, finely serrated, glossy green leaflets',
    spill: 'the same neem powder', tint: 'pale sage', colour: 'dull olive-green colour of the powder',
  },
  'tulsi-powder': {
    contents: powder('fine dried tulsi (holy basil) leaf powder, a muted green colour'),
    garnish: 'a fresh tulsi (holy basil, Ocimum tenuiflorum) sprig with oval, slightly toothed green leaves and one slender purple flower spike',
    spill: 'the same tulsi powder', tint: 'pale sage', colour: 'muted green colour of the powder',
  },
  'brahmi-powder': {
    contents: powder('fine brahmi (Bacopa monnieri) herb powder, a greyish olive-green colour'),
    garnish: 'a fresh brahmi (Bacopa monnieri) sprig: a thin creeping stem with pairs of small, rounded, thick, succulent green leaves',
    spill: 'the same brahmi powder', tint: 'soft grey-green', colour: 'greyish olive-green colour of the powder',
  },
  'triphala-powder': {
    contents: powder('fine triphala powder, a light warm brown colour'),
    garnish: 'three dried whole fruits side by side: one dried amla (Indian gooseberry, dark brown and wrinkled), one haritaki (oval, ridged, yellowish-brown) and one bibhitaki (round, matte, greyish-brown)',
    spill: 'the same triphala powder', tint: 'warm sand', colour: 'light warm brown colour of the powder',
  },
  'moringa-powder': {
    contents: powder('fine moringa leaf powder, a vivid but natural green colour'),
    garnish: 'a fresh moringa (drumstick tree) sprig with many small, rounded-oval green leaflets on thin stems',
    spill: 'the same moringa powder', tint: 'pale green', colour: 'vivid natural green colour of the powder',
  },
  'moringa-dried-leaves': {
    contents: 'the bowl is filled to the brim with whole dried moringa leaflets: small, rounded-oval, natural green leaflets, loosely heaped, with no powder.',
    garnish: 'a fresh moringa (drumstick tree) sprig with many small, rounded-oval green leaflets on thin stems',
    spill: 'a few dried moringa leaflets', tint: 'pale green', colour: 'natural green colour of the dried leaflets',
  },
  'turmeric-powder': {
    contents: powder('fine turmeric powder, a rich golden-yellow colour'),
    garnish: 'two fresh turmeric rhizome fingers with light brown skin, plus one cut piece showing its bright orange core',
    spill: 'the same turmeric powder', tint: 'warm ochre', colour: 'rich golden-yellow colour of the powder',
  },
  'ginger-powder': {
    contents: powder('fine dry ginger (sonth) powder, a pale creamy-beige colour'),
    garnish: 'two pieces of dried, peeled ginger root (sonth): pale, knobbly and slightly fibrous',
    spill: 'the same ginger powder', tint: 'warm sand', colour: 'pale creamy-beige colour of the powder',
  },
};

export const promptFor = (slug) => TEMPLATE(PRODUCTS[slug]);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const slug of Object.keys(PRODUCTS)) console.log(`\n=== ${slug} ===\n${promptFor(slug)}`);
}

// ---------- hero thali: bowl-only images, cut out as circles by process-thali.py ----------

export const THALI_MODEL = { model: 'gemini-3-pro-image-preview', aspect_ratio: '1:1', image_size: '2K' };
export const THALI_SLUGS = ['turmeric-powder', 'moringa-powder', 'shatavari-powder', 'neem-powder', 'ashwagandha-powder', 'tulsi-powder', 'ginger-powder', 'brahmi-powder', 'triphala-powder'];

export const bowlPrompt = (slug) => `Overhead product photograph, camera directly above at exactly 90 degrees, so the bowl appears as a perfect circle. One round, hand-hammered brass katori (a small Indian bowl about 5 cm deep, with gently curved sides, a narrow rolled rim, visible hammer marks and a soft, warm golden patina; not a flat plate) is perfectly centred and fills about 86% of the square frame, with an even margin on every side.

Contents: ${PRODUCTS[slug].contents}

Nothing else is in the frame: no garnish, no loose spill, no props, no spoon. Background: plain matte, warm off-white limestone. Light: soft, diffused natural daylight from the upper left, with a soft shadow falling to the lower right. True-to-life natural colour, not oversaturated. Photorealistic editorial ingredient photography, sharp focus across the whole bowl.

Strictly no text, letters, labels, logos, hands, people or extra bowls.`;

export const platePrompt = `Overhead photograph, camera directly above at exactly 90 degrees. One large, round, hand-hammered brass thali (a broad, shallow serving tray with a gently raised rolled rim, visible hammer marks and a warm golden-brown aged patina, slightly darker toward the rim) is perfectly centred and fills about 94% of the square frame. The tray is completely empty and bare: nothing on it. Background: plain matte, near-black dark green. Light: soft, diffused natural daylight from the upper left. Photorealistic. Strictly no text, no objects, no bowls, no food, no hands.`;
