# AUDIT RÉTROACTIF — Inventaire & Diagnostic des Ressources Transmises

> **Date :** 18 janvier 2025
> **Objectif :** Repasser au crible de la logique « De la bibliothèque passive à l'expertise active de l'IA » l'ensemble des ressources transmises par l'utilisateur au cours du projet MaTh-se / ThesisFrame.
> **Livrables attendus :** Étapes 1 & 2 uniquement (Inventaire + Diagnostic). Le plan de traitement (étape 3) sera produit **après validation** de l'utilisateur.

---

## 1. INVENTAIRE COMPLET

### Catégorie A — Livres académiques (PDF, 5 ouvrages)

| # | Titre | Auteur(s) | Année | Édition | Format | Pages | Emplacement |
|---|-------|-----------|-------|---------|--------|-------|-------------|
| 1 | The Good Supervisor | Gina Wisker | 2012 | 2nd | PDF (53 MB) | 304 | `upload/Books-6-extract/` + `public/resources/books/` |
| 2 | A Handbook for Doctoral Supervisors | Stan Taylor, Margaret Kiley | 2018 | 3rd | PDF (4.8 MB) | 256 | `upload/Book-7-extract/` + `public/resources/books/` |
| 3 | A Manual for Writers of Term Papers, Theses, and Dissertations | Kate L. Turabian | 2018 | 9th | PDF (4.3 MB) | 416 | `upload/Book-7-extract/` + `public/resources/books/` |
| 4 | Constructing Research Questions: Doing Interesting Research | Mats Alvesson, Jörgen Sandberg | 2013 | 1st | PDF (4.4 MB) | 176 | `upload/Book-7-extract/` + `public/resources/books/` |
| 5 | How to Get a PhD | Estelle Phillips, Derek S. Pugh | 2015 | 4th | PDF (779 KB) | 280 | `upload/Book-7-extract/` + `public/resources/books/` |

### Catégorie B — Livre académique (Markdown intégral, 1 ouvrage)

| # | Titre | Auteur(s) | Année | Édition | Format | Lignes | Emplacement |
|---|-------|-----------|-------|---------|--------|--------|-------------|
| 6 | How to Write and Publish a Scientific Paper | Barbara Gastel, Robert A. Day | 2022 | 9th | MD (~1.4 MB) | 15 208 | `upload/.1-extract/.1/Como-escribir-articulo-cientifico.md` |

> **Note :** Les archives `.1.rar` à `.6.rar` (233 MB cumulés) contiennent toutes **le même fichier** dupliqué 6 fois. Aucune ressource additionnelle à en tirer.

### Catégorie C — Protocole analytique & Skill documentation (3 documents)

| # | Titre | Format | Lignes | Emplacement |
|---|-------|--------|--------|-------------|
| 7 | SKILL.md — analyse-documentaire-scientifique | MD | 180 | `upload/files-extract/SKILL.md` |
| 8 | grilles-qualite-appraisal.md | MD | 47 | `upload/files-extract/grilles-qualite-appraisal.md` |
| 9 | integrations-gestionnaires-references.md | MD | 50 | `upload/files-extract/integrations-gestionnaires-references.md` |

### Catégorie D — Images / Planches RB (15 images)

| # | Fichiers | Format | Emplacement |
|---|----------|--------|-------------|
| 10 | RB-1.jpg à RB-15.jpg | JPG | `upload/RB-extract/RB/` |

### Catégorie E — Documentation projet (2 documents)

| # | Titre | Format | Emplacement |
|---|-------|--------|-------------|
| 11 | FICHE_SYNTHESE.md | MD | `upload/FICHE_SYNTHESE.md` |
| 12 | audit-retroactif-documentation-livres.md | MD | `upload/` (pièce jointe courante) |

---

## 2. DIAGNOSTIC PAR ÉLÉMENT

