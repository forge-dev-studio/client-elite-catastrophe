# Downsize placeholder photos for demo load speed (max 1500px wide, quality 80).
# Logo/favicon/og-card are left alone.
from PIL import Image
import os
D = '/home/adminsynergycloud/client-elite-catastrophe/assets/img'
KEEP = {'logo.jpg', 'logo-header.png', 'favicon.png', 'og-card.jpg', 'candidate-logo.jpg'}
MAXSIDE = 1200  # cap the LONGEST side; images display at <=760px so this is ample
for n in os.listdir(D):
    if n in KEEP or not n.lower().endswith(('.jpg', '.jpeg')):
        continue
    p = os.path.join(D, n)
    before = os.path.getsize(p) / 1024
    im = Image.open(p).convert('RGB')
    long_side = max(im.width, im.height)
    if long_side > MAXSIDE:
        sc = MAXSIDE / long_side
        im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    im.save(p, 'JPEG', quality=80, optimize=True, progressive=True)
    after = os.path.getsize(p) / 1024
    print(f"  {n}: {before:.0f}KB -> {after:.0f}KB")
