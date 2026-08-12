/**
 * Template LaTeX pour thèse de doctorat
 * Format francophone IMRaD
 */

export interface ThesisData {
  title: string
  author: string
  supervisor: string
  coSupervisor?: string
  speciality: string
  laboratory: string
  university: string
  faculty: string
  department: string
  date: string
  abstractFr: string
  abstractEn: string
  keywordsFr: string
  keywordsEn: string
  dedication?: string
  acknowledgements?: string
  chapters: {
    title: string
    content: string // LaTeX content
  }[]
  references: string // raw bibtex or bibitem entries
}

export const DEFAULT_THESIS_DATA: ThesisData = {
  title: 'Titre de la thèse',
  author: 'Prénom NOM',
  supervisor: 'Pr. Prénom NOM',
  coSupervisor: '',
  speciality: '',
  laboratory: '',
  university: '',
  faculty: '',
  department: '',
  date: '2025',
  abstractFr: 'Résumé de la thèse en français…',
  abstractEn: 'Abstract of the thesis in English…',
  keywordsFr: '',
  keywordsEn: '',
  dedication: '',
  acknowledgements: '',
  chapters: [
    { title: 'Introduction générale', content: `\\TODO{Rédiger l'introduction générale}` },
    { title: 'Revue de la littérature', content: `\\TODO{Rédiger la revue de la littérature}` },
    { title: 'Cadre méthodologique', content: `\\TODO{Rédiger le cadre méthodologique}` },
    { title: 'Résultats et analyse', content: `\\TODO{Rédiger les résultats et analyse}` },
    { title: 'Discussion', content: `\\TODO{Rédiger la discussion}` },
    { title: 'Conclusion générale', content: `\\TODO{Rédiger la conclusion générale}` },
  ],
  references: '',
}