### LIVRE 1 — The Good Supervisor (Wisker, 2012)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🔴 **Simplement stocké.** Métadonnées présentes dans `book-resources.ts` (catégorie « supervision »). PDF accessible via la bibliothèque UI. Aucune extraction de contenu vers un corpus actionnable. |
| **Potentiel d'exploitation** | **Élevé.** Concepts clés exploitables : compétences du superviseur (feedback constructif, gestion de la relation directeur-doctorant), types de difficultés doctorales, accompagnement à travers les blocages, critères d'évaluation d'un bon encadrement. Ces connaissances sont directement injectables dans le prompt du Directeur de thèse IA pour lui donner un comportement de supervision fidèle aux meilleures pratiques académiques. |
| **Modules cibles** | `directeur-prompt.ts` (Directeur de thèse IA) — enrichir le system prompt avec les principes de supervision de Wisker ; IA Assistants (module Directeur) |
| **Priorité** | 🔴 **HAUTE — impact immédiat.** Le Directeur de thèse est le module IA le plus utilisé. Son prompt actuel est générique et ne reflète aucune expertise issue de la littérature. |

---

### LIVRE 2 — A Handbook for Doctoral Supervisors (Taylor & Kiley, 2018)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🔴 **Simplement stocké.** Même situation que le livre 1. Métadonnées dans `book-resources.ts`, PDF accessible, aucun corpus. |
| **Potentiel d'exploitation** | **Élevé.** Complémentaire au livre 1 avec une focale plus institutionnelle : encadrement de doctorants internationaux, supervision à distance, éthique de la recherche, gestion des comités de thèse, préparation à la soutenance. Règles et critères directement reformulables en prompt pour le Directeur IA (comment guider un doctorant vers la soutenance, comment gérer les étapes de validation institutionnelle). |
| **Modules cibles** | `directeur-prompt.ts` (enrichissement du prompt) ; Module Soutenance (si création) ; Module Méthodologie |
| **Priorité** | 🔴 **HAUTE — impact immédiat.** À traiter en lot avec le livre 1 (même cible, même type de connaissances). |

---

### LIVRE 3 — A Manual for Writers (Turabian, 2018)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🟡 **Partiellement exploité.** Référencé dans le prompt de « Rédaction scientifique » (mode `scientific-writing` dans `ai-writing-modes.ts`) implicitement via les normes Chicago. Mais aucun corpus structuré n'a été extrait : les règles spécifiques de citation, la structure des notes de bas de page, les conventions de présentation des tableaux/figures ne sont pas formalisées en règles injectables. |
| **Potentiel d'exploitation** | **Très élevé.** Ce livre est LA référence normative pour : règles de citation (notes + bibliographie), présentation des tableaux et figures, abréviations académiques, structure des documents. Le contenu se prête parfaitement à une extraction en **règles de formatage actionnables** (if-then-else) pour le mode « Rédaction scientifique » et la vérification linguistique. |
| **Modules cibles** | `ai-writing-modes.ts` (mode `scientific-writing`) ; IA Assistants (Vérification linguistique, Vérification stylistique) ; Module Références (normes de citation) ; Module Cadrage (formatage) |
| **Priorité** | 🔴 **HAUTE — impact immédiat.** Affecte directement 4 modules actifs. Les règles de citation sont le fondement de la crédibilité académique. |

---

### LIVRE 4 — Constructing Research Questions (Alvesson & Sandberg, 2013)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🟡 **Partiellement exploité.** La description dans `book-resources.ts` mentionne les 5 stratégies (gap-spotting, problématization, analogy, contextualization, critique), mais ce savoir est **figé dans la description textuelle** et n'est injecté dans aucun prompt ni module. |
| **Potentiel d'exploitation** | **Très élevé.** Ce livre est le guide méthodologique le plus directement actionnable pour : formulation de questions de recherche, construction de la problématique, identification des lacunes dans la littérature. Les 5 stratégies de construction de questions peuvent être transformées en **procédures guidées** (checklist + questions socratiques) pour le Module Cadrage et le Module Méthodologie. Le concept de « problématization » (remettre en question les présupposés plutôt que simplement combler un gap) est particulièrement puissant pour le module socratique. |
| **Modules cibles** | Module Cadrage (champs problématique, question de recherche) ; Module Méthodologie (démarche) ; Mode « Construction théorique » dans ai-writing-modes.ts ; Module Socratique (questionnement des présupposés) |
| **Priorité** | 🔴 **HAUTE — impact immédiat.** La construction de la problématique est le cœur du travail doctoral. Ce livre fournit le cadre intellectuel exact dont les modules ont besoin. |

