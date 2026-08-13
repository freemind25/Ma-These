# AUDIT RÉTROACTIF V3 — Inventaire Exhaustif Définitif

> **Date :** 19 janvier 2025
> **Objet :** Inventaire exhaustif de TOUTES les ressources transmises par l'utilisateur (source : Google Drive + filesystem local).
> **Conformité :** Directive « De la bibliothèque passive à l'expertise active de l'IA ».
> **Aucune ressource exclue** — tout fichier est inventorié et classifié, y compris les directives techniques, les images, et les archives non explorées.

---

## ARCHITECTURE GOOGLE DRIVE — Source de vérité

```
Ressources/ (Google Drive — dossier racine)
├── Articles/
│   ├── Nouveau dossier/
│   │   ├── art-1.jpg → art-6.jpg (6 images)
│   │   ├── find-1.jpg → find-7.jpg + find6.jpg (8 images)
│   │   ├── RS-1.jpg → RS-6.jpg (6 images)
│   │   ├── 5-8.jpg, 5-9.jpg, 5-10.jpg, 5-11.jpg (4 images)
│   │   ├── six-1.jpg, six-2.jpg (2 images)
│   │   └── w-1.webp (1 image)
│   └── Nouveau dossier.rar (8.1 MB — contenu inconnu)
│
├── images/
│   ├── ress-1/
│   │   ├── 1-1.jpg → 1-11.jpg (11 images)
│   │   ├── 2-1.jpg, 2-2.jpg (2 images)
│   │   ├── 3.jpg (1 image)
│   │   ├── 5-1.jpg, 5-2.jpg, 5-3.jpg, 5-6.jpg (4 images)
│   │   ├── 2607.01233v1.pdf (article scientifique)
│   │   ├── ai-1.jpg, ai-2.jpg, ai-3.jpg (3 images)
│   │   ├── APA Results Composer.md (document)
│   │   ├── MP4 vidéo (271 KB)
│   │   └── data-1.jpg, data-2.jpg, data-3.jpg (3 images)
│   ├── ress-2/
│   │   ├── semantic_review.pdf (1.8 MB)
│   │   ├── semantic.jpg (849 KB)
│   │   ├── six-3.jpg, six-4.jpg, six-6.jpg (3 images)
│   │   ├── tip-1.jpg, tip-2.jpg, tip-4.jpg (3 images)
│   │   ├── Type-1.jpg → Type-8.jpg (8 images)
│   │   ├── type.jpg, Type.pdf (2 fichiers)
│   │   ├── variables.jpg (1 image)
│   │   └── w-9.webp → w-13.webp (5 images)
│   ├── 2026-08-05-18h47m42s-attachments.zip (17.8 MB)
│   ├── 2026-08-05-18h47m53s-attachments.zip (11.2 MB)
│   ├── 2026-08-06-15h19m17s-attachments.zip (2.5 MB)
│   ├── files.zip (→ files-extract/ : SKILL.md, grilles, intégrations)
│   ├── files(1).zip (16 KB — contenu inconnu)
│   ├── RB.rar (→ RB-extract/ : RB-1.jpg → RB-15.jpg)
│   ├── ress-1.rar (47.8 MB — contenu inconnu, pas sur filesystem)
│   ├── ress-2.rar (8.7 MB — contenu inconnu, pas sur filesystem)
│   ├── thesis-assistant-knowledge.ts (165 KB)
│   └── wetransfer_order_without_design_bertaud.zip (113.4 MB)
│
├── Livres/
│   ├── (24 fichiers standalone — voir détail ci-dessous)
│   ├── books/
│   │   ├── Comment réussir sa thèse (Romelaer & Kalika).pdf
│   │   ├── book-1.rar, book-2.rar, book-3.rar
│   ├── livres_découpés/
│   │   ├── Comment réussir sa thèse (.pdf, .1, .2, .3, .4)
│   │   ├── GUIDE_~1 (2 fichiers)
│   │   └── QUALIT~1 (2 fichiers)
│   └── ressources/
│       ├── .1.rar → .6.rar (= upload/.1.rar → .6.rar)
│       ├── Designing_Cities (Schenk).pdf
│       ├── GUIDE_TO_ACADEMIC_AND_SCIENTIFIC_PUBLICATION (Olson).pdf
│       ├── L_aventure_de_la_Recherche_Qualitative.pdf
│       ├── Longman_Academic_Writing_Series_5 (Meyers).pdf
│       ├── Qualitative_Research_in_Education_and_Social_Sciences_2nd (Hays & Singh).pdf
│       ├── ressources.rar (contenu inconnu)
│       └── implementés/ (sous-dossier)
│
├── Prompting/
│   ├── Des prompts de qualité.pdf
│   └── The Research Prompt Handbook.docx
│
└── sites/
    ├── depots-github-1.txt
    └── depots-github-2.txt
```

