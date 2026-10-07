# Tâches — Mode « Expertise urbaine (URBANIS-DZ) »

## Groupe A — IA / prompts + test dédié
- [ ] T1 — Créer `src/lib/ai/specializations/urbanis-dz.ts` : `URBANIS_DZ_PROMPT = buildStandalonePrompt(<§2 du pack verbatim> + <passerelle « CONTEXTE D'INTÉGRATION (ThesisFrame) » 3 puces>)` · preuve : taille mesurée ≤ 7 000 car., grep des marqueurs.
- [ ] T2 — Enregistrer la spécialisation dans `index.ts` (export + entrée `SPECIALIZATION_PROMPTS['expertise-urbaine-dz']`) · preuve : import lint-clean, résolution du registre.
- [ ] T3 — Créer `src/lib/ai/specializations/urbanis-dz.test.ts` : invariants structurels (12 règles dures, M1-M7, RISQUES, FORMAT DE SORTIE, passerelle), autoporteur (CA-2.2), câblage data+registre (CA-1.1/2.1), garde-fou ≤ 7 000 car., snapshot anti-dérive · preuve : vitest verts.

## Groupe B — Données / UI [DÉPEND DE Groupe A]
- [ ] T4 — Ajouter l'entrée `expertise-urbaine-dz` dans `WRITING_MODES` (`src/data/ai-writing-modes.ts`) : label, description avec « avis technique non opposable », placeholder, icon `Building2`, category `analysis`, temperature `0.4`, systemPrompt `""` · preuve : lint + import.
- [ ] T5 — UI `ai-writing-page.tsx` : importer + enregistrer `Building2` dans `ICON_MAP` ; note conditionnelle ambre sous la zone de saisie quand le mode est actif (« Avis technique non opposable — toute règle juridique doit être vérifiée au JORADP ») · preuve : recette navigateur CA-1.4.

## Groupe C — Non-régression / docs [DÉPEND DE Groupe B]
- [ ] T6 — Suite complète + lint · preuve : vitest 0 échec (baseline 70/1 558 + nouveaux), lint 0 erreur / 231 warnings, lignes rouges 0 diff.
- [ ] T7 — `docs/ARCHITECTURE-CONNAISSANCE.md` : section « 6 quater » (mode URBANIS-DZ : source pack v1.1, canal autoporteur sans noyau, intégrité citations, non-opposabilité/JORADP) · preuve : lecture.
