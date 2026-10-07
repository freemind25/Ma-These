# Tâches — Option B
## Groupe A — Lib + API
- [x] T1 — analysis.ts (analyse pure + anti-fragmentation) + buildAnglesPrompt/parse + tests · preuve : vitest.
- [x] T2 — /api/articles/analyze + /api/articles/angles · preuve : curl réel sur le mémoire de recette.
## Groupe B — UI
- [x] T3 — Panneau d'analyse (étape 1) + propositions d'angles + sélection obligatoire conditionnelle + blocage génération · preuve : recette navigateur.
## Groupe C — Non-régression / docs
- [x] T4 — Suite + lint + redlines · preuve : ≥ 1 601 verts.
- [x] T5 — Docs § 7 bis enrichi + convergence · preuve : preuves + captures.

## Convergence — 2026-10-07

Critères d'acceptation satisfaits : **6/6** (CA-B1→B6)
Écarts au plan : 1 consigné — l'analyse sur le DOCX de recette signale 0 titre (texte aplati par l'extraction DOCX — les titres réels sont connus à l'import et testés en vitest) ; rapport néanmoins honnête (qualité « insuffisante » sur 699 car., manquants justes).
Dette introduite : aucune. Défauts corrigés dans le groupe : icône Search manquante (lint), seuil qualité du test.
Verdict : **CONVERGÉ** (recette déléguée + preuves API, révisable à la recette du propriétaire)
