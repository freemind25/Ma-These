# Tâches — Pack Soutenance

## Groupe A — Schéma [BLOQUANT]
- [ ] T1 — Ajouter le modèle `SoutenancePrep` 1:1 (thesisId @unique, slides/speech/questions JSON-string, speechDurationMin, timestamps, cascade) à `prisma/schema.prisma` · preuve : `prisma migrate diff` avant/après (table ajoutée, 0 colonne modifiée) + `db:push` + survie des données existantes (comptes avant/après).

## Groupe B — Backend / routes API [DÉPEND DE Groupe A]
- [ ] T2 — Ajouter les schémas zod `soutenance` à `src/lib/api-schemas.ts` + créer `src/app/api/thesis/[id]/soutenance/route.ts` (GET record|null, PUT upsert, 400 zod, enveloppe {data}/{error}) · preuve : curl GET→null, PUT, GET persistant, 400.
- [ ] T3 — Créer `src/lib/ai/prompts/soutenance-prompts.ts` (3 prompts : slides JSON / discours durée / questions 10 par familles) + `src/app/api/soutenance/generate/route.ts` (POST zod, contexte thèse tronqué ≤ 40 000 chars prouvé, generateCompletion maxTokens 2500/8000/6000, extraction JSON, 502 si parse échoue) · preuve : curl 400 sans config/invalide ; log comptage contexte.

## Groupe C — Frontend / UI [DÉPEND DE Groupe B]
- [ ] T4 — Enregistrer la navigation : `ViewId "soutenance"` + entrée `NAVIGATION_ITEMS` (icône ClipboardCheck, catégorie methodologie, badge IA) dans `src/lib/stores/app-store.ts` ; import + case dans `src/app/page.tsx` · preuve : test:run vert (ids uniques), module dans la sidebar.
- [ ] T5 — Créer `src/modules/soutenance/soutenance-page.tsx` : 3 onglets, états vides, génération (spinners, toasts, relance confirmée), copie, persistance react-query, restauration à l'ouverture · preuve : navigateur.
- [ ] T6 — Entrée du module dans le guide intégré `src/components/layout/usage-guide-dialog.tsx` · preuve : guide affiche l'entrée.

## Groupe D — Tests / non-régression [DÉPEND DE Groupe B]
- [ ] T7 — Tests vitest des 2 routes (GET/PUT incl. 400 ; generate : zod 400, 502 sur JSON invalide mocké) · preuve : `bun run test:run` verts, suite complète verte.

## Groupe E — Documentation [DÉPEND DE Groupe C]
- [ ] T8 — Section du module dans `docs/NOTICE-UTILISATION.md` (onglets, flux, persistance) · preuve : cohérence avec le code réel (compteurs globaux gérés en fin de session par l'orchestrateur).
