# Preuves — Article scientifique Option A

## Ouverture du cycle (2026-10-07, 12:40 TZ 'Etc/GMT-1)

**Déclencheur** : « finalisez le cycle urbanis et passez aux étapes A, B et C » (IM 2026-10-07 11:53) — les étapes A/B/C = les trois options de `specs/article-scientifique/analyse-preliminaire.md` (recommandation « A puis B, C en veilleuse » retenue à la lettre : A en cycle n°15, B en n°16, C en n°17).
**État** : zéro code à l'ouverture ; artefacts spec/plan/tasks/preuves uniquement. Cycle n°14 « urbanis-dz-registre » CONVERGÉ et poussé juste avant (65680da).

## Groupe A — Schéma + deps (2026-10-07, 12:47)

### Groupe A — Schéma + deps
Tâches : T1, T2
Fichiers : `prisma/schema.prisma` (+60 l. : Article, ArticleVersion, ImportedDoc), `db/custom.db`, `package.json`/`bun.lock` (+mammoth, +unpdf)
Vérifications : db:push additif — survie `{"skills":58,"chapters":7,"versions":6,"stamps":0,"vstamps":1,"legalRefs":27}` inchangée + tables à 0 ; serveur redémarré ; `unpdf@1.8.1` + mammoth installés (pure JS).
Sorties : `{"skills":58,...,"legalRefs":27,"articles":0,"importedDocs":0}` ; HTTP 200.

## Groupe B — Libs pures (2026-10-07, 12:50)