---

### LIVRE 5 — How to Get a PhD (Phillips & Pugh, 2015)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🟡 **Partiellement exploité.** Référencé dans la description `book-resources.ts` mais aucun contenu extrait. |
| **Potentiel d'exploitation** | **Modéré à élevé.** Guide pratique couvrant l'ensemble du parcours doctoral : gestion du temps, rédaction, soutenance, stress, publication, carrière. Les conseils pratiques (gestion du temps de rédaction, planification des étapes) peuvent être reformulés en **règles de planification** pour le dashboard/agile board. La section « préparation à la soutenance » enrichit le mode `defense` dans ai-writing-modes.ts. |
| **Modules cibles** | Mode `defense` (ai-writing-modes.ts) ; Dashboard (planification) ; `directeur-prompt.ts` (conseils sur le rythme de travail) |
| **Priorité** | 🟡 **MOYENNE.** Utile mais moins critique que les livres 1-4. Les conseils pratiques sont secondaires par rapport aux cadres méthodologiques et normatifs. |

---

### LIVRE 6 — How to Write and Publish a Scientific Paper (Gastel & Day, 2022)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🔴 **Complètement dormant.** Fichier de 15 208 lignes extrait des archives .rar mais **jamais indexé, jamais référencé dans le code, jamais exploité**. Pas d'entrée dans `book-resources.ts`. Pas de cover image. |
| **Potentiel d'exploitation** | **Très élevé — le plus riche pour la rédaction.** Contenu exhaustif couvrant : (1) rédaction IMRAD complète (Introduction, Methods, Results, Discussion), (2) rédaction du titre, abstract, acknowledgments, (3) conception de tables et figures, (4) citation des références (styles multiples), (5) soumission et processus de peer review, (6) éthique scientifique, (7) rédaction pour revues internationales, (8) révision et réponse aux relecteurs. Ce livre est en **texte intégral** — il permet une extraction beaucoup plus fine que les PDF. |
| **Modules cibles** | `ai-writing-modes.ts` (modes `scientific-writing`, `literature-review`, `peer-review`, `abstract`, `supervision`) ; IA Assistants (Vérification linguistique, Vérification stylistique) ; Module Références ; Module Méthodologie |
| **Priorité** | 🔴 **HAUTE — impact immédiat + facilité d'extraction.** Texte intégral en Markdown = extraction automatisée possible. Affecte quasiment tous les modules de rédaction et vérification. |

---

### DOCUMENT 7 — SKILL.md (analyse-documentaire-scientifique)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🟡 **Partiellement reflété.** Les concepts de cette skill sont vaguement présents dans le Module Méthodologie (checklist, paradigmes) mais **l'intelligence analytique profonde n'est PAS intégrée** : les 12 protocoles, la logique PRISMA, les grilles 05bis/09bis, la règle de pondération par qualité des preuves, le garde anti-hallucination — rien de tout cela n'est dans un prompt système. |
| **Potentiel d'exploitation** | **Très élevé.** Ce document définit un pipeline analytique complet et publiable en classe A : 12 protocoles structurés, règles de traçabilité, échelle de certitude, grilles de qualité. C'est le **socle intellectuel** qui devrait sous-tendre : la Revue de littérature dans le Module Références, le Module Méthodologie (audit de qualité), et un futur module d'analyse documentaire IA. |
| **Modules cibles** | Mode `literature-review` (ai-writing-modes.ts) ; Mode `peer-review` ; Module Méthodologie ; Module Références (futur sous-module « Analyse de corpus ») |
| **Priorité** | 🔴 **HAUTE — impact structurant.** Ce document est le squelette méthodologique de tout ce qui concerne l'analyse de corpus scientifique. Son intégration dans les prompts transformerait la qualité des réponses IA de « générique » à « publiable en classe A ». |

