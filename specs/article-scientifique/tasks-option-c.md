# Tâches — Option C
## Groupe A — IA + API
- [x] T1 — buildTranslationPrompt/parse + tests (préservation verbatim) · preuve : vitest.
- [x] T2 — /api/articles/translate (copie distincte, original intact) · preuve : curl live fr→en.
## Groupe B — UI + docs
- [ ] T3 — Boutons traduction (section + article) + panneau résultat + vue multi-articles · preuve : recette navigateur.
- [ ] T4 — Suite + lint + redlines + docs § 7 bis (traduction + différé OCR/async consigné) + convergence · preuve : preuves.

## Convergence — 2026-10-07

Critères d'acceptation satisfaits : **0/2 côté UI** — CA-C1 backend livré et testé (règles verbatim + route copie distincte, 25/25 verts) mais recette live non exécutée et boutons UI non implémentés ; CA-C2 backend livré (stats serveur) mais panneau UI non implémenté.
Écarts au plan : OCR + jobs asynchrones DIFFÉRÉS (consigné à l'ouverture — cycle d'étude dédié exigé).
Dette introduite : UI de l'option C (T3) — tâche restante.
Verdict : **NON CONVERGÉ** — reste T3 (UI traduction + panneau multi-articles) + recette live ; environnement d'outils instable en fin de session (corruption d'affichage), arrêt appliqué conformément à la Constitution.
