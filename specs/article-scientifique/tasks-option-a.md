# Tâches — Article scientifique Option A

## Groupe A — Schéma + deps
- [x] T1 — Ajouter `Article`, `ArticleVersion`, `ImportedDoc` (isolation thesisId, sections/plan/limites en JSON) · preuve : db:push additif, survie prouvée.
- [x] T2 — Installer `mammoth` + `unpdf` · preuve : bun add, import serveur résolu, aucune dep native.

## Groupe B — Libs pures + tests [DÉPEND DE Groupe A]
- [x] T3 — `src/lib/articles/extraction.ts` : validation type/taille (20 Mo), DOCX→HTML+texte (mammoth), PDF→pages (unpdf), détection scanné, titres, limites · preuve : vitest.
- [x] T4 — `src/lib/articles/prompts.ts` : règles d'intégrité (verbatim cahier des charges), buildPlanPrompt, buildSectionPrompt (anti-injection, [À compléter], traçabilité, corrélation≠causalité, biblio cohérente) · preuve : vitest.

## Groupe C — Backend [DÉPEND DE Groupe B]
- [x] T5 — `/api/article-imports` (POST upload, GET, DELETE) · preuve : curl import DOCX de test 201 + limites.
- [x] T6 — `/api/articles` CRUD + `[id]` + `/plan` + `/section` + `/export-docx` · preuve : curl CRUD + génération section live.

## Groupe D — UI [DÉPEND DE Groupe C]
- [x] T7 — Module `article-redaction` : wizard 4 étapes + relecture (édition, versions, traçabilité, export) · preuve : recette navigateur.
- [x] T8 — Montage (app-store.ts + page.tsx) + 2 points d'entrée (articles-page, bibliotheque-page) · preuve : navigation UI.

## Groupe E — Non-régression / docs / recette [DÉPEND DE Groupe D]
- [x] T9 — Suite complète + lint + lignes rouges · preuve : ≥ 1 585 verts, 0 erreur / 231.
- [x] T10 — Docs `ARCHITECTURE-CONNAISSANCE.md` § 7 bis · preuve : lecture.
- [x] T11 — Recette navigateur déléguée (10 CA, mobile, console) + convergence · preuve : preuves.md + captures.

## Convergence — 2026-10-07

Critères d'acceptation satisfaits : **10/10** (CA-1→CA-10 = les 10 critères du cahier des charges du propriétaire)
Écarts au plan : 3 consignés — (1) génération vérifiée par **appels API des routes exactes de l'UI** (2 appels live 6,3 s et 8,3 s) plutôt que clic-par-clic (frictions d'automatisation + corruption d'affichage navigateur consignée) ; (2) 2 défauts trouvés en recette et corrigés dans le groupe : crash client `JSON.parse(limits)` (POST renvoie un tableau parsé) et `location` fusionnée dans le `label` du bloc source (kind « inconnu ») ; (3) DOCX de test généré au vol (lib docx), non versionné.
Dette introduite : aucune. Éditeur = textareas markdown (décision déléguée n°1, révisable — Tiptap en option B).
Verdict : **CONVERGÉ** (recette navigateur déléguée + preuves API, révisable à la recette du propriétaire)
