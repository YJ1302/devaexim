# Deva Exim INC website

This is the website for **Deva Exim INC** of Narhe, Pune. The company supplies, exports, trades and distributes Ayurvedic herbal powders and spice powders.

The site is plain HTML, CSS and JavaScript, with no framework and no dependencies. It is built from a small Node script, so the company details and the catalogue live in one place.

## Quick start

- **View it:** open `index.html` in a browser. Every page works straight from disk.
- **Serve it locally** (closer to real hosting):

```bash
python -m http.server 4321
```

  Then open http://localhost:4321.

- **After changing anything in `_src/`,** rebuild and check:

```bash
node _src/build.mjs
```

```bash
node _src/check.mjs
```

Node 18 or newer is needed for the build; nothing has to be installed. Processing product photos also needs Python 3 with Pillow and numpy.

## What is in the project

```
index.html, products.html, quality.html, export.html,
about.html, contact.html, privacy.html, 404.html      generated pages (do not edit by hand)
products/*.html                                       one generated page per product
de/, ar/, hi/                                         the same pages in German, Arabic and Hindi (generated)
assets/css/styles.css                                 all styles, including print styles for spec sheets
assets/js/main.js                                     all behaviour (no libraries)
assets/img/products/*.webp                            product images, 1600 and 800 px wide (generated from _src/photos)
assets/img/placeholders/*.svg                         generated illustrations, used for any product without an image
assets/img/share/*.jpg                                link-preview cards, one per product
assets/img/og-image.png, icon-*.png, favicon.svg      social share image and icons
sitemap.xml, robots.txt, site.webmanifest             generated
dist/                  the public site only, ready to upload (generated, not in git)
_src/data.mjs          company details, products, terms, FAQ: edit content here
_src/pages.mjs         page layouts and page copy
_src/templates.mjs     shared header, footer, cards, thali, SEO tags
_src/i18n.mjs          the translation engine
_src/i18n/             translations, one JSON file per language
_src/placeholder.mjs   product illustration generator
_src/photos/           original product images, plus manifest.json (source and alt text of each)
_src/photo-prompts.mjs the prompts used to generate the product images
_src/process-photos.py crops the originals so the bowl sits the same in every image, and writes the WebP files
_src/build.mjs         builds everything above
_src/check.mjs         link, ID, alt-text and ARIA checks
_src/make-images.mjs   renders og-image.png, the icons and the share cards with headless Chrome or Edge
.github/workflows/deploy.yml   optional GitHub Pages deployment (runs only when started by hand)
docs/content-to-confirm.md     generated list of everything still to confirm with the client
docs/ai-image-brief.md         art direction and prompts for the product images
```

## Editing content

The HTML pages are generated, so **edit `_src/`, never the `.html` files**. Changes made directly in the HTML are overwritten by the next build.

- **Phone, email, address, GSTIN or other company details:** edit `site` in `_src/data.mjs`. The change reaches every page, the footer, the structured data, the WhatsApp links and the printed spec sheets.
- **A product:** edit its entry in `products`. The `hex` field is the real colour of the powder. It drives the swatches, the illustration and the hero bowl.
- **Page wording:** edit `_src/pages.mjs`.

### Unconfirmed content and review mode

Anything not yet confirmed by the client is wrapped in `tbc(value, note)` in the source. It displays normally, and is tracked in three ways:

- `docs/content-to-confirm.md` lists every open item and the pages it appears on. Today there are 35. The file is regenerated on each build.
- Adding **`?review`** to any page address (for example `index.html?review`) highlights each unconfirmed item in place. A panel lists the items, and clicking one jumps to it. Review mode stays on while you browse; `?review=off` turns it off. This is handy for walking the client through the site.
- To confirm an item, replace `tbc('value', 'note')` with the confirmed value and rebuild.

## Languages

The site is in **English, Deutsch (German), Français (French), Español (Spanish), العربية (Arabic) and हिन्दी (Hindi)**. Visitors choose a language from the dropdown in the header (inside the menu on phones). Each language has its own copy of every page, so the choice survives a shared link and Google can index each version:

