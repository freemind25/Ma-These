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

## Groupe A — Schéma (2026-10-07, 11:58)

### Groupe A — Schéma
Tâches : T1
Fichiers modifiés : `prisma/schema.prisma` (+23 l. modèle `LegalRef`), `db/custom.db` (base versionnée, amend)
Vérifications exécutées : db:push additif — survie AVANT `{"skills":58,"chapters":7,"versions":6,"stamps":0,"vstamps:1}` = APRES (mêmes comptes) + `legalRefs:0` ; serveur dev redémarré (leçon cycle 12).
Sorties : `bun .tmp/survival.mjs` → `{"skills":58,"chapters":7,"versions":6,"stamps":0,"vstamps":1,"legalRefs":0}` ; HTTP 200.
CA couverts : support de CA-1.x/3.x.
Écart au plan : aucun.
Statut proposé : à recetter (déléguée)

## Groupe B — IA / prompts + tests (2026-10-07, 12:00-12:04)

### Groupe B — IA / prompts + tests
Tâches : T2, T3, T4
Fichiers modifiés : `src/lib/ai/legal-refs.ts` (créé, ~160 l.), `src/lib/ai/legal-refs-server.ts` (créé), `src/lib/ai/knowledge-stamp.ts` (+53 l. : `legalRefs?` additif, summary/detail étendus), `src/lib/ai/legal-refs.test.ts` (créé, 9 tests), `src/lib/ai/knowledge-stamp.test.ts` (+4 tests)
Vérifications exécutées : vitest 23/23 verts (2 échecs intermédiaires de TEST corrigés — arithmétique budget, casse garde-fou) ; lint 0 erreur.
Sorties : `Tests 23 passed (23)` ; `✖ 231 problems (0 errors, 231 warnings)` (baseline — après nettoyage de `.tmp/survival.mjs` scanné par eslint, fausse alerte +1 consignée).
CA couverts : CA-2.2, CA-2.3 (lib), CA-3.2 (composition verbatim).
Écart au plan : aucun.
Statut proposé : à recetter (déléguée)

## Groupe C — Backend (2026-10-07, 12:05-12:10)

### Groupe C — Backend
Tâches : T5, T6
Fichiers modifiés : `src/app/api/legal-refs/route.ts` + `[id]/route.ts` (créés), `src/app/api/ai-writing/stream/route.ts` (+16 l. injection conditionnelle), `src/app/api/ai-writing/stream/route.test.ts` (+3 tests)
Vérifications exécutées : vitest stream 17/17 (14 préexistants + 3 : URBANIS-DZ + registre au stamp SSE ; autre mode byte-identique + `getActiveLegalRefs` jamais appelé ; URBANIS-DZ 0 active → prompt inchangé) ; lint 0 erreur / 231.
Sorties : `Tests 17 passed (17)`.
CA couverts : CA-2.1 (canal), CA-2.2 (byte-identique ×2 modes).
Écart au plan : aucun.
Statut proposé : à recetter (déléguée)

## Groupes D + E — UI + seed (2026-10-07, 12:11-12:16)

