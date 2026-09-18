# Plan — Veille académique (alertes sur requêtes sauvegardées)

Spec : `specs/veille-academique/spec.md` (validée, Étape 2 clôturée le 2026-09-18). Décisions actives : sources HAL + arXiv ; marquage « vu » par résultat + raccourci global ; déclenchement 100 % manuel ; rétention 200 résultats par veille.

## État réel constaté

Fichiers lus intégralement ou par sections ciblées — chemins et lignes réels :

- `src/app/api/theses-en-ligne/search/route.ts` (196 l.) — proxy HAL/Solr. GET lit `q, domain, yearMin, yearMax, sort, page, rows` (l.54-61) ; filtres `fq` sur `docType_s:THESE`, `level0_domain_s`, années (l.72-81) ; construction `URLSearchParams` avec un `append("fq", …)` par filtre (l.87-107) ; normalisation du tri `%2B`/`+` → espace (l.113-116) ; encodage final `%20` (l.120). Retourne `{ theses, total, page, rows, totalPages }` (l.181-189). Interface `ThesisResult` exportée (l.28-40). **Épinglée par non-régression** (`route.test.ts`, 14 tests) — cette route ne doit PAS être modifiée.
- `src/app/api/arxiv/search/route.ts` (259 l.) — API Atom arXiv. GET lit `q, start, max, sort` (l.179-185), `max` plafonné à 30 (l.183) ; throttle ~1,2 s + cache TTL 10 min (l.28-32, 209-218) ; retourne `{ ok, cached, total, start, max, entries }` (l.247). Interface `ArxivEntry` (l.12-26).
- `src/modules/theses-en-ligne/theses-en-ligne-page.tsx` (388 l.) — UI HAL : états `query/domain/yearMin/yearMax/sort/page` (l.98-110), fetch l.112-146, drapeau `hasFilters` l.161, `ThesisCard` l.330.
- `src/modules/academic-db/arxiv-search.tsx` (353 l.) — UI arXiv : `runSearch` fetch `/api/arxiv/search` l.59-87, ajout aux références via POST `/api/references` l.107-120.
- `src/modules/academic-db/academic-db-page.tsx` (429 l.) — hôte de `ArxivSearchSection` (l.325).
- `prisma/schema.prisma` (465 l.) — **aucun modèle de recherche sauvegardée ni de résultat** n'existe. Patron JSON-dans-String déjà en usage (`DoctoralToolbox` l.151-154, `ResearchTab.links/quotes/todos` l.174-176). `Reference` est un modèle global sans lien Thesis (l.190-217) — précédent pertinent pour une entité non rattachée à une thèse. `ChapterVersion` l.69-81.
- Conventions CRUD : `src/app/api/thesis/[id]/research-tabs/route.ts` — GET/POST avec `db.*`, `NextResponse.json({ data, meta })`, `params: Promise<{ id }>` (Next.js 16), 400 validation / 500 catch (l.7-29, 34-77).
- `src/lib/db.ts` (12 l.) — client Prisma singleton (`db`).
- `src/app/page.tsx` (171 l.) — switch `currentView` l.61-150 ; tout nouveau module exige import + `case`.
- `src/lib/stores/app-store.ts` (457 l.) — union `ViewId` l.9-51 (terminée l.51 `experimentations`) ; `NAV_CATEGORY_META` l.62-70 (catégorie `recherche` l.66) ; items existants `academic-db` l.201-205, `theses-en-ligne` l.223-227 (format : id/label/icon/description/category).
- `src/components/layout/app-sidebar.tsx` (341 l.) — registre `ICON_MAP` l.71-77 ; l'icône **`Binoculars` est déjà importée (l.38) et enregistrée** — aucune modification de ce fichier n'est nécessaire.
- `package.json` l.12 : `db:push = prisma db push --accept-data-loss` ; `.env` l.1 : `DATABASE_URL=file:/home/z/my-project/db/custom.db`.

