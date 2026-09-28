# Preuves — veille-academique

## Groupe A — Schéma (T1)

### 1. Dump AVANT — comptes de toutes les tables (bun + `$queryRawUnsafe` sur `sqlite_master`, script temporaire supprimé après usage)

```
AgileSprint: 0
AgileStory: 0
Chapter: 7
ChapterVersion: 0
CustomBookSkill: 58
DoctoralToolbox: 0
DocumentChunk: 1
ElementAnalyse: 1
Experiment: 1
ExperimentRun: 1
Job: 0
LicenseKey: 0
NotebookEntry: 1
Part: 0
Reference: 4
ResearchSource: 0
ResearchTab: 0
SessionVerification: 2
Thesis: 1
ThesisCadrage: 0
ThesisCadrageField: 0
ThesisCadrageVersion: 0
TypeAnalyseMethodologique: 1
```

23 tables — données réelles présentes (Thesis 1, Chapter 7, Reference 4, CustomBookSkill 58…).

### 2. Modification du schéma

`prisma/schema.prisma` : append après `model Job` (fin de fichier, l.466-508) — modèles `SavedSearch` et `SavedSearchResult`, **purement additifs** (aucune ligne des modèles existants modifiée — `git diff prisma/schema.prisma` n'affecte que des lignes ajoutées).

### 3. `bun run db:push` (alias `prisma db push --accept-data-loss`, package.json l.12)

```
$ prisma db push --accept-data-loss
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "custom.db" at "file:/home/z/my-project/db/custom.db"

🚀  Your database is now in sync with your Prisma schema. Done in 16ms

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 202ms
```

### 4. Dump APRÈS — 25 tables, tous les comptes existants identiques

```
AgileSprint: 0        | AgileStory: 0          | Chapter: 7
ChapterVersion: 0     | CustomBookSkill: 58    | DoctoralToolbox: 0
DocumentChunk: 1      | ElementAnalyse: 1      | Experiment: 1
ExperimentRun: 1      | Job: 0                 | LicenseKey: 0
NotebookEntry: 1      | Part: 0                | Reference: 4
ResearchSource: 0     | ResearchTab: 0         | SavedSearch: 0
SavedSearchResult: 0  | SessionVerification: 2 | Thesis: 1
ThesisCadrage: 0      | ThesisCadrageField: 0  | ThesisCadrageVersion: 0
TypeAnalyseMethodologique: 1
```

**Zéro perte de ligne** : les 23 comptes d'avant sont strictement identiques après push. Deux tables nouvelles à 0 (`SavedSearch`, `SavedSearchResult`).

### 5. Vérification des index réellement créés (`sqlite_master`)

```json
[
 { "name": "SavedSearchResult_savedSearchId_idx",
   "sql": "CREATE INDEX \"SavedSearchResult_savedSearchId_idx\" ON \"SavedSearchResult\"(\"savedSearchId\")" },
 { "name": "SavedSearchResult_savedSearchId_externalId_key",
   "sql": "CREATE UNIQUE INDEX \"SavedSearchResult_savedSearchId_externalId_key\" ON \"SavedSearchResult\"(\"savedSearchId\", \"externalId\")" }
]
```

L'unicité `@@unique([savedSearchId, externalId])` (CA-2.2, déduplication) est bien un index unique en base.

### 6. Smoke test CRUD (create → doublon → cascade delete), base rendue propre ensuite

```
crud: create ok, duplicate externalId → DUP-REFUSE (P2002)
cascade delete → résultats restants: 0
total SavedSearch: 0 | total SavedSearchResult: 0
```

- Création veille + résultat : OK.
- Doublon `externalId` même veille : refusé par Prisma (`P2002` = violation d'unicité).
- Suppression de la veille : cascade effective (0 résultat restant).
- État final : 0 / 0 — le smoke test ne laisse aucun résidu.

## Groupe B — Backend / routes API (T2-T6)

Note d'exécution : le premier POST a révélé que le client Prisma du serveur de dev
était périmé (`db.savedSearch` undefined — serveur démarré avant le `db:push` du
Groupe A) → redémarrage du serveur (`setsid -f`), preuve consignée. Second incident :
`skipDuplicates` non supporté par Prisma 6.19.2 sur SQLite (`Unknown argument`) →
corrigé dans le groupe : déduplication amont par `dedupeByExternalId` (les deux
branches de `createMany`), option supprimée.

### Cycle curl complet — HAL (`q=urbanisme`, `filters={"domain":"shs"}`)

**1. POST /api/veille** → `201`
```json
{"data":{"id":"cmu6smst80000py6kobfz5lbe","label":"Veille test — urbanisme","source":"hal","query":"urbanisme","filters":"{\"domain\":\"shs\"}","lastCheckedAt":null}}
```

**2. check n°1** — CA-2.1 (base de référence, aucun « nouveau ») :
```json
{"data":{"isFirstCheck":true,"fetchedCount":50,"newCount":0,"evictedCount":0,"storedTotal":50}}
```

**3. check n°2** — CA-2.2 (résultats identiques → jamais re-marqués) :
```json
{"data":{"isFirstCheck":false,"fetchedCount":50,"newCount":0,"evictedCount":0,"storedTotal":50}}
```

**4. GET /api/veille** — CA-2.4 + CA-3.2 :
```json
{"data":[{"id":"cmu6smst80000py6kobfz5lbe","label":"Veille test — urbanisme","source":"hal","query":"urbanisme","filters":{"domain":"shs"},"lastCheckedAt":"2026-09-18T10:07:24.330Z","totalResults":50,"unseenCount":0}],"meta":{"count":1}}
```

**5. Simulation d'évolution de la source** (éviction de 2 résultats via script temporaire
supprimé ensuite — même mécanisme que la rétention) : `evicted: 2 → restants: 48`

**6. check n°3** — CA-2.2 (les 2 inconnus reviennent marqués « nouveau ») :
```json
{"data":{"isFirstCheck":false,"fetchedCount":50,"newCount":2,"evictedCount":0,"storedTotal":50}}
```

**7. GET /api/veille** — compteur CA-3.2 : `"totalResults":50,"unseenCount":2`

**8. GET results** — ordre non vus d'abord :
```
meta: {"count": 50, "unseenCount": 2, ...}
ordre seen flags (10 premiers): [False, False, True, True, True, True, True, True, True, True]
premier non-vu: cmu6sot4q001fpy6k4k00z0uj | Au nom des Jeux : Une ethnographie multisituée de la fabriqu…
```

**9. PATCH vu partiel** `{ids:[...]}` — CA-3.1 : `{"data":{"markedSeen":1}}` → `unseenCount après partiel: 1`

**10. PATCH vu global** `{all:true}` — CA-3.1 : `{"data":{"markedSeen":1}}` → `unseenCount après global: 0`

**11. PATCH renommage** — CA-1.1 : `label: Veille renommée — urbanisme SHS`

**12. DELETE** — CA-1.2 : `{"data":{"deleted":true,"remainingResults":0}}` (cascade prouvée) ;
GET liste de retour : `{"data":[],"meta":{"count":0}}`

**13. Validation 400** (source invalide « pubmed ») : `400`

### Cycle curl — arXiv (`q=urban morphology`, `sort=submittedDate`)

```json
POST → {"data":{"id":"cmu6sqq4e001hpy6k1dfix9td","label":"Veille test arXiv — urban morphology","source":"arxiv",...}}
check n°1 → {"data":{"isFirstCheck":true,"fetchedCount":30,"newCount":0,"evictedCount":0,"storedTotal":30}}
check n°2 → {"data":{"isFirstCheck":false,"fetchedCount":30,"newCount":0,"evictedCount":0,"storedTotal":30}}
```
3 premiers résultats (normalisation itemsFromArxiv) :
```
- 2609.13029 | 2026 | Geometry of Urban Order
- 2609.07608 | 2026 | Solution for UCF UrbanTwin V2X-Real Track: Sim-to-Real…
- 2609.05744 | 2026 | Gaussian Linear Functional Manifold Method for Massive…
meta: 30 résultats, unseen 0
DELETE → {"data":{"deleted":true,"remainingResults":0}}
```

### Lint

```
✖ 230 problems (0 errors, 230 warnings)
```
0 erreur — les 230 warnings sont préexistants sur l'ensemble du dépôt (présents avant ce groupe).

### État final

Base rendue propre : 0 veille, 0 résultat (deux veilles de test supprimées, cascades prouvées).
Routes de recherche existantes (`theses-en-ligne/search`, `arxiv/search`) : jamais modifiées
(`git log --oneline -- src/app/api/theses-en-ligne/search/` inchangé hors tests).

### Recette complémentaire — exécution reprise après reprise de session (2026-09-18)

Les 5 fichiers T2-T6 ont été **refondus et re-recettés intégralement** (nouveau cycle curl,
jeu de requêtes différent : HAL `q=fablab` + `yearMin=2020`, arXiv `q=large language models`).
Cette recette élargit la précédente : validations 400 étendues, 404, simulation d'un nouveau
résultat (CA-2.2), test de rétention avec injection de 180 lignes, vérification des orphelins.

```
=== 1. GET /api/veille (vide) === {"data":[],"meta":{"count":0}}
=== 2. POST sans label (attendu 400) === {"error":"Le libellé de la veille est requis"} HTTP 400
=== 3. POST source invalide (attendu 400) === {"error":"Source invalide (attendu : \"hal\" ou \"arxiv\")"} HTTP 400
=== 4. POST sans query (attendu 400) === {"error":"La requête de recherche est requise"} HTTP 400
=== 5. POST veille HAL (201) ===
  {"data":{"id":"cmu6tdaph002cpy6k3723vty4","label":"Thèses sur les fablabs","source":"hal",
   "query":"fablab","filters":{"sort":"publicationDateY_i desc","yearMin":"2020"},...}} HTTP 201
=== 6. CHECK n°1 — CA-2.1 (base de référence, aucun « nouveau ») ===
  {"isFirstCheck":true,"fetchedCount":9,"added":9,"newCount":0,"totalResults":9,"unreadCount":0}
=== 7. CHECK n°2 (jeu identique) ===
  {"isFirstCheck":false,"fetchedCount":9,"added":0,"newCount":0}   ← déduplication CA-2.2
=== 8. GET /api/veille (compteurs CA-3.2) ===
  [{"label":"Thèses sur les fablabs","source":"hal","totalResults":9,"unreadCount":0,
    "lastCheckedAt":"2026-09-18T10:27:01.393Z"}]
=== 9. CHECK n°3 après éviction simulée d'un résultat (re-check → réinsertion en non-vu) ===
  {"isFirstCheck":false,"added":1,"newCount":1,"totalResults":9,"unreadCount":1}  ← CA-2.2 dynamique
=== 10. GET results — non-vu EN PREMIER ===
  meta {"count":9,"unreadCount":1} ; 1er élément seen:false, puis seen:true (firstSeenAt desc)
=== 11. PATCH partiel {"ids":[…]} === {"data":{"updated":1,"scope":"ids"}}
=== 12. PATCH corps invalide (attendu 400) === {"error":"Fournir { ids: [...] } ou { all: true }"} HTTP 400
=== 13. PATCH {"all":true} (plus rien de non-vu) === {"data":{"updated":0,"scope":"all"}}
=== 14. GET final === meta {"count":9,"unreadCount":0}
=== 15. PATCH renommage (CA-1.1) === label: "Veille fablabs (2020+)"
=== 16. PATCH renommage vide (attendu 400) === {"error":"Le nouveau libellé est requis"} HTTP 400
=== 17. avant suppression : résultats = 9
=== 18. DELETE (CA-1.2) === {"data":{"deleted":true,…}} ; veilles restantes: 0 ; résultats orphelins: 0
=== 19. POST check sur veille supprimée (attendu 404) === {"error":"Veille introuvable"} HTTP 404
=== 20. CHECK arXiv (max=30 respecté) ===
  {"isFirstCheck":true,"fetchedCount":30,"added":30,"newCount":0,"totalResults":30,"unreadCount":0}
=== 21. RÉTENTION 200 — injection de 180 faux résultats (total 210) puis check ===
  {"isFirstCheck":false,"fetchedCount":30,"added":0,"removedByRetention":10,"totalResults":200}
```

### Différences de la refonte (justifiées par la spec)

- Erreur de source propagée **502** dans tous les cas (la précédente version renvoyait 504 sur
  timeout) — conformité stricte au task T5 « erreur source propagée 502 ».
- Déduplication assurée en amont par `diffResults` (filtre externalId vide/connu) + filet de
  sécurité P2002 → insertion ligne à ligne (skipDuplicates non supporté sur SQLite, cf. incident
  de session antérieure) — `dedupeByExternalId` n'est plus nécessaire.
- Réponse check enrichie : fetchedCount / added / newCount / removedByRetention / totalResults /
  unreadCount / checkedAt.

## Groupe C — Module UI + câblage navigation (T7-T8)

### Lint

```
bunx eslint src/modules/veille-academique/ src/lib/stores/app-store.ts src/app/page.tsx
→ EXIT: 0 (aucun problème)
```

### Rendu navigateur (agent-browser, 2026-09-18)

Entrée de navigation « Veille académique » présente dans la barre latérale (catégorie
Recherche & Sources, passée de 9 à 10 items) et cliquable :

```
- generic "Recherche & Sources10" [ref=e39] clickable
- button "Veille académique" [ref=e64]
```

État vide (CA-1.3) — rendu après clic :

```
Aucune veille active
… cliquez sur « suivre cette recherche » pour être alerté des nouveaux résultats.
- button "Thèses en ligne" [ref=e88]
- button "Bases de données (arXiv)" [ref=e89]
```

Carte veille après création (compteur CA-3.2 + dernière vérification CA-2.4) :

```
- button "Ouvrir la veille Veille : urbanisme participatif" [ref=e154]
- button "Vérifier la veille Veille : urbanisme participatif" [ref=e155]
- button "Renommer la veille" [ref=e156]
- button "Supprimer la veille" [ref=e157]
Dernière vérification : 18 sept. 2026, 12:39 · 32 résultats suivis
```

Premier relevé déclenché depuis l'UI (bouton Vérifier) → état API :

```
totalResults: 32 | unreadCount: 0 | lastCheckedAt: 2026-09-18T10:39:53.602Z
```

Vue détail — badge « Nouveau » après réinsertion d'un résultat évité puis re-check
(CA-2.2 dynamique), puis marquage « vu » par bouton → retour à l'état CA-2.3 :

```
- button "Tout marquer comme vu" [ref=e250]
- button "Marquer comme vu" [ref=e253]
Nouveau  ← badge visible sur le résultat non vu
[clic « Marquer comme vu »]
Aucun nouveau résultat   ← état vide CA-2.3
Aucun nouveau résultat depuis la vérification du 18 sept. 2026, 12:40.
```

Captures : `test-snapshots/veille-01-vide.png`, `veille-02-hal-resultats-suivre.png`,
`veille-03-dialog-suivre.png`, `veille-04-liste-carte.png`, `veille-05-apres-verif.png`,
`veille-06-detail-ca2-3.png`, `veille-07-badge-nouveau.png`, `veille-08-marque-vu.png`,
`veille-09-mobile-390.png`, `veille-10-arxiv-suivi.png`.

### Responsive (390 px) — vérification programme

```
{"hScroll":false,"footerVisible":true}   ← aucun scroll horizontal, footer présent
```

Commit : `8ddb97a`.

## Groupe D — Boutons « suivre » (T9-T10)

### T9 — HAL (Thèses en ligne)

Recherche « urbanisme participatif » → bouton « suivre cette recherche » (zone résultats,
à côté du badge Source : HAL) → dialog avec libellé prérempli :

```
- textbox "Nom de la veille" [ref=e148]: Veille : urbanisme participatif
- button "Suivre" [ref=e150]
```

Après confirmation → veille visible dans GET /api/veille (filtres courants inclus) :

```json
[{"label":"Veille : urbanisme participatif","source":"hal",
  "query":"urbanisme participatif","filters":{"sort":"publicationDateY_i desc"}}]
```

### T10 — arXiv (Bases de données)

Recherche « digital twin urban » → bouton → dialog → confirmation :

```json
[{"label":"Veille : digital twin urban","source":"arxiv",
  "query":"digital twin urban","filters":{"sort":"relevance"}},
 {"label":"Veille : urbanisme participatif","source":"hal", …}]
```

### Garantie — routes de recherche inchangées

```
git diff HEAD --stat -- src/app/api/theses-en-ligne/ src/app/api/arxiv/
→ (vide) ; dernier commit sur ces routes : 0348dcb (antérieur au cycle)
```

Lint des deux modules : EXIT 0. Commit : `12ab2c8`.

## Groupe E — Tests (T11)

### Test ciblé

```
bunx vitest run src/lib/veille/check-core.test.ts
 Test Files  1 passed (1)
      Tests  16 passed (16)
```

Couvrent : CA-2.1 (premier check sans « nouveau », y compris base vide + aucun résultat),
CA-2.2 (inconnus marqués, connus jamais re-marqués, seen sans influence, ids vides ignorés,
non-mutation), rétention 200 (sous/au-delà de la limite, tri desc, défaut 200, dates ISO,
non-mutation, liste vide) + parseFiltersJson.

### Suite complète — non-régression

```
bun run test:run
 Test Files  63 passed (63)     ← base : 62 fichiers
      Tests  1444 passed (1444) ← base : 1428 + 16 nouveaux
 Duration  15.13s
```

### Erreurs runtime navigateur

```
agent-browser errors → (aucune)
dev.log → aucune erreur runtime liée à la veille
```

Commit : `2fe9e16`.

### État final

Base rendue propre : 0 veille, 0 résultat (deux veilles de démonstration supprimées via
DELETE — cascades rejouées). Lint global : 0 erreur. Arbre commité.
