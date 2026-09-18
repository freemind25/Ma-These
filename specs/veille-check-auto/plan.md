# Plan — Veille académique : déclenchement automatique des vérifications

## État réel constaté

**File de tâches persistante (A.8)** :
- `src/lib/jobs/queue.ts` (106 l.) — file en base (modèle `Job`) : `enqueueJob` l.28-37, `claimNextJob` l.44-63 (verrou optimiste), `completeJob` l.66-75, `failJob` l.78-88, `requeueStaleJobs` l.95-105 (orphelins → pending).
- `src/lib/jobs/worker.ts` (117 l.) — worker **réactif**, sans planificateur : registre `HANDLERS` l.21-38 (`noop`, `deep-research`) ; `POLL_INTERVAL_MS = 3_000` et `STALE_SWEEP_EVERY_MS = 60_000` l.44-45 ; boucle `tick` l.99-112 (sweep orphelins + un job par tick) ; démarré par `src/instrumentation.ts` (`register()`, runtime nodejs uniquement).
- `src/app/api/jobs/route.ts` (85 l.) — POST soumission (type validé contre le registre l.12-18) / GET liste avec filtre statut.
- Le tick du worker pollue visiblement en dev (`dev.log` : SELECT Job répétés) — le worker tourne bien.

**Vérification de veille (à réutiliser)** :
- `src/app/api/veille/[id]/check/route.ts` (277 l.) — POST avec toute la logique : `buildSourceUrl` l.26-46 (HAL rows=50 / arXiv max=30), `normalizeFetched` l.49-109, auto-fetch sur `request.nextUrl.origin` l.131-152 (timeout 20 s, erreur source → **502**), diff pur `diffResults` l.174, insertion premier contrôle = référence (CA-2.1) / suivants = non-vus (CA-2.2) l.179-181 + filet P2002 l.199-231, rétention 200 l.235-244, `lastCheckedAt` l.247-250, réponse enrichie l.257-268.
- Le worker **n'a pas de requête HTTP** : la logique est prisonnière du handler de route → extraction en lib commune nécessaire.