- English: `/products/neem-powder.html`
- German: `/de/products/neem-powder.html`, and likewise `/fr/…` (French), `/es/…` (Spanish), `/hi/…` (Hindi)
- Arabic: `/ar/…` (laid out right to left)

The 404 page is English only. A first-time visitor on an English page whose browser is set to German, Arabic or Hindi sees a small, dismissible "also available in…" bar; nothing redirects automatically.

**How it works.** English is written once, in `_src/`. On every build, `_src/i18n.mjs` takes each finished English page and swaps its text for the translation in `_src/i18n/<code>.json`, which is a plain list of `"English text": "translation"`. So changing English wording means updating the same text in each language file; text with no translation stays in English and is listed in `docs/translation-gaps.md` after the build.

- **Dynamic text** uses `{name}` gaps, for example `"Get a quote for {name}": "Angebot für {name} anfordern"`. Parts marked `[1]` are the highlighted "to be confirmed" details and must be kept in the translation.
- **Names that never change** (botanical names, Sanskrit names, the address, codes) are kept as they are, via `_src/i18n/_keep.json`.
- **The enquiry message** sent to Deva Exim is always in English, with the page language added, so the team can read it.
- **Add a language** (French, Spanish...): add a line to `languages` in `_src/data.mjs`, create `_src/i18n/<code>.json`, and build. `_src/i18n/_missing.<code>.json` then lists every string to translate. Scripts that need extra fonts (Arabic, Hindi) are declared in `languages` too.

**These translations are first drafts.** They were produced with AI and checked for structure and consistency, but not by a native speaker. Specifications, trade terms and the privacy note carry commercial and legal weight, so have a fluent reader of each language review them before the languages are promoted. Translated pages carry a note saying that the English version is the reference.

## Product images

The ten product images were **generated with AI** (Google Gemini 3 Pro Image) from one locked prompt, so they look like a single shoot: a brass katori of each powder, its raw plant material and a small spill.

- **Captions:** product pages caption them "Representative image", because they are not photographs of actual lots.
- **Source files:** the originals are in `_src/photos/`. Each image's source and alt text are in `_src/photos/manifest.json`, and the prompts are in `_src/photo-prompts.mjs`.
- **Cropping:** `_src/process-photos.py` finds the bowl in each image and crops so it sits at the same size and position in every one. It then writes `assets/img/products/<slug>.webp` (1600 px) and `<slug>-800.webp`, and the site serves whichever suits the screen.

To replace an image, for example with a real photograph of a lot:

1. Save the original as `_src/photos/<slug>.jpg`, for example `turmeric-powder.jpg`, shot like the others: overhead, bowl in the centre, light from the upper left. See `docs/ai-image-brief.md`.
2. In `_src/photos/manifest.json`, set its `source` to `"photo"` to drop the "Representative image" caption.
3. Run these commands:

```bash
python _src/process-photos.py turmeric-powder
```

```bash
node _src/build.mjs
```

```bash
node _src/make-images.mjs
```

The last command refreshes the link-preview card.

If the bowl is not detected in a new photo, the script falls back to a centre crop. You can set the crop by hand in `_src/photos/crops.json`; the format is described at the top of `_src/process-photos.py`. Any product without an image falls back to its illustration automatically.

## The enquiry flow

- Visitors add products to an **enquiry list** from any page. The list is saved in their browser and shown in the header.
- The **Request a quote** page pre-ticks those products and asks for quantities, destination, Incoterm, packaging and contact details.
- **Sending without a form service (the default):** the enquiry opens in the visitor's email app, addressed to the company. There is also a **Send on WhatsApp** button with the enquiry pre-written.
- **Sending through a form service:** to receive enquiries in an inbox without relying on the visitor's email app, create a free form at Formspree, Web3Forms or Getform. Put its endpoint URL in `site.formEndpoint` in `_src/data.mjs` and rebuild. The form then posts directly, shows a thank-you message and clears the list.

## Deploying

The site is static, so any host works. Every build writes the public files, and only those, to `dist/`.

**First, set the domain.** Put the final address in `site.url` in `_src/data.mjs` (for example `https://www.devaexim.in`) and rebuild. It is used for canonical links, the sitemap and the social previews.

