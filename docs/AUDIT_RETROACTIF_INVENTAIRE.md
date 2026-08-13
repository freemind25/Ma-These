# AUDIT RÉTROACTIF — Inventaire Exhaustif & Diagnostic Complet

> **Date :** 18 janvier 2025  
> **Objet :** Inventaire exhaustif de TOUTES les ressources transmises par l'utilisateur au cours du projet MaTh-se / ThesisFrame.  
> **Conformité :** Contrainte de stricte application de la directive « De la bibliothèque passive à l'expertise active de l'IA ».

---

## RÉCAPITULATIF GÉNÉRAL

| Source | Fichiers bruts | Ressources académiques uniques | Directives/techniques |
|--------|---------------|-------------------------------|----------------------|
| Archives .1.rar à .6.rar | 71 | **66** | 5 (prompts, patch) |
| Archive Books-6.rar + Book-7.rar (déjà extraits) | 5 PDF | **5** (doublons de .rar) | 0 |
| Archive files.zip (= files-extract/) | 3 MD | **3** | 0 |
| Archive RB.rar (= RB-extract/RB/) | 15 JPG | **15** | 0 |
| Autres fichiers upload | 3 | **1** (28.png = capture GitHub) + 2 (FICHE_SYNTHESE, directive) | 2 |
| **TOTAL** | **97 fichiers bruts** | **~82 ressources académiques distinctes** | ~9 directives/techniques |

> **Note :** Les 5 PDF de Books-6/Book-7 sont déjà comptabilisés dans les .rar. Les archives .rar contiennent donc bien le contenu principal. L'outil `unrar-free` (seul disponible sur le système) ne lit que le premier fichier de chaque archive (limitation UTF-16BE) — le listing complet a été obtenu via `rarfile` Python.

---

## CATÉGORIE 1 — OUVRAGES SUR LA SUPERVISION & LE DIRECTEUR DE THÈSE (7 livres)

| # | Titre | Auteur(s) | Archive | Format | Taille |
|---|-------|-----------|---------|--------|--------|
| 1 | The Good Supervisor: Supervising Postgraduate and Undergraduate Research (2nd ed.) | Gina Wisker | Books-6 / .1 | PDF | 53 MB |
| 2 | A Handbook for Doctoral Supervisors (3rd ed.) | Stan Taylor, Margaret Kiley | Book-7 / .1 | PDF | 4.8 MB |
| 26 | Encadrer aux cycles supérieurs : Étapes, problèmes et interventions | Christian Bégin | .2 | PDF | 2.25 MB |
| 31 | How to Write a Thesis | Rowena Murray | .2 | PDF | 1.15 MB |
| 37 | Structuring Your Research Thesis (Palgrave Research Skills) | Susan Carter, Frances Kelly et al. | .2 | PDF | 1.07 MB |
| 39 | Thesis and Dissertation Writing in a Second Language: A Handbook for Supervisors | Brian Paltridge, Sue Starfield | .2 | PDF | 1.07 MB |
| 41 | Writing Your Doctoral Dissertation: Invisible Rules for Success | Rita S. Brause | .2 | PDF | 1.24 MB |

**Statut global de la catégorie :** 🔴 7/7 simplement stockés (aucun corpus extrait, aucun prompt enrichi)

**Potentiel d'exploitation :** Très élevé. L'ensemble couvre la supervision sous tous ses angles (anglophone, francophone, interculturel, L2, structure de thèse, règles invisibles). Injectables directement dans `directeur-prompt.ts` pour transformer le Directeur IA générique en un superviseur expert nourri par la littérature.

---

## CATÉGORIE 2 — OUVRAGES SUR LA RÉDACTION SCIENTIFIQUE & LA THÈSE (23 livres)

