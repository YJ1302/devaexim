The images in this folder are generated. Do not edit them here.

Originals live in _src/photos/ (one per product, named after the product slug).
To add or replace a product image:
  1. save the original as _src/photos/<slug>.jpg (or .png), for example:
     ashwagandha-powder.jpg
     shatavari-powder.jpg
     neem-powder.jpg
     tulsi-powder.jpg
     brahmi-powder.jpg
     triphala-powder.jpg
     moringa-powder.jpg
     moringa-dried-leaves.jpg
     turmeric-powder.jpg
     ginger-powder.jpg
  2. run: python _src/process-photos.py <slug>   (crops to 4:5 and writes <slug>.webp and <slug>-800.webp here)
  3. run: node _src/build.mjs
  4. optional, for the link-preview card: node _src/make-images.mjs

Mark real photographs as "photo" in _src/photos/manifest.json so the "Representative image" caption is dropped.
The build uses a photo when one exists here, and the illustration in ../placeholders/ when it does not.