**The live site is on Vercel** at https://devaeximinc.vercel.app. `vercel.json` makes Vercel run the build and publish only `dist/`, so `docs/`, `_src/` and the notes are never public. It redeploys on every push to `main`. When the real domain is connected in Vercel, change `SITE_URL` in the `buildCommand` in `vercel.json` to it.

Other hosts also work:

- **GitHub Pages** (free, uses this repository):
  1. In the repository, open Settings, then Pages, and set the Source to **GitHub Actions**.
  2. Open the Actions tab, choose **Deploy site** and click **Run workflow**. To deploy on every push instead, uncomment the `push` trigger in `.github/workflows/deploy.yml`.
  3. To use a custom domain, enter it in Settings, then Pages, under Custom domain. Then add DNS records at the domain registrar:
     - For the bare domain: A records pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
     - For `www`: a CNAME pointing to `yj1302.github.io`.
  4. Turn on **Enforce HTTPS** once the certificate is issued.
- **Netlify or Cloudflare Pages:** connect the repository, set the build command to `node _src/build.mjs` and the publish directory to `dist`.
- **Shared hosting** (Hostinger, GoDaddy or any cPanel host): run the build, then upload the contents of `dist/` into `public_html`.

Missing pages use `404.html`. Netlify, Cloudflare and GitHub Pages pick it up automatically; on cPanel, set it as the 404 page. The 404 page uses root-relative links, so the site should live at the root of its domain.

If the brand or the hero changes, regenerate the share image, icons and product cards with `node _src/make-images.mjs`. This needs Chrome or Edge installed.

## Before launch

- [ ] Work through `docs/content-to-confirm.md` with the client.
- [ ] **Register the domain** and set `site.url`. A registry lookup on 10 October 2026 gave these results:
  - `devaexim.in` and `devaexim.co.in`: not found, so they appear to be available.
  - `devaexim.com`: registered since February 2024, expiring February 2027. Ask the client whether it is theirs.
- [ ] **Confirm the sales phone number.** The online directory listings show the directory's own numbers; the site uses +91 94038 89604, which came from the old website.
- [ ] **Logo.** The leaf-in-a-ring mark is a placeholder. Swap in the client's logo if they have one (`logoMark` in `_src/templates.mjs`, and `favicon.svg` in `_src/build.mjs`).
- [ ] **Have the client approve the product images.** They are AI-generated and captioned "Representative image". Replace them with photographs of real lots when possible (see Product images above).
- [ ] Optionally set a form endpoint so enquiries arrive without relying on an email app.
- [ ] After going live:
  - Submit `sitemap.xml` in Google Search Console.
  - Set up a Google Business Profile for the Narhe address.

## Design notes

- **Colour carries information.** Each powder's real colour identifies the product everywhere on the site: in the hero bowls, swatches, card backgrounds and the spec-sheet header.
- **Tokens:**

  | Token | Hex | Use |
  |---|---|---|
  | Forest | `#11241A` | Dark ground |
  | Leaf | `#2F5D3F` | Primary actions |
  | Haldi | `#E4A11B` | Accent and focus ring on dark |
  | Neem wash | `#EEF0E6` | Light ground |
  | Sand | `#D8C7A6` | Supporting neutral |
  | Ink | `#17211A` | Text |

  All text pairs meet WCAG AA contrast.
- **Type:**
  - Fraunces for display and botanical names.
  - Instrument Sans for text.
  - Tiro Devanagari Sanskrit for the Sanskrit herb names. It is loaded as a tiny subset containing only the characters used.
- **Motion:** one orchestrated moment, the thali filling on load. Everything else moves only in response to the visitor. Visitors with `prefers-reduced-motion` set see no animation.
- **Print:** every product page prints as a one-page A4 specification sheet on a company letterhead, either with the **Print the spec sheet** button or with Ctrl+P.
- **Accessibility:**
  - Semantic landmarks and a skip link.
  - Visible focus rings.
  - The menu and enquiry list are accessible dialogs.
  - Form errors are announced and focused.
  - `node _src/check.mjs` verifies IDs, links, alt text and ARIA references on every build.
