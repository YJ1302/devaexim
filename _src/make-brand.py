"""Builds the logo files the site uses from the client's original logo.

    python _src/make-brand.py

Input : _src/brand/logo-original.png   (the official logo, exactly as supplied; never edited)
Output: assets/img/logo.png            the logo with the stray dotted-grid background removed
        assets/img/favicon.png, favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png
                                      the globe-and-plane emblem on white, for tabs and phones

The supplied logo has a faint dot pattern baked into its white background and a soft grey shadow
under the globe. Only small, isolated pale-grey specks (the dots) are turned white. The shadow, the
letters and the artwork are untouched. Needs Pillow, numpy and scipy.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_src" / "brand" / "logo-original.png"
OUT = ROOT / "assets" / "img"

img = Image.open(SRC).convert("RGB")
a = np.asarray(img).astype(int)
mn, mx = a.min(axis=2), a.max(axis=2)

# pale, unsaturated grey that is not pure white: the dot pattern and the shadow
pale = (mn > 205) & (mx - mn < 16) & (mn < 252)
labels, n = ndimage.label(pale, structure=np.ones((3, 3)))
sizes = ndimage.sum(pale, labels, index=np.arange(1, n + 1))
dots = np.isin(labels, np.flatnonzero(sizes <= 60) + 1)       # specks only; the big shadow is kept
clean = a.copy()
clean[ndimage.binary_dilation(dots, iterations=1) & pale] = 255
logo = Image.fromarray(clean.astype("uint8"))
logo.save(OUT / "logo.png", optimize=True)
print(f"logo.png  {logo.size[0]}x{logo.size[1]}  ({int(dots.sum())} dot pixels removed in {int((sizes <= 60).sum())} specks)")

# square emblem (globe and plane) for favicons and app icons
EMBLEM = (0, 0, 128, 160)
em = logo.crop(EMBLEM)
side = max(em.size)


def icon(size, pad=0.10):
    canvas = Image.new("RGB", (size, size), (255, 255, 255))
    inner = int(size * (1 - 2 * pad))
    scale = inner / max(em.size)
    e = em.resize((round(em.width * scale), round(em.height * scale)), Image.LANCZOS)
    canvas.paste(e, ((size - e.width) // 2, (size - e.height) // 2))
    return canvas


for name, size in (("favicon-32", 32), ("favicon", 64), ("apple-touch-icon", 180), ("icon-192", 192), ("icon-512", 512)):
    icon(size).save(OUT / f"{name}.png", optimize=True)
    print(f"{name}.png  {size}x{size}")