export function generateLatex(data: ThesisData): string {
  const preamble = `\\documentclass[12pt,a4paper,oneside]{report}

% ─── Encodage et langue ────────────────────────────────────────
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}

% ─── Polices ────────────────────────────────────────────────────
\\usepackage{lmodern}
\\usepackage{microtype}

% ─── Mise en page ───────────────────────────────────────────────
\\usepackage[a4paper,left=3cm,right=2.5cm,top=3cm,bottom=3cm]{geometry}
\\usepackage{setspace}
\\onehalfspacing

% ─── Structure ───────────────────────────────────────────────────
\\usepackage{titlesec}
\\titleformat{\\chapter}[display]
  {\\normalfont\\huge\\bfseries}{\\chaptertitlename~\\thechapter}{20pt}{\\Huge}
\\titlespacing*{\\chapter}{0pt}{-30pt}{30pt}

% ─── Navigation ─────────────────────────────────────────────────
\\usepackage{hyperref}
\\hypersetup{
  colorlinks=true,
  linkcolor=black,
  citecolor=black,
  urlcolor=blue,
  pdfauthor={${data.author}},
  pdftitle={${data.title}},
}

% ─── Figures et tableaux ────────────────────────────────────────
\\usepackage{graphicx}
\\usepackage{caption}
\\usepackage{subcaption}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{multirow}
\\usepackage{longtable}

% ─── Mathématiques ───────────────────────────────────────────────
\\usepackage{amsmath,amssymb,amsfonts}

% ─── Bibliographie ──────────────────────────────────────────────
\\usepackage[backend=biber,style=numeric-comp,sorting=nyt,maxnames=3]{biblatex}
\\addbibresource{references.bib}

% ─── Divers ──────────────────────────────────────────────────────
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{tocbibind}  % inclure TOC, LOF, LOT dans la table des matières

% ─── En-têtes / pieds de page ────────────────────────────────────
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[LE,RO]{\\thepage}
\\fancyhead[RE]{\\leftmark}
\\fancyhead[LO]{\\rightmark}
\\renewcommand{\\headrulewidth}{0.4pt}

% ─── Commande TODO ───────────────────────────────────────────────
\\newcommand{\\TODO}[1]{\\textcolor{red}{\\textbf{[TODO : #1]}}}

% ─── Métadonnées PDF ─────────────────────────────────────────────
\\usepackage{pdfmetadata}

% ─── Dédicace (si présente) ─────────────────────────────────────
${data.dedication ? '\\newcommand{\\dedicationtext}{' + data.dedication.replace(/'/g, "''") + '}' : '% Aucune dédicace'}
`

  const chaptersTex = data.chapters
    .map((ch, i) => {
      const num = i + 1
      return `\\chapter{${ch.title}}

${ch.content}
`
    })
    .join('\n')

  const abstractFrBlock = `\\begin{abstract}
${data.abstractFr}

\\vspace{1em}
\\noindent\\textbf{Mots-clés :} ${data.keywordsFr}
\\end{abstract}`

  const abstractEnBlock = `\\renewcommand{\\abstractname}{Abstract}
\\begin{abstract}
${data.abstractEn}

\\vspace{1em}
\\noindent\\textbf{Keywords:} ${data.keywordsEn}
\\end{abstract}`

  const ackBlock = data.acknowledgements
    ? `\\chapter*{Remerciements}
\\addcontentsline{toc}{chapter}{Remerciements}
${data.acknowledgements}
`
    : `% Remerciements à rédiger
\\chapter*{Remerciements}
\\addcontentsline{toc}{chapter}{Remerciements}
\\TODO{Rédiger les remerciements}`

  const dedBlock = data.dedication
    ? `\\chapter*{Dédicace}
\\addcontentsline{toc}{chapter}{Dédicace}
\\begin{center}
\\itshape\\dedicationtext
\\end{center}
`
    : ''

  const refBlock = data.references.trim()
    ? `% ─── Références bibliographiques (fichier references.bib) ───
% Collez vos entrées BibTeX dans le fichier references.bib
% puis compilez avec : xelatex → biber → xelatex → xelatex

% --- Exemples d'entrées BibTeX ---
% @article{ecarnot2015,
%   author  = {Ecarnot, F. and Seronde, M.-F. and Chopard, R. and Schiele, F. and Meneveau, N.},
%   title   = {Writing a scientific article: A step-by-step guide for beginners},
%   journal = {European Geriatric Medicine},
%   year    = {2015},
%   volume  = {6},
%   pages   = {573--579},
%   doi     = {10.1016/j.eurger.2015.08.005},
% }
`
    : ''

  return `${preamble}

\\begin{document}

% ═══════════════════════════════════════════════════════════════
%  PAGE DE GARDE
% ═══════════════════════════════════════════════════════════════
\\begin{titlepage}
\\centering

\\vspace*{2cm}

{\\scshape\\LARGE ${data.university} \\\\[0.5cm]
\\large ${data.faculty} \\\\[0.3cm]
${data.department}\\par}

\\vspace{1.5cm}

{\\scshape\\Large Thèse de Doctorat\\par}

\\vspace{0.5cm}

{\\scshape\\large Spécialité : ${data.speciality}\\par}

\\vspace{1.5cm}

\\rule{\\textwidth}{1.5pt}\\[0.5cm]

{\\LARGE\\bfseries ${data.title}\\par}

\\rule{\\textwidth}{1.5pt}\\[1.5cm]

\\begin{flushleft}
  \\large Présentée et soutenue par :\\[0.3cm]
  \\textbf{\\Large ${data.author}}\\[1cm]
  \\large Sous la direction de :\\[0.3cm]
  \\textbf{${data.supervisor}}${data.coSupervisor ? '\\\\[0.2cm]  \\textbf{' + data.coSupervisor + ' (co-directeur)}' : ''}\\[1cm]
${data.laboratory ? '  \\large ' + data.laboratory + '\\[0.5cm]' : ''}
\\end{flushleft}

\\vfill

{\\large ${data.date}\\par}

\\end{titlepage}

${dedBlock}

${ackBlock}

% ═══════════════════════════════════════════════════════════════
%  TABLE DES MATIÈRES
% ═══════════════════════════════════════════════════════════════
\\tableofcontents

% ═══════════════════════════════════════════════════════════════
%  LISTE DES FIGURES ET TABLEAUX
% ═══════════════════════════════════════════════════════════════
\\listoffigures
\\addcontentsline{toc}{chapter}{Liste des figures}
\\listoftables
\\addcontentsline{toc}{chapter}{Liste des tableaux}

% ═══════════════════════════════════════════════════════════════
%  RÉSUMÉS
% ═══════════════════════════════════════════════════════════════
${abstractFrBlock}
${abstractEnBlock}

% ═══════════════════════════════════════════════════════════════
%  CORPS DE LA THÈSE
% ═══════════════════════════════════════════════════════════════
${chaptersTex}

% ═══════════════════════════════════════════════════════════════
%  CONCLUSION GÉNÉRALE
% ═══════════════════════════════════════════════════════════════

% ═══════════════════════════════════════════════════════════════
%  RÉFÉRENCES BIBLIOGRAPHIQUES
% ═══════════════════════════════════════════════════════════════
\\printbibliography[heading=bibintoc,title={Références bibliographiques}]

% ═══════════════════════════════════════════════════════════════
%  ANNEXES
% ═══════════════════════════════════════════════════════════════
\\appendix
\\chapter*{Annexes}
\\addcontentsline{toc}{chapter}{Annexes}
\\TODO{Ajouter les annexes ici}

\\end{document}
`
}
