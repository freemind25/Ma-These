# Preuves — Mode « Expertise urbaine (URBANIS-DZ) »

## Ouverture du cycle (2026-10-07, 11:03 TZ 'Etc/GMT-1')

**Déclencheur** : le propriétaire a fourni le pack URBANIS-DZ v1.1 (PDF 5 pages, 18 761 car.) et demandé une analyse d'intégration ; l'analyse préliminaire (`specs/urbanis-dz-integration/analyse-preliminaire.md`, commit `0960639`) a proposé 3 options ; le propriétaire a répondu **« A »** (IM) — lancement du cycle Option A.

**Faits mesurés à l'ouverture** :
- Pack : §2 instruction système = **4 837 car.** ; §3 référentiel juridique = 2 815 ; §4 risques = 3 535 ; total 18 761.
- `src/lib/ai/specializations/index.ts` l.8-36/70+ : 27 spécialisations + registre `SPECIALIZATION_PROMPTS`.
- `src/lib/ai/prompt-builder.ts` l.101-104 : `buildStandalonePrompt` = spécialisation sans noyau.
- `src/app/api/ai-writing/stream/route.ts` l.32/49/94 : mode trouvé dans `WRITING_MODES`, prompt = `SPECIALIZATION_PROMPTS[mode]`, température des métadonnées.
- `src/modules/ai-writing/ai-writing-page.tsx` l.41-56 : `ICON_MAP` fixe (11 icônes), consommé l.240.
- `src/lib/ai/post-compaction-digestion.test.ts` l.55-95 : précédent de test de câblage par listes de modes.

**État** : zéro code écrit à l'ouverture — artefacts spec/plan/tasks/preuves uniquement.

## Groupe A — IA / prompts + test dédié (2026-10-07, 10:09-10:11)

### Groupe A — IA / prompts + test dédié
Tâches : T1, T2, T3
Fichiers modifiés : `src/lib/ai/specializations/urbanis-dz.ts` (créé, ~75 lignes), `src/lib/ai/specializations/index.ts` (+3 lignes), `src/lib/ai/specializations/urbanis-dz.test.ts` (créé, 97 lignes), `src/lib/ai/specializations/__snapshots__/urbanis-dz.test.ts.snap` (généré)
Vérifications exécutées : T1 taille prompt mesurée **4 870 car.** (≤ 7 000) ; T2 registre `'expertise-urbaine-dz': URBANIS_DZ_PROMPT` résolu ; T3 vitest `urbanis-dz.test.ts` **9/9 verts** + non-régression `post-compaction-digestion.test.ts` (33/33 avec le nouveau fichier, dont 24 préexistants) ; lint **0 erreur / 231 warnings** (baseline inchangée) ; lignes rouges **0 diff**.
Sorties : `Test Files 2 passed (2) / Tests 33 passed (33)` ; `PROMPT CAR: 4870` ; `✖ 231 problems (0 errors, 231 warnings)`.
Critères d'acceptation couverts : CA-2.1, CA-2.2.
Écart au plan : ordonnancement corrigé — le bloc « câblage mode + registre » du test exigeait l'entrée data (T4) : déplacé de T3 vers T4 (tasks.md ajusté avant commit, aucun fichier hors annonce).
Statut proposé : à recetter (déléguée)