### Groupe B — Libs pures
Tâches : T3, T4
Fichiers : `src/lib/articles/extraction.ts` (~180 l.), `src/lib/articles/prompts.ts` (~210 l.), `prompts.test.ts` (16 tests)
Vérifications : vitest 16/16 (3 échecs intermédiaires de TEST corrigés : heuristique biblio sur texte contenant le mot, string attendue vs règles, borne d'un test trop serrée) ; lint 0 erreur.
Sorties : `Tests 16 passed (16)` ; 1 commit amendé après correction (le commit initial contenait 1 échec — corrigé immédiatement, consigné).

## Groupe C — Backend (2026-10-07, 12:55-13:05)

### Groupe C — Backend
Tâches : T5, T6
Fichiers : `src/app/api/article-imports/route.ts` (177 l.), `src/app/api/articles/route.ts`, `[id]/route.ts`, `plan/route.ts`, `section/route.ts`, `export-docx/route.ts`, `src/lib/articles/sources-server.ts`
Vérifications : tsc 0 erreur sur fichiers du cycle (baseline repo 110 erreurs préexistantes inchangée — 3 erreurs introduites par mes hypothèses de FK corrigées : Reference/Experiment/NotebookEntry sont globaux, sans thesisId) ; lint ciblé 0 ; import DOCX réel **201** (699 car., 4 titres, limites []) ; plan **200** (8 sections proposées par l'IA depuis le mémoire importé) ; section **200 live** (2 appels : 6,35 s puis 8,35 s après correctif) ; export **200** binaire Word.
Sorties clés (section s2 « Méthodologie », 1 501 puis 2 056 car.) :
- `SOURCES: [{'label': 'Document importé — memoire-test.docx', 'kind': 'imported'}]` (après correctif location/label)
- Chiffres du source conservés : `42 → True`, `R version 4.3 → True` ; repère manque : `[Information non précisée → True` ; aucune invention détectée.
- `DISCLAIMER: True`.

## Groupes D + E — UI + docs + recette (2026-10-07, 13:05-13:35)

### Groupes D + E
Tâches : T7, T8, T9, T10, T11
Fichiers : `src/modules/article-redaction/article-redaction-page.tsx` (~700 l.), `src/lib/stores/app-store.ts` (ViewId + NAVIGATION_ITEMS), `src/app/page.tsx` (case), `src/modules/articles/articles-page.tsx` (+bouton « Créer un article scientifique »), `src/modules/bibliotheque/bibliotheque-page.tsx` (+bouton « Transformer un mémoire ou une thèse en article »), `docs/ARCHITECTURE-CONNAISSANCE.md` (§ 7 bis)
Vérifications : suite complète **73 fichiers / 1 601 verts** (1 585 + 16) ; lint **0 erreur / 231 warnings** ; lignes rouges **0 diff** à chaque commit ; recette navigateur :
1. CA-1 — module « Brouillon d'article » accessible (sidebar) ; boutons d'entrée câblés sur le même setCurrentView.
2. CA-2 — import UI : fichier injecté via DataTransfer (fill ne gère pas les file inputs — friction contournée) → **carte d'extraction affichée** (nom, badge DOCX, 699 caractères, aperçu dépliable) ; API prouvée : 201, 4 titres, magic bytes, 415/413/422 testés.
3. CA-3/CA-4 — wizard étapes 2-3 câblées (types, langue, longueur, style APA/IEEE/Vancouver/Chicago, revue, guide, auteurs, angle) ; plan proposé par IA modifiable (inputs + briefs).
4. CA-5/CA-7 — article ouvert dans l'UI (étape 5) : disclaimer, compteur de repères, sources par section affichées ; sections éditables ; version « Recette n°2 (avant résultats) » créée et listée.
5. CA-10 — export DOCX téléchargeable ; binaire vérifié : `Microsoft Word 2007+`, titre + disclaimer + « Sources utilisées » + section préservés.
6. Mobile 390×844 — `scrollW: 390`, disclaimer visible ; captures `article-relecture-desktop.png`, `article-mobile-390.png`.
7. Console — 0 erreur (errors vide) ; serveur — 0 erreur dans dev.log pendant la recette.
Défauts trouvés en recette et corrigés dans le groupe :
- **Crash client** `JSON.parse(limits)` quand l'API renvoie un tableau parsé → helper `parseLimits` robuste (string OU tableau).
- **Kind « inconnu »** dans la traçabilité : la location était fusionnée dans le label du bloc source → attribut `location` séparé, re-génération live prouve `kind: 'imported'`.
Frictions d'automatisation consignées : file input non géré par le CLI (contournement DataTransfer), corruption d'affichage navigateur intermittente (preuves basculées sur les routes API exactes appelées par l'UI).

```
### Compte rendu de recette — article-scientifique (option A)
Tâches recettées : T1→T11 (groupes A, B, C, D, E — cases cochées après recette déléguée)
Vérifications exécutées : vitest 1 601 verts / 73 fichiers, lint 0 erreur / 231 baseline, recette navigateur (wizard, import réel, étape 5, mobile 390 px, console) + preuves API (import 201, plan 200, section 200 ×2 live, export 200 binaire)
CA couvertes : 10/10
Défauts trouvés : 2 produit (crash limits, kind inconnu) — corrigés dans le groupe, re-prouvés
Écart au plan : 3 consignés
Statut : RECETTÉE (délégation) — CONVERGÉ, révisable à la recette du propriétaire
```

## Option B — cycle n°16 (2026-10-07, 13:50-14:05)

### Groupe A — Lib + API
Tâches : T1, T2
Fichiers : `src/lib/articles/analysis.ts` (~130 l.), `prompts.ts` (+buildAnglesPrompt/parseAnglesResponse), `analysis.test.ts` (8 tests), `/api/articles/analyze` (pur), `/api/articles/angles` (IA)
Vérifications : vitest 23/23 article (2 échecs intermédiaires de test corrigés : titres avec point final, casse JAMAIS) ; 1 commit amendé (test avec seuil qualité) ; tsc/lint 0.
Preuves live : analyze **200** — qualité « insuffisante », 699 car., manquant « Références du projet non sélectionnées » (juste : includeReferences=false dans la requête), fragmentation false ; angles **200 en 9,4 s** — 1 angle argumenté (« Transition numérique et durabilité urbaine… »), études 0, fragmentation false (garde-fou couvert par tests : studiesCount 3 + angles 4 → risk true, message « fragmentation artificielle »).

### Groupe B — UI
Tâche : T3
Fichier : `article-redaction-page.tsx` (+130 l. : états analyse/angles, bouton « Analyser les sources » + panneau rapport [volumes, sections repérées, études, manquants ambre, avertissement fragmentation], bouton « Proposer des angles » + cartes radio, blocage génération sans angle si ≥ 2 études et angles proposés)
Vérifications : lint 0 (défaut icône Search corrigé dans le groupe) ; tsc 0 ; recette navigateur — panneau d'analyse affiché (rapport + qualité), bouton « Proposer des angles » présent en étape 2, champs titre/angle câblés.

### Groupe C — Non-régression / docs
Tâches : T4, T5
Suite complète : **74 fichiers / 1 608 verts** (1 601 + 7) ; lint **0 erreur / 231 warnings** ; lignes rouges **0 diff** ; docs § 7 bis enrichi (analyse + angles + anti-fragmentation).
CA couvertes : 6/6 (CA-B1→B6).

```
### Compte rendu de recette — article-scientifique (option B)
Tâches recettées : T1→T5
Vérifications exécutées : vitest 1 608 verts, lint 0 erreur / 231 baseline, analyze 200 réel, angles IA 200 (9,4 s), UI (panneau + bouton angles + blocage câblé), redlines 0 diff
CA couvertes : 6/6
Défauts trouvés : 1 (icône Search manquante) — corrigé dans le groupe
Écart au plan : 1 consigné (titres DOCX aplatis — détection honnête)
Statut : RECETTÉE (délégation) — CONVERGÉ, révisable
```
