# -*- coding: utf-8 -*-
"""Génération du corps PDF de la notice d'utilisation Ma Thèse (Template 07 Crystal Blue).
Pipeline : MD -> ReportLab (TocDocTemplate + multiBuild), pagination romaine (sommaire) / arabe (corps).
"""
import hashlib, re, sys

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    HRFlowable, Flowable, Preformatted,
)
from reportlab.platypus.tableofcontents import TableOfContents

MD_PATH = "/home/z/my-project/docs/NOTICE-UTILISATION.md"
OUT_PATH = "/home/z/my-project/.pdfbuild/notice-body.pdf"

# ━━ Polices ━━
FD = "/usr/share/fonts/truetype/dejavu"
pdfmetrics.registerFont(TTFont("DVS", f"{FD}/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVS-Bold", f"{FD}/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("DVSM", f"{FD}/DejaVuSansMono.ttf"))
pdfmetrics.registerFont(TTFont("DVSM-Bold", f"{FD}/DejaVuSansMono-Bold.ttf"))
registerFontFamily("DVS", normal="DVS", bold="DVS-Bold", italic="DVS", boldItalic="DVS-Bold")
registerFontFamily("DVSM", normal="DVSM", bold="DVSM-Bold", italic="DVSM", boldItalic="DVSM-Bold")

# ━━ Palette Template 07 « Crystal Blue » (alignée sur la couverture) ━━
HEADER_FILL   = colors.HexColor("#1d4e6e")   # M tier — en-têtes de tableaux
ACCENT        = colors.HexColor("#2d7ab3")   # S tier — accents, filets
BORDER        = colors.HexColor("#b8cdd9")   # S tier — bordures
TABLE_STRIPE  = colors.HexColor("#eef4f8")   # L tier — zébrage
QUOTE_BG      = colors.HexColor("#f2f7fb")   # L tier — encadrés
CODE_BG       = colors.HexColor("#f5f5f2")
TEXT_PRIMARY  = colors.HexColor("#1a2632")
TEXT_MUTED    = colors.HexColor("#5f7285")

PAGE_W, PAGE_H = A4
M_L = M_R = 46
M_T, M_B = 52, 50
AVAIL = PAGE_W - M_L - M_R

# ━━ Styles ━━
S_BODY = ParagraphStyle("body", fontName="DVS", fontSize=9.3, leading=13.6,
                        textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY, spaceAfter=5)
S_H1 = ParagraphStyle("h1", fontName="DVS-Bold", fontSize=14.5, leading=18,
                      textColor=HEADER_FILL, spaceBefore=16, spaceAfter=7, keepWithNext=1)
S_H2 = ParagraphStyle("h2", fontName="DVS-Bold", fontSize=11, leading=14.5,
                      textColor=ACCENT, spaceBefore=11, spaceAfter=5, keepWithNext=1)
S_BULLET = ParagraphStyle("bullet", parent=S_BODY, leftIndent=14, bulletIndent=4, spaceAfter=3.2)
S_NUM = ParagraphStyle("num", parent=S_BODY, leftIndent=17, bulletIndent=2, spaceAfter=3.2)
S_QUOTE = ParagraphStyle("quote", parent=S_BODY, fontSize=8.8, leading=12.6,
                         backColor=QUOTE_BG, borderColor=BORDER, borderWidth=0.7,
                         borderPadding=(5, 7, 5, 7), leftIndent=4, rightIndent=4,
                         spaceBefore=4, spaceAfter=7, alignment=TA_LEFT)
S_CELL = ParagraphStyle("cell", fontName="DVS", fontSize=8.1, leading=10.8, textColor=TEXT_PRIMARY)
S_CELL_B = ParagraphStyle("cellb", parent=S_CELL, fontName="DVS-Bold", textColor=colors.white)
S_CODE = ParagraphStyle("code", fontName="DVSM", fontSize=8, leading=11.2, textColor=TEXT_PRIMARY,
                        backColor=CODE_BG, borderPadding=(5, 7, 5, 7), spaceBefore=3, spaceAfter=7)
S_TOC_TITLE = ParagraphStyle("toct", parent=S_H1, fontSize=17, spaceBefore=2, spaceAfter=12)
TOC_L0 = ParagraphStyle("toc0", fontName="DVS-Bold", fontSize=9.6, leading=14.6, textColor=TEXT_PRIMARY)
TOC_L1 = ParagraphStyle("toc1", fontName="DVS", fontSize=8.4, leading=12.0,
                        textColor=TEXT_MUTED, leftIndent=16)

# ━━ Pagination : marqueur de début de corps + étiquettes romain/arabe ━━
BODY_START = {"page": None}

def to_roman(n):
    vals = [(10, "x"), (9, "ix"), (5, "v"), (4, "iv"), (1, "i")]
    out = ""
    for v, s in vals:
        while n >= v:
            out += s
            n -= v
    return out

class BodyStart(Flowable):
    width = height = 0
    def draw(self):
        pass

class PageLabelCanvas(pdfcanvas.Canvas):
    """Étiquettes : sommaire en romain (i, ii…), corps en arabe reparti à 1."""
    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self._states = []
    def showPage(self):
        self._states.append(dict(self.__dict__))
        self._startPage()
    def save(self):
        start = BODY_START["page"]
        for st in self._states:
            self.__dict__.update(st)
            phys = st["_pageNumber"]
            label = to_roman(phys) if (start is None or phys < start) else str(phys - start + 1)
            self.saveState()
            self.setFont("DVS", 7.6)
            self.setFillColor(TEXT_MUTED)
            self.drawCentredString(PAGE_W / 2.0, 26, label)
            self.restoreState()
            super().showPage()
        super().save()

class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, BodyStart):
            BODY_START["page"] = self.page
            return
        if hasattr(flowable, "bookmark_name"):
            level = getattr(flowable, "bookmark_level", 0)
            text = getattr(flowable, "bookmark_text", "")
            key = getattr(flowable, "bookmark_key", "")
            page = self.page
            if BODY_START["page"] is not None and self.page >= BODY_START["page"]:
                page = self.page - BODY_START["page"] + 1
            self.notify("TOCEntry", (level, text, page, key))

# ━━ Conversion Markdown -> rich text ReportLab ━━
def inline(md):
    t = md
    t = t.replace("&", "&").replace("<", "<").replace(">", ">")
    t = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", t)          # liens -> texte
    t = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", t)          # gras
    t = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"\1", t)      # italique -> normal
    t = re.sub(r"`([^`]+)`", r'<font face="DVSM" size="7.8">\1</font>', t)
    return t

