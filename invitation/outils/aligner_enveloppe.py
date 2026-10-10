# Recale les photos de l'enveloppe fermée et ouverte sur un même cadre,
# pour que l'animation passe de l'une à l'autre sans saut.
#
#   python3 outils/aligner_enveloppe.py fermee.jpg ouverte.jpg
#
# Produit assets/enveloppe-fermee.webp et assets/enveloppe-ouverte.webp.
# Les repères ci-dessous (fractions de largeur/hauteur de chaque photo)
# correspondent aux deux images générées dans Canva ; à re-mesurer si on
# change de photos.
import pathlib, sys
from PIL import Image

CLOSED = dict(left=.125, right=.875, bottom=.893)   # corps de l'enveloppe fermée
OPEN = dict(left=.244, right=.7625, bottom=.94)     # corps de l'enveloppe ouverte
CANVAS = dict(left=.05, right=.95, top=-.47, bottom=.96)  # cadre final, en fractions de la photo fermée
BG = (245, 236, 227)  # fond des photos
OUT_W = 1400

closed = Image.open(sys.argv[1]).convert("RGB")
opened = Image.open(sys.argv[2]).convert("RGB")
W, H = closed.size

def place(img, scale, dx, dy):
    # Pose img, mise à l'échelle, sur un cadre aux dimensions de CANVAS (en pixels de la photo fermée).
    cw = round((CANVAS["right"] - CANVAS["left"]) * W)
    ch = round((CANVAS["bottom"] - CANVAS["top"]) * H)
    canvas = Image.new("RGB", (cw, ch), BG)
    im = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    canvas.paste(im, (round(dx - CANVAS["left"] * W), round(dy - CANVAS["top"] * H)))
    return canvas

a = place(closed, 1, 0, 0)
s = (CLOSED["right"] - CLOSED["left"]) * W / ((OPEN["right"] - OPEN["left"]) * opened.width)
dx = CLOSED["left"] * W - OPEN["left"] * opened.width * s
dy = CLOSED["bottom"] * H - OPEN["bottom"] * opened.height * s
b = place(opened, s, dx, dy)

out = pathlib.Path(__file__).resolve().parent.parent / "assets"
size = (OUT_W, round(OUT_W * a.height / a.width))
a.resize(size, Image.LANCZOS).save(out / "enveloppe-fermee.webp", quality=88, method=6)
b.resize(size, Image.LANCZOS).save(out / "enveloppe-ouverte.webp", quality=88, method=6)
print("ok", size)
