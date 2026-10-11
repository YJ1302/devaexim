# AI product images: brief

This brief covers the 10 product images. Every image should look like it came from **the same shoot**.

## Status

All 10 were generated on 10 October 2026.

- **Model:** Google Gemini 3 Pro Image (`gemini-3-pro-image-preview`), 4:5 at 2K.
- **Prompts:** the exact prompts are in `_src/photo-prompts.mjs`. Run `node _src/photo-prompts.mjs` to print them.
- **Originals:** in `_src/photos/`.
- **Site files:** `_src/process-photos.py` turned the originals into the site images. It detects the brass bowl, crops every image so the bowl sits at the same size and position, and writes WebP files.
- **Rejected:** the first turmeric render is kept in `_src/photos/alternates/`, which is not in git.

**Regenerating one image.** Use the same model, aspect ratio and prompt. Save the result as `_src/photos/<slug>.jpg`, then run:

```bash
python _src/process-photos.py <slug>
```

```bash
node _src/build.mjs
```

The template already fixes the bowl, angle, light and layout, so a new render matches the set.

**What the template had to fix.** Early renders varied in bowl size, from 58% to 75% of the frame width, and in bowl style. Two things fixed it:

- explicit rim positions and the "not a flat plate" bowl description in the template;
- the automatic crop in the processing script.

## How the site uses them

- **Where they appear:**
  - catalogue cards
  - product pages, captioned "Representative image"
  - the home-page hover preview
  - the enquiry list thumbnails
  - each product's link-preview card (`assets/img/share/`, made by `node _src/make-images.mjs`)
- **Format:** the processing script writes two sizes. The site serves whichever suits the screen.
  - 1600 × 2000 px, WebP at quality 74, about 170 to 360 KB.
  - 800 × 1000 px, about 60 to 115 KB.
- **Safe area:** keep the bowl in the centre and the garnish inside the frame. The crop centres the bowl and can trim the edges.

## Art direction (same for every image)

| | |
|---|---|
| Angle | Directly overhead (flat lay), camera at 90° |
| Hero | One hand-hammered **brass katori**, slightly above centre, filled to the brim with the powder |
| Garnish | The raw plant material at the **upper right**, partly resting over the bowl rim |
| Spill | A small, natural spill of the same powder at the **lower left** |
| Surface | Matte stone or lime plaster, warm neutral, faintly tinted toward the product colour |
| Light | Soft diffused daylight from the **upper left**, gentle shadows falling to the lower right |
| Colour | True to life. The powder colour must match the real product (reference hex below) |
| Mood | Calm, clean, premium. No clutter, no extra props |
| Never | Text, labels, logos, packaging, spoons, hands, people, multiple bowls, cartoon or 3D-render looks |

## Base prompt for other image tools

The prompt actually used, with its exact framing instructions, is in `_src/photo-prompts.mjs`. This shorter version suits other tools such as Midjourney, Firefly or Ideogram. Replace the three `{…}` parts with values from the table below:

> Overhead flat-lay product photograph, camera directly above. A single hand-hammered brass katori bowl, slightly above centre, filled to the brim with fine {powder description}. {garnish} rests at the upper right, partly over the bowl rim. A small natural spill of the same powder at the lower left. Matte warm-neutral stone surface with a faint {surface tint} tint. Soft diffused daylight from the upper left, gentle natural shadows. True-to-life colour, visible fine powder texture, minimal styling, premium Ayurvedic ingredient photography. Portrait 4:5, photorealistic, high detail.

**Negative prompt** (for tools that support one):

> text, letters, watermark, logo, label, packaging, plastic, spoon, hands, people, multiple bowls, cluttered props, oversaturated, artificial colours, illustration, cartoon, 3D render, blurry, harsh shadows

## Per product

| File name | Powder description | Garnish | Surface tint | Powder colour |
|---|---|---|---|---|
| `ashwagandha-powder.webp` | creamy beige-brown ashwagandha root powder | a few dried, pale-brown ashwagandha roots | warm sand | `#C9AE84` |
| `shatavari-powder.webp` | off-white shatavari root powder | two or three dried, cream-coloured shatavari tuberous roots | ivory | `#EAE2CF` |
| `neem-powder.webp` | olive-green neem leaf powder | a fresh neem sprig with narrow, serrated leaflets | sage | `#66703A` |
| `tulsi-powder.webp` | green holy basil (tulsi) leaf powder | a fresh tulsi sprig with a small purple flower spike | sage | `#72803F` |
| `brahmi-powder.webp` | greyish-green brahmi (Bacopa monnieri) herb powder | a fresh brahmi sprig with small, round, fleshy leaves | grey-green | `#7E8556` |
| `triphala-powder.webp` | light-brown triphala powder | three dried fruits side by side: amla, haritaki and bibhitaki | warm sand | `#A9875A` |
| `moringa-powder.webp` | vivid green moringa leaf powder | a fresh moringa sprig with small oval leaflets | pale green | `#6F9A34` |
| `moringa-dried-leaves.webp` | *Replace "fine powder" with:* whole dried moringa leaflets, piled to the brim | a fresh moringa sprig with small oval leaflets | pale green | `#5E8A2F` |
| `turmeric-powder.webp` | golden-yellow turmeric powder | two fresh turmeric fingers, one sliced to show its bright orange core | warm ochre | `#E2A21C` |
| `ginger-powder.webp` | pale beige dry ginger (sonth) powder | two pieces of dried, peeled ginger root | warm sand | `#D7C094` |

## Before you publish an image

1. **Check the colour against a real sample.** Buyers compare photos with the lot they receive, and a too-bright turmeric or too-green moringa sets the wrong expectation.
2. **Check the garnish is the right plant.** Image tools often draw generic leaves. Neem leaflets are narrow and serrated; brahmi leaves are small and round; tulsi has a purple flower spike.
3. **Keep the set consistent.** Bowl size and position, light direction and surface should match across all ten. Generate the whole set in one session and re-roll any outliers.
4. **Plan to replace them with photographs of real lots** once stock is available. For B2B buyers, a real photograph of the actual material builds the most trust.