### Groupes D + E — UI + seed
Tâches : T7, T8, T9
Fichiers modifiés : `src/modules/livres-competences/registre-juridique-tab.tsx` (créé, ~430 l.), `src/modules/livres-competences/livres-competences-page.tsx` (+9 l. : import, TabsTrigger `registre`, TabsContent), `scripts/seed-legal-refs.ts` (créé, 27 entrées), `.gitignore` (+1 l., écart Art. 4), `db/custom.db` (27 entrées)
Vérifications exécutées : lint ciblé 0 problème sur les fichiers UI ; seed exécuté 2× — `SEED: 27 entrées créées (§3: 13, §4: 14)` puis `SKIP: registre déjà alimenté (27 entrées) — idempotent` ; `{"total":27,"enabled":27,"s3":4,"vigilanceVerbatim":"À vérifier au JORADP."}`.
CA couverts : CA-1.1→1.3 (UI), CA-3.1, CA-3.2 (seed).
Écart au plan : 27 entrées (pas 36 — estimation d'analyse corrigée sur verbatim) ; `.gitignore` inscrit Art. 4.
Statut proposé : à recetter (déléguée)

## Groupe F — Non-régression + recette déléguée (2026-10-07, 12:17-12:35)

### Groupe F — Non-régression
Tâches : T10, T11
Fichiers modifiés : `docs/ARCHITECTURE-CONNAISSANCE.md` (+30 l., § 6 quinquies)
Vérifications exécutées : suite complète **1 585/1 585 verts** (baseline 1 569 + 16 : 9 legal-refs + 4 stamp + 3 stream) ; lint **0 erreur / 231 warnings** ; lignes rouges 0 diff à chaque commit.
Sorties : `Tests 1585 passed (1585)`.

### Compte rendu de recette — urbanis-dz-registre
Tâches recettées : T1→T11 (groupes A-F, cases cochées après recette déléguée)
Vérifications exécutées (agent-browser) :
1. CA-1.1 — module Livres & compétences : tablist 6 onglets dont « Registre juridique » ; panneau : « 27 entrées · 27 utilisées par l'IA (mode Expertise urbaine URBANIS-DZ). Avis technique non opposable — toute règle juridique doit être vérifiée au JORADP. » ; cartes avec switches et Modifier/Supprimer.
2. CA-3.2 — statuts affichés verbatim : « En vigueur ; version consolidée à vérifier. », « Texte modificatif. », « À vérifier dans sa version à jour. », « À vérifier au JORADP. »…
3. CA-1.2 — dialog création (11 champs dont Select niveau de confiance + date) : POST réel → **défaut trouvé et corrigé** (500 PrismaClientValidationError : `statut` NOT NULL recevait `null`) ; correctif POST/PUT prouvé **curl 201** (`statut:"à vérifier"`, `enabled:false`) ; entrée affichée en UI après re-mount.
4. CA-1.3 — switch défaut `false` ; clic programmatique (overlay, friction connue) → API `enabled:true` ; persiste après re-mount de l'onglet.
5. Suppression — clic UI → COUNT 27, entrée absente.
6. CA-2.1 — génération live mode Expertise urbaine (banc d'essai T4) : note ambre présente (`true`) ; bloc « Provenance des savoirs » (`provenance:true`) avec résumé « **+ 27 entrées du registre juridique** » (`registre:true`) ; détail déplié : `[R1]`/`Loi n° 90-29`/« injectée en intégral »/« vérifier au JORADP » tous `true`.
7. CA-2.2 — prouvé par tests vitest (autre mode + 0 active : prompts byte-identiques, `getActiveLegalRefs` non appelé, pas de `legalRefs` au stamp).
8. CA-2.3 — prouvé par tests vitest (budget 8 000, index tronqué propre) ; en pratique le registre (≈6 350 car.) tient en intégral.
9. Mobile 390×844 — `scrollW: 390` (pas de scroll horizontal), panneau registre visible.
10. Console — 0 erreur page.
Captures : `test-snapshots/urbanis-registre-stamp-detail.png`, `urbanis-registre-mobile-390.png`.

Note d'exécution : frictions d'automatisation uniquement (overlay sur switch/boutons — clics programmatiques React natifs, contournement établi au cycle 13) ; 1 timeout de commande (découpage) — aucun défaut produit hors le POST 500 corrigé.

```
### Compte rendu de recette — urbanis-dz-registre
Tâches recettées : T1→T11 (groupes A, B, C, D+E, F — cases cochées après recette déléguée)
Vérifications exécutées : vitest 1 585 verts, lint 0 erreur / 231 baseline, recette navigateur 10 contrôles (CRUD complet, génération live + stamp registre, mobile 390 px), 0 erreur console
CA couvertes : 8/8 (CA-1.1→1.3, CA-2.1→2.3, CA-3.1→3.2)
Défauts trouvés : 1 produit (POST 500 statut NOT NULL) — corrigé dans le groupe, re-prouvé (curl 201 + toggle + suppression)
Écart au plan : 3 consignés (27 vs 36 entrées ; .gitignore Art. 4 ; rien d'autre)
Statut : RECETTÉE (délégation) — CONVERGÉ, révisable à la recette du propriétaire
```
