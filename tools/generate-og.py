from PIL import Image, ImageDraw, ImageFont
ROOT = '/home/adminsynergycloud/client-elite-catastrophe'
W, H = 1200, 630
card = Image.new('RGBA', (W, H), (13, 13, 15, 255))
d = ImageDraw.Draw(card)

# faint orange concentric ring motif (matches the site bands)
for rad, a in [(300, 26), (240, 16)]:
    d.ellipse((W - rad, H - rad, W + rad, H + rad), outline=(255, 106, 0, a), width=2)

# logo (transparent light lockup) centered upper area
logo = Image.open(f'{ROOT}/assets/img/logo-header.png').convert('RGBA')
lw, lh = logo.size
scale = min(700 / lw, 280 / lh)
lg = logo.resize((max(1, int(lw * scale)), max(1, int(lh * scale))))
lx = (W - lg.size[0]) // 2
ly = 120
card.alpha_composite(lg, (lx, ly))

# orange rule under the logo
ry = ly + lg.size[1] + 36
d.rectangle((W // 2 - 90, ry, W // 2 + 90, ry + 6), fill=(255, 106, 0, 255))

# tagline + vanity phone (graceful font fallback)
def font(paths, size):
    for p in paths:
        try: return ImageFont.truetype(p, size)
        except Exception: pass
    return ImageFont.load_default()
base = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf']
bold = ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']
d.text((W / 2, ry + 52), 'Tree Service & Storm Response  ·  Rome & Northwest Georgia',
       font=font(base, 30), fill=(200, 198, 194, 255), anchor='mm')
d.text((W / 2, ry + 112), '470-77-STORM', font=font(bold, 50), fill=(255, 106, 0, 255), anchor='mm')

card.convert('RGB').save(f'{ROOT}/assets/img/og-card.jpg', quality=88)
print('og-card.jpg written', card.size)
