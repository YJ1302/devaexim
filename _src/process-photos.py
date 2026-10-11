"""Turn the original product photos in _src/photos/ into the site's WebP images.

For each photo it:
  1. finds the round brass bowl (fits a circle to the bowl's outer edge),
  2. crops so the bowl has the same size and position in every image
     (about 72% of the frame width, centred),
  3. writes assets/img/products/<slug>.webp (1600 x 2000) and <slug>-800.webp (800 x 1000).

Usage (needs Pillow and numpy):
    python _src/process-photos.py                 # every photo
    python _src/process-photos.py neem-powder     # just one
    python _src/process-photos.py --sheet out.jpg # also write a review contact sheet

If the bowl is not found (for example a photo without a bowl), the photo is
centre-cropped instead. To set a crop by hand, add an entry to
_src/photos/crops.json:  {"neem-powder": {"cx": 940, "cy": 1100, "d": 1300}}
(pixels in the original photo: bowl centre and diameter), or {"neem-powder": "center"}.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "_src" / "photos"
OUT = ROOT / "assets" / "img" / "products"
SIZES = [("", 1600, 2000, 74), ("-800", 800, 1000, 78)]
BOWL_RATIO = 0.72      # bowl diameter as a share of the frame width
BOWL_Y = 0.50          # bowl centre as a share of the frame height
EXTS = (".jpg", ".jpeg", ".png", ".webp")


def circle_from_3(p1, p2, p3):
    (x1, y1), (x2, y2), (x3, y3) = p1, p2, p3
    d = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
    if abs(d) < 1e-9:
        return None
    s1, s2, s3 = x1 * x1 + y1 * y1, x2 * x2 + y2 * y2, x3 * x3 + y3 * y3
    cx = (s1 * (y2 - y3) + s2 * (y3 - y1) + s3 * (y1 - y2)) / d
    cy = (s1 * (x3 - x2) + s2 * (x1 - x3) + s3 * (x2 - x1)) / d
    return cx, cy, float(np.hypot(x1 - cx, y1 - cy))


def lsq_circle(p):
    A = np.column_stack([p[:, 0], p[:, 1], np.ones(len(p))])
    b = -(p[:, 0] ** 2 + p[:, 1] ** 2)
    D, E, F = np.linalg.lstsq(A, b, rcond=None)[0]
    cx, cy = -D / 2, -E / 2
    return cx, cy, float(np.sqrt(max(cx * cx + cy * cy - F, 1e-9)))


def find_bowl(img):
    """Return (cx, cy, d) of the bowl in original pixels, or None.

    Rays are cast outward from the middle of the frame. On each ray the outermost
    brass pixel (followed by plain surface) is a candidate rim point. Light comes
    from the upper left, so only the lit half of the rim is used: there the edge
    is crisp, while on the shadow side saturation fades out gradually. Rays that
    hit the garnish or the powder spill give wrong points, so the circle is fitted
    with RANSAC, which keeps only the points that agree with one circle.
    """
    scale = 464 / img.width
    small = img.resize((464, round(img.height * scale)), Image.BILINEAR)
    a = np.asarray(small, dtype=float) / 255.0
    H, W = a.shape[:2]
    mx, mn = a.max(axis=2), a.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)

    # Background: the top-left and bottom-right corners are plain surface in this layout.
    k = 0.08
    corners = np.concatenate([sat[: int(H * k), : int(W * k)].ravel(), sat[-int(H * k):, -int(W * k):].ravel()])
    vals = np.concatenate([mx[: int(H * k), : int(W * k)].ravel(), mx[-int(H * k):, -int(W * k):].ravel()])
    s_bg, v_bg = np.median(corners), np.median(vals)
    # Brass is clearly saturated; the stone is not. Very dark objects also count.
    brass = (sat > s_bg + 0.15) | (mx < v_bg - 0.40)

    cx0, cy0 = W * 0.5, H * 0.5
    rs = np.arange(int(W * 0.18), int(W * 0.50))
    pts = []
    for deg in range(120, 332, 2):   # lower left, round through left and top, to upper right (y points down)
        t = np.radians(deg)
        xs = np.clip((cx0 + rs * np.cos(t)).astype(int), 0, W - 1)
        ys = np.clip((cy0 + rs * np.sin(t)).astype(int), 0, H - 1)
        line = brass[ys, xs]
        for i in np.flatnonzero(line)[::-1]:
            if i + 6 < len(line) and not line[i + 1: i + 7].any():   # needs plain surface after it
                pts.append((xs[i], ys[i]))
                break
    if len(pts) < 30:
        return None
    pts = np.asarray(pts, dtype=float)

    rng = np.random.default_rng(7)
    best_c, best_n = None, 0
    for _ in range(600):
        c = circle_from_3(*pts[rng.choice(len(pts), 3, replace=False)])
        if c is None or not (0.25 * W < c[2] < 0.46 * W):
            continue
        n = int((np.abs(np.hypot(pts[:, 0] - c[0], pts[:, 1] - c[1]) - c[2]) < max(1.5, 0.012 * c[2])).sum())
        if n > best_n:
            best_c, best_n = c, n
    if best_c is None or best_n < max(20, len(pts) * 0.35):
        return None
    inliers = pts[np.abs(np.hypot(pts[:, 0] - best_c[0], pts[:, 1] - best_c[1]) - best_c[2]) < max(1.5, 0.012 * best_c[2])]
    cx, cy, r = lsq_circle(inliers)
    if not ((0.3 * W < cx < 0.7 * W) and (0.3 * H < cy < 0.7 * H)):
        return None
    return cx / scale, cy / scale, 2 * r / scale


def crop_box(img, bowl):
    W, H = img.size
    if bowl is None:
        cw = min(W, H * 0.8)
        ch = cw * 1.25
        return ((W - cw) / 2, (H - ch) / 2, cw, ch)
    cx, cy, d = bowl
    cw = d / BOWL_RATIO
    cw = min(cw, W, H / 1.25)
    ch = cw * 1.25
    x0 = min(max(cx - cw / 2, 0), W - cw)
    y0 = min(max(cy - BOWL_Y * ch, 0), H - ch)
    return (x0, y0, cw, ch)


def main(args):
    sheet_path = None
    if "--sheet" in args:
        i = args.index("--sheet")
        sheet_path = Path(args[i + 1])
        args = args[:i] + args[i + 2:]
    overrides = {}
    if (SRC / "crops.json").exists():
        overrides = json.loads((SRC / "crops.json").read_text(encoding="utf-8"))

    sources = sorted(p for p in SRC.iterdir() if p.suffix.lower() in EXTS and p.parent == SRC and "." not in p.stem)
    if args:
        sources = [p for p in sources if p.stem in args]
    OUT.mkdir(parents=True, exist_ok=True)
    tiles = []

    for src in sources:
        slug = src.stem
        img = Image.open(src).convert("RGB")
        ov = overrides.get(slug)
        if ov == "center":
            bowl, how = None, "centre crop (override)"
        elif isinstance(ov, dict):
            bowl, how = (ov["cx"], ov["cy"], ov["d"]), "manual crop"
        else:
            bowl = find_bowl(img)
            how = "bowl found" if bowl else "bowl NOT found, centre crop"
        x0, y0, cw, ch = crop_box(img, bowl)
        cropped = img.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch)))
        for suffix, w, h, q in SIZES:
            cropped.resize((w, h), Image.LANCZOS).save(OUT / f"{slug}{suffix}.webp", "WEBP", quality=q, method=6)
        ratio = (bowl[2] / cw) if bowl else 0
        kb = (OUT / f"{slug}.webp").stat().st_size // 1024
        print(f"{slug:22s} {how:28s} bowl {ratio:5.1%} of width, crop {round(cw)}x{round(ch)}"
              f"{'  (upscaled)' if cw < 1600 else ''}  -> {kb} KB")
        if sheet_path:
            tiles.append(cropped.resize((320, 400), Image.LANCZOS))

    if sheet_path and tiles:
        cols = 5
        rows = (len(tiles) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * 328 - 8, rows * 408 - 8), (40, 40, 40))
        for i, t in enumerate(tiles):
            sheet.paste(t, ((i % cols) * 328, (i // cols) * 408))
        sheet.save(sheet_path, quality=88)
        print("sheet:", sheet_path)


if __name__ == "__main__":
    main(sys.argv[1:])
