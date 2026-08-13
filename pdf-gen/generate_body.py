#!/usr/bin/env python3
"""ThesisFrame Roadmap - ReportLab Body PDF Generator"""
import os, sys, hashlib
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm, inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, CondPageBreak, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FONT SETUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FONT_DIR = '/usr/share/fonts'

pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold', italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')

pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans-Bold', f'{FONT_DIR}/truetype/dejavu/DejaVuSans-Bold.ttf'))

pdfmetrics.registerFont(TTFont('DejaVuMono', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CASCADE PALETTE (auto-generated)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE_BG       = colors.HexColor('#f0eff1')
SECTION_BG    = colors.HexColor('#f2f0f2')
CARD_BG       = colors.HexColor('#ebe8ed')
TABLE_STRIPE  = colors.HexColor('#f4f2f5')
HEADER_FILL   = colors.HexColor('#483850')
COVER_BLOCK   = colors.HexColor('#73607d')
BORDER        = colors.HexColor('#c2b7c7')
ICON          = colors.HexColor('#8642a8')
ACCENT        = colors.HexColor('#8827b9')
ACCENT_2      = colors.HexColor('#40cd58')
TEXT_PRIMARY   = colors.HexColor('#1f1d20')
TEXT_MUTED     = colors.HexColor('#7e7882')
SEM_SUCCESS   = colors.HexColor('#398352')
SEM_WARNING   = colors.HexColor('#8c7240')
SEM_ERROR     = colors.HexColor('#96473f')
SEM_INFO      = colors.HexColor('#4d77a0')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STYLES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MARGIN = 0.85 * inch

styles = getSampleStyleSheet()

s_h1 = ParagraphStyle('H1', parent=styles['Heading1'], fontName='FreeSerif-Bold',
    fontSize=24, leading=30, textColor=HEADER_FILL, spaceAfter=12, spaceBefore=20,
    borderWidth=0, borderPadding=0, borderColor=ACCENT)

s_h2 = ParagraphStyle('H2', parent=styles['Heading2'], fontName='FreeSerif-Bold',
    fontSize=18, leading=24, textColor=HEADER_FILL, spaceAfter=8, spaceBefore=16)

s_h3 = ParagraphStyle('H3', parent=styles['Heading3'], fontName='FreeSerif-Bold',
    fontSize=14, leading=18, textColor=ICON, spaceAfter=6, spaceBefore=12)

s_body = ParagraphStyle('Body', parent=styles['Normal'], fontName='FreeSerif',
    fontSize=10.5, leading=17, textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY,
    spaceAfter=6, spaceBefore=2)

s_body_small = ParagraphStyle('BodySmall', parent=s_body, fontSize=9.5, leading=15)

s_bullet = ParagraphStyle('Bullet', parent=s_body, leftIndent=20, bulletIndent=8,
    spaceBefore=2, spaceAfter=2)

s_code = ParagraphStyle('Code', fontName='DejaVuMono', fontSize=8.5, leading=12,
    textColor=TEXT_PRIMARY, backColor=SECTION_BG, borderWidth=0.5,
    borderColor=BORDER, borderPadding=6, spaceAfter=6, spaceBefore=6)

s_callout = ParagraphStyle('Callout', fontName='FreeSerif-Italic', fontSize=10.5,
    leading=17, textColor=ICON, leftIndent=20, borderWidth=2,
    borderColor=ACCENT, borderPadding=8, spaceAfter=8, spaceBefore=8)

# Table styles
s_th = ParagraphStyle('TH', fontName='FreeSerif-Bold', fontSize=9, leading=13,
    textColor=TABLE_HEADER_TEXT, alignment=TA_CENTER)

s_td = ParagraphStyle('TD', fontName='FreeSerif', fontSize=8.5, leading=12,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')

s_td_center = ParagraphStyle('TDCenter', parent=s_td, alignment=TA_CENTER)

s_td_small = ParagraphStyle('TDSmall', fontName='FreeSerif', fontSize=7.5,
    leading=11, textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')

# TOC styles
s_toc0 = ParagraphStyle('TOC0', fontName='FreeSerif-Bold', fontSize=13,
    leading=20, leftIndent=20, textColor=HEADER_FILL)

s_toc1 = ParagraphStyle('TOC1', fontName='FreeSerif', fontSize=11,
    leading=18, leftIndent=40, textColor=TEXT_PRIMARY)

s_toc2 = ParagraphStyle('TOC2', fontName='FreeSerif', fontSize=10,
    leading=16, leftIndent=60, textColor=TEXT_MUTED)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELPERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE_W = A4[0]
PAGE_H = A4[1]
AVAIL_W = PAGE_W - 2 * MARGIN

def P(text, style=None):
    return Paragraph(text, style or s_body)

def H1(text):
    return add_heading(text, s_h1, level=0)

def H2(text):
    return add_heading(text, s_h2, level=1)

def H3(text):
    return add_heading(text, s_h3, level=2)

_heading_counter = [0, 0, 0]

def add_heading(text, style, level=0):
    if level == 0:
        _heading_counter[0] += 1
        _heading_counter[1] = 0
        _heading_counter[2] = 0
        num = f'{_heading_counter[0]}'
    elif level == 1:
        _heading_counter[1] += 1
        _heading_counter[2] = 0
        num = f'{_heading_counter[0]}.{_heading_counter[1]}'
    else:
        _heading_counter[2] += 1
        num = f'{_heading_counter[0]}.{_heading_counter[1]}.{_heading_counter[2]}'
    
    key = f'h_{hashlib.md5(text.encode()).hexdigest()[:8]}'
    display = f'{num}  {text}' if level > 0 else text
    p = Paragraph(f'<a name="{key}"/>{display}', style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = display
    p.bookmark_key = key
    return p

def make_table(headers, rows, col_ratios=None):
    """Build a professional table with Paragraph-wrapped cells."""
    if col_ratios is None:
        n = len(headers)
        col_ratios = [1.0/n] * n
    
    col_widths = [r * AVAIL_W for r in col_ratios]
    # Ensure sum <= AVAIL_W
    scale = AVAIL_W / sum(col_widths)
    col_widths = [w * scale for w in col_widths]
    
    header_row = [Paragraph(f'<b>{h}</b>', s_th) for h in headers]
    data = [header_row]
    for row in rows:
        data.append([Paragraph(str(c), s_td) if not isinstance(c, Paragraph) else c for c in row])
    
    t = Table(data, colWidths=col_widths, repeatRows=1)
    
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('LINEBELOW', (0, 0), (-1, 0), 1, ACCENT),
    ]
    
    for i in range(1, len(data)):
        bg = TABLE_ROW_ODD if i % 2 == 0 else TABLE_ROW_EVEN
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    
    t.setStyle(TableStyle(style_cmds))
    t.hAlign = 'CENTER'
    return t

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=8, spaceBefore=8)

def sp(pts=6):
    return Spacer(1, pts)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TOC TEMPLATE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PAGE TEMPLATES (footers)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_body_page_count = [0]

def footer_body(canvas, doc):
    _body_page_count[0] += 1
    canvas.saveState()
    canvas.setFont('FreeSerif', 8)
    canvas.setFillColor(TEXT_MUTED)
    pn = doc.page
    canvas.drawCentredString(PAGE_W / 2, 25, str(pn))
    # Header line
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(MARGIN, PAGE_H - MARGIN + 10, PAGE_W - MARGIN, PAGE_H - MARGIN + 10)
    canvas.setFont('FreeSerif', 7)
    canvas.drawString(MARGIN, PAGE_H - MARGIN + 14, "ThesisFrame - Roadmap Strategique")
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - MARGIN + 14, "v1.0 - Plan de Production")
    canvas.restoreState()

def footer_toc(canvas, doc):
    canvas.saveState()
    canvas.setFont('FreeSerif', 8)
    canvas.setFillColor(TEXT_MUTED)
    roman_map = {1:'i',2:'ii',3:'iii',4:'iv',5:'v',6:'vi',7:'vii',8:'viii',9:'ix',10:'x',
                 11:'xi',12:'xii',13:'xiii',14:'xiv',15:'xv'}
    pn = roman_map.get(doc.page, str(doc.page))
    canvas.drawCentredString(PAGE_W / 2, 25, pn)
    canvas.restoreState()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BUILD STORY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT = '/home/z/my-project/pdf-gen/body.pdf'

doc = TocDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN + 10, bottomMargin=MARGIN,
    title="ThesisFrame - Roadmap Strategique de Developpement",
    author="Z.ai",
    subject="Plan de reconstruction modulaire de l'assistant doctoral ThesisFrame"
)

story = []

# ──────────────────────────────────────────
# TABLE OF CONTENTS
# ──────────────────────────────────────────
story.append(sp(10))
story.append(Paragraph('<b>Table des Matieres</b>', ParagraphStyle('TOCTitle',
    fontName='FreeSerif-Bold', fontSize=22, leading=28, textColor=HEADER_FILL,
    spaceAfter=16, spaceBefore=10)))

toc = TableOfContents()
toc.levelStyles = [s_toc0, s_toc1, s_toc2]
story.append(toc)
story.append(PageBreak())

# ──────────────────────────────────────────
# SECTION I: DIAGNOSTIC & AUDIT TECHNIQUE
# ──────────────────────────────────────────
story.append(H1("Diagnostic et Audit Technique"))
story.append(sp(4))
story.append(P("Cette section presente l'etat des lieux du depot ThesisFrame existant, identifie les risques techniques majeurs et analyse le chemin critique vers une reconstruction professionnelle. Le depot actuel (v0.4.0) presente une architecture monolithique complexe qui necessite une refonte complete pour atteindre les standards de qualite requis pour un outil doctoral."))

story.append(H2("Etat des lieux du depot existant"))
story.append(P("Le depot GitHub <b>freemind25/these-frame</b> dans sa version v0.4.0 revele une architecture typique de prototype rapide qui a atteint ses limites structurelles. L'analyse statique du code met en evidence les problematiques suivantes qui compromettent la maintenabilite et l'evolutivite du projet a moyen terme."))
story.append(sp(4))

findings = [
    ("Architecture monolithique critique", "Le fichier page.tsx principal contient environ 900 lignes de code avec plus de 30 etats React (useState) integres directement, rendant le composant impossible a tester unitairement et extremement difficile a maintenir. Chaque modification risque des effets de bord non maitrises."),
    ("Composants et routes surdimensionnes", "41 composants metier coupls et plus de 40 routes API sans validation consistante forment un reseau de dependances inextricable. L'absence de separation claire entre la logique metier et la couche de presentation rend chaque evolution hasardeuse."),
    ("Modeles de donnees complexes", "20+ modeles Prisma definissent une structure de donnees academique riche (theses, chapitres, references, cadrage, notebook, versions). Ce schema constitue un actif precieux pour la reconstruction mais necessite une migration soigneusement planifiee."),
    ("Contenu academique substantiel", "26 fichiers de donnees contenant environ 6 240 lignes de contenu academique structure (guides methodologiques, templates de theses, references bibliographiques) representent un capital connaissances qu'il est imperatif de preserver lors de la reconstruction."),
    ("Absence totale de tests", "Aucun test unitaire, d'integration ou end-to-end n'existe dans le depot. La variable ignoreBuildErrors est activee a true dans la configuration Next.js, masquant les erreurs TypeScript et rendant le type checking ineffectif."),
]

for title, desc in findings:
    story.append(P(f'<b>{title}</b> : {desc}'))

story.append(sp(6))
story.append(H2("Matrice des risques techniques"))
story.append(P("L'analyse des risques identifie huit risques majeurs qui doivent etre adresses de maniere proactive tout au long du projet de reconstruction. Chaque risque est evalue selon sa probabilite d'occurrence et son impact potentiel sur le succes du projet, permettant ainsi de prioriser les actions d'attenuation de maniere coherente."))
story.append(sp(4))

risk_headers = ['ID', 'Risque', 'Probabilite', 'Impact', 'Niveau', 'Attenuation']
risk_rows = [
    ['R1', 'Dette technique du monolithe', 'Elevee', 'Critique', 'Majeur', 'Refonte modulaire P0-P1'],
    ['R2', 'Absence de tests', 'Certaine', 'Eleve', 'Critique', 'Infrastructure Vitest P0'],
    ['R3', 'TypeScript non verifie', 'Certaine', 'Moyen', 'Majeur', 'ESLint strict P0'],
    ['R4', 'Dependances non maitrisees', 'Moyenne', 'Eleve', 'Majeur', 'Audit + lockfile P0'],
    ['R5', 'Performance UI monolithe', 'Elevee', 'Moyen', 'Eleve', 'Code splitting P3'],
    ['R6', 'Securite cles API localStorage', 'Moyenne', 'Critique', 'Majeur', 'Server-side vault P7'],
    ['R7', 'Evolutivite limitee', 'Certaine', 'Eleve', 'Critique', 'Architecture modulaire P1'],
    ['R8', 'Documentation absente', 'Certaine', 'Moyen', 'Majeur', 'Docs techniques P7'],
]
story.append(make_table(risk_headers, risk_rows, [0.06, 0.28, 0.12, 0.10, 0.10, 0.34]))

story.append(sp(8))
story.append(H2("Analyse du chemin critique"))
story.append(P("Le chemin critique de la reconstruction passe par quatre jalons incontournables qui conditionnent le succes global du projet. Premierement, la mise en place de l'infrastructure de qualite (lint, tests, CI/CD) constitue le fondement sans lequel aucune evolution ulterieure ne peut etre validee de maniere fiable. Deuxiemement, la definition de l'architecture modulaire et l'implementation du layout principal etablissent le squelette structurel sur lequel tous les modules viendront s'articuler."))
story.append(P("Troisiemement, la couche de donnees et les API routes constituent le pont entre le schema Prisma existant et l'interface utilisateur, necessitant une migration soignee des 20+ modeles. Quatriemement, l'editeur central Tiptap avec ses extensions avancees represente le composant le plus complexe du systeme et le veritable coeur fonctionnel de l'application. Le retard sur l'un de ces quatre jalons se repercute directement sur la livraison totale du projet."))
story.append(P("L'estimation totale du projet s'eleve a environ 315 jours-homme repartis sur 21 semaines (5 mois), avec une equipe impliquant un lead developpeur a temps plein, un designer UX/UI a mi-temps, un testeur QA a quart temps et un expert IA/NLP a quart temps."))

# ──────────────────────────────────────────
# SECTION II: DECISIONS D'ARCHITECTURE
# ──────────────────────────────────────────
story.append(CondPageBreak(100))
story.append(H1("Decisions d'Architecture"))
story.append(sp(4))
story.append(P("Cette section detaille les choix architecturaux fondamentaux qui guideront la reconstruction de ThesisFrame. Chaque decision est argumentee en fonction du contexte specifique du projet (equipe de 1 a 3 developpeurs, application monopage complexe, contraintes de temps) pour eviter toute sur-ingenierie tout en preservant l'evolutivite a long terme."))

story.append(H2("Architecture cible : Modular Monolith"))
story.append(P("L'architecture cible retenue est celle du <b>Monolithe Modulaire</b> suivant le paradigme <b>Feature-Sliced Design</b>. Ce choix strategique s'appuie sur une analyse comparative rigoureuse des alternatives disponibles et des contraintes specifiques du projet. Contrairement aux micro-frontends qui introduiraient une complexite operationnelle disproportionate pour une equipe de 1 a 3 developpeurs, le monolithe modulaire offre le meilleur equilibre entre separation des responsabilites et simplicite de deploiement."))
story.append(sp(4))

advantages = [
    "<b>Simplicite operationnelle</b> : Un seul depot, un seul pipeline CI/CD, un seul processus de deploiement. Pas de coordination inter-equipes necessaire.",
    "<b>Partage d'etat simplifie</b> : Les modules communiquent directement via des imports TypeScript, sans API inter-service ni event bus complexe.",
    "<b>Refactoring aise</b> : Un seul codebase permet les refactoring cross-modules en une seule operation, alors que les micro-frontends figent les frontieres.",
    "<b>Performance optimale</b> : Pas de sur-reseau ni de serialisation/deserialisation entre services. Le bundler optimise globalement.",
    "<b>Evolutivite future</b> : Si le besoin se presente, l'extraction d'un module en micro-frontend est facilisee par la separation claire des features.",
]
for adv in advantages:
    story.append(P(f'&#8226; {adv}', s_bullet))

story.append(sp(6))
story.append(H2("Structure de dossiers cible"))
story.append(P("La structure de dossiers suit le paradigme Feature-Sliced Design avec une separation nette entre les modules metier, les composants UI generiques, la logique partagée et les donnees. Chaque module est autonome et expose uniquement une API publique via un fichier index.ts barrel export, garantissant l'encapsulation et la maintenabilite."))
story.append(sp(4))

folder_structure = """src/<br/>
  app/<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;layout.tsx / page.tsx (orchestrateur leger)<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;api/ (health, thesis, editor, ai, references, methodology)<br/>
  modules/<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;thesis/ components/ hooks/ api/ types/ index.ts<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;editor/ ai-writing/ references/ methodology/ notebook/<br/>
  components/ (ui/ shadcn + layout/)<br/>
  lib/ (db, ai, utils)<br/>
  data/ types/"""

story.append(Paragraph(folder_structure, s_code))

story.append(sp(6))
story.append(H2("Strategie d'etat (4 couches)"))
story.append(P("La gestion d'etat adopte une approche en quatre couches complementaires, chacune dediee a un type de donnees specifique pour eviter le melange des responsabilites et garantir la coherence de l'application. Cette stratification permet de choisir l'outil le plus adapte a chaque besoin sans compromettre la performance ou la maintenabilite."))

state_headers = ['Couche', 'Technologie', 'Responsabilite', 'Exemple']
state_rows = [
    ['Server State', 'TanStack Query', 'Donnees serveur cachees', 'Liste des theses, references'],
    ['Module Store', 'Zustand', 'Etat metier par module', 'Editeur actif, mode IA courant'],
    ['UI Local', 'useState/useReducer', 'Etat composant local', 'Modal ouvert, toggle sombre'],
    ['URL State', 'searchParams', 'Etat navigable', 'Onglet courant, filtre actif'],
]
story.append(make_table(state_headers, state_rows, [0.15, 0.18, 0.32, 0.35]))

story.append(sp(6))
story.append(H2("Design patterns API"))
story.append(P("Les API routes suivent un pattern RESTful standardise avec validation Zod a l'entree et un format de reponse uniforme. Chaque route implemente un schema de reponse au format <b>{ data, error, meta }</b> avec les codes HTTP appropriatifs (200, 201, 400, 401, 404, 500). Le rate limiting protege les endpoints sensibles et un error handler centralise garantit des reponses coherentes en cas d'erreur. La pagination utilise un systeme cursor-based pour optimiser les performances sur les grands jeux de donnees bibliographiques."))

story.append(H2("Pyramide de tests"))
story.append(P("La strategie de tests suit une pyramide classique avec trois niveaux complementaires. Les tests unitaires avec Vitest visent une couverture de 80%, constituant la base de la qualite logicielle. Les tests d'integration utilisant Vitest avec MSW (Mock Service Worker) valident les interactions entre composants et API. Les tests end-to-end avec Playwright couvrent 15 scenarios critiques representatifs des parcours utilisateur principaux."))

story.append(H2("Pipeline CI/CD"))
story.append(P("Le pipeline d'integration et de deploiement continu suit une sequence stricte en six etapes : <b>Lint (ESLint)</b> puis <b>Type Check (tsc --noEmit)</b> puis <b>Unit Tests (Vitest)</b> puis <b>Build (next build)</b> puis <b>E2E Tests (Playwright)</b> puis <b>Deploy (Vercel/Docker)</b>. Chaque etape bloque la suivante en cas d'echec, garantissant que seul du code valide et testé atteint la production."))

# ──────────────────────────────────────────
# SECTION III: ROADMAP DETAILLEE
# ──────────────────────────────────────────
story.append(CondPageBreak(100))
story.append(H1("Roadmap Detaillee"))
story.append(sp(4))
story.append(P("Cette section presente le planning detaille de la reconstruction en huit phases (P0 a P7), couvrant 21 semaines de developpement soit environ 315 jours-homme. Chaque phase est decomposee en epics avec des taches individuelles, des estimations d'effort et des livrables clairement definis. Les criteres d'acceptation de chaque phase garantissent la qualite et la completude avant de passer a la phase suivante."))

# PHASE 0
story.append(H2("Phase 0 : Fondations et Audit (Semaines 1-2, 10 jours)"))
story.append(P("<b>Objectifs :</b> Auditer le code existant et documenter les risques, mettre en place l'infrastructure de qualite, configurer le pipeline CI/CD, definir le design system."))
story.append(sp(4))

story.append(H3("Epic 1 : Audit et Configuration Projet (5 jours)"))
p0e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p0e1_rows = [
    ['0.1.1', 'Cloner et analyser le depot', 'Analyse statique du code existant', '1j', 'Rapport d\'audit'],
    ['0.1.2', 'Configurer ESLint strict', 'Regles TypeScript strict, pas d\'any', '0.5j', 'eslint.config.mjs'],
    ['0.1.3', 'Activer le type checking', 'Retirer ignoreBuildErrors', '0.5j', 'next.config.ts propre'],
    ['0.1.4', 'Definir conventions de code', 'Naming, formatting, structure', '1j', '.editorconfig + guide'],
    ['0.1.5', 'Mettre a jour package.json', 'Nom, version, scripts utiles', '0.5j', 'package.json'],
    ['0.1.6', 'Configurer variables env', 'Schema validation des env vars', '1j', '.env.example + schema'],
    ['0.1.7', 'Documenter l\'audit', 'Synthese des findings', '0.5j', 'AUDIT.md'],
]
story.append(make_table(p0e1_headers, p0e1_rows, [0.07, 0.22, 0.32, 0.08, 0.31]))

story.append(sp(6))
story.append(H3("Epic 2 : Infrastructure Qualite (5 jours)"))
p0e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p0e2_rows = [
    ['0.2.1', 'Installer Vitest', 'Setup avec coverage', '1j', 'vitest.config.ts'],
    ['0.2.2', 'Installer Playwright', 'Setup E2E avec baseURL', '1j', 'playwright.config.ts'],
    ['0.2.3', 'Pipeline GitHub Actions', 'Lint + test + build + E2E', '1.5j', '.github/workflows/'],
    ['0.2.4', 'Configurer Husky + lint-staged', 'Pre-commit hooks', '0.5j', '.husky/'],
    ['0.2.5', 'Definir le design system', 'Tokens couleur, typo, espacement', '1.5j', 'tokens.ts + storybook'],
    ['0.2.6', 'Creer composants de base', 'Button, Card, Input, Badge (audit)', '1j', 'Composants verifies'],
]
story.append(make_table(p0e2_headers, p0e2_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> Pipeline CI vert, couverture >= 30%, 0 erreurs TypeScript, design system documente.', s_callout))

# PHASE 1
story.append(sp(8))
story.append(H2("Phase 1 : Architecture Noyau (Semaines 3-5, 15 jours)"))
story.append(P("<b>Objectifs :</b> Implementer le layout principal responsive, creer le systeme de navigation, developper les composants layout, etablir la structure modulaire."))
story.append(sp(4))

story.append(H3("Epic 1 : Layout et Navigation (8 jours)"))
p1e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p1e1_rows = [
    ['1.1.1', 'Layout racine responsive', 'Header, Sidebar, Main, Footer sticky', '2j', 'RootLayout'],
    ['1.1.2', 'Sidebar de navigation', 'Menu collapsible, breadcrumbs', '2j', 'Sidebar component'],
    ['1.1.3', 'Systeme de routing', 'Client-side tabs + deep linking', '2j', 'Navigation system'],
    ['1.1.4', 'Page d\'accueil dashboard', 'Vue d\'ensemble avec stats', '2j', 'Dashboard page'],
]
story.append(make_table(p1e1_headers, p1e1_rows, [0.07, 0.22, 0.34, 0.08, 0.29]))

story.append(sp(6))
story.append(H3("Epic 2 : Design System et Composants (7 jours)"))
p1e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p1e2_rows = [
    ['1.2.1', 'Theme clair/sombre', 'next-themes + CSS variables', '1j', 'ThemeProvider'],
    ['1.2.2', 'Composants metier de base', 'ChapterCard, StatusBadge, ProgressBar', '2j', 'Base components'],
    ['1.2.3', 'Systeme de modales/dialogs', 'Composables reutilisables', '1.5j', 'Dialog system'],
    ['1.2.4', 'Toasts et notifications', 'Feedback utilisateur standardise', '0.5j', 'Toast system'],
    ['1.2.5', 'Loading states', 'Skeletons, spinners, empty states', '1j', 'Loading components'],
    ['1.2.6', 'Composables partages', 'useDebounce, useLocalStorage, useMediaQuery', '1j', 'Hooks library'],
]
story.append(make_table(p1e2_headers, p1e2_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> Navigation fonctionnelle, responsive mobile/desktop, theme clair/sombre, tous composants testes unitairement.', s_callout))

# PHASE 2
story.append(sp(8))
story.append(H2("Phase 2 : Couche Donnees et API (Semaines 6-7, 10 jours)"))
story.append(P("<b>Objectifs :</b> Implementer le schema Prisma complet, developper les API routes CRUD, mettre en place la logique metier serveur avec validation et error handling standardises."))
story.append(sp(4))

story.append(H3("Epic 1 : Base de donnees (5 jours)"))
p2e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p2e1_rows = [
    ['2.1.1', 'Schema Prisma Thesis', 'Modele These avec chapitres', '1j', 'schema.prisma'],
    ['2.1.2', 'Schema Prisma References', 'CRUD references bibliographiques', '1j', 'schema.prisma'],
    ['2.1.3', 'Schema Cadrage et Versions', 'Modele cadrage avec versioning', '1j', 'schema.prisma'],
    ['2.1.4', 'Schema Notebook et Sources', 'Notebook de recherche', '0.5j', 'schema.prisma'],
    ['2.1.5', 'Seed data', 'Donnees initiales de demonstration', '1j', 'seed.ts'],
    ['2.1.6', 'Migrations et validation', 'db:push, verification integrite', '0.5j', 'Base operationnelle'],
]
story.append(make_table(p2e1_headers, p2e1_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(6))
story.append(H3("Epic 2 : API Routes (5 jours)"))
p2e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p2e2_rows = [
    ['2.2.1', 'API Thesis CRUD', 'GET/POST/PUT/DELETE theses', '1j', '/api/thesis/'],
    ['2.2.2', 'API Chapters CRUD', 'Gestion des chapitres', '1j', '/api/thesis/chapters/'],
    ['2.2.3', 'API References', 'CRUD + recherche + BibTeX export', '1.5j', '/api/references/'],
    ['2.2.4', 'API Cadrage', 'Sauvegarde et versions', '1j', '/api/cadrage/'],
    ['2.2.5', 'Validation Zod', 'Schemas de validation pour toutes routes', '0.5j', 'api-schemas.ts'],
]
story.append(make_table(p2e2_headers, p2e2_rows, [0.07, 0.22, 0.34, 0.08, 0.29]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> Toutes les API testees (integration tests), schema DB stable, CRUD fonctionnel, validation Zod sur toutes les routes.', s_callout))

# PHASE 3
story.append(sp(8))
story.append(H2("Phase 3 : Editeur Central et Workspace (Semaines 8-10, 15 jours)"))
story.append(P("<b>Objectifs :</b> Integrer l'editeur Tiptap avec extensions avancees, developper le workspace de these, implementer la gestion des chapitres avec drag and drop, auto-save et historique des versions."))
story.append(sp(4))

story.append(H3("Epic 1 : Editeur Tiptap (8 jours)"))
p3e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p3e1_rows = [
    ['3.1.1', 'Setup Tiptap core', 'Installation + extensions de base', '1j', 'TiptapEditor component'],
    ['3.1.2', 'Toolbar complete', 'Gras, italique, titres, listes, liens', '2j', 'EditorToolbar'],
    ['3.1.3', 'Extensions avancees', 'Highlight, typography, character count', '1j', 'Extensions config'],
    ['3.1.4', 'Menu IA inline', 'Menu contextuel sur selection texte', '2j', 'InlineAIMenu'],
    ['3.1.5', 'Auto-save', 'Debounced save + indicateur de statut', '1j', 'useAutoSave hook'],
    ['3.1.6', 'Mode fullscreen et focus', 'Zen mode, split view', '1j', 'Editor modes'],
]
story.append(make_table(p3e1_headers, p3e1_rows, [0.07, 0.22, 0.34, 0.08, 0.29]))

story.append(sp(6))
story.append(H3("Epic 2 : Workspace et Chapitres (7 jours)"))
p3e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p3e2_rows = [
    ['3.2.1', 'Onglets de chapitres', 'Navigation horizontale drag and drop', '2j', 'ChapterTabs'],
    ['3.2.2', 'Panneau lateral outils', 'Tools sidebar avec categories', '1.5j', 'ToolsSidebar'],
    ['3.2.3', 'Header de chapitre', 'Titre editable, statut, mot count', '1j', 'ChapterHeader'],
    ['3.2.4', 'Gestionnaire de these', 'Creer/charger/sauvegarder these', '1.5j', 'ThesisManager'],
    ['3.2.5', 'Templates de these', '10 templates de structure', '1j', 'TemplateSystem'],
]
story.append(make_table(p3e2_headers, p3e2_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> Editeur fonctionnel avec 10+ extensions, auto-save operationnel, drag and drop chapitres, templates applicables et testes.', s_callout))

# PHASE 4
story.append(sp(8))
story.append(H2("Phase 4 : Moteur IA et Assistant (Semaines 11-13, 15 jours)"))
story.append(P("<b>Objectifs :</b> Implementer le routeur IA multi-fournisseur, developper les 10 modes d'ecriture IA, creer le chat directeur, construire le notebook de recherche avec graphe de connaissances."))
story.append(sp(4))

story.append(H3("Epic 1 : Infrastructure IA (5 jours)"))
p4e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p4e1_rows = [
    ['4.1.1', 'Wrapper Z.ai SDK', 'zai.ts avec retry logic et queue', '1j', 'lib/zai.ts'],
    ['4.1.2', 'Routeur multi-provider', '9 providers avec fallback', '2j', 'lib/ai-router.ts'],
    ['4.1.3', 'Conversation store', 'Persistance conversations', '1j', 'conversation-store.ts'],
    ['4.1.4', 'UI selection provider', 'Dialog configuration provider', '1j', 'ProviderSettings'],
]
story.append(make_table(p4e1_headers, p4e1_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(6))
story.append(H3("Epic 2 : Modes d'ecriture IA (5 jours)"))
p4e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p4e2_rows = [
    ['4.2.1', 'Mode Redaction scientifique', 'System prompt + UI', '1j', 'Mode 1'],
    ['4.2.2', 'Mode Revue de litterature', 'System prompt + UI', '1j', 'Mode 2'],
    ['4.2.3', 'Mode Peer review', 'System prompt + UI', '0.5j', 'Mode 3'],
    ['4.2.4', 'Mode Paraphrase', 'System prompt + UI', '0.5j', 'Mode 4'],
    ['4.2.5', 'Modes restants (6)', 'Abstract, hypothese, methodo, theorie, supervision, soutenance', '2j', 'Modes 5-10'],
]
story.append(make_table(p4e2_headers, p4e2_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(6))
story.append(H3("Epic 3 : Chat et Notebook (5 jours)"))
p4e3_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p4e3_rows = [
    ['4.3.1', 'Chat directeur IA', 'Simulateur de directeur de these', '2j', 'DirecteurChat'],
    ['4.3.2', 'Notebook de recherche', 'Notes, sources, Q&A', '1.5j', 'ResearchNotebook'],
    ['4.3.3', 'Graphe de connaissances', 'Force-directed SVG', '1.5j', 'KnowledgeGraph'],
]
story.append(make_table(p4e3_headers, p4e3_rows, [0.07, 0.22, 0.34, 0.08, 0.29]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> 10 modes IA fonctionnels, chat directeur operationnel, notebook avec graphe de connaissances, fallback provider automatique.', s_callout))

# PHASE 5
story.append(sp(8))
story.append(H2("Phase 5 : Modules Academiques (Semaines 14-16, 15 jours)"))
story.append(P("<b>Objectifs :</b> Developper les guides methodologiques complets, implementer la gestion bibliographique, creer le generateur de plan LaTeX, ajouter les outils academiques et les bases de donnees de references."))
story.append(sp(4))

story.append(H3("Epic 1 : Methodologie et Articles (8 jours)"))
p5e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p5e1_rows = [
    ['5.1.1', 'Guide methodologique (7 onglets)', 'Approche, problematique, variables, collecte, docs, concepts, test', '3j', 'MethodologyTab'],
    ['5.1.2', 'Guide articles scientifiques (7 onglets)', 'Etapes, IMRaD, erreurs, checklist, toolbox, revue syst., soutenance', '3j', 'ArticlesTab'],
    ['5.1.3', 'Contenu academique', 'Migration des 26 fichiers de donnees', '2j', 'data/ complet'],
]
story.append(make_table(p5e1_headers, p5e1_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(6))
story.append(H3("Epic 2 : Bibliographie et Plan (7 jours)"))
p5e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p5e2_rows = [
    ['5.2.1', 'References bibliographiques', 'CRUD, tags, recherche, filtres', '2j', 'ReferencesTab'],
    ['5.2.2', 'Export BibTeX', 'Generation et telechargement', '1j', 'BibTeX export'],
    ['5.2.3', 'Generateur plan LaTeX', 'Template personnalisable + download .tex', '2j', 'ThesisPlanTab'],
    ['5.2.4', 'Bases de donnees academiques', '7 ressources cataloguees', '1j', 'AcademyDB'],
    ['5.2.5', 'SLR Protocol', 'Protocole de revue systematique', '1j', 'SLRProtocolPanel'],
]
story.append(make_table(p5e2_headers, p5e2_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> 14 onglets academiques fonctionnels, CRUD references operationnel, export BibTeX fonctionnel, generation LaTeX valide.', s_callout))

# PHASE 6
story.append(sp(8))
story.append(H2("Phase 6 : Modules Avances (Semaines 17-19, 15 jours)"))
story.append(P("<b>Objectifs :</b> Implementer les outils IA avances, ajouter Excalidraw et la visualisation de donnees, developper les integrations cloud et la reconnaissance vocale, creer la roadmap agile interactive."))
story.append(sp(4))

story.append(H3("Epic 1 : Outils IA avances (5 jours)"))
p6e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p6e1_rows = [
    ['6.1.1', 'Humanizer', 'Humanisation de texte IA', '1j', 'Humanizer'],
    ['6.1.2', 'Consensus', 'Analyse multi-sources', '2j', 'Consensus'],
    ['6.1.3', 'Visualisation de donnees', '6 types de graphiques SVG', '1.5j', 'DataViz'],
    ['6.1.4', 'APA Results Composer', 'Redaction resultats APA', '1.5j', 'APAComposer'],
]
story.append(make_table(p6e1_headers, p6e1_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(6))
story.append(H3("Epic 2 : Outils collaboratifs (5 jours)"))
p6e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p6e2_rows = [
    ['6.2.1', 'Excalidraw', 'Tableau blanc dessin', '2j', 'ExcalidrawTab'],
    ['6.2.2', 'Roadmap agile', 'Sprints, stories, phases 0-4', '1.5j', 'AgileRoadmap'],
    ['6.2.3', 'ASR dictee vocale', 'Speech-to-text', '1.5j', 'DictationButton'],
]
story.append(make_table(p6e2_headers, p6e2_rows, [0.07, 0.22, 0.34, 0.08, 0.29]))

story.append(sp(6))
story.append(H3("Epic 3 : Integrations et Recherche (5 jours)"))
p6e3_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p6e3_rows = [
    ['6.3.1', 'Recherche bibliographique', 'Recherche web integree', '1.5j', 'LiteratureSearch'],
    ['6.3.2', 'Journal Finder', 'Trouver des journaux adaptes', '1.5j', 'JournalFinder'],
    ['6.3.3', 'Cloud drive backup', 'Google Drive, OneDrive', '1.5j', 'CloudDriveBackup'],
    ['6.3.4', 'Fiches de lecture', 'Problematique, methodes, resultats', '1.5j', 'RecherchePanel'],
]
story.append(make_table(p6e3_headers, p6e3_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> Tous les modules avances fonctionnels, Excalidraw integre, ASR operationnel, tools IA avec fallback.', s_callout))

# PHASE 7
story.append(sp(8))
story.append(H2("Phase 7 : Qualite, Securite et Production (Semaines 20-21, 10 jours)"))
story.append(P("<b>Objectifs :</b> Atteindre 80% de couverture de tests, securiser l'application, preparer le deploiement production, documenter le projet de maniere exhaustive."))
story.append(sp(4))

story.append(H3("Epic 1 : Qualite et Tests (5 jours)"))
p7e1_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p7e1_rows = [
    ['7.1.1', 'Tests unitaires manquants', 'Atteindre 80% couverture', '2j', 'Tests unitaires'],
    ['7.1.2', 'Tests E2E Playwright', '15 scenarios critiques', '1.5j', 'Tests E2E'],
    ['7.1.3', 'Tests d\'integration API', 'Toutes les routes API', '1j', 'Tests integration'],
    ['7.1.4', 'Performance audit', 'Lighthouse, bundle analysis', '0.5j', 'Rapport perf'],
]
story.append(make_table(p7e1_headers, p7e1_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(6))
story.append(H3("Epic 2 : Securite et Deploiement (5 jours)"))
p7e2_headers = ['#', 'Tache', 'Description', 'Effort', 'Livrable']
p7e2_rows = [
    ['7.2.1', 'Securiser les API', 'Rate limiting, input sanitization', '1j', 'API securisee'],
    ['7.2.2', 'Gestion cles API', 'Server-side key vault', '1j', 'Key management'],
    ['7.2.3', 'Configuration deploiement', 'Docker + Vercel config', '1.5j', 'Deploy config'],
    ['7.2.4', 'Documentation technique', 'README, CONTRIBUTING, API docs', '1j', 'Documentation'],
    ['7.2.5', 'Checklist de release', 'Verification finale', '0.5j', 'Release ready'],
]
story.append(make_table(p7e2_headers, p7e2_rows, [0.07, 0.24, 0.30, 0.08, 0.31]))

story.append(sp(4))
story.append(P('<b>Criteres d\'acceptation :</b> Couverture >= 80%, 15 scenarios E2E passants, zero vulnerabilite critique, documentation complete.', s_callout))

# ──────────────────────────────────────────
# SECTION IV: SPECIFICATIONS TECHNIQUES
# ──────────────────────────────────────────
story.append(CondPageBreak(100))
story.append(H1("Specifications Techniques"))
story.append(sp(4))
story.append(P("Cette section definit les standards techniques que l'application ThesisFrame doit respecter en termes de design system, performance, contrats API et conventions de developpement. Ces specifications constituent le cadre de reference pour l'ensemble des phases de developpement."))

story.append(H2("Design System"))
story.append(P("Le design system repose sur trois piliers fondamentaux : la palette de couleurs avec variables CSS proposant 10 nuances derivees d'une teinte principale, la typographie Geist (sans-serif) avec 6 niveaux de titrage (H1 a H6) et un systeme d'espacement base sur une grille de 4px (4, 8, 12, 16, 24, 32, 48 pixels). L'ecosysteme de composants comprend plus de 60 composants dont 50 issus de shadcn/ui et 10 composants custom developpes specifiquement pour les besoins academiques de ThesisFrame."))

specs_headers = ['Composant', 'Standard', 'Details']
specs_rows = [
    ['Palette couleurs', '10 nuances CSS variables', 'Derivees d\'une teinte principale'],
    ['Typographie', 'Geist Sans (6 niveaux)', 'H1: 36pt, H2: 24pt, H3: 18pt, Body: 14pt'],
    ['Espacement', 'Grille 4px', '4, 8, 12, 16, 24, 32, 48px'],
    ['Composants UI', '60+ composants', '50 shadcn/ui + 10 custom'],
    ['Icones', 'Lucide React', 'Suite de 1000+ icones SVG'],
    ['Animations', 'Framer Motion', 'Transitions subtiles, respects prefers-reduced-motion'],
]
story.append(make_table(specs_headers, specs_rows, [0.18, 0.25, 0.57]))

story.append(sp(8))
story.append(H2("Cibles de Performance"))
story.append(P("Les objectifs de performance suivent les recommandations Core Web Vitals avec des seuils stricts pour garantir une experience utilisateur fluide. Les cibles incluent un Largest Contentful Paint inferieur a 2.5 secondes, un First Input Delay inferieur a 100 millisecondes, et un Cumulative Layout Shift inferieur a 0.1. Le bundle JavaScript initial doit rester sous 250 Ko avec des chunks de route inferieurs a 500 Ko. Le temps de reponse API (p95) ne doit pas depasser 500 millisecondes."))

perf_headers = ['Metrique', 'Cible', 'Mesure']
perf_rows = [
    ['LCP (Largest Contentful Paint)', '< 2.5s', 'Core Web Vitals'],
    ['FID (First Input Delay)', '< 100ms', 'Core Web Vitals'],
    ['CLS (Cumulative Layout Shift)', '< 0.1', 'Core Web Vitals'],
    ['Bundle initial', '< 250KB', 'Code splitting + tree shaking'],
    ['Chunk par route', '< 500KB', 'Lazy loading dynamique'],
    ['API response (p95)', '< 500ms', 'Monitoring edge/server'],
]
story.append(make_table(perf_headers, perf_rows, [0.32, 0.20, 0.48]))

story.append(sp(8))
story.append(H2("Contrats API"))
story.append(P("Toutes les API routes adherent a un format de reponse uniforme structure en trois champs : <b>data</b> (la donnee retournee), <b>error</b> (les informations d'erreur si applicable) et <b>meta</b> (les metadonnees de pagination et de requete). Les codes HTTP utilises sont strictement 200 (succes), 201 (cree), 400 (erreur client), 401 (non autorise), 404 (non trouve) et 500 (erreur serveur). La validation utilise des schemas Zod definis pour chaque route, et la pagination suit un modele cursor-based pour optimiser les performances sur les grands jeux de donnees bibliographiques."))

# ──────────────────────────────────────────
# SECTION V: GOUVERNANCE & INDICATEURS
# ──────────────────────────────────────────
story.append(CondPageBreak(100))
story.append(H1("Gouvernance et Indicateurs"))
story.append(sp(4))
story.append(P("Cette section etablit le cadre de gouvernance du projet avec les KPIs de suivi par phase, le format des revues de sprint et le calendrier synthetique. Ces indicateurs permettent de mesurer objectivement la progression et la qualite du projet tout au long des 21 semaines de developpement."))

story.append(H2("KPIs par phase"))
story.append(P("Chaque phase dispose d'indicateurs cles de performance mesurables qui permettent de valider l'atteinte des objectifs qualitatifs et quantitatifs. La couverture de tests, le nombre de bugs critiques, le score de performance Lighthouse et le debit de developpement en points par story constituent les quatre axes de mesure principaux."))

kpi_headers = ['KPI', 'P0 Cible', 'P2 Cible', 'P4 Cible', 'P7 Cible']
kpi_rows = [
    ['Couverture de tests', '>= 30%', '>= 50%', '>= 65%', '>= 80%'],
    ['Bugs critiques', '0', '0', '<= 2', '0'],
    ['Score Lighthouse', '>= 85', '>= 90', '>= 90', '>= 95'],
    ['Debit (points/story)', '8', '10', '12', '10'],
]
story.append(make_table(kpi_headers, kpi_rows, [0.25, 0.19, 0.19, 0.19, 0.18]))

story.append(sp(8))
story.append(H2("Format de Sprint Review"))
story.append(P("Les revues de sprint suivent un format structure en quatre etapes. La <b>demonstration fonctionnelle</b> presente les fonctionnalites terminees en conditions reelles. La <b>revue de code</b> examine la qualite du code produit et le respect des conventions. Les <b>metriques qualite</b> sont presentees et comparees aux cibles definies. L'<b>ajustement de la roadmap</b> permet de reorienter les priorites si necessaire en fonction des resultats observes."))

story.append(H2("Calendrier synthetique"))
story.append(sp(4))

cal_headers = ['Phase', 'Periode', 'Duree', 'Effort (j/h)', 'Focus Principal']
cal_rows = [
    ['P0', 'S1-S2', '10 jours', '10', 'Fondations, CI/CD, design system'],
    ['P1', 'S3-S5', '15 jours', '15', 'Layout, navigation, composants'],
    ['P2', 'S6-S7', '10 jours', '10', 'Schema Prisma, API routes CRUD'],
    ['P3', 'S8-S10', '15 jours', '15', 'Editeur Tiptap, workspace'],
    ['P4', 'S11-S13', '15 jours', '15', 'Moteur IA, 10 modes, chat'],
    ['P5', 'S14-S16', '15 jours', '15', 'Methodologie, bibliographie, LaTeX'],
    ['P6', 'S17-S19', '15 jours', '15', 'Outils IA, Excalidraw, integrations'],
    ['P7', 'S20-S21', '10 jours', '10', 'Qualite, securite, production'],
]
story.append(make_table(cal_headers, cal_rows, [0.08, 0.10, 0.12, 0.15, 0.55]))

# ──────────────────────────────────────────
# SECTION VI: BUDGET & RESSOURCES
# ──────────────────────────────────────────
story.append(CondPageBreak(100))
story.append(H1("Budget et Ressources"))
story.append(sp(4))
story.append(P("Cette section presente le budget global du projet en termes d'effort, de duree et de profils requis. L'estimation prend en compte la complexite de la reconstruction modulaire, la richesse fonctionnelle de l'application cible et les contraintes de qualite inherentes a un projet de cette envergure."))

story.append(H2("Effort total"))
story.append(P("L'effort total estime pour la reconstruction complete de ThesisFrame s'eleve a <b>environ 315 jours-homme</b>. Cette estimation repartit sur <b>21 semaines</b> (soit 5 mois) de travail effectif, en tenant compte d'un rythme soutenu mais realiste pour une equipe de developpement agile. La marge d'incertitude est estimee a +/- 15%, ce qui represente un ecart de 47 jours-homme, pris en compte dans le planning par des buffers integres a chaque phase."))

budget_headers = ['Ressource', 'Implication', 'Role Principal', 'Phases Actives']
budget_rows = [
    ['Lead Developer', '100%', 'Architecture, dev frontend/backend, revue de code', 'P0 a P7'],
    ['Designer UX/UI', '50%', 'Design system, mockups, tests utilisateurs', 'P0, P1, P3, P5'],
    ['Testeur QA', '25%', 'Tests E2E, tests d\'integration, reporting', 'P0, P7'],
    ['Expert IA/NLP', '25%', 'System prompts, evaluation modes IA', 'P4, P5'],
]
story.append(make_table(budget_headers, budget_rows, [0.20, 0.13, 0.40, 0.27]))

story.append(sp(8))
story.append(H2("Duree et jalons"))
story.append(P("La duree totale du projet est de 21 semaines (5 mois) avec 8 jalons de livraison correspondant aux phases P0 a P7. Chaque jalon est associe a des criteres d'acceptation stricts qui doivent etre validates avant de demarrer la phase suivante. Les trois premiers jalons (P0-P2) constituent le socle technique sur lequel repose l'ensemble du projet. Les phases P3 et P4 representent le coeur fonctionnel avec l'editeur et le moteur IA. Les phases P5 a P7 completent l'offre fonctionnelle et assurent la qualite production."))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BUILD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
from reportlab.platypus import PageTemplate, Frame

frame = Frame(MARGIN, MARGIN, AVAIL_W, PAGE_H - 2*MARGIN, id='normal')

body_template = PageTemplate(id='body', frames=frame, onPage=footer_body)
toc_template = PageTemplate(id='toc', frames=frame, onPage=footer_toc)

doc.addPageTemplates([toc_template, body_template])

# Insert template switch after TOC
from reportlab.platypus import NextPageTemplate
story.insert(story.index(story[story.index([s for s in story if isinstance(s, PageBreak)][0])]), NextPageTemplate('body'))

doc.multiBuild(story)
print(f"Body PDF generated: {OUTPUT}")
