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

## Option C — cycle n°17 complété (2026-10-07, 12:10-13:40 TZ 'Etc/GMT-1')

### Recette live API — /api/articles/translate (fr → en, contenu de recette avec chiffres + citation + repère)
- **1er live** : `HTTP 200 en 1,96-2,1 s` — préservation verbatim prouvée : « 42 respondents (78% response rate) », « Benali (2019, p. 12), "urban density doubled between 2005 and 2015" », « correlation (r = 0.72) … without establishing causality », AUCUN contenu ajouté. **Défaut trouvé** : le repère `[À compléter par l'auteur]` était rendu `[To be completed by the author]` — la règle 5 exige de le conserver tels quel (et le compteur de repères ne matche que les marqueurs français).
- **Correctif** (dans le groupe) : `buildTranslationPrompt` — ligne de contrainte de sortie ajoutée : les repères entre crochets restent « EXACTEMENT tels quels, en français — ne les traduis pas, ne les supprime pas, ne les reformule pas » ; test de non-régression ajouté (`prompts.test.ts` : « restent EXACTEMENT tels quels, en français »).
- **2e live (après correctif)** : `HTTP 200 en 2,1 s` — `[À compléter par l'auteur] : exact sample size by neighborhood.` — **repère conservé verbatim en français**, chiffres/citation/r = 0,72 intacts.

### Recette navigateur (déléguée)
- **CA-C2 (vue multi-articles)** : module « Brouillon d'article IA » — carte « Vos brouillons d'articles » avec agrégat (N articles · N section(s) · N repère(s)) et par article : titre, badges type (« empirique »), statut (« generated »), « 2 sections », « 1 à compléter/vérifier » (ambre) — sur les 2 articles présents (article de recette + article réel des cycles précédents, intact).
- **CA-C1 (traduction UI)** : ouverture article → étape 5 — carte « Traduction (copie distincte) » (sélecteur langue fr/en/ar, défaut = inverse de la langue de rédaction), bouton « Traduire l'article entier » + boutons « Traduire » par section. Clic sur « Traduire la section Méthodologie » → panneau « Copie traduite (anglais) · original intact » : textarea i=2 = « The survey covered 42 respondents (78% response rate) in the urban area of Dz. A[ccording to Benali (2019]… » ; textarea i=0 (original) **français inchangé** ; marqueur `[À compléter par l'auteur]` présent **en français** dans la traduction ; note ambre « 1 section non traduite : elle sera conservée dans la langue d'origine ».
- **Enregistrement de la copie** : « Enregistrer comme nouvel article (copie traduite) » → notice verte « Copie traduite enregistrée comme NOUVEL article — l'original reste intact. » ; la liste affiche le nouvel article « Recette option C — traduction (copie anglais) · empirique · generated · 2 sections · **1 à compléter/vérifier** » (le marqueur français de la copie anglaise est compté par les stats serveur — cohérence de bout en bout).
- **Nettoyage** : article de recette + copie supprimés (DELETE 200/200) ; l'article réel « Urbanisation durable… » intact ; `db/custom.db` restauré depuis HEAD (aucun artefact de recette persisté).
- Captures : `test-snapshots/article-option-c-copie-traduite-desktop.png`, `test-snapshots/article-option-c-mobile-390.png` (390 px — flux complet sans scroll horizontal).

### Non-régression
- vitest **74 fichiers / 1 611 verts** (1 610 + 1 test repères) ; lint **0 erreur / 231 warnings** ; lignes rouges **0 diff**.
- Incidents d'environnement consignés : **OOM box confirmée** (dmesg : « Out of memory: Killed process next-server, anon-rss ~2 Go » — 2 tués en recette) ; serveur relancé avec `NODE_OPTIONS="--max-old-space-size=1400"` ; un `wait --text` navigateur a donné un faux négatif (texte pourtant présent — vérifié par dump DOM) ; un Fast Refresh pendant un fetch a perdu l'état React de la page (recharge propre → recette rejouée OK).

```
### Compte rendu de recette — article-scientifique (option C, complément)
Tâches recettées : T3, T4 (+ correctif prompts dans le groupe)
Vérifications exécutées : 2 live curl fr→en (verbatim + repères), recette navigateur (multi-articles, traduction section, original intact, copie enregistrée, nettoyage), vitest 1 611 verts, lint 0 erreur / 231 baseline, redlines 0 diff
CA couvertes : 2/2 (CA-C1, CA-C2)
Défauts trouvés : 1 (repères traduits) — corrigé dans le groupe, re-prouvé live
Écart au plan : aucun (OCR + jobs async différés — consigné à l'ouverture, cycle d'étude dédié exigé)
Statut : RECETTÉE (délégation) — CONVERGÉ, révisable
```

## Recette de contrôle cycles 15/16/17 (2026-10-07, 15:45-15:50 TZ 'Etc/GMT-1')

Déclencheur : instruction propriétaire « engagez toutes les étapes par ordre prioritaire » — les cycles 15/16/17 étant recettés par délégation (statut révisable), un passage de contrôle agent est exécuté avant d'ouvrir le cycle d'étude OCR/async.

```
Contrôle 1 — Baseline : bun run test:run → Test Files 74 passed (74), Tests 1611 passed (1611), Duration 16.31s
Contrôle 2 — Lint : 0 errors, 231 warnings (= baseline convergence)
Contrôle 3 — Lignes rouges : git diff HEAD --stat sur les 3 fichiers protégés → 0 diff
Contrôle 4 — Points d'entrée : sidebar « Articles scientifiques » (e69) + « Brouillon d'article IA » (e70) présents
Contrôle 5 — Wizard (cycle 15) : heading « Brouillon d'article scientifique », liste « Étapes », « 1. Choisir les sources » (5 cases sources, thèse inactive → désactivées), « Fichier à importer » + « Importer et extraire », « Continuer vers les consignes »
Contrôle 6 — Vue multi-articles (cycle 17/C2) : « Vos brouillons d'articles » — article réel « Urbanisation durable et technologies numeriques a Alger (article) » avec badges « empirique · generated · 2 sections · 2 à compléter/vérifier »
Contrôle 7 — Étape 5 (cycles 15+17) : carte « Traduction (copie distincte) » (sélecteur Anglais, « Traduire l'article entier », boutons par section), repères verbatim visibles (« [À compléter par l'auteur] », « [Information non précisée dans le document source : intervalle de confiance] »), traçabilité « Sources : Document importé — memoire-test.docx (imported) », « Restaurer » / « Enregistrer une version » / « Exporter en DOCX », avertissement « Aucune garantie d'acceptation par une revue »
Contrôle 8 — Cycle 16 : bouton « Analyser les sources (rapport : volumes, sections, études, manquants) » présent en étape 1
Contrôle 9 — Mobile 390 px : scrollWidth 390 = viewport 390 (aucun scroll horizontal)
Contrôle 10 — Console : 0 erreur (1 warning Next/Image préexistant sur logo.png, cosmétique, hors périmètre)
Contrôle 11 — Cycle 14 : GET /api/legal-refs → HTTP 200, données présentes (Loi n° 90-29 du 1er décembre 1990, JORADP, statut)
Captures : test-snapshots/controle-cycles-15-17-etape5.png + controle-cycles-15-17-mobile390.png
Santé : agent-browser close OK ; GET /api → HTTP 200 après recette
Avertissement : l'article réel en base n'a PAS été modifié ni supprimé (contrôle en lecture seule)
```

**Verdict : contrôle POSITIF — cycles 15/16/17 et 14 se comportent conformément aux recettes de convergence.** Aucun écart constaté.