| # | Titre | Auteur(s) | Archive | Format | Taille |
|---|-------|-----------|---------|--------|--------|
| **13** | How to Write and Publish a Scientific Paper (9th ed.) | Barbara Gastel, Robert A. Day | .1 | **MD intégral** | 0.68 MB |
| 3/43 | A Manual for Writers of Research Papers, Theses, and Dissertations (9th ed.) | Kate L. Turabian | Book-7 / .3 | PDF | 4.3–5.85 MB |
| 25 | Comment écrire sa thèse | Umberto Eco | .2 | PDF | 3.06 MB |
| 30 | How to Write a Scientific Paper: An Academic Self-Help Guide for PhD Students | Jari Saramäki | .2 | PDF | 1.71 MB |
| 34 | L'art de la thèse : Comment préparer et rédiger un mémoire, une thèse de doctorat ou tout autre travail universitaire | Michel Beaud, Magali Gravier et al. | .2 | PDF | 2.05 MB |
| 42 | writing a scientific thesis.pdf | — | .2 | PDF | 2.63 MB |
| 44 | Effective Academic Writing: Second Edition, vol. 3 — The Researched Essay | Rhonda Liss, Alice Savage, Jason Davis | .3 | PDF | 4.52 MB |
| 54 | The Handbook of Academic Writing | Rowena Murray, Sarah Moore | .3 | PDF | 0.90 MB |
| 38 | The PhD Writing Handbook | Desmond Thomas | .2 | PDF | 2.19 MB |
| 64 | Effective Strategies for Academic Writing (essay, paper, thesis, journal article, bachelor, master, PhD) | — | .5 | PDF | 11.50 MB |
| 66 | Writing Research Papers: A Complete Guide | James D. Lester | .5 | PDF | 12.38 MB |
| 70 | Writing the Research Paper: A Handbook (2009 MLA Update Edition) | Anthony C. Winkler, Jo Ray McCuen-Metherell | .6 | PDF | 12.50 MB |
| 33 | La Rédaction des Publications Scientifiques | Gilles Lussier | .2 | PDF | 2.67 MB |
| 29 | How to Research & Write a Successful PhD | Kathleen McMillan, Jonathan Weyers | .2 | PDF | 2.97 MB |
| 5 | How to Get a PhD (4th ed.) | Estelle Phillips, Derek S. Pugh | Book-7 | PDF | 0.8 MB |
| 46 | Finish Your Thesis or Dissertation: Tips, Hacks for Success | Kevin Morrell | .3 | PDF | 0.98 MB |
| 68 | Enjoy Writing Your Science Thesis or Dissertation | Holtom, Fisher | .6 | PDF | 14.56 MB |
| 22 | Writing a Science PhD | Boyle, Jennifer Ramsay, Scott | .1 | EPUB | 0.35 MB |
| 62 | Writing Well and Being Well for Your PhD and Beyond | Katherine Firth | .4 | PDF | 7.00 MB |
| 40 | Writing Your Thesis With ChatGPT: Research, Scholarship and Academic Writing in the Age of Generative AI | Paul Johannesson | .2 | PDF | 1.60 MB |
| 18 | PhD: An Uncommon Guide to Research, Writing & PhD Life | James Hayton | .1 | EPUB | 0.65 MB |
| 16 | How to Write an Exceptional Thesis or Dissertation: A Step-By-Step Guide from Proposal to Successful Defense | Jessica Graustein | .1 | EPUB | 2.24 MB |
| 59 | PhDone: A Professional Dissertation Editor's Guide to Writing Your Doctoral Thesis and Earning Your PhD | Allen Roda, Lauren Saunders, Kevin Anderson | .4 | PDF | 9.69 MB |

**Statut global de la catégorie :** 🟡 1/23 partiellement exploité (Gastel & Day = texte intégral dormant ; Turabian référencée implicitement). Les 22 autres sont simplement stockés.

**Potentiel d'exploitation :** Très élevé. Cette catégorie est le cœur du projet. Gastel & Day en texte intégral MD (15 208 lignes) est le plus riche. Turabian est LA norme. Eco est un classique francophone incontournable. L'ensemble couvre : rédaction IMRAD, titre, abstract, tables/figures, citation (Chicago + MLA), peer review, révision, rédaction en L2, écriture avec ChatGPT, bien-être doctoral.

---

## CATÉGORIE 3 — OUVRAGES SUR LA REVUE DE LITTÉRATURE (4 livres)

