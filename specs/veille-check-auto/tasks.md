# Tasks — veille-check-auto

Contexte : mandat du propriétaire « go pour les deux propositions » (2026-09-18). Spec : `specs/veille-check-auto/spec.md` — opt-in par veille (défaut désactivé), intervalle fixe 6 h, anti-empilement, échec sans retry. Garanties inchangées : routes de recherche HAL/arXiv et `app-sidebar.tsx` jamais modifiées.

## Groupe A — Schéma [BLOQUANT]

- [ ] T1 — Ajouter à `SavedSearch` (`prisma/schema.prisma`) le champ **`autoCheck Boolean @default(false)`** — additif pur, aucune colonne existante modifiée · preuve attendue : dump des comptes de toutes les tables avant/après `bun run db:push` (script temporaire en projet, supprimé après), zéro perte de ligne, sortie collée dans `preuves.md`

Dépendances : aucune. **[BLOQUANT]** — tout le reste consomme le champ.

## Groupe B — Backend / routes API + worker [DÉPEND DE Groupe A]

- [ ] T2 — Extraire `src/lib/veille/run-check.ts` : `runCheckForSavedSearch(id, origin)` reprenant à l'identique la séquence du POST check (auto-fetch source timeout 20 s, diff pur, insertion CA-2.1/2.2, rétention 200, `lastCheckedAt`, compteurs) + `VeilleNotFoundError` / `SourceFetchError` ; `src/app/api/veille/[id]/check/route.ts` devient un wrapper (404/502/500 inchangés, **contrat de réponse identique**) · preuve attendue : curl check manuel avant/après extraction — même structure de réponse ; lint 0 erreur
- [ ] T3 — Étendre les routes de réglage : `src/app/api/veille/route.ts` GET renvoie `autoCheck` ; `src/app/api/veille/[id]/route.ts` PATCH accepte `{ label? }` et/ou `{ autoCheck?: boolean }` (400 si aucun des deux, 404 inconnu) · preuve attendue : curl GET (champ présent), PATCH auto true/false, PATCH `{}` → 400, 404 veille inconnue
- [ ] T4 — Planification : `check-core.ts` reçoit la fn pure **`isDueForAutoCheck(autoCheck, lastCheckedAt, now, intervalMs)`** + constante `AUTO_CHECK_INTERVAL_MS` (6 h) ; `src/lib/jobs/worker.ts` reçoit le handler **`veille-check`** (payload `{ savedSearchId }`, origine interne) et le balayage 60 s dans le tick existant (veille auto + échue → `enqueueJob` si aucun job `veille-check` pending/running pour elle) · preuve attendue : `dev.log` montrant `[job-worker]` exécuter le job ; `GET /api/jobs` listant le `veille-check` terminé ; veille dont `lastCheckedAt` rafraîchi sans clic

Dépendances : Groupe A recetté. Ordre interne T2 → T3 → T4.

## Groupe C — Frontend / UI [DÉPEND DE Groupe B]

- [ ] T5 — Dans `src/modules/veille-academique/veille-academique-page.tsx` (`VeilleCard`) : interrupteur `Switch` « Auto » (infobulle « Vérification automatique toutes les 6 h »), reflétant `autoCheck`, commutable → PATCH, état persistant au rechargement — aucune autre modification du fichier · preuve attendue : rendu navigateur (bascule, rechargement conservé), capture `test-snapshots/`

Dépendances : Groupe B recetté (les appels réels doivent répondre).

## Groupe D — Tests / non-régression [DÉPEND DE Groupe B]

- [ ] T6 — Étendre `src/lib/veille/check-core.test.ts` : tests `isDueForAutoCheck` (désactivée → false ; jamais vérifiée + activée → true ; vérifiée il y a < intervalle → false ; ≥ intervalle → true) — zéro réseau, zéro db · preuve attendue : test ciblé vert, puis `bun run test:run` intégralement verte (base 63 fichiers / 1444 tests + nouveaux)

Dépendances : Groupe B recetté (T4). Indépendant du groupe C.

---

Dépendances globales : **A [BLOQUANT] → B → {C, D}**. Un groupe à la fois : annonce → feu vert → exécution → preuves → commit → compte rendu → recette (rythme global applicable si le propriétaire le demande, comme sur `veille-academique`).