---

### DOCUMENT 8 — grilles-qualite-appraisal.md

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🔴 **Complètement inutilisé.** Document de 47 lignes paraphrasant les critères d'appréciation critique (CASP, MMAT, Cochrane RoB2, Newcastle-Ottawa). Non référencé dans aucun module, aucun prompt. |
| **Potentiel d'exploitation** | **Élevé.** Fournit les dimensions d'évaluation par type de design (quantitatif expérimental, observationnel, qualitatif, revues/méta-analyses) + les 5 niveaux de risque de biais. Directement injectable comme **base de connaissances du prompt** pour le mode `peer-review` et la Vérification méthodologique dans IA Assistants. |
| **Modules cibles** | Mode `peer-review` (ai-writing-modes.ts) ; IA Assistants (Vérification méthodologique) ; Mode `methodology` |
| **Priorité** | 🟡 **MOYENNE-HAUTE.** Fortement complémentaire au SKILL.md. À traiter en lot avec le document 7. |

---

### DOCUMENT 9 — integrations-gestionnaires-references.md

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🟡 **Partiellement reflété.** Les concepts d'intégration Mendeley/Zotero sont vaguement présents dans le Module Mendeley, mais les conventions de tags par protocole et le script d'extraction ne sont pas implémentés. |
| **Potentiel d'exploitation** | **Faible à modéré.** Ce document est surtout de l'outillage technique (scripts Python, OAuth, tags). Il n'apporte pas de connaissances académiques actionnables pour les prompts IA. Son utilité est dans l'implémentation de fonctionnalités d'import/export, pas dans l'enrichissement des corpus de connaissances. |
| **Modules cibles** | Module Mendeley (futur import/export) ; Module Références (tags par protocole) |
| **Priorité** | 🟢 **FAIBLE.** Document utilitaire, pas de connaissances à injecter dans l'IA. Peut être utilisé comme référence technique lors d'une future implémentation d'import Mendeley/Zotero. |

---

### RESSOURCE 10 — Images RB (RB-1.jpg à RB-15.jpg)

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🔴 **Extraites mais inutilisées.** 15 images JPG extraites de RB.rar. Aucune intégration dans l'interface. Aucune analyse VLM effective consignée dans le code. |
| **Potentiel d'exploitation** | **Inconnu — nécessite analyse VLM.** Sans analyse visuelle, il est impossible de déterminer le contenu exact de ces images. Si ce sont des planches de cours, des diagrammes méthodologiques ou des grilles d'évaluation, le potentiel pourrait être élevé. Si ce sont des captures d'écran ordinaires, le potentiel est nul. |
| **Modules cibles** | Dépend du contenu — à déterminer après analyse VLM |
| **Priorité** | 🟡 **À DÉTERMINER.** Nécessite une passe VLM préalable. Ne pas traiter en l'état. |

---

### DOCUMENT 11 — FICHE_SYNTHESE.md

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🟢 **Document de gestion de projet.** Journal de bord des jalons, format de commit, instructions permanentes. |
| **Potentiel d'exploitation** | **Nul pour l'IA.** Ce document est un outil de traçabilité interne au projet, pas une ressource académique. Il ne contient aucune connaissance exploitable pour les prompts ou corpus. |
| **Modules cibles** | Aucun |
| **Priorité** | ⬜ **HORS PÉRIMÈTRE.** Document de gestion de projet, à exclure de l'audit des ressources académiques. |

---

### DOCUMENT 12 — audit-retroactif-documentation-livres.md

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 🟢 **Directive de travail.** Le document que vous êtes en train de lire. |
| **Potentiel d'exploitation** | **Nul pour l'IA.** Directive opérationnelle, pas ressource académique. |
| **Modules cibles** | Aucun |
| **Priorité** | ⬜ **HORS PÉRIMÈTRE.** |