**Réglage de veille (à étendre)** :
- `src/app/api/veille/route.ts` — GET mapping l.31-42 (sans réglage auto) ; POST création l.58-123.
- `src/app/api/veille/[id]/route.ts` — PATCH exige `label` non vide l.29-34 (400 sinon), update l.36-39 ; DELETE l.58-77.
- `prisma/schema.prisma` — `SavedSearch` (modèle additif livré par `specs/veille-academique`, commit `1da1584`) : pas de champ de réglage à ce jour.
- `src/modules/veille-academique/veille-academique-page.tsx` — `VeilleCard` l.338-416 (carte liste, boutons d'action l.388-411) ; `switch.tsx` disponible dans `src/components/ui/`.

**Épinglés non concernés** : `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`, `src/components/layout/app-sidebar.tsx` — le auto-fetch reste un appel HTTP aux URLs identiques.

## Approche retenue

1. **Schéma** : `autoCheck Boolean @default(false)` sur `SavedSearch` — additif pur, `db:push` avec preuve de survie (dump comptes avant/après, méthode éprouvée).
2. **Extraction** : `src/lib/veille/run-check.ts` exporte `runCheckForSavedSearch(id, origin)` — reprend à l'identique `buildSourceUrl`, `normalizeFetched` et la séquence du POST check (fetch source → diff → insertion → rétention → horodatage). Deux classes d'erreur exportées : `VeilleNotFoundError` (route → 404, worker → job failed) et `SourceFetchError` (route → 502, worker → job failed avec message). La route check devient un wrapper mince — **contrat de réponse inchangé** (UI consomme `isFirstCheck`, `newCount`, `unreadCount`).
3. **Éligibilité pure** : `check-core.ts` (module pur épinglé par 16 tests) reçoit `isDueForAutoCheck(autoCheck, lastCheckedAt, now, intervalMs)` et la constante `AUTO_CHECK_INTERVAL_MS = 6 h` — testable sans db ni réseau.
4. **Worker** : handler `"veille-check"` dans `HANDLERS` (payload `{ savedSearchId }`, origine interne `http://127.0.0.1:${process.env.PORT ?? 3000}`) + balayage de planification dans le tick existant (toutes les 60 s, même motif que le sweep orphelins) : veilles `autoCheck=true` et échues → `enqueueJob` si aucun job `veille-check` pending/running pour cette veille (garde anti-empilement par recherche sur `Job.payload`).
5. **API réglage** : GET `/api/veille` renvoie `autoCheck` ; PATCH `/api/veille/[id]` accepte `{ label? }` et/ou `{ autoCheck?: boolean }` (400 si les deux absents ; `label` vide rejeté comme aujourd'hui).
6. **UI** : interrupteur `Switch` « Auto » sur chaque carte de liste (`VeilleCard`), infobulle « Vérification automatique toutes les 6 h », PATCH au changement, état reflété à rechargement.

## Alternatives écartées

- **Cron externe / processus séparé qui frappe les routes HTTP** — rejeté : la note opérationnelle sandbox (processus fils moissonnés) rend tout démon externe fragile ; le worker intégré au serveur est persistant par construction.
- **Appel direct des handlers de routes épinglées depuis le worker** (import GET + `NextRequest` fabriqué) — rejeté : construction de requête hors contexte HTTP, fragile face aux évolutions Next ; l'auto-fetch HTTP interne reste le chemin prouvé par la recette manuelle.
- **Vérification de TOUTES les veilles sans réglage** — rejeté : consommerait les quotas HAL/arXiv sans consentement ; l'opt-in par veille est plus conservateur et suffisant.
- **Retry automatique dédié (backoff)** — rejeté : complexité non demandée ; la prochaine échéance retente ; l'échec reste consultable dans la file.

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| `prisma/schema.prisma` | modification additive (1 champ) | db:push — diff comptes avant/après + preuve de survie requis |
| `src/lib/veille/check-core.ts` | modification additive (fn pure + constante) | Faible — 16 tests existants doivent rester verts |
| `src/lib/veille/run-check.ts` | création (extrait de la route check) | Moyen — logique déplacée, contrat route inchangé à prouver par curl |
| `src/app/api/veille/[id]/check/route.ts` | modification (délégation au lib) | Moyen — comportement 200/404/502 strict à re-recetter |
| `src/app/api/veille/route.ts` | modification (GET : + `autoCheck`) | Faible |
| `src/app/api/veille/[id]/route.ts` | modification (PATCH : réglage auto) | Faible — validation 400/404 à préserver |
| `src/lib/jobs/worker.ts` | modification (handler + balayage) | Moyen — ne pas casser le poll existant ; un job/tick préservé |
| `src/modules/veille-academique/veille-academique-page.tsx` | modification (Switch sur carte) | Faible |
| `src/lib/veille/check-core.test.ts` | modification (tests `isDueForAutoCheck`) | Faible — additif |

**Effet de bord accepté** : le type `veille-check` devient soumissible via POST `/api/jobs` (validation contre le registre) — équivalent fonctionnel au check manuel, sans risque nouveau.

## Impacts transverses

- Schéma Prisma (`db:push --accept-data-loss`) — preuve de survie des données obligatoire (23→25 tables déjà joué ; ici zéro suppression, champ additif).
- Quotas HAL/arXiv — opt-in + intervalle 6 h + anti-empilement bornent l'exposition.
- File `Job` — nouveau type dans le registre ; GET `/api/jobs` expose les checks automatiques (traçabilité).
- Var. d'environnement : aucune nouvelle (PORT déjà standard, fallback 3000).

## Stratégie de vérification

1. `bun run lint` — 0 erreur.
2. `bun run test:run` — suite intégrale verte (63 fichiers / 1444 + nouveaux `isDueForAutoCheck`).
3. Curl API : GET liste avec `autoCheck` ; PATCH `{ autoCheck: true }` ; PATCH corps vide → 400 ; inconnu → 404 ; check manuel → même réponse JSON qu'avant extraction (comparaison de contrat).
4. **Cycle automatique de bout en bout** : veille créée, auto activé → script temporaire (supprimé après) repoussant `lastCheckedAt` de >6 h → balayage ≤ 60 s → `GET /api/jobs?status=done` montre le job `veille-check`, la veille a `lastCheckedAt` rafraîchi — sorties `dev.log` (`[job-worker]`) collées dans `preuves.md`.
5. Anti-empilement : deux échéances rapprochées → un seul job en attente/en cours pour la veille.
6. Échec : veille pointant une source injoignable (query provoquant erreur) → job `failed`, `lastCheckedAt` intact — preuve curl + dev.log.
7. Navigateur : interrupteur Auto visible/commutable/persistant (rechargement), captures `test-snapshots/`.

## Risques

- **`db:push` écrase silencieusement** — champ additif, dump comptes avant/après exigé (précédent : méthode `.tmp-db-count` supprimée après usage).
- **Origine interne du worker** (`127.0.0.1:PORT`) — si le port d'écoute diffère, le check auto échouera visiblement (job failed) ; fallback 3000 = port du dev server constaté dans `dev.log` ; risque signalé, échec non silencieux.
- **Empilement de jobs** — garde par recherche sur `Job.payload` ; si la garde fuyait, l'anti-doublon fonctionnel (unicité `[savedSearchId, externalId]` + diff) rendrait le doublon inoffensif pour les données.
- **Régression du contrat de la route check** — l'UI et les preuves curl d'avant/après extraction servent de verrou.
- **Tick worker ralenti** — le balayage 60 s s'ajoute au poll 3 s : une requête SQL légère indexée (`autoCheck`), au pire une file de checks séquentiels (un job/tick) — acceptable pour un usage doctorant.
