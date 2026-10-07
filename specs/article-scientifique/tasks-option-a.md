# Tâches — Article scientifique Option A

## Groupe A — Schéma + deps
- [ ] T1 — Ajouter `Article`, `ArticleVersion`, `ImportedDoc` (isolation thesisId, sections/plan/limites en JSON) · preuve : db:push additif, survie prouvée.
- [ ] T2 — Installer `mammoth` + `unpdf` · preuve : bun add, import serveur résolu, aucune dep native.

## Groupe B — Libs pures + tests [DÉPEND DE Groupe A]
- [ ] T3 — `src/lib/articles/extraction.ts` : validation type/taille (20 Mo), DOCX→HTML+texte (mammoth), PDF→pages (unpdf), détection scanné, titres, limites · preuve : vitest.
- [ ] T4 — `src/lib/articles/prompts.ts` : règles d'intégrité (verbatim cahier des charges), buildPlanPrompt, buildSectionPrompt (anti-injection, [À compléter], traçabilité, corrélation≠causalité, biblio cohérente) · preuve : vitest.

## Groupe C — Backend [DÉPEND DE Groupe B]
- [ ] T5 — `/api/article-imports` (POST upload, GET, DELETE) · preuve : curl import DOCX de test 201 + limites.
- [ ] T6 — `/api/articles` CRUD + `[id]` + `/plan` + `/section` + `/export-docx` · preuve : curl CRUD + génération section live.

## Groupe D — UI [DÉPEND DE Groupe C]
- [ ] T7 — Module `article-redaction` : wizard 4 étapes + relecture (édition, versions, traçabilité, export) · preuve : recette navigateur.
- [ ] T8 — Montage (app-store.ts + page.tsx) + 2 points d'entrée (articles-page, bibliotheque-page) · preuve : navigation UI.

## Groupe E — Non-régression / docs / recette [DÉPEND DE Groupe D]
- [ ] T9 — Suite complète + lint + lignes rouges · preuve : ≥ 1 585 verts, 0 erreur / 231.
- [ ] T10 — Docs `ARCHITECTURE-CONNAISSANCE.md` § 7 bis · preuve : lecture.
- [ ] T11 — Recette navigateur déléguée (10 CA, mobile, console) + convergence · preuve : preuves.md + captures.