| # | Titre | Auteur(s) | Archive | Format | Taille |
|---|-------|-----------|---------|--------|--------|
| 14/67 | Doing a Systematic Review: A Student's Guide (2nd ed.) | Angela Boland, Gemma Cherry, Rumona Dickson | .1 (EPUB) / .6 (PDF) | EPUB+PDF | 4.06 + 6.65 MB |
| 21 | Writing Your Dissertation Literature Review: A Step-By-Step Guide | Grant Andrews | .1 | EPUB | 0.12 MB |
| 69 | Writing Literature Reviews: A Guide for Students of the Social and Behavioral Sciences | Melisa C. Galvan, Jose L. Galvan | .6 | PDF | 12.43 MB |
| 47 | How to Write a Literature Review: A Workbook in Six Steps | Jim Ollhoff | .3 | PDF | 0.30 MB |

**Statut global :** 🔴 4/4 simplement stockés.

**Potentiel :** Élevé. Directement injectables dans le mode `literature-review` et le Module Références. Boland (PRISMA) et Galvan & Galvan (sciences sociales) sont les références majeures.

---

## CATÉGORIE 4 — OUVRAGES MÉTHODOLOGIQUES (11 livres)

| # | Titre | Auteur(s) | Archive | Format | Taille |
|---|-------|-----------|---------|--------|--------|
| 4 | Constructing Research Questions: Doing Interesting Research | Mats Alvesson, Jörgen Sandberg | Book-7 | PDF | 4.4 MB |
| 35 | Research Methodology: Methods and Techniques | C.R. Kothari | .2 | PDF | 1.91 MB |
| 55 | Une méthodologie de la recherche scientifique | Raymond Henri Shevenell | .3 | PDF | 5.47 MB |
| 51 | Méthodologie de recherche (JML) | — | .3 | PDF | 0.20 MB |
| 24 | Méthodologie et guide pratique du mémoire de recherche et de la thèse de doctorat | Pierre N'Da | .1 | DOC | 0.10 MB |
| 53 | The Method of Multiple Hypotheses: A Guide for Professional and Academic Researchers | Charles S. Reichardt | .3 | PDF | 3.85 MB |
| 58 | Methodological Innovations in Research and Academic Writing | Aaron Samuel Zimmerman | .4 | PDF | 6.02 MB |
| 63 | 100 Questions (and Answers) About Research Methods | Neil J. Salkind | .5 | PDF | 11.60 MB |
| 48 | How to Examine a Thesis | Lynne Pearce | .3 | PDF | 0.53 MB |
| 50 | Measuring Academic Research: How to Undertake a Bibliometric Study | Ana Andres | .3 | PDF | 3.12 MB |
| 65 | Guide de rédaction scientifique : l'hypothèse, clé de voûte de l'article scientifique | David Lindsay, Pascal Poindron | .5 | PDF | 11.51 MB |

**Statut global :** 🟡 1/11 partiellement exploité (Alvesson & Sandberg = description figée dans `book-resources.ts`). Les 10 autres simplement stockés.

**Potentiel :** Très élevé. Alvesson & Sandberg (5 stratégies de construction de problématique), Kothari (manuel méthodologique de référence), Reichardt (hypothèses multiples), N'Da (francophone), Lindsay & Poindron (l'hypothèse) — tous directement injectables dans le Module Cadrage, le Module Méthodologie, et les modes `theory`, `methodology`, `hypothesis`.

---

## CATÉGORIE 5 — OUVRAGES SUR L'IA ET LA RECHERCHE (4 livres)

| # | Titre | Auteur(s) | Archive | Format | Taille |
|---|-------|-----------|---------|--------|--------|
| 32 | Institutional Guide to Using AI for Research | Xue Zhou, Hosam Al-Samarraie | .2 | PDF | 2.58 MB |
| 20 | The AI-Powered Academic: 100+ AI Tools, Prompt Strategies to Revolutionize Your Research, Writing, and Teaching Skills | Dr. Mehdi Bagheri | .1 | EPUB | 2.89 MB |
| 40 | Writing Your Thesis With ChatGPT | Paul Johannesson | .2 | PDF | 1.60 MB |
| 15 | Extraire une thèse d'un cerveau étudiant sans gâchis : favoriser la rédaction et la persévérance aux cycles supérieurs | Geneviève Belleville, Philip L. Jackson | .1 | EPUB | 2.62 MB |

