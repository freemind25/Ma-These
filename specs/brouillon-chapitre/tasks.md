# Tâches — Générateur de brouillon de chapitre

## Groupe A — Backend / routes API [BLOQUANT]
- [x] T1 — Créer `src/lib/markdown-to-html.ts` (liste blanche h2/h3/p/ul/ol/li/strong/em/blockquote, échappement HTML) · preuve : tests unitaires verts (T3).
- [x] T2 — Créer `src/app/api/chapter-draft/stream/route.ts` (POST SSE : zod {chapterId, targetWords 300-8000, referenceIds ≤ 20}, chargement chapitre+thèse+cadrage+références, prompt strict « citer uniquement les références fournies », generateCompletionStream maxTokens 12 000, relance unique si troncature) · preuve : curl 400 invalides ; SSE `data: {type:'chunk'}` visible.

## Groupe B — Tests / non-régression [DÉPEND DE Groupe A]
- [x] T3 — Tests : `src/lib/markdown-to-html.test.ts` (conversions + échappement + balise hors liste) et `src/app/api/chapter-draft/stream/route.test.ts` (zod 400, 404 chapitre inconnu) · preuve : `bun run test:run` verts, suite complète verte.

## Groupe C — Frontend / UI [DÉPEND DE Groupe A]
- [x] T4 — Navigation : `ViewId "brouillon-chapitre"` + entrée (icône PenTool, catégorie redaction, badge IA) dans `app-store.ts` ; import + case `page.tsx` · preuve : test:run vert, sidebar.
- [x] T5 — Créer `src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx` : sélection chapitre, longueur cible préremplie, multi-sélection références avec recherche, génération en direct + Arrêter, aperçu + compteur vs cible, rappel des références, Copier, Insérer (confirmation remplacement + version) → PUT chapitre → invalidations · preuve : navigateur (insertion + historique de versions contenant l'état antérieur).
- [x] T6 — Entrée dans le guide intégré · preuve : guide.

## Groupe D — Documentation [DÉPEND DE Groupe C]
- [x] T7 — Section du module dans `docs/NOTICE-UTILISATION.md` · preuve : cohérence code (compteurs globaux en fin de session).

## Convergence — 2026-10-02
Critères d'acceptation satisfaits : 11/11 (CA-1.1→1.4, CA-2.1→2.3, CA-3.1→3.4 — preuves : tests 1506/1506, génération SSE réelle en direct + Arrêter, aperçu « X mots / cible Y », insertion après AlertDialog → chapitre 1 957 mots/cible 2 000, 2 versions dans l'historique dont l'état antérieur, copie)
Écarts au plan : aucun fonctionnel ; preuve navigateur de l'insertion complétée par l'orchestrateur (l'agent délégué avait été coupé pendant la recette) ; incident environnemental SQLite readonly (journal chaud + double serveur de dev) résolu par redémarrage propre — sans rapport avec le code
Dette introduite : aucune
Verdict : **CONVERGÉ**

## Recette — 2026-10-03
Recette propriétaire déléguée : **ACCEPTÉE** — 11/11 CA confirmés (génération SSE ciblée chap. 7 / 400 mots / 2 références, confirmation de remplacement, 338 mots insérés, version 338 mots dans l'historique). Preuves : preuves.md + 2 captures.
