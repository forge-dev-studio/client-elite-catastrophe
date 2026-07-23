from PIL import Image, ImageChops, ImageDraw
ROOT = '/home/adminsynergycloud/client-elite-catastrophe'
src = Image.open(f'{ROOT}/assets/img/logo.jpg').convert('RGB')
W, H = src.size
px = src.load()

# --- 1. row ink profile to find content bands (monogram+ELITE, CATASTROPHE, phone) ---
def row_ink(y):
    c = 0
    for x in range(0, W, 3):
        r, g, b = px[x, y]
        if 0.299*r + 0.587*g + 0.114*b < 200:
            c += 1
    return c > 3
rows = [row_ink(y) for y in range(H)]
bands, s = [], None
for y, v in enumerate(rows):
    if v and s is None: s = y
    elif not v and s is not None: bands.append((s, y)); s = None
if s is not None: bands.append((s, H))

# drop the last band (phone): crop at the gap above it
if len(bands) >= 2:
    crop_bottom = (bands[-2][1] + bands[-1][0]) // 2
else:
    crop_bottom = H
cropped = src.crop((0, 0, W, crop_bottom))

# --- 2. trim surrounding whitespace ---
bg = Image.new('RGB', cropped.size, (255, 255, 255))
bbox = ImageChops.difference(cropped, bg).getbbox()
m = 14
bbox = (max(0, bbox[0]-m), max(0, bbox[1]-m), min(cropped.size[0], bbox[2]+m), min(cropped.size[1], bbox[3]+m))
logo = cropped.crop(bbox)
lw, lh = logo.size

# --- 3. recolor to transparent light (for dark header): white bg -> transparent, black ink -> light, orange kept ---
def recolor(img, ink=(244, 242, 239)):
    img = img.convert('RGB'); w, h = img.size; p = img.load()
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); o = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = p[x, y]
            lum = 0.299*r + 0.587*g + 0.114*b
            if r > 165 and g > 70 and b < 165 and (r - b) > 55 and r >= g - 12:  # orange
                o[x, y] = (min(255, r+15), g, b, 255)
            else:  # ink vs white -> alpha from darkness
                a = int(max(0, min(255, 255 - lum)))
                o[x, y] = (ink[0], ink[1], ink[2], a)
    return out
recolor(logo).save(f'{ROOT}/assets/img/logo-header.png')

# --- 4. favicon from the monogram (top-left square) ---
# re-detect top band on the trimmed logo to size the monogram square
def row_ink2(img, y):
    p = img.convert('RGB').load(); w, h = img.size; c = 0
    for x in range(0, w, 3):
        r, g, b = p[x, y]
        if 0.299*r + 0.587*g + 0.114*b < 200: c += 1
    return c > 3
r2 = [row_ink2(logo, y) for y in range(lh)]
b2, s = [], None
for y, v in enumerate(r2):
    if v and s is None: s = y
    elif not v and s is not None: b2.append((s, y)); s = None
if s is not None: b2.append((s, lh))
top = b2[0] if b2 else (0, lh)
mono_h = top[1] - top[0]
mono = logo.crop((0, top[0], int(mono_h * 1.06), top[1]))
mono_r = recolor(mono)
fav = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
ImageDraw.Draw(fav).rounded_rectangle((0, 0, 127, 127), radius=26, fill=(13, 13, 15, 255))
mw, mh = mono_r.size
sc = min(92 / mw, 92 / mh)
ms = mono_r.resize((max(1, int(mw*sc)), max(1, int(mh*sc))))
fav.alpha_composite(ms, ((128 - ms.size[0]) // 2, (128 - ms.size[1]) // 2))
fav.save(f'{ROOT}/assets/img/favicon.png')

print(f"bands={len(bands)} crop_bottom={crop_bottom} | header logo {lw}x{lh} ratio={lw/lh:.2f} | monogram {mono.size}")
