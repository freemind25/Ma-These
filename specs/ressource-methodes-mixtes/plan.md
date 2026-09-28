# Plan — Ressource « méthodes mixtes » (ajout + digestion)

## État réel constaté

- `src/components/dashboard/resources-section.tsx` (112 lignes) : 2 ressources en tableau `as const`, vignette + Dialog plein format, aucune pagination.
- `src/lib/ai/knowledge-core.ts` : `METHODOLOGY_MODULE` l.323-450 — Kumar (arbre, échantillonnage), Gaudet & Robert, Zimmerman, Yin, Hammersley (risques épistémologiques mixtes l.406-408), Creswell & Plano Clark (rédaction l.445-449). **Absent** : combinatoire technique de Sandelowski (niveaux, 7 gabarits, échantillonnage combiné, instruments multi-usages, lier/transformer) et le vocabulaire methods/méthodologie + check-list pré-collecte du guide UWA.
- `src/lib/ai/knowledge-core.budget.test.ts` : capteur permanent — CHARS_PER_TOKEN=3, budget core 22 000 tok, mode 17 000, module max 5 000, 13 modules obligatoires, méthodologie doit rester la plus grande. Baseline mesurée : 60 370 chars / ~20 123 tok ; méthodologie ~3 665 tok.
- `src/lib/ai/knowledge-core/modules/*.md` : 7 sources brutes, **aucun consommateur runtime** (rg « knowledge-core/modules » = 0 hit) → documentation.
- `upload/res.pdf` : 2 pages = le guide UWA (pages 1-2 sans l'habillage e-mail), rendu pdftoppm propre après recadrage.
- Drift préexistant signalé (Article 4) : AGENTS.md annonçait 11 modules (code : 13) et un budget « ~3 900 tok » (capteur : ~20 123) ; tableau AGENTS l.170+ et colonne Tokens d'ARCHITECTURE §4 restent historiques — signalé dans preuves, non réécrit en masse (hors périmètre).

## Approche retenue

Deux jambes indépendantes :
1. **Ajout** — assets dans `public/resources/` (guide UWA verbatim recadré du PDF reçu ; fiche de lecture Sandelowski 2 pages composée en HTML → capture chromium 2×) + extension `resources-section.tsx` (tableau typé, `ResourcePager` avec pagination Précédente/Suivante + compteur, pastille « N pages » au survol) + README.
2. **Digestion** (processus §7 ARCHITECTURE-CONNAISSANCE : capture → triage → correction noyau → validation → documentation) — deux sections compactes ajoutées à `METHODOLOGY_MODULE` (style télégraphique maison), 2 fichiers sources brutes dans `modules/`, mise à jour factuelle des compteurs AGENTS/ARCHITECTURE.

## Alternatives écartées

- Pages de l'article en verbatim (9 JPG) : texte dense + filigrane tiers, illisible en vignette — écarté au profit de la fiche + digestion (décision documentée dans spec).
- Recréation HTML du guide UWA : risque de dérive de contenu + contrevient à « retain them in their original form » — écarté pour le recadrage verbatim.
- Nouveau module `mixed-methods` dans le noyau : le savoir est consommé par les mêmes modes que `methodology` ; un module de plus alourdirait toutes les injections — écarté pour une section dans `methodology`.
- Package `playwright` (absent de node_modules) : capture faite avec le binaire chromium headless déjà présent (~/.cache/ms-playwright) + `ffmpeg` système — zéro dépendance ajoutée.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| public/resources/methodes-methodologie-uwa-1.jpg / -2.jpg | création (935×990) | nul — nouveaux fichiers |
| public/resources/methodes-mixtes-sandelowski-fiche-1.jpg / -2.jpg | création (1840×2380) | nul |
| docs/pdf-sources/ressources/fiche-sandelowski-p1.html / -p2.html | création (sources versionnées des fiches) | nul |
| src/components/dashboard/resources-section.tsx | réécriture typée + pager | faible — composant isolé du dashboard |
| README.md | section Ressources pédagogiques | nul |
| src/lib/ai/knowledge-core.ts | +2 sections dans METHODOLOGY_MODULE | moyen — capteur budget (prouvé avant/après) |
| src/lib/ai/knowledge-core/modules/methods-mixtes-sandelowski.md | création | nul (documentation) |
| src/lib/ai/knowledge-core/modules/methodes-methodologie-uwa.md | création | nul |
| AGENTS.md | compteurs 11→13, sources, ligne budget | nul |
| docs/ARCHITECTURE-CONNAISSANCE.md | date, arbre modules/, ligne methodology + note de mesure | nul |
| specs/ressource-methodes-mixtes/* | création | nul |
| worklog.md | append | nul |
| test-snapshots/ressources-*.png (5) | création (preuves navigateur) | nul |

## Impacts transverses

- Aucun changement de schéma Prisma, de route API, de build Tauri ou de variables d'environnement.
- Budget de prompt : méthodologie injectée par directeur, hypothesis, methodology, revue-litterature (+~800 tok chacun) — capteur vert.
- Poids statique : +1,36 Mo d'images dans `public/` (images unoptimized côté next.config — compatible Tauri).

## Stratégie de vérification

- `bun run lint` (0 erreur attendue) ; `bun run test:run` complet (1452+ tests).
- Capteur budget avant/après (sorties réelles collées dans preuves.md).
- agent-browser : 4 cartes, pagination des 2 nouvelles (compteur + src commutée), 0 erreur console/page, mobile 390 px.
- Lignes rouges : `git diff HEAD --stat -- <3 fichiers>` = vide avant chaque commit.

## Risques

- Dépassement du plafond 5 000 tok du module methodology → mesuré : 4 470 tok, marge 530 tok (documentée).
- next/image avec dimensions hétérogènes → width/height par page dans le type `ResourcePage`.