**Statut global :** 🔴 4/4 simplement stockés.

**Potentiel :** Modéré-élevé. Zhou & Al-Samarraie (guide institutionnel éthique de l'IA pour la recherche) est le plus structurant. Bagheri (catalogue d'outils) est utilitaire. Johannesson (ChatGPT + thèse) est directement applicable aux IA Assistants.

---

## CATÉGORIE 6 — PUBLICATION & PEER REVIEW (6 livres)

| # | Titre | Auteur(s) | Archive | Format | Taille |
|---|-------|-----------|---------|--------|--------|
| 56 | Writing Your Journal Article in Twelve Weeks: A Guide to Academic Publishing Success | Wendy Laura Belcher | .3 | PDF | 4.22 MB |
| 27/45 | Evaluating Research in Academic Journals: A Practical Guide to Realistic Evaluation | Fred Pyrczak (+ Tcherni-Buzzeo) | .2 / .3 | PDF | 1.17 / 3.14 MB |
| 57 | Writing for Publication (The Academics Support Kit) | Debbie Epstein, Jane Kenway, Rebecca Boden | .3 | PDF | 0.98 MB |
| 19 | Research and Writing Skills for Academic and Graduate Researchers | RMIT University Library | .1 (EPUB) / .2 (PDF) | EPUB+PDF | 2.91 / 2.78 MB |
| 36 | Research and Writing Skills (RMIT) | RMIT University Library | .2 | PDF | 2.78 MB |
| 28 | Getting Started on Research (The Academics Support Kit) | Rebecca Boden, Jane Kenway, Debbie Epstein | .2 | PDF | 1.37 MB |

**Statut global :** 🔴 6/6 simplement stockés.

**Potentiel :** Modéré-élevé. Belcher (publication en 12 semaines) et Pyrczak (évaluation critique) sont les plus actionnables — directement injectables dans le mode `peer-review`.

---

## CATÉGORIE 7 — URBANISME & AMÉNAGEMENT (4 livres)

| # | Titre | Auteur(s) | Archive | Format | Taille |
|---|-------|-----------|---------|--------|--------|
| 17 | Order without Design: How Markets Shape Cities | Alain Bertaud | .1 | EPUB | 25.36 MB |
| 49 | L'urbanisme | Jean Tribillon | .3 | PDF | 6.00 MB |
| 52 | Nouveaux Principes de l'urbanisme | — | .3 | PDF | 3.58 MB |
| 60 | Renouveler l'aménagement et la… | — | .4 | PDF | 9.57 MB |

**Statut global :** 🔴 4/4 simplement stockés.

**Potentiel :** Spécialisé. Pertinent uniquement si la thèse porte sur l'urbanisme/l'aménagement (confirme la pertinence des images RB sur le même sujet).

---

## CATÉGORIE 8 — IMAGES & INFOGRAPHIES ACADEMIQUES (16 images)

