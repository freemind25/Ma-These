# Preuves — veille-check-auto

Recette du 2026-09-18, mandant « go » (spec + plan + exécution enchaînée). Environnement : dev server port 3000 (redémarré à 11:37 pour charger le nouveau worker — le garde `globalThis` interdit tout double démarrage), curl + navigateur agent-browser.

## Groupe A — Schéma (T1)

- Dump des **25 tables** avant/après `bun run db:push` (script temporaire `.tmp-db-count.mjs` via `$queryRawUnsafe` sur `sqlite_master`, supprimé après usage) : **diff vide — zéro perte de ligne** (comptes inchangés : Chapter 7, CustomBookSkill 58, Reference 4, SavedSearch 0, SavedSearchResult 0, Job 0, etc.).
- Sortie push : `🚀 Your database is now in sync with your Prisma schema. Done in 18ms` + Prisma Client régénéré (v6.19.2).
- Champ ajouté : `autoCheck Boolean @default(false)` (additif pur).

## Groupe B — Backend (T2, T3, T4)

### T2 — Contrat de la route check inchangé après extraction

- Check manuel POST `/api/veille/[id]/check` après extraction (veille « Check-auto — essai recette », HAL « transition écologique ») :
  ```json
  { "data": { "isFirstCheck": true, "checkedAt": "2026-09-18T11:38:32.293Z", "fetchedCount": 50, "added": 50, "newCount": 0, "removedByRetention": 0, "totalResults": 50, "unreadCount": 0 } }
  ```
  Structure identique au contrat livré par `specs/veille-academique` (CA-2.1 : base de référence, aucun « nouveau »).

### T3 — Réglage autoCheck

- GET `/api/veille` : champ `autoCheck: False` présent (défaut opt-in).
- PATCH `{autoCheck:true}` → appliqué ; GET confirme `autoCheck: True`.
- PATCH `{autoCheck:"oui"}` → **HTTP 400** (`autoCheck doit être un booléen`).
- PATCH `{}` → **HTTP 400** (`Fournir un nouveau libellé et/ou le réglage autoCheck`).
- PATCH `{label:"Nouveau libellé essai"}` seul → compat renommage préservée (label modifié, autoCheck intact).
- PATCH veille inconnue → **HTTP 404**.

### T4 — Déclenchement automatique de bout en bout (CA-1.3, CA-2.1)

- Backdate `lastCheckedAt` −7 h (script temporaire supprimé) → balayage worker (60 s) :
  ```
  [job-worker] Vérification automatique programmée pour la veille cmu6vxhy10000pyhe39npu0ah
  [job-worker] Exécution du job cmu6vzl2y001gpyhe18qmc77l (veille-check)
  [job-worker] Job cmu6vzl2y001gpyhe18qmc77l (veille-check) terminé
  ```
- `GET /api/veille` après job : `lastCheckedAt: 2026-09-18T11:40:16.326Z` (**rafraîchi sans clic**), `totalResults: 50`, `unreadCount: 0` (déduplication — sémantique strictement identique au manuel, CA-2.1).
- `GET /api/jobs` : job `veille-check` **done**.

### T4 — Anti-empilement (CA-2.2)

- Job `veille-check` soumis manuellement via POST `/api/jobs` (type enregistré → accepté) → `pending` ; backdate simultanée.
- Après une fenêtre couvrant un balayage complet (70 s) : compteur de lignes « Vérification automatique programmée pour la veille … » **inchangé (2)** — le balayage n'a pas empilé de second job ; le job en attente a été exécuté par le worker (`done`) et a lui-même rafraîchi `lastCheckedAt` (11:43:34).
- Jamais plus d'un job pending/running par veille.

### T4 — Échec sans corruption (CA-2.3)

- Échec **réel** : premier déclenchement auto pendant une lenteur HAL amont → source répondue HTTP 500 (timeout amont) → job **failed** avec `SourceFetchError: Erreur de la source HAL (HTTP 500) : The operation was aborted due to timeout` ; **veille intacte** (`lastCheckedAt` resté à la valeur backdatée, `totalResults: 50`, `unreadCount: 0`), worker et autres jobs non perturbés.
- Rejeu réussi ensuite (la route HAL répond 200 en 7,8 s — transitoire confirmé).
- Chemin `VeilleNotFoundError` : job soumis pour une veille inexistante → **failed**, `error: "Veille introuvable : id-inexistant-test"`.

## Groupe C — Frontend (T5)

- Switch `checked=true` au rendu (reflète l'état serveur), libellé « Auto », `title="Vérification automatique toutes les 6 h"`, aria-label nominatif.
- Bascule OFF (UI) → `GET /api/veille` : `autoCheck: False` → **rechargement** : switch `[checked=false]` (CA-1.2).
- Bascule ON (UI) → `autoCheck: True` → **rechargement** : `[checked=true]` (CA-1.2).
- Captures : `test-snapshots/checkauto-01-switch-off.png`, `test-snapshots/checkauto-02-switch-on.png`.
- Console : aucune erreur.

## Groupe D — Tests (T6)

- `src/lib/veille/check-core.test.ts` : **24 tests** (16 existants + 8 nouveaux `isDueForAutoCheck` : opt-in off, jamais vérifiée, < intervalle, ≥ intervalle, borne exacte, intervalle explicite, date non parsable, constante 6 h).
- Suite intégrale : **63 fichiers / 1452 tests verts** (base 1444 + 8, zéro régression).

## Nettoyage

- Veille d'essai supprimée (DELETE, cascade) → `GET /api/veille` : `count: 0` — base rendue propre.
- Scripts temporaires (`.tmp-db-count.mjs`, `.tmp-backdate.mjs`) supprimés ; arbre git propre après commits.
- `bun run lint` final : **0 erreur** (baseline 230 warnings inchangée).