Écart documentation/code : aucun sur le périmètre de ce plan.

## Approche retenue

1. **Schéma** — deux modèles nouveaux (mêmes patrons que l'existant) :
   - `SavedSearch` (une veille) : `id`, `label`, `source` ("hal" | "arxiv"), `query`, `filters` (JSON : domain/yearMin/yearMax/sort pour HAL ; sort pour arXiv), `lastCheckedAt DateTime?`, `createdAt/updatedAt`, relation `results`.
   - `SavedSearchResult` : `id`, `savedSearchId`, `externalId` (docid HAL / arxivId), `title`, `authors` (séparés « ; »), `year Int?`, `url`, `abstract String?`, `seen Boolean @default(false)`, `firstSeenAt DateTime`, `@@unique([savedSearchId, externalId])` (déduplication CA-2.2), index sur `savedSearchId`.
   - Rétention (décision n°4) : après chaque vérification, ne conserver que les 200 résultats les plus récents par veille (`firstSeenAt desc`), suppression du surplus.
2. **Backend** — 4 routes nouvelles, conventions research-tabs, zéro modification des routes de recherche existantes :
   - `GET/POST /api/veille` — liste avec compteurs (`_count` des résultats non vus) / création (label, source, query, filters).
   - `PATCH/DELETE /api/veille/[id]` — renommage (CA-1.1) / suppression (CA-1.2, cascade résultats).
   - `POST /api/veille/[id]/check` — exécute la recherche stockée en **auto-fetch** de la route de source existante (`/api/theses-en-ligne/search` ou `/api/arxiv/search`, origin pris du `request.nextUrl`), HAL `rows=50`, arXiv `max=30` ; diff par `externalId` contre les résultats stockés ; premier check = base de référence sans « nouveau » (CA-2.1) ; checks suivants = insertion des inconnus marqués non-vus (CA-2.2) ; mise à jour `lastCheckedAt` (CA-2.4) ; application de la rétention 200.
   - `GET/PATCH /api/veille/[id]/results` — résultats (nouveaux d'abord) / marquage « vu » (`{ ids: [...] }` ou `{ all: true }`, CA-3.1/3.2).
3. **Frontend** — module nouveau `src/modules/veille-academique/veille-academique-page.tsx` :
   - Liste des veilles : libellé éditable, badge source, compteur non-vus (CA-3.2), `lastCheckedAt` (CA-2.4), bouton « Vérifier » par veille, suppression.
   - États vides explicites : liste vide invitante (CA-1.3) ; vérification sans nouveau → « aucun nouveau résultat depuis le … » (CA-2.3).
   - Détail : résultats avec badge « nouveau », marquage vu par résultat + bouton « tout marquer comme vu » (CA-3.1).
   - Boutons « suivre cette recherche » ajoutés aux deux UI de recherche existantes : `theses-en-ligne-page.tsx` (zone résultats) et `arxiv-search.tsx` (zone résultats) — dialog léger de nommage (défaut = requête) puis POST `/api/veille` avec les filtres courants.
   - Enregistrement : `ViewId` + item `NAVIGATION_ITEMS` (`veille-academique`, catégorie `recherche`, icône `Binoculars`) dans `app-store.ts`, puis import + `case` dans `page.tsx`.

## Alternatives écartées

- **Refactorer la construction de requête HAL/arXiv en lib partagée** pour la vérification — rejeté : toucherait la route HAL épinglée par non-régression et créerait un risque de divergence d'encodage ; l'auto-fetch réutilise les chemins de code exacts déjà testés.
- **Rejouer la requête directement contre HAL/arXiv dans la route check** (sans passer par les routes internes) — rejeté : duplication de la logique d'encodage HAL (fragilité A.1 connue) et double implémentation du parsing arXiv.
- **Déclenchement automatique via le worker `Job`** (modèle existant, schema l.449-464) — rejeté : décision de clarification n°3 (100 % manuel cette itération).
- **Historique de snapshots par vérification** — rejeté : la spec n'exige que la diff nouveau/vu ; la fenêtre glissante 200 suffit (rétention décision n°4).

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| `prisma/schema.prisma` | modification (2 modèles nouveaux) | db:push — diff avant/après + preuve de survie des données requis |
| `src/app/api/veille/route.ts` | nouveau | — |
| `src/app/api/veille/[id]/route.ts` | nouveau | — |
| `src/app/api/veille/[id]/check/route.ts` | nouveau | — |
| `src/app/api/veille/[id]/results/route.ts` | nouveau | — |
| `src/modules/veille-academique/veille-academique-page.tsx` | nouveau | — |
| `src/modules/theses-en-ligne/theses-en-ligne-page.tsx` | modification (bouton « suivre » + dialog) | UI locale ; `route.ts` HAL non touchée |
| `src/modules/academic-db/arxiv-search.tsx` | modification (bouton « suivre » + dialog) | UI locale |
| `src/lib/stores/app-store.ts` | modification (union ViewId + item navigation) | types dérivés — compilation à vérifier |
| `src/app/page.tsx` | modification (import + case switch) | — |
| `specs/veille-academique/preuves.md` | nouveau (preuves au fil des groupes) | — |

`src/components/layout/app-sidebar.tsx` : **non touché** (Binoculars déjà enregistré, l.38 + l.71-77).
Routes de recherche existantes (`theses-en-ligne/search`, `arxiv/search`) : **non touchées**.

## Impacts transverses

- **Schéma Prisma** : `db:push` sur SQLite (`db/custom.db`) — diff avant/après + comptes de lignes avant/après exigés dans `preuves.md` (survie des données).
- **Routes API** : 4 routes nouvelles uniquement ; aucune route consommée par un autre module n'est modifiée.
- **Build Tauri** : aucun impact (aucun script, aucune variable d'environnement).
- **Quotas API externes** : une vérification = 1 requête HAL (15 s timeout déjà en place) et/ou 1 requête arXiv (throttle 1,2 s + cache déjà en place, arxiv route l.28-32) ; déclenchement manuel seulement.
- **Navigation** : ajout d'une entrée — fichier store partagé par toute l'application (union de types) : `bun run lint` + build requis.

## Stratégie de vérification

1. `prisma db push` : dump des tables avant/après (`sqlite3` comptes par table) → preuve de survie ; diff schéma constaté.
2. CRUD complet par `curl` sur le serveur de dev : création veille HAL → check n°1 (base de référence, 0 nouveau) → check n°2 (nouveaux marqués si présents) → liste avec compteurs → mark seen partiel puis global → renommage → suppression (cascade). Idem arXiv si réseau disponible ; sinon preuve du comportement d'erreur 502 propagé.
3. `bun run test:run` — suite complète verte (base : 62 fichiers / 1428 tests) + `bun run lint` 0 erreur.
4. Rendu navigateur (agent-browser) : module visible dans la barre latérale, états vides, création depuis une recherche HAL, boutons actifs — captures desktop + mobile ≥ 390 px dans `test-snapshots/`.

## Risques

- `db:push` écrase silencieusement (`--accept-data-loss`, package.json l.12) — mitigué par la preuve de survie obligatoire ; modèles purement additifs (aucune colonne modifiée sur l'existant).
- Auto-fetch interne : dépend de l'origin de la requête entrante ; timeout court exigé (≤ 20 s) pour ne pas suspendre la route check ; erreur source propagée en 502 avec message lisible.
- Tri stocké libre côté HAL (le paramètre `sort` est normalisé par la route, l.113-116) — la vérification réutilise le même mécanisme, aucun traitement nouveau.
- Unicité `@@unique([savedSearchId, externalId])` : les identifiants HAL (docid) et arXiv (arxivId) sont stables ; collision inter-sources impossible (clé composée par veille).
- Union `ViewId` touchée : toute erreur de frappe casse le build — couvert par lint + build.