| # | Fichier | Contenu VLM | Valeur | Modules cibles |
|---|---------|-------------|--------|---------------|
| **RB-1** | Cadre théorique vs cadre conceptuel (tableau comparatif) | 🔴 Élevée — clarification conceptuelle essentielle | Module Cadrage, mode `theory` |
| **RB-2** | Architecture du chapitre 2 — Revue de littérature (6 sections, exemple solitude au travail, JD-R) | 🔴 Élevée — guide opérationnel de structuration de l'état de l'art | Mode `literature-review`, Module Cadrage |
| **RB-3** | Taxonomie des 7 Research Gaps (Evidence, Knowledge, Practice, Methodological, Empirical, Theoretical, Population) | 🔴 Élevée — cadre analytique pour justifier l'originalité | Mode `literature-review`, Module Cadrage |
| **RB-4** | Récapitulatif des tests statistiques (descriptifs, inférentiels, non paramétriques, régressions) | 🟡 Moyenne — outil de choix des analyses quantitatives | Module Méthodologie, mode `methodology` |
| **RB-5** | Cadre théorique vs cadre conceptuel (variante du RB-1) | 🔴 Élevée — même sujet, format alternatif | Module Cadrage, mode `theory` |
| **RB-6** | Types of Research Gaps (variante du RB-3) | 🔴 Élevée — taxonomie des lacunes | Mode `literature-review` |
| **RB-7** | Vue d'ensemble Urban Planning (chronologie Garden City → Smart City) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-8** | Garden City Approach (modèle howardien 1898) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-9** | Modernist Planning (Le Corbusier, Chandigarh) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-10** | Comprehensive Planning (mid-20e siècle, London Plan) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-11** | Advocacy & Equity Planning (1960-70, Jane Jacobs) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-12** | New Urbanism (1980-aujourd'hui) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-13** | Sustainable Urban Planning (1990-aujourd'hui) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-14** | Smart City Approach (XXIe siècle, IoT, IA) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **RB-15** | Synthèse intégrative (Bringing It All Together) | 🟡 Spécialisé urbanisme | Module Cadrage |
| **28.png** | Capture d'écran du dépôt GitHub MaTh-se | ⬜ Nulle — documentation technique | Aucun module |

**Statut global :** 🔴 15/15 infographies académiques inutilisées. 6 à valeur élevée (RB-1,2,3,4,5,6) directement injectables. 9 à valeur spécialisée urbanisme.

---

## CATÉGORIE 9 — PROTOCOLES & DOCUMENTATION ANALYTIQUE (3 documents)

| # | Titre | Format | Lignes | Emplacement |
|---|-------|--------|--------|-------------|
| 7 | SKILL.md — analyse-documentaire-scientifique (12 protocoles PRISMA/GRADE) | MD | 180 | `files-extract/` |
| 8 | grilles-qualite-appraisal.md (CASP, MMAT, Cochrane RoB2, Newcastle-Ottawa — paraphrasés) | MD | 47 | `files-extract/` |
| 9 | integrations-gestionnaires-references.md (Mendeley/Zotero/Notion/Obsidian) | MD | 50 | `files-extract/` |

**Statut global :** 🟡 SKILL.md partiellement reflété dans le Module Méthodologie. Grilles complètement inutilisées.

**Potentiel :** Très élevé pour SKILL.md + grilles (socle méthodologique classe A). Faible pour intégrations-gestionnaires (outillage technique).

---

## CATÉGORIE 10 — ⬜ HORS PÉRIMÈTRE ACADÉMIQUE (ne nécessitent pas de traitement)

| Fichier | Raison |
|---------|--------|
| `prompt-developpeur-audit-application.md` (.1) | Directive technique interne |
| `prompt_pdf.pdf` (.2) | Directive technique interne |
| `PromptChatGPT.pdf` (.3) | Directive technique interne |
| `historique-redaction-chapitre.patch` (.1) | Diff Git (historique de code) |
| `28.png` | Capture d'écran GitHub |
| `FICHE_SYNTHESE.md` | Journal de bord projet |
| `audit-retroactif-documentation-livres.md` | Directive courante |
| `simplypsychology.org-Doing-a-Systematic-Review-A-Students-Guide.pdf` (.2) | Webpage print — contenu couvert par Boland |
| `sciadv.aec0494.pdf` (.3) | Article scientifique isolé |
| `preview-9781526416582.pdf` (.3) | Extrait d'ouvrage incomplet |
| Doublons internes (McMillan ×2, Brause ×2, Johannesson ×2, Pyrczak ×2) | Copies à décompter |
| `ROADMAP.md`, `roadmap-thesisframe.pdf`, `roadmap-gantt.png`, `pdf-gen/` | Documentation technique du projet |
| `screenshot-dark-mode.png`, `screenshot-dashboard.png` | Captures d'écran de l'application |
| `skills/design/` (38 images) | Templates de design (pas ressources utilisateur) |
| `download/` (fichiers JSON) | Données d'import de code source |

---

## SYNTHÈSE — 82 RESSOURCES ACADÉMIQUES DISTINCTES

| Catégorie | # ressources | Statut dominant | Impact potentiel |
|-----------|-------------|-----------------|-----------------|
| 1. Supervision & Directeur | 7 | 🔴 Stocké | 🔴 Haute |
| 2. Rédaction scientifique & Thèse | 23 | 🟡 1 partiel | 🔴 Haute |
| 3. Revue de littérature | 4 | 🔴 Stocké | 🔴 Haute |
| 4. Méthodologie | 11 | 🟡 1 partiel | 🔴 Haute |
| 5. IA & Recherche | 4 | 🔴 Stocké | 🟡 Moyenne |
| 6. Publication & Peer Review | 6 | 🔴 Stocké | 🟡 Moyenne |
| 7. Urbanisme | 4 | 🔴 Stocké | 🟡 Spécialisé |
| 8. Infographies académiques | 15 | 🔴 Inutilisées | 🔴 Haute (6) + 🟡 (9) |
| 9. Protocoles analytiques | 3 | 🟡 1 partiel | 🔴 Haute |
| **TOTAL** | **77** *(hors doublons)* | | |

> **Note :** Le compte de 77 exclut les doublons (5 livres présents dans Book-6/7 + .rar) et les 5 directives/techniques. Les archives .rar ne seront jamais supprimées — elles contiennent les sources originales.

---

## LOTS DE TRAITEMENT PROPOSÉS

### 🔴 LOT 1 — Directeur de thèse IA (7 livres)
**Cibles :** `directeur-prompt.ts`, IA Assistants (Directeur)  
**Ressources :** #1, 2, 26, 31, 37, 39, 41

### 🔴 LOT 2 — Rédaction scientifique (11 livres prioritaires)
**Cibles :** Modes AI `scientific-writing`, `abstract`, `paraphrase`, `supervision`; Vérification linguistique + stylistique; Module Références  
**Ressources :** #13 (MD intégral !), 3/43, 25, 30, 34, 33, 66, 65, 44, 54, 42

### 🔴 LOT 3 — Problématique & Méthodologie (11 ressources)
**Cibles :** Module Cadrage, Module Méthodologie, Modes `theory`, `methodology`, `hypothesis`  
**Ressources :** #4, 35, 55, 51, 24, 53, 65, 58, 63 + SKILL.md (#7) + RB-1, RB-5 (cadre théorique/conceptuel)

### 🔴 LOT 4 — Revue de littérature (7 ressources)
**Cibles :** Mode `literature-review`, Module Références  
**Ressources :** #14/67, 21, 69, 47 + RB-2, RB-3, RB-6 (structure chapitre 2 + lacunes de recherche) + grilles-qualite (#8)

### 🟡 LOT 5 — IA & Recherche (4 livres)
**Cibles :** IA Assistants, ai-config, ai-writing-modes  
**Ressources :** #32, 20, 40, 15

### 🟡 LOT 6 — Publication & Peer Review (6 livres + remaining rédaction)
**Cibles :** Mode `peer-review`, `defense`  
**Ressources :** #56, 27/45, 57, 59 + #29, 5, 46, 68, 38, 64, 70, 16, 18, 62, 48

### 🟡 LOT 7 — Urbanisme (4 livres + 9 images) — conditionnel
**Condition :** Uniquement si la thèse porte sur l'urbanisme  
**Ressources :** #17, 49, 52, 60 + RB-7 à RB-15

---

## PROCHAINE ÉTAPE

**En attente de votre validation** sur :
1. ✅ Les priorités LOT 1→7 vous conviennent-elles ?
2. ❓ **Quel est le sujet de votre thèse ?** (pour activer/désactiver le LOT 7 urbanisme)
3. ✅ Voulez-vous que je commence le traitement effectif (extraction de corpus + injection dans les prompts) par le LOT 1 ?

**Le traitement d'un lot comprend :**
- Extraction des concepts clés reformulés en règles/critères/questions (sans reproduction de texte protégé)
- Enrichissement des system prompts dans `directeur-prompt.ts` et `ai-writing-modes.ts`
- Création de corpus structurés injectables par les API routes
- Mise à jour des modules UI pour exposer les connaissances
