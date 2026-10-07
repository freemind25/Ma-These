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
