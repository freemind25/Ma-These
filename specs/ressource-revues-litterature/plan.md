# Plan — Ressource « revues de littérature » (ajout + digestion)

## État réel constaté

- `upload/Combining Qualitative.pdf` : 9 pages (pdfinfo) ; pdftotext → filigrane « Askpstudyinaustralia » (1 hit), « Res Nurs & Health 23:246-255, 2000 » (l.24 de l'extrait), marqueurs du contenu digéré présents (« stratified purposeful sampling », « quantitizing »). → **Identique à l'article Sandelowski déjà digéré le 28/09** (cycle `ressource-methodes-mixtes`, source « ressources.pdf » 12 pages dont pages 1-9 = cet article). Aucune action de duplication.
- `upload/Literature review as a research methodology_An overview _guidelines.pdf` : 6 pages (pdfinfo), texte intégral extrait (844 lignes). Article Hannah Snyder, JBR 104 (2019) 333-339, CC BY-NC-ND. **Jamais intégré.**
- `src/components/dashboard/resources-section.tsx` (240 lignes) : 4 entrées dans `RESOURCES` (l.43-113), types `Resource`/`ResourcePage` (l.28-40) avec pagination multi-pages `ResourcePager` (l.115-165), grille `sm:grid-cols-2` (l.181), pastille « N pages » (l.206-210). La 5e carte s'ajoute au tableau — aucun changement structurel.
- `src/lib/ai/knowledge-core.ts` (937 lignes) : `LITERATURE_REVIEW_MODULE` l.595-673 — Ollhoff 6 étapes (l.596-642) + Pearce biblio (l.644-646) + Paltridge & Starfield reporting/temps (l.648-658) + Wette citations (l.660-672). **Absent : typologie systématique/semi-systématique/intégrative, 4 phases, critères qualité, erreurs de publication (Snyder).** Enregistrement `MODULES` l.896-910 ; commentaires sources l.11-37.
- Mesures budget (bun, CHARS_PER_TOKEN=3, capteur `knowledge-core.budget.test.ts`) : full 62 823 chars ≈ 20 941 tok (budget 22 000, marge ≈ 1 059) ; `literature-review` 6 684 chars ≈ 2 228 tok ; `methodology` 13 412 chars ≈ 4 471 tok (max requis).
- Points d'injection du module : `src/lib/ai/specializations/literature-review.ts` l.8 (`['literature-review','style']`) et `src/lib/ai/specializations/revue-litterature-slr.ts` l.8 (`['literature-review','methodology','style']`) — non modifiés.
- `src/lib/ai/knowledge-core/modules/` : 9 fichiers bruts (documentation, aucun consommateur runtime — vérifié cycle précédent) ; `literature-review.md` = Ollhoff uniquement ; `methods-mixtes-sandelowski.md` = digest Sandelowski déjà en place.
- `docs/pdf-sources/ressources/fiche-sandelowski-p{1,2}.html` : gabarit de fiche 920×1190, palette stone/amber, footer crédité + pagination — réutilisable tel quel.
- `AGENTS.md` l.168 : ligne budget à rafraîchir (valeurs = capteur) ; drift historique déjà signalé, inchangé.
- `docs/ARCHITECTURE-CONNAISSANCE.md` : date l.4, arbre modules l.30-40, §7 « Processus de digestion et feedback » l.185 (Capture → Triage → Correction → Retirer → Validation → Documentation) — le présent cycle en est l'application directe.
- `README.md` l.82-94 : section « Ressources pédagogiques » avec 4 vignettes.
- Outillage : pdftotext/pdftoppm (/usr/bin), chromium `~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`, ffmpeg /usr/bin/ffmpeg ; serveur dev actif port 3000 (next-server pid 1114).

## Approche retenue

Deux jambes indépendantes, dans le sillage direct du cycle `ressource-methodes-mixtes` :

1. **Ajout (Snyder uniquement)** — fiche de lecture 2 pages composée en HTML (gabarit Sandelowski réutilisé, thème adapté) → capture chromium headless 2× → JPG ; sources HTML versionnées ; 5e carte dans `resources-section.tsx` (pagination existante) ; vignette + crédit dans le README.
2. **Digestion (Snyder uniquement)** — section compacte « Typologie et conduite des revues (Snyder 2019) » ajoutée à `LITERATURE_REVIEW_MODULE` (style télégraphique maison : SI/ALORS, tirets), source brute détaillée `modules/revue-litterature-snyder.md`, sync factuelle AGENTS (ligne budget) et ARCHITECTURE-CONNAISSANCE (date, arbre).
3. **Traçabilité (Sandelowski)** — preuve d'identité du PDF retransmis consignée dans preuves.md ; aucune duplication créée.

## Alternatives écartées

- Pages de l'article en verbatim (6 JPG) : texte dense deux colonnes, illisible en vignette — écarté au profit de la fiche + digestion (même décision que Sandelowski, documentée en spec).
- Section dans le module `methodology` : le savoir est consommé par les modes revue (`literature-review`, `revue-litterature-slr`) et prolonge Ollhoff/SLR — le module revue de littérature est son domicile naturel.
- Nouvelle fiche/carte Sandelowski : doublon d'un contenu déjà intégré et prouvé — écarté (CA-3.1).
- Recréer la fiche Snyder en 3 pages : le contenu cible (typologie + 4 phases + qualité + erreurs) tient en 2 pages au gabarit 920×1190 ; 3 pages alourdiraient la vignette sans gain.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| public/resources/revue-litterature-snyder-fiche-1.jpg / -2.jpg | création (~1840×2380) | nul — nouveaux fichiers |
| docs/pdf-sources/ressources/fiche-snyder-p1.html / -p2.html | création (sources versionnées des fiches) | nul |
| src/components/dashboard/resources-section.tsx | +1 entrée dans RESOURCES | faible — composant isolé du dashboard |
| README.md | +1 vignette + crédit | nul |
| src/lib/ai/knowledge-core.ts | +1 section dans LITERATURE_REVIEW_MODULE + ligne source en tête | moyen — capteur budget (preuve avant/après exigée) |
| src/lib/ai/knowledge-core/modules/revue-litterature-snyder.md | création | nul (documentation) |
| AGENTS.md | ligne budget actualisée | nul |
| docs/ARCHITECTURE-CONNAISSANCE.md | date + arbre modules (+1 fichier) | nul |
| specs/ressource-revues-litterature/* | création | nul |
| worklog.md | append | nul |
| FICHE_SYNTHESE.md | mise à jour fin de session | nul |
| test-snapshots/ressources-snyder-*.png | création (preuves navigateur) | nul |

**Lignes rouges (0 diff exigé avant chaque commit)** : `src/components/layout/app-sidebar.tsx`, `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts` — aucun ne figure dans la liste.

## Impacts transverses

- Aucun changement de schéma Prisma, de route API, de build Tauri ou de variables d'environnement.
- Budget de prompt : modes `literature-review` et `revue-litterature-slr` (+~650 tok chacun) — marge core 1 059 → ~400 tok après ajout (mesuré avant/après dans preuves.md) ; `methodology` (4 471 tok) reste le plus grand module (2 228 + ~650 ≈ 2 880 tok pour literature-review).
- Poids statique : ~0,7-1 Mo d'images dans `public/` (images unoptimized — compatible Tauri).

## Stratégie de vérification

- Capteur budget avant/après (sorties réelles dans preuves.md).
- `bun run lint` (0 erreur) ; `bun run test:run` complet (68 fichiers / 1531+ tests).
- agent-browser : 5 cartes, ouverture + pagination de la carte Snyder (1/2 → 2/2), 4 cartes intacts, 0 erreur console/page, mobile 390 px — captures `test-snapshots/ressources-snyder-*.png`.
- Lignes rouges : `git diff HEAD --stat -- <3 fichiers>` = vide avant chaque commit.

## Risques

- Dépassement du budget full core (marge 1 059 tok) → section Snyder compacte ≤ ~2 100 chars (~700 tok), mesurée avant commit.
- méthodologie ne resterait pas le module max → impossible à ~2 880 tok pour literature-review vs 4 471, mais vérifié par le capteur.
- Chromium sandbox en environnement conteneurisé → capture avec `--no-sandbox --headless`, binaire playwright existant (pattern du cycle précédent).
