"""Cuts the hero thali images out of the originals in _src/photos/thali/.

    python _src/process-thali.py

For each bowl photo it finds the brass bowl (same detector as process-photos.py), crops a square
exactly around it, and masks everything outside the bowl's rim so only a clean circle is left.
The result is assets/img/thali/<slug>.webp (400 px, transparent corners). The empty tray photo
(plate.jpg) is cut the same way into assets/img/thali/plate.webp (1200 px).
The site adds the shadows with CSS, so the cutouts carry none.
Needs Pillow and numpy.
"""
import importlib.util
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_src" / "photos" / "thali"
OUT = ROOT / "assets" / "img" / "thali"
OUT.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location("pp", ROOT / "_src" / "process-photos.py")
pp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pp)


def circle_cutout(img, cx, cy, d, size, grow=1.0, feather=1.6):
    """Square crop around (cx, cy) with diameter d, circular alpha mask, resized to size px."""
    r = d / 2 * grow
    box = (round(cx - r), round(cy - r), round(cx + r), round(cy + r))
    crop = img.crop(box).convert("RGBA")
    big = 4                                                    # draw the mask 4x then shrink: smooth edge
    m = Image.new("L", (crop.width * big, crop.height * big), 0)
    ImageDraw.Draw(m).ellipse([0, 0, m.width - 1, m.height - 1], fill=255)
    m = m.resize(crop.size, Image.LANCZOS)
    if feather:
        m = m.filter(ImageFilter.GaussianBlur(feather * crop.width / size / 2))
    crop.putalpha(m)
    return crop.resize((size, size), Image.LANCZOS)


def find_plate(img):
    """Circle of the tray: brass is warm (red above green), the background and shadow are green."""
    small = np.asarray(img.convert("RGB").resize((512, 512))).astype(int)
    warm = (small[..., 0] - small[..., 1]) > 6
    warm &= small.sum(axis=2) > 120
    ys, xs = np.where(warm)
    k = img.width / 512
    x0, x1 = np.percentile(xs, [0.3, 99.7]); y0, y1 = np.percentile(ys, [0.3, 99.7])
    return ((x0 + x1) / 2 * k, (y0 + y1) / 2 * k, ((x1 - x0) + (y1 - y0)) / 2 * k)


for f in sorted(SRC.glob("*.jpg")):
    img = Image.open(f).convert("RGB")
    if f.stem == "plate":
        cx, cy, d = find_plate(img)
        out = circle_cutout(img, cx, cy, d, 1200, grow=1.0, feather=1.2)
        out.save(OUT / "plate.webp", "WEBP", quality=84, method=6)
        print(f"plate  centre ({cx / img.width:.3f}, {cy / img.height:.3f}) diameter {d / img.width:.1%}")
        continue
    bowl = pp.find_bowl(img)
    if bowl is None:
        print(f"{f.stem}: bowl NOT found, skipped")
        continue
    cx, cy, d = bowl
    out = circle_cutout(img, cx, cy, d, 400, grow=1.0)
    out.save(OUT / f"{f.stem}.webp", "WEBP", quality=88, method=6)
    print(f"{f.stem:20s} centre ({cx / img.width:.3f}, {cy / img.height:.3f}) diameter {d / img.width:.1%}  {(OUT / (f.stem + '.webp')).stat().st_size // 1024} KB")