---

### ARCHIVES .1.rar à .6.rar

| Dimension | Diagnostic |
|-----------|-----------|
| **Statut actuel** | 6 archives identiques contenant le même fichier (Gastel & Day déjà comptabilisé comme Livre 6). |
| **Potentiel d'exploitation** | **Nul — doublons.** |
| **Modules cibles** | Aucun |
| **Priorité** | ⬜ **À SUPPRIMER.** 233 MB de stockage inutile. Conservés uniquement si l'utilisateur souhaite vérifier l'intégrité. |

---

## SYNTHÈSE DES PRIORITÉS

### 🔴 PRIORITÉ HAUTE — À traiter en premier (impact immédiat sur les fonctionnalités actives)

| Lot | Ressources | Modules impactés | Raison |
|-----|-----------|-------------------|--------|
| **LOT 1 : Directeur de thèse IA** | Livres 1 + 2 (Wisker, Taylor & Kiley) | `directeur-prompt.ts`, IA Assistants (Directeur) | Le prompt actuel est générique — pas d'expertise de supervision réelle injectée |
| **LOT 2 : Rédaction scientifique** | Livre 6 (Gastel & Day, texte intégral), Livre 3 (Turabian) | `ai-writing-modes.ts` (4 modes), IA Assistants (linguistique + stylistique), Références | Les règles de rédaction, citation et formatage sont le cœur de la crédibilité académique |
| **LOT 3 : Problématique & Méthodologie** | Livre 4 (Alvesson & Sandberg), Document 7 (SKILL.md) | Module Cadrage, Méthodologie, Mode `methodology` + `theory` | La construction de problématique et l'audit de qualité sont les étapes critiques du doctoral |

### 🟡 PRIORITÉ MOYENNE — À traiter en second

| Lot | Ressources | Modules impactés | Raison |
|-----|-----------|-------------------|--------|
| **LOT 4 : Qualité & Review** | Document 8 (grilles-qualite-appraisal.md), Livre 5 (Phillips & Pugh — section soutenance) | Mode `peer-review`, Mode `defense`, IA Assistants | Complémentaire aux lots 2 et 3 |

### 🟢 PRIORITÉ FAIBLE — Traitement différé ou inutile

| Ressource | Raison |
|-----------|--------|
| Document 9 (intégrations gestionnaires) | Outillage technique, pas de connaissances IA |
| Images RB (10) | Contenu inconnu — nécessite analyse VLM préalable |
| Documents 11 + 12 | Hors périmètre académique |
| Archives .1-.6.rar | Doublons à supprimer |

### ⬜ CE QUI NE MÉRITE PAS D'ÊTRE TRAITÉ

- **FICHE_SYNTHESE.md** — Document de gestion de projet interne, aucune valeur académique pour les corpus IA.
- **audit-retroactif-documentation-livres.md** — Directive opérationnelle.
- **Archives .1.rar à .6.rar** — 6 copies identiques du même fichier (déjà comptabilisé). 233 MB de stockage gaspillé. Recommandation : suppression après confirmation utilisateur.
- **integrations-gestionnaires-references.md** — Document utilitaire (scripts Python, OAuth). Aucune connaissance académique à en extraire pour les prompts. Utile uniquement si une implémentation technique d'import Mendeley/Zotero est planifiée.

---

## PROCHAINE ÉTAPE

**En attente de votre validation** sur :
1. La pertinence des priorités proposées (LOTS 1 → 4)
2. La décision sur les images RB (analyse VLM préalable souhaitée ?)
3. La décision sur les archives .1-.6.rar (suppression autorisée ?)

Après votre validation, je produirai le **Plan de traitement** (étape 3) avec, pour chaque lot :
- Le corpus structuré à produire (format, volume estimé)
- Les modifications de prompt système nécessaires
- L'ordre de mise en œuvre