def heading(md_text, style, level):
    text = inline(md_text)
    key = "h_" + hashlib.md5(md_text.encode()).hexdigest()[:8]
    p = Paragraph(f'<a name="{key}"/>{text}', style)
    if re.sub(r"\*\*|`", "", md_text).strip() != "Table des matières":
        p.bookmark_name = key
        p.bookmark_level = level
        p.bookmark_text = re.sub(r"\*\*|`", "", md_text)
        p.bookmark_key = key
    return p

def make_table(rows):
    """rows = liste de lignes (cellules brutes). Ligne 0 = en-tête."""
    ncol = max(len(r) for r in rows)
    rows = [r + [""] * (ncol - len(r)) for r in rows]
    maxlens = [max(len(rows[i][j]) for i in range(len(rows))) for j in range(ncol)]
    maxlens = [max(v, 6) for v in maxlens]
    total = sum(maxlens)
    weights = [max(v / total, 0.10) for v in maxlens]
    scale = 1.0 / sum(weights)
    widths = [w * scale * AVAIL for w in weights]
    data = []
    for i, row in enumerate(rows):
        st = S_CELL_B if i == 0 else S_CELL
        data.append([Paragraph(inline(c), st) for c in row])
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]
    for i in range(1, len(rows)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), TABLE_STRIPE))
    t.setStyle(TableStyle(style))
    return t

def split_row(line):
    line = line.strip().strip("|")
    return [c.strip() for c in line.split("|")]

