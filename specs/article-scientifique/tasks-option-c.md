# Tâches — Option C
## Groupe A — IA + API
- [x] T1 — buildTranslationPrompt/parse + tests (préservation verbatim) · preuve : vitest.
- [x] T2 — /api/articles/translate (copie distincte, original intact) · preuve : curl live fr→en.
## Groupe B — UI + docs
- [x] T3 — Boutons traduction (section + article) + panneau résultat + vue multi-articles · preuve : recette navigateur.
- [x] T4 — Suite + lint + redlines + docs § 7 bis (traduction + différé OCR/async consigné) + convergence · preuve : preuves.

## Convergence — 2026-10-07 (complément, session 12:10-13:40)

Critères d'acceptation satisfaits : **2/2** — CA-C1 : règles verbatim testées (26 tests article, dont repères conservés en français), route live 200 ×2 (chiffres 42/78 %, citation Benali (2019, p. 12), r = 0,72 préservés ; aucun contenu ajouté), UI recettée (boutons section + article entier, panneau « original intact », original français inchangé, copie enregistrée comme nouvel article) ; CA-C2 : vue multi-articles recettée (titre, type, statut, sections, repères par article + agrégat).
Écarts au plan : OCR + jobs asynchrones DIFFÉRÉS (consigné à l'ouverture — cycle d'étude dédié exigé).
Dette introduite : aucune (correctif repères livré dans le groupe, re-prouvé live).
Verdict : **CONVERGÉ** — recette déléguée (2 live curl, 8 contrôles navigateur, mobile 390 px, captures, nettoyage prouvé), révisable.

## Convergence — 2026-10-07 (session antérieure, conservée pour l'historique)

Critères d'acceptation satisfaits : **0/2 côté UI** — CA-C1 backend livré et testé (règles verbatim + route copie distincte, 25/25 verts) mais recette live non exécutée et boutons UI non implémentés ; CA-C2 backend livré (stats serveur) mais panneau UI non implémenté.
Écarts au plan : OCR + jobs asynchrones DIFFÉRÉS (consigné à l'ouverture — cycle d'étude dédié exigé).
Dette introduite : UI de l'option C (T3) — tâche restante.
Verdict : **NON CONVERGÉ** — reste T3 (UI traduction + panneau multi-articles) + recette live ; environnement d'outils instable en fin de session (corruption d'affichage), arrêt appliqué conformément à la Constitution.
