# Tâches — Générateur de brouillon de chapitre

## Groupe A — Backend / routes API [BLOQUANT]
- [ ] T1 — Créer `src/lib/markdown-to-html.ts` (liste blanche h2/h3/p/ul/ol/li/strong/em/blockquote, échappement HTML) · preuve : tests unitaires verts (T3).
- [ ] T2 — Créer `src/app/api/chapter-draft/stream/route.ts` (POST SSE : zod {chapterId, targetWords 300-8000, referenceIds ≤ 20}, chargement chapitre+thèse+cadrage+références, prompt strict « citer uniquement les références fournies », generateCompletionStream maxTokens 12 000, relance unique si troncature) · preuve : curl 400 invalides ; SSE `data: {type:'chunk'}` visible.

## Groupe B — Tests / non-régression [DÉPEND DE Groupe A]
- [ ] T3 — Tests : `src/lib/markdown-to-html.test.ts` (conversions + échappement + balise hors liste) et `src/app/api/chapter-draft/stream/route.test.ts` (zod 400, 404 chapitre inconnu) · preuve : `bun run test:run` verts, suite complète verte.

## Groupe C — Frontend / UI [DÉPEND DE Groupe A]
- [ ] T4 — Navigation : `ViewId "brouillon-chapitre"` + entrée (icône PenTool, catégorie redaction, badge IA) dans `app-store.ts` ; import + case `page.tsx` · preuve : test:run vert, sidebar.
- [ ] T5 — Créer `src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx` : sélection chapitre, longueur cible préremplie, multi-sélection références avec recherche, génération en direct + Arrêter, aperçu + compteur vs cible, rappel des références, Copier, Insérer (confirmation remplacement + version) → PUT chapitre → invalidations · preuve : navigateur (insertion + historique de versions contenant l'état antérieur).
- [ ] T6 — Entrée dans le guide intégré · preuve : guide.

## Groupe D — Documentation [DÉPEND DE Groupe C]
- [ ] T7 — Section du module dans `docs/NOTICE-UTILISATION.md` · preuve : cohérence code (compteurs globaux en fin de session).
