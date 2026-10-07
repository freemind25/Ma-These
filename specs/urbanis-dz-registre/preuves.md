# Preuves — Registre juridique structuré URBANIS-DZ

## Ouverture du cycle (2026-10-07, 11:55 TZ 'Etc/GMT-1)

**Déclencheur** : « finalisez le cycle urbanis et passez aux étapes A, B et C » (IM, 2026-10-07 11:53) — finalisation = exécution de l'Option B (registre juridique `LegalRef`) de `specs/urbanis-dz-integration/analyse-preliminaire.md` § 5, restée en pause depuis l'exploration ; les étapes A/B/C du générateur d'article scientifique suivent (cycles n°15-17). L'option C URBANIS (veille JORADP) reste en veilleuse conformément à l'analyse (pas d'API publique stable, cycle dédié exigé).

**Faits mesurés à l'ouverture** (chemins + lignes vérifiés aujourd'hui) :
- `src/lib/ai/book-skills.ts` l.11/14/17/27/42/61/90 : mécanique complète à dupliquer adaptée (122 l.).
- `src/lib/ai/knowledge-stamp.ts` : `KnowledgeStamp{coreVersion, skills[], generatedAt}` — extension additive.
- `src/app/api/ai-writing/stream/route.ts` l.62-75, 103 : points d'injection/stamp.
- `src/app/api/book-skills/route.ts` + `[id]/route.ts` : conventions CRUD (zod, `.nullish()`, 400/404).
- `prisma/schema.prisma` : `CustomBookSkill` l.319-332 ; aucun modèle LegalRef.
- UI : onglets `livres-competences-page.tsx` l.691-709 ; bloc stamp l.14-15/37/44.
- Registre §3+§4 du pack ≈ 6 350 car. → budget contenu 8 000 car. retenu.

**État** : zéro code écrit à l'ouverture — artefacts spec/plan/tasks/preuves uniquement.