# ━━ Lecture du Markdown ━━
with open(MD_PATH, encoding="utf-8") as f:
    lines = f.read().splitlines()

story = []
i = 0
n = len(lines)

story.append(Paragraph("Sommaire", S_TOC_TITLE))
toc = TableOfContents()
toc.levelStyles = [TOC_L0, TOC_L1]
toc.dotsMinLevel = 0
toc.tableStyle = TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 0),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 1.6),
])
story.append(toc)
story.append(PageBreak())
story.append(BodyStart())

first_h1 = True
while i < n:
    ln = lines[i]
    s = ln.strip()
    if not s:
        i += 1
        continue
    if s.startswith("```"):                                   # bloc de code
        code = []
        i += 1
        while i < n and not lines[i].strip().startswith("```"):
            code.append(lines[i])
            i += 1
        i += 1
        story.append(Preformatted("\n".join(code), S_CODE, maxLineLength=88))
        continue
    if s == "---":                                            # filet
        story.append(HRFlowable(width="100%", thickness=0.6, color=BORDER,
                                spaceBefore=6, spaceAfter=6))
        i += 1
        continue
    if s.startswith("# "):                                    # H1 unique -> titre de document
        if first_h1:
            story.append(Paragraph(inline(s[2:]), ParagraphStyle(
                "doct", parent=S_H1, fontSize=15.5, alignment=TA_CENTER, spaceBefore=0)))
            first_h1 = False
        else:
            story.append(heading(s[2:], S_H1, 0))
        i += 1
        continue
    if s.startswith("## "):
        story.append(heading(s[3:], S_H1, 0))
        i += 1
        continue
    if s.startswith("### "):
        story.append(heading(s[4:], S_H2, 1))
        i += 1
        continue
    if s.startswith("> "):                                    # encadré
        block = []
        while i < n and lines[i].strip().startswith(">"):
            block.append(lines[i].strip().lstrip(">").strip())
            i += 1
        story.append(Paragraph(inline(" ".join(b for b in block if b)), S_QUOTE))
        continue
    if s.startswith("|"):                                     # tableau
        rows = []
        while i < n and lines[i].strip().startswith("|"):
            row = lines[i].strip()
            if not re.match(r"^\|[\s:|-]+\|$", row):
                rows.append(split_row(row))
            i += 1
        if rows:
            story.append(Spacer(1, 2))
            story.append(make_table(rows))
            story.append(Spacer(1, 6))
        continue
    if re.match(r"^- ", s):                                   # liste à puces
        while i < n and re.match(r"^- ", lines[i].strip()):
            story.append(Paragraph(inline(lines[i].strip()[2:]),
                                   S_BULLET, bulletText="•"))
            i += 1
        continue
    if re.match(r"^\d+\.\s", s):                              # liste numérotée
        while i < n and re.match(r"^\d+\.\s", lines[i].strip()):
            item = lines[i].strip()
            num = re.match(r"^(\d+)\.\s", item).group(1)
            story.append(Paragraph(inline(item[len(num) + 2:]),
                                   S_NUM, bulletText=f"{num}."))
            i += 1
        continue
    # paragraphe (avec continuation éventuelle)
    para = [s]
    i += 1
    while i < n and lines[i].strip() and not re.match(
            r"^(#|\||>|-|\d+\.\s|```|---)", lines[i].strip()):
        para.append(lines[i].strip())
        i += 1
    story.append(Paragraph(inline(" ".join(para)), S_BODY))

# ━━ Construction ━━
doc = TocDocTemplate(
    OUT_PATH, pagesize=A4,
    leftMargin=M_L, rightMargin=M_R, topMargin=M_T, bottomMargin=M_B,
    title="Notice d'utilisation — Ma Thèse",
    author="Z.ai",
    subject="Manuel utilisateur de l'application Ma Thèse (ThesisFrame) v1.10.8",
    creator="Z.ai",
)
doc.multiBuild(story, canvasmaker=PageLabelCanvas)
print("OK", OUT_PATH, "body_start=", BODY_START["page"])
