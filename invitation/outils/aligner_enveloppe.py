# Recale les photos (PNG/WebP à fond transparent) de l'enveloppe fermée et
# ouverte sur un même cadre, pour que l'animation passe de l'une à l'autre
# sans saut : le corps de l'enveloppe ouverte est étiré pour couvrir
# exactement celui de l'enveloppe fermée.
#
#   python3 outils/aligner_enveloppe.py fermee.webp ouverte.webp
#
# Produit assets/enveloppe-fermee.webp et assets/enveloppe-ouverte.webp, et
# affiche les repères à reporter dans index.html (.envelope, .slot, .letter).
# Les repères ci-dessous sont en pixels dans chaque photo d'origine ; à
# re-mesurer si on change de photos.
import pathlib, sys
from PIL import Image

CLOSED = dict(left=48, right=1405, top=97, bottom=1007)   # corps de l'enveloppe fermée
OPEN = dict(left=200, right=1250, top=440, bottom=1060)   # corps (sous la charnière) de l'enveloppe ouverte
OPEN_FLAP_TOP = 16                                         # pointe du rabat ouvert
OPEN_POCKET_V = (720, 718)                                 # pointe du V de la poche avant
OUT_W = 1200

closed = Image.open(sys.argv[1]).convert("RGBA")
opened = Image.open(sys.argv[2]).convert("RGBA")

sx = (CLOSED["right"] - CLOSED["left"]) / (OPEN["right"] - OPEN["left"])
sy = (CLOSED["bottom"] - CLOSED["top"]) / (OPEN["bottom"] - OPEN["top"])
to_closed = lambda x, y: (CLOSED["left"] + (x - OPEN["left"]) * sx, CLOSED["bottom"] - (OPEN["bottom"] - y) * sy)

top = min(0, to_closed(0, OPEN_FLAP_TOP)[1]) - 20
W, H = closed.width, round(closed.height - top)

a = Image.new("RGBA", (W, H)); a.alpha_composite(closed, (0, round(-top)))
b = Image.new("RGBA", (W, H))
ox, oy = to_closed(0, 0)
b.alpha_composite(opened.resize((round(opened.width * sx), round(opened.height * sy)), Image.LANCZOS), (round(ox), round(oy - top)))
b = b.crop((0, 0, W, H))

out = pathlib.Path(__file__).resolve().parent.parent / "assets"
size = (OUT_W, round(OUT_W * H / W))
a.resize(size, Image.LANCZOS).save(out / "enveloppe-fermee.webp", quality=90, method=6)
b.resize(size, Image.LANCZOS).save(out / "enveloppe-ouverte.webp", quality=90, method=6)

pct = lambda v, n: f"{100 * v / n:.1f}%"
vx, vy = to_closed(*OPEN_POCKET_V)
print("taille", size, "aspect-ratio", f"{W}/{H}")
print("corps : x", pct(CLOSED["left"], W), "→", pct(CLOSED["right"], W), " y", pct(CLOSED["top"] - top, H), "→", pct(CLOSED["bottom"] - top, H))
print("V de la poche :", pct(vx, W), pct(vy - top, H))
