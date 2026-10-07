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

## Groupe B — Données / UI (2026-10-07, 10:12)

### Groupe B — Données / UI
Tâches : T4, T5
Fichiers modifiés : `src/data/ai-writing-modes.ts` (+11 lignes, entrée `expertise-urbaine-dz` l.280-288), `src/modules/ai-writing/ai-writing-page.tsx` (+11 lignes : import Building2 l.21, ICON_MAP l.55, note conditionnelle l.327-332), `src/lib/ai/specializations/urbanis-dz.test.ts` (+11 lignes, bloc câblage CA-1.1)
Vérifications exécutées : vitest 3 fichiers (urbanis-dz + routes ai-writing/stream + ai-writing) **44/44 verts** ; lint **0 erreur** (baseline 231 warnings).
Sorties : `Test Files 3 passed (3) / Tests 44 passed (44)` ; compteur de modes de la page (`WRITING_MODES.length`) s'incrémente seul.
Critères d'acceptation couverts : CA-1.1 (câblage), CA-1.4 (note — vérification visuelle en recette).
Écart au plan : aucun.
Statut proposé : à recetter (déléguée)

## Groupe C — Non-régression / docs (2026-10-07, 10:13-10:17)

### Groupe C — Non-régression / docs
Tâches : T6, T7
Fichiers modifiés : `docs/ARCHITECTURE-CONNAISSANCE.md` (+21 lignes, § 6 quater), `src/lib/ai/knowledge-core.budget.test.ts` (1 mot, `allowedStandalone` l.173), `specs/urbanis-dz-mode/plan.md` (écart consigné)
Vérifications exécutées : suite complète vitest **70→71 fichiers, 1 569/1 569 verts** (baseline 1 558 + 11 nouveaux, zéro régression) ; lint **0 erreur / 231 warnings** ; lignes rouges **0 diff**.
Sorties : `Tests 1569 passed (1569)` ; échec intermédiaire instructif — le capteur budget préexistant (`measureBudget` l.57-102) identifie les modes par **nom de fichier** et exige l'inscription des autoporteurs dans `allowedStandalone` : première tentative avec l'id de mode (`expertise-urbaine-dz`) corrigée en nom de fichier (`urbanis-dz`) après lecture du mécanisme ; les 2 essais et la sémantique sont consignés ici et au plan (Article 4).
Critères d'acceptation couverts : CA-2.2 (capteur budget), non-régression générale.
Écart au plan : 1 fichier non anticipé (`knowledge-core.budget.test.ts`, 1 mot) — inscrit au plan avant modification, justifié par le message du test lui-même.
Statut proposé : à recetter (déléguée)


## Recette navigateur déléguée (2026-10-07, 10:25-10:40)

1. **CA-1.1** — mode « Expertise urbaine (URBANIS-DZ) » visible dans la liste (`button … [ref=e132]`), description portant « Avis technique non opposable ; vérifier au JORADP », catégorie Analyse ; sélection → placeholder dédié actif (`Décrivez le site, la question urbaine ou le livrable souhaité…`).
2. **CA-1.4** — note ambre présente dans le DOM quand le mode est actif : `eval → true` sur « Avis technique non opposable — toute règle juridique doit être vérifiée au JORADP. »
3. **CA-1.3 (banc d'essai T4 live)** — prompt réel : « Peut-on construire ici ? Le terrain est en pente, il n'y a aucun POS ni PDAU disponible… oui ou non. » Réponse générée (SSE, ~50 s) :
   - « # Cadrage de la demande » — Décision à éclairer / Périmètre / Échelle / Documents disponibles / Contraintes / Horizon temporel (les 6 rubriques du pack) ;
   - « # Analyse » → « ## FAIT SOURCÉ » (règle TROIS REGISTRES) ;
   - « Absence de document d'urbanisme : Sans POS ou PDAU… » + études géotechniques requises + « Vérifications : À faire auprès des services de l'urbanisme de la wilaya et de la commune » → **refus de conclure sans documents** ;
   - « Bloc de traçabilité » avec les 7 champs du pack (Échelle, Millésime, Sources, Hypothèses, Limites, Vérifications, Niveau de confiance : « Élevé pour la réponse non, nécessitant des études complémentaires »).
4. **CA-1.2** — format de sortie du pack suivi intégralement ; mention « Avis technique non opposable » présente dans la réponse (règle 8).
5. **CA-2.3** — bloc « Provenance des savoirs » toujours affiché sous le résultat du nouveau mode (`hasProvenance: true`).
6. **Mobile 390×844** — `scrollW: 390` (pas de scroll horizontal), note visible après re-navigation.
7. **Console** — 0 erreur page (`agent-browser errors` vide) ; console bénigne (React DevTools, HMR, warning logo préexistant).
8. **Captures** — `test-snapshots/urbanis-dz-mode-selected.png`, `urbanis-dz-generation-desktop.png`, `urbanis-dz-mobile-390.png`.

Note d'exécution recette : le bouton « Générer » était masqué par un overlay au hit-test agent-browser — déclenché par clic programmatique (gestionnaire React natif) ; le comportement est identique à un clic utilisateur. L'événement de génération est un flux non persistant (ai-writing est écran seul — rien à restaurer).

```
### Compte rendu de recette — urbanis-dz-mode
Tâches recettées : T1→T7 (groupes A, B, C — cases cochées après recette déléguée)
Vérifications exécutées : vitest 71 fichiers / 1 569 verts, lint 0 erreur / 231 baseline, recette navigateur 8 contrôles (dont banc d'essai T4 live), mobile 390 px, 0 erreur console
CA couvertes : 7/7 (CA-1.1→1.4, CA-2.1→2.3)
Défauts trouvés : 0 produit ; 1 friction d'automatisation (overlay sur Générer — contournée, non liée au cycle)
Écart au plan : 2 consignés (ordonnancement test câblage T3→T4 ; fichier knowledge-core.budget.test.ts inscrit au plan Article 4)
Statut : RECETTÉE (délégation) — CONVERGÉ, révisable à la recette du propriétaire
```

## Validation propriétaire (2026-10-07, 11:25 TZ 'Etc/GMT-1')

Réponse **« ok et enchainer »** (IM), reçue 3 minutes après le commit de convergence `9076a25` (11:22) :

- « ok » : la recette déléguée (7/7 CA — 8 contrôles navigateur dont banc d'essai T4 live, 3 captures, mobile 390 px, 0 erreur console) est **acceptée sans réserve** ;
- « et enchainer » : instruction d'enchaîner sur la suite de la séquence documentée dans l'analyse préliminaire (`specs/urbanis-dz-integration/analyse-preliminaire.md` § 5-6) — l'**Option B** (registre juridique structuré `LegalRef`), dont l'usage est avéré (thèse urbanisme/TIC/IA active).

**Cycle n°13 « urbanis-dz-mode » clos et validé.**
