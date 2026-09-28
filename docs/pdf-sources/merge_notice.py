# -*- coding: utf-8 -*-
"""Fusion couverture + corps -> docs/NOTICE-UTILISATION.pdf"""
from pypdf import PdfReader, PdfWriter

COVER = "/home/z/my-project/.pdfbuild/cover-notice.pdf"
BODY = "/home/z/my-project/.pdfbuild/notice-body.pdf"
OUT = "/home/z/my-project/docs/NOTICE-UTILISATION.pdf"

w = PdfWriter()
for src in (COVER, BODY):
    r = PdfReader(src)
    for p in r.pages:
        w.add_page(p)
# normaliser toutes les pages au format A4 exact (595.276 x 841.890 pt)
for p in w.pages:
    p.scale_to(595.2755905511812, 841.8897637795277)
w.add_metadata({
    "/Title": "Notice d'utilisation — Ma Thèse",
    "/Author": "Z.ai",
    "/Subject": "Manuel utilisateur de l'application Ma Thèse (ThesisFrame) v1.10.8",
    "/Creator": "Z.ai",
})
with open(OUT, "wb") as f:
    w.write(f)
print("OK", OUT, "pages=", len(w.pages))