---

## RÉCAPITULATIF GÉNÉRAL V3

| Source | Dossier Google Drive | Total fichiers/items | Sur filesystem | Statut |
|--------|---------------------|--------------------|----------------|---------|
| **Articles/** | Nouveau dossier/ + .rar | 28 (27 images + 1 RAR) | ❌ Aucun | Jamais transférés |
| **images/ress-1/** | — | 25 (JPG + PDF + MD + MP4) | ❌ Aucun | Jamais transférés |
| **images/ress-2/** | — | 24 (JPG + PDF + WEBP) | ❌ Aucun | Jamais transférés |
| **images/ root** | ZIPs + RARs + TS | 11 | ✅ 3 (files.zip, RB.rar) | 8 non transférés |
| **Livres/ root** | Standalone + ZIPs | 24 | ❌ Aucun | Jamais transférés |
| **Livres/books/** | Romelaer + 3 RARs | 4 | ❌ Aucun | Jamais transférés |
| **Livres/livres_découpés/** | Split parts | 9 | ❌ Aucun | Jamais transférés |
| **Livres/ressources/** | 6 RARs + PDFs + RAR | ~12 | ✅ 6 RARs (.1-.6) | 6+ non transférés |
| **Prompting/** | — | 2 | ❌ Aucun | Jamais transférés |
| **sites/** | — | 2 | ❌ Aucun | Jamais transférés |
| **upload/ (filesystem)** | — | 39 | ✅ Tous | Déjà comptabilisés |
| **public/resources/books/** | — | 10 (5 PDFs + 5 covers) | ✅ Tous | Copies publiques |
| **TOTAL** | | **~176 items** | **~52 sur filesystem** | **~124 non transférés** |

> **Note critique :** Environ 124 ressources référencées dans Google Drive n'ont **jamais été transférées** sur le filesystem du projet. Seuls les RAR .1-.6, Books-6/7, RB, et files.zip ont été transférés.

---

## CATÉGORIE A — OUVRAGES ACADEMIQUES (Livres, PDFs, EPUBs)

### A.1 — Supervision & Direction de thèse (12 livres)

| # | Titre | Auteur(s) | Source | Format | Taille | Sur filesystem |
|---|-------|-----------|--------|--------|--------|---------------|
| A1-01 | The Good Supervisor (2nd ed.) | Gina Wisker | Books-6 / .1 | PDF | 53 MB | ✅ |
| A1-02 | A Handbook for Doctoral Supervisors (3rd ed.) | Stan Taylor, Margaret Kiley | Book-7 / .1 | PDF | 4.8 MB | ✅ |
| A1-03 | Encadrer aux cycles supérieurs | Christian Bégin | .2 | PDF | 2.25 MB | 🔒 RAR |
| A1-04 | How to Write a Thesis | Rowena Murray | .2 | PDF | 1.15 MB | 🔒 RAR |
| A1-05 | Structuring Your Research Thesis | Carter, Kelly et al. | .2 | PDF | 1.07 MB | 🔒 RAR |
| A1-06 | Thesis and Dissertation Writing in a Second Language | Paltridge, Starfield | .2 | PDF | 1.07 MB | 🔒 RAR |
| A1-07 | Writing Your Doctoral Dissertation: Invisible Rules | Rita S. Brause | .2 | PDF | 1.24 MB | 🔒 RAR |
| A1-08 | Supervising Doctorates Downunder | Denholm, Evans | Book-7 | PDF | 5.84 MB | 🔒 RAR |
| A1-09 | How to Survive Your PhD | Jason Karp | Book-7 | PDF | 2.35 MB | 🔒 RAR |
| A1-10 | How to Get a PhD (4th ed.) | Phillips, Pugh | Book-7 | PDF | 0.8 MB | ✅ |
| A1-11 | How to Examine a Thesis | Lynne Pearce | .3 | PDF | 0.53 MB | 🔒 RAR |
| A1-12 | Comment réussir sa thèse | Romelaer, Kalika | Livres/books/ | PDF | — | ❌ Google Drive |

**Statut :** 🔴 12/12 stockés, aucun corpus extrait, aucun prompt enrichi.

### A.2 — Rédaction scientifique & Thèse (28 livres)

| # | Titre | Auteur(s) | Source | Format | Sur filesystem |
|---|-------|-----------|--------|--------|---------------|
| A2-01 | Como escribir artículo científico (How to Write and Publish a Scientific Paper) | Gastel, Day | .1 | **MD intégral** (15 208 lignes) | ✅ |
| A2-02 | A Manual for Writers (Turabian) | Kate L. Turabian | Book-7 / .3 | PDF | ✅ |
| A2-03 | Comment écrire sa thèse | Umberto Eco | .2 | PDF | 🔒 RAR |
| A2-04 | How to Write a Scientific Paper | Jari Saramäki | .2 | PDF | 🔒 RAR |
| A2-05 | L'art de la thèse | Beaud, Gravier et al. | .2 | PDF | 🔒 RAR |
| A2-06 | writing a scientific thesis.pdf | — | .2 | PDF | 🔒 RAR |
| A2-07 | Effective Academic Writing vol.3 | Liss, Savage, Davis | .3 | PDF | 🔒 RAR |
| A2-08 | The Handbook of Academic Writing | Murray, Moore | .3 | PDF | 🔒 RAR |
| A2-09 | The PhD Writing Handbook | Desmond Thomas | .2 | PDF | 🔒 RAR |
| A2-10 | Effective strategies for academic writing | — | .5 | PDF | 🔒 RAR |
| A2-11 | Writing Research Papers: A Complete Guide | James D. Lester | .5 | PDF | 🔒 RAR |
| A2-12 | Writing the Research Paper: A Handbook | Winkler, McCuen-Metherell | .6 | PDF | 🔒 RAR |
| A2-13 | La Rédaction des Publications Scientifiques | Gilles Lussier | .2 | PDF | 🔒 RAR |
| A2-14 | How to Research & Write a Successful PhD | McMillan, Weyers | .2 | PDF | 🔒 RAR |
| A2-15 | Finish Your Thesis or Dissertation | Kevin Morrell | .3 | PDF | 🔒 RAR |
| A2-16 | Enjoy Writing Your Science Thesis | Holtom, Fisher | .6 | PDF | 🔒 RAR |
| A2-17 | Writing a Science PhD | Boyle et al. | .1 | EPUB | 🔒 RAR |
| A2-18 | Writing Well and Being Well for Your PhD | Katherine Firth | .4 | PDF | 🔒 RAR |
| A2-19 | Writing Your Thesis With ChatGPT | Paul Johannesson | .2 / Book-7 | PDF | 🔒 RAR |
| A2-20 | PhD: An Uncommon Guide | James Hayton | .1 | EPUB | 🔒 RAR |
| A2-21 | How to Write an Exceptional Thesis | Jessica Graustein | .1 | EPUB | 🔒 RAR |
| A2-22 | PhDone | Roda, Saunders, Anderson | .4 | PDF | 🔒 RAR |
| A2-23 | How to Prepare a Scientific Doctoral Dissertation | Björn Gustavii | Book-7 | PDF | 🔒 RAR |
| A2-24 | How to Use Storytelling in Academic Writing | Timothy G. Pollock | Book-7 | PDF | 🔒 RAR |
| A2-25 | Writing for Academic Journals | Rowena Murray | Book-7 | PDF | 🔒 RAR |
| A2-26 | Writing the winning thesis or dissertation | Joyner, Rouse et al. | Book-7 | EPUB | 🔒 RAR |
| A2-27 | Assieds-toi et écris ta thèse | Geneviève Belleville | Livres/ root | PDF | ❌ Google Drive |
| A2-28 | Academic Writing: A Handbook for International Students | Stephen Bailey | Livres/ root | PDF | ❌ Google Drive |

**Statut :** 🟡 1/28 partiellement exploité (Gastel & Day MD dormante). 27 stockés sans exploitation.

### A.3 — Revue de littérature (5 livres)

| # | Titre | Auteur(s) | Source | Format | Sur filesystem |
|---|-------|-----------|--------|--------|---------------|
| A3-01 | Doing a Systematic Review (2nd ed.) | Boland, Cherry, Dickson | .1 (EPUB) / .6 (PDF) | EPUB+PDF | 🔒 RAR |
| A3-02 | Writing Your Dissertation Literature Review | Grant Andrews | .1 | EPUB | 🔒 RAR |
| A3-03 | Writing Literature Reviews | Galvan, Galvan | .6 / Book-7 | PDF | 🔒 RAR |
| A3-04 | How to Write a Literature Review: A Workbook | Jim Ollhoff | .3 | PDF | 🔒 RAR |
| A3-05 | Systematic reviews | Carole Torgerson | Book-7 | PDF | 🔒 RAR |

**Statut :** 🔴 5/5 stockés, aucun exploité.

### A.4 — Méthodologie (17 livres)

| # | Titre | Auteur(s) | Source | Format | Sur filesystem |
|---|-------|-----------|--------|--------|---------------|
| A4-01 | Constructing Research Questions | Alvesson, Sandberg | Book-7 | PDF | ✅ |
| A4-02 | Research Methodology (Kothari) | C.R. Kothari | .2 | PDF | 🔒 RAR |
| A4-03 | Une méthodologie de la recherche scientifique | Shevenell | .3 | PDF | 🔒 RAR |
| A4-04 | Méthodologie de recherche (JML) | — | .3 | PDF | 🔒 RAR |
| A4-05 | Méthodologie et guide pratique (N'Da) | Pierre N'Da | .1 | DOC | 🔒 RAR |
| A4-06 | The Method of Multiple Hypotheses | Reichardt | .3 | PDF | 🔒 RAR |
| A4-07 | Methodological Innovations | Zimmerman | .4 | PDF | 🔒 RAR |
| A4-08 | 100 Questions About Research Methods | Salkind | .5 | PDF | 🔒 RAR |
| A4-09 | Guide de rédaction scientifique (l'hypothèse) | Lindsay, Poindron | .5 | PDF | 🔒 RAR |
| A4-10 | The Craft of Research | Booth, Colomb et al. | Book-7 | EPUB | 🔒 RAR |
| A4-11 | Practical Research Methods | C. Dawson | Book-7 | PDF | 🔒 RAR |
| A4-12 | Research Methods | Peter Marshall | Book-7 | PDF | 🔒 RAR |
| A4-13 | Measuring Academic Research | Ana Andres | .3 | PDF | 🔒 RAR |
| A4-14 | Qualitative Research in Education & Social Sciences (2nd) | Hays, Singh | Livres/ressources/ | PDF | ❌ Google Drive |
| A4-15 | L'aventure de la Recherche Qualitative | — | Livres/ressources/ | PDF | ❌ Google Drive |
| A4-16 | Longman Academic Writing Series 5 | Alan Meyers | Livres/ressources/ | PDF | ❌ Google Drive |
| A4-17 | Supporting research in area studies | Pitman | .3 | PDF | 🔒 RAR |

**Statut :** 🟡 1/17 partiellement (Alvesson description figée). 16 stockés.

### A.5 — IA et Recherche (5 livres)

| # | Titre | Auteur(s) | Source | Format | Sur filesystem |
|---|-------|-----------|--------|--------|---------------|
| A5-01 | Institutional Guide to Using AI for Research | Zhou, Al-Samarraie | .2 | PDF | 🔒 RAR |
| A5-02 | The AI-Powered Academic (100+ AI Tools) | Dr. Mehdi Bagheri | .1 | EPUB | 🔒 RAR |
| A5-03 | Writing Your Thesis With ChatGPT | Johannesson | .2 | PDF | 🔒 RAR |
| A5-04 | Extraire une thèse d'un cerveau étudiant | Belleville, Jackson | .1 | EPUB | 🔒 RAR |
| A5-05 | Artificial Intelligence in Academic Writing | — | Livres/ root | PDF | ❌ Google Drive |

**Statut :** 🔴 5/5 stockés, aucun exploité.

### A.6 — Publication & Peer Review (10 livres)

| # | Titre | Auteur(s) | Source | Format | Sur filesystem |
|---|-------|-----------|--------|--------|---------------|
| A6-01 | Writing Your Journal Article in Twelve Weeks | Wendy Laura Belcher | .3 | PDF | 🔒 RAR |
| A6-02 | Evaluating Research in Academic Journals | Pyrczak (+ Tcherni-Buzzeo) | .2 / .3 | PDF | 🔒 RAR |
| A6-03 | Writing for Publication | Epstein, Kenway, Boden | .3 | PDF | 🔒 RAR |
| A6-04 | Research and Writing Skills (RMIT) | RMIT Library | .1 (EPUB) / .2 (PDF) | EPUB+PDF | 🔒 RAR |
| A6-05 | Getting Started on Research | Boden, Kenway, Epstein | .2 | PDF | 🔒 RAR |
| A6-06 | GUIDE TO ACADEMIC AND SCIENTIFIC PUBLICATION | Linda Olson | Livres/ressources/ | PDF | ❌ Google Drive |
| A6-07 | Academic Library Impact | — | Livres/ root | PDF | ❌ Google Drive |
| A6-08 | The Art of Writing a PhD Proposal | Hans Sonneveld | .4 | PDF | 🔒 RAR |
| A6-09 | Your Thesis Writing Strengths and Challenges | Grant Andrews | .1 | EPUB | 🔒 RAR |
| A6-10 | Thesis Statement | Grant Andrews | Book-7 | EPUB | 🔒 RAR |

**Statut :** 🔴 10/10 stockés, aucun exploité.

### A.7 — Urbanisme & Aménagement (5 livres)

| # | Titre | Auteur(s) | Source | Format | Sur filesystem |
|---|-------|-----------|--------|--------|---------------|
| A7-01 | Order without Design | Alain Bertaud | .1 | EPUB | 🔒 RAR |
| A7-02 | L'urbanisme | Jean Tribillon | .3 | PDF | 🔒 RAR |
| A7-03 | Nouveaux Principes de l'urbanisme | — | .3 | PDF | 🔒 RAR |
| A7-04 | Renouveler l'aménagement | — | .4 | PDF | 🔒 RAR |
| A7-05 | Designing Cities | Leonhard Schenk | Livres/ressources/ | PDF | ❌ Google Drive |

**Statut :** 🔴 5/5 stockés.

### A.8 — Livres supplémentaires (livres non classés ci-dessus)

| # | Titre | Auteur(s) | Source | Format | Sur filesystem |
|---|-------|-----------|--------|--------|---------------|
| A8-01 | My Research Workflow With Jenni | Dr. Simona Ippoliti | Livres/ root | PDF | ❌ Google Drive |
| A8-02 | 3livre_enqute_gveracruz | — | Livres/ root | PDF | ❌ Google Drive |
| A8-03 | 10 Academic Phrases to Compare Journal Articles | — | Livres/ root | PDF | ❌ Google Drive |
| A8-04 | 10 Essential Prompts for Researchers | — | Livres/ root | PDF | ❌ Google Drive |
| A8-05 | 51 Prompts Génieux pour ChatGPT | Onur Karapinar | Livres/ root | PDF | ❌ Google Drive |
| A8-06 | Academic Research Understanding Fundamentals | Maluth | Livres/ root | EPUB | ❌ Google Drive |
| A8-07 | Academic Writing Research How to Write a Good Thesis | Neil Mars | Livres/ root | EPUB | ❌ Google Drive |
| A8-08 | Advances in Corpus-based Research on Academic Writing | Römer, Cortes, Friginal | Livres/ root | EPUB | ❌ Google Drive |
| A8-09 | An Analysis of Jane Jacobs' The Death and Life | Fuller, Moore | Livres/ root | PDF | ❌ Google Drive |
| A8-10 | Comment réussir sa thèse (découpé) | Romelaer, Kalika | Livres/livres_découpés/ | PDF (5 parts) | ❌ Google Drive |
| A8-11 | GUIDE_~1 (2 fichiers) | — | Livres/livres_découpés/ | PDF | ❌ Google Drive |
| A8-12 | QUALIT~1 (2 fichiers) | — | Livres/livres_découpés/ | PDF | ❌ Google Drive |

**Total livres ouvrages : ~84 ouvrages académiques uniques**

---

## CATÉGORIE B — IMAGES & INFOGRAPHIES (111 images)

### B.1 — Infographies académiques RB (15 images) — ✅ Sur filesystem

| # | Fichier | Contenu VLM | Valeur |
|---|---------|-------------|--------|
| B1-01 | RB-1.jpg | Cadre théorique vs cadre conceptuel | 🔴 Élevée |
| B1-02 | RB-2.jpg | Architecture chapitre 2 — Revue de littérature | 🔴 Élevée |
| B1-03 | RB-3.jpg | Taxonomie des 7 Research Gaps | 🔴 Élevée |
| B1-04 | RB-4.jpg | Tests statistiques (descriptifs, inférentiels) | 🟡 Moyenne |
| B1-05 | RB-5.jpg | Cadre théorique vs conceptuel (variante) | 🔴 Élevée |
| B1-06 | RB-6.jpg | Types of Research Gaps (variante RB-3) | 🔴 Élevée |
| B1-07 to B1-15 | RB-7 → RB-15 | Urban Planning (Garden City → Smart City) | 🟡 Spécialisé |

### B.2 — Images articles (27 images) — ❌ Jamais transférées

| # | Fichier(s) | Dossier | Contenu probable |
|---|-----------|---------|------------------|
| B2-01 to B2-06 | art-1 → art-6 | Articles/ | Captures d'écrans d'articles |
| B2-07 to B2-14 | find-1 → find-7 + find6 | Articles/ | Résultats de recherche |
| B2-15 to B2-20 | RS-1 → RS-6 | Articles/ | Systematic Review / Research Synthesis |
| B2-21 to B2-24 | 5-8 → 5-11 | Articles/ | Chapitre 5 (méthodologie?) |
| B2-25 to B2-26 | six-1, six-2 | Articles/ | Chapitre 6 (résultats?) |
| B2-27 | w-1.webp | Articles/ | Web page capture |

### B.3 — Images ress-1 (25 fichiers) — ❌ Jamais transférées

| # | Fichier(s) | Contenu probable |
|---|-----------|------------------|
| B3-01 to B3-11 | 1-1 → 1-11 | Chapitre 1 (captures de pages) |
| B3-12 to B3-13 | 2-1, 2-2 | Chapitre 2 |
| B3-14 | 3.jpg | Chapitre 3 |
| B3-15 to B3-18 | 5-1, 5-2, 5-3, 5-6 | Chapitre 5 |
| B3-19 | 2607.01233v1.pdf | Article arXiv (potentiellement analyse sémantique) |
| B3-20 to B3-22 | ai-1, ai-2, ai-3 | IA et recherche |
| B3-23 | APA Results Composer.md | Document technique APA |
| B3-24 | MP4 (271 KB) | Vidéo courte |
| B3-25 to B3-27 | data-1, data-2, data-3 | Visualisations de données |

### B.4 — Images ress-2 (24 fichiers) — ❌ Jamais transférées

| # | Fichier(s) | Contenu probable |
|---|-----------|------------------|
| B4-01 to B4-02 | semantic_review.pdf, semantic.jpg | Revue sémantique |
| B4-03 to B4-05 | six-3, six-4, six-6 | Chapitre 6 (résultats) |
| B4-06 to B4-08 | tip-1, tip-2, tip-4 | Conseils astuces |
| B4-09 to B4-16 | Type-1 → Type-8 | Types de recherche |
| B4-17 to B4-18 | type.jpg, Type.pdf | Taxonomie des types |
| B4-19 | variables.jpg | Variables de recherche |
| B4-20 to B4-24 | w-9 → w-13.webp | Captures web |

### B.5 — Autres images (filesystem)

| # | Fichier | Contenu |
|---|---------|---------|
| B5-01 | 28.png | Capture d'écran dépôt GitHub |
| B5-02 to B5-06 | cover-*.png (5) | Couvertures de livres (public/) |

**Total images : ~111 images + 3 PDFs image-like + 1 MD + 1 MP4**

---

## CATÉGORIE C — PROTOCOLES & DOCUMENTATION ANALYTIQUE (3 documents) — ✅ Sur filesystem

| # | Titre | Format | Lignes |
|---|-------|--------|--------|
| C-01 | SKILL.md — analyse-documentaire-scientifique (12 protocoles PRISMA/GRADE) | MD | 180 |
| C-02 | grilles-qualite-appraisal.md (CASP, MMAT, Cochrane, Newcastle-Ottawa) | MD | 47 |
| C-03 | integrations-gestionnaires-references.md | MD | 50 |

---

## CATÉGORIE D — GUIDES DE PROMPTING (2 documents) — ❌ Jamais transférés

| # | Titre | Format | Source |
|---|-------|--------|--------|
| D-01 | Des prompts de qualité | PDF | Prompting/ |
| D-02 | The Research Prompt Handbook | DOCX | Prompting/ |

**Potentiel :** 🔴 Très élevé — directement injectables dans les IA Assistants et ai-writing-modes.

---

## CATÉGORIE E — DIRECTIVES TECHNIQUES & OUTILS (tous inventoriés)

| # | Fichier | Nature | Source |
|---|---------|--------|--------|
| E-01 | prompt-developpeur-audit-application.md | Directive technique | .1.rar |
| E-02 | prompt_pdf.pdf | Directive technique | .2.rar |
| E-03 | PromptChatGPT.pdf | Directive technique | .3.rar |
| E-04 | historique-redaction-chapitre.patch | Diff Git | .1.rar |
| E-05 | thesis-assistant-knowledge.ts | Code TypeScript (knowledge base) | images/ |
| E-06 | FICHE_SYNTHESE.md | Journal de bord projet | upload/ |
| E-07 | audit-retroactif-documentation-livres.md | Directive audit courante | upload/ |
| E-08 | APA Results Composer.md | Document technique APA | images/ress-1/ |
| E-09 | depots-github-1.txt | Liste dépôts GitHub | sites/ |
| E-10 | depots-github-2.txt | Liste dépôts GitHub | sites/ |
| E-11 | simplypsychology.org print | Webpage print | .2.rar |
| E-12 | sciadv.aec0494.pdf | Article scientifique isolé | .3.rar |
| E-13 | preview-9781526416582.pdf | Extrait d'ouvrage incomplet | .3.rar |

---

## CATÉGORIE F — ARCHIVES NON EXPLOREES (contenu inconnu)

| # | Archive | Taille | Source | Statut |
|---|---------|--------|--------|--------|
| F-01 | Nouveau dossier.rar | 8.1 MB | Articles/ | ❌ Jamais transféré, contenu inconnu |
| F-02 | ress-1.rar | 47.8 MB | images/ | ❌ Jamais transféré, contenu inconnu |
| F-03 | ress-2.rar | 8.7 MB | images/ | ❌ Jamais transféré, contenu inconnu |
| F-04 | book-1.rar | — | Livres/books/ | ❌ Jamais transféré, contenu inconnu |
| F-05 | book-2.rar | — | Livres/books/ | ❌ Jamais transféré, contenu inconnu |
| F-06 | book-3.rar | — | Livres/books/ | ❌ Jamais transféré, contenu inconnu |
| F-07 | ressources.rar | — | Livres/ressources/ | ❌ Jamais transféré, contenu inconnu |
| F-08 | files(1).zip | 16 KB | images/ | ❌ Jamais transféré, contenu inconnu |
| F-09 | 2026-08-05-18h47m42s-attachments.zip | 17.8 MB | images/ | ❌ Jamais transféré |
| F-10 | 2026-08-05-18h47m53s-attachments.zip | 11.2 MB | images/ | ❌ Jamais transféré |
| F-11 | 2026-08-06-15h19m17s-attachments.zip | 2.5 MB | images/ | ❌ Jamais transféré |
| F-12 | wetransfer_order_without_design_bertaud.zip | 113.4 MB | images/ | ❌ Jamais transféré |
| F-13 | 2026-07-28-15h47m18s-attachments.zip | 7.8 MB | Livres/ | ❌ Jamais transféré |
| F-14 | 2026-07-29-06h28m11s-attachments.zip | 19.1 MB | Livres/ | ❌ Jamais transféré |
| F-15 | 2026-07-29-15h31m08s-attachments.zip | 16.6 MB | Livres/ | ❌ Jamais transféré |
| F-16 | 2026-07-29-19h16m34s-attachments.zip | 5.8 MB | Livres/ | ❌ Jamais transféré |
| F-17 | 2026-07-31-09h54m55s...eml | 3.7 MB | Livres/ | ❌ Jamais transféré |
| F-18 | 2026-07-31-12h14m35s-attachments.zip | 22.1 MB | Livres/ | ❌ Jamais transféré |
| F-19 | 2026-07-31-12h19m56s-attachments.zip | 10.9 MB | Livres/ | ❌ Jamais transféré |
| F-20 | 2026-08-02-09h37m51s-attachments.zip | 10.1 MB | Livres/ | ❌ Jamais transféré |
| F-21 | these-frame-1.1.0.zip | 95.5 MB | images/ | ❌ Jamais transféré |

> **⚠️ ARCHIVES CRITIQUES :** Les archives F-01 à F-07 (RAR inconnus) et F-08 à F-21 (ZIP/EML non explorés) contiennent potentiellement des dizaines de ressources supplémentaires. Leur contenu est totalement inconnu.

---

## SYNTHÈSE FINALE — ~176 ITEMS IDENTIFIÉS

| Catégorie | # items | Statut dominant | Sur filesystem |
|-----------|---------|----------------|---------------|
| **A. Ouvrages académiques** | **~84** | 🔴 Stockés | ~68 (RAR) + 10 (public) |
| **B. Images & infographies** | **~111** | 🔴 Non transférées | 15 (RB) + 6 (covers) + 1 |
| **C. Protocoles analytiques** | **3** | 🟡 1 partiel | 3 (files-extract) |
| **D. Guides de prompting** | **2** | 🔴 Non transférés | 0 |
| **E. Directives & outils** | **13** | ⬜ Technique | ~4 |
| **F. Archives non explorées** | **21** | ❌ Contenu inconnu | 0 |
| **Archives système** | **~6** | ⬜ Unpack dupliqués | 6 (Gastel MD) |
| **TOTAL** | **~240** (tous fichiers confondus) | | ~52 sur filesystem |

### Décompte des ressources académiques exploitables :
- **~84 livres/ouvrages** académiques uniques
- **~111 images** académiques et de recherche
- **~5 documents** protocols/prompting
- **~21 archives** non explorées (contenu potentiel)
- **~13 directives/outils** techniques

---

## ÉCARTS IDENTIFIÉS ENTRE V2 ET V3

| Écart | Description | Impact |
|-------|-------------|--------|
| **+~18 livres** dans Book-7.rar | Seuls les 4 doublons étaient comptés | +18 ressources |
| **+12 livres** Livres/ root | Jamais transférés sur filesystem | +12 ressources |
| **+~6 livres** Livres/ressources/ | PDFs standalone jamais transférés | +6 ressources |
| **+1 livre** .1.rar manquant | Your Thesis Writing Strengths (Andrews) | +1 ressource |
| **+1 livre** .3.rar manquant | Supporting research in area studies (Pitman) | +1 ressource |
| **+1 livre** .4.rar manquant | The Art of Writing a PhD Proposal (Sonneveld) | +1 ressource |
| **+27 images** Articles/ | Jamais transférées | +27 ressources |
| **+49 images** ress-1 + ress-2 | Jamais transférées | +49 ressources |
| **+2 guides** Prompting/ | Jamais transférés | +2 ressources |
| **+2 fichiers** sites/ | Jamais transférés | +2 ressources |
| **+21 archives** non explorées | Contenu totalement inconnu | Potentiel +XX ressources |
| **Suppression** « hors périmètre » | Tous fichiers inventoriés sans exclusion | +13 ressources |

**Total : ~240 items** vs ~97 en V2 (inventaire précédent)

---

## PROCHAINE ÉTAPE

**En attente de votre validation :**

1. ✅ Cet inventaire V3 est-il maintenant exhaustif selon vous ?
2. ❓ Voulez-vous que je transfère les ressources manquantes du Google Drive vers le filesystem ?
3. ❓ Souhaitez-vous que j'explore les archives non identifiées (F-01 à F-21) pour découvrir leur contenu ?
4. ✅ Les catégories et priorités de traitement sont-elles correctes ?

**Le traitement d'un lot comprend :**
- Extraction des concepts clés reformulés en règles/critères/questions
- Enrichissement des system prompts (`directeur-prompt.ts`, `ai-writing-modes.ts`)
- Création de corpus structurés injectables
- Mise à jour des modules UI
