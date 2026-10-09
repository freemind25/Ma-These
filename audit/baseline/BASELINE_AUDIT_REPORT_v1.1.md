# BASELINE_AUDIT_REPORT v1.1 — Rapport de Revalidation (ThesisFrame / Ma Thèse)

**Document distinct de la v1.0 (qui reste immuable)** — cycle `audit-remediation-p1`
Version audité finale : **ThesisFrame v1.10.8** · commits C-1..C-4 (`1682dcd` → `93d8d08`) · **2026-10-09**
Autorisation propriétaire (IM 2026-10-09) : verdict **GO SOUS CONDITIONS validé** ; étape 3 autorisée **exclusivement** pour les corrections C-1 → C-4 et leur revalidation. **Ni mise en production, ni ouverture aux premiers utilisateurs.**

---

## 1. Synthèse exécutive

Les **4 conditions P1** du verdict GO SOUS CONDITIONS sont exécutées, avec preuves :

| Condition | Anomalie | Avant | Après | Statut |
|---|---|---|---|---|
| **C-1** sauvegarde DB | AUD-GOV-001 (⚠️ Élevée) | Aucune sauvegarde outillée, unique copie locale | Backup quotidien auto (VACUUM INTO, rotation 7 j, miroir hors arbre) + restore outillé ; **restauration réelle en env de test prouvée complète** | ✅ **corrigée, revalidée** |
| **C-2** multi-thèses | AUD-FUNC-002 (❌ CASSÉ) | CTA « Créer une thèse » ré-ouvrait l'ancienne thèse | CTA → dialogue de création ; bouton « Changer de thèse » ; création/changement/sélection/persistance vérifiés en UI réelle | ✅ **corrigée, revalidée** |
| **C-3** confirmation suppression | AUD-FUNC-003 (⚠️ Moyenne) | Suppression immédiate sans confirmation (références) | Confirmation obligatoire sur **16 actions destructives** ; Annuler = 0 requête ; suppression = DELETE 200 après confirmation | ✅ **corrigée, revalidée** |
| **C-4** durcissement Tauri | AUD-SEC-001/005 (⚠️ Moyenne) | `shell:allow-execute/open` + CSP null | Capabilities minimales (`core:default`) + CSP explicite ; web inchangé | 🟡 **corrigée, non revalidée côté desktop** (build Windows = propriétaire) |

**Verdict intermédiaire** : les 3 conditions applicables à l'environnement sont **satisfaites avec preuve** ; la 4ᵉ est configurée mais **sa revalidation exige le build Windows** que seul le propriétaire peut exécuter. **Le verdict final reste GO SOUS CONDITIONS** — les réserves §5 et les critères de sortie §6 doivent être levés/acceptés avant toute demande d'ouverture.

## 2. Détail par correction (avant / après / preuves / tests)

### C-1 — Sauvegarde et restauration de la base (commit `1682dcd`)
- **Avant** : aucune procédure ; la seule perte évitée de justesse date du rollback 2026-10-08 (copies manuelles).
- **Après** : `src/lib/backup.ts` — snapshot cohérent à chaud (SQLite `VACUUM INTO`) au boot serveur + re-check 6 h, rotation 7 jours, miroir hors arbre (`TF_BACKUP_MIRROR_DIR`) ; scripts versionnés `scripts/backup-db.ts`, `restore-db.ts` (copie de sécurité préalable systématique), `db-snapshot-stats.ts` ; procédure `docs/SAUVEGARDE-RESTAURATION.md`.
- **Couverture données** : base SQLite complète (thèse, chapitres, références, jobs, **et les 12 blobs PDF du corpus — 205,5 Mo — stockés en DB**) + copie des sources `upload/` (244 Mo).
- **Preuves de restauration (exigence propriétaire)** : ① sauvegarde initiale **avant toute modification** (213 Mo ×2 emplacements) vérifiée (`integrity_check=ok`, 0 violation FK, compteurs identiques — `evidence/c1-backup-initial.json`) ; ② **restauration réelle vers `/tmp/restore-test`** : `integrity=ok`, puis **diff complet des statistiques live↔restaurée VIDE** (Thesis 1, Chapter 7 / 2 295 mots, ImportedDoc 16 / 6 737 798 car., Reference 4, Job 24 — `evidence/c1-restore-test.json`) ; ③ mécanisme auto testé en exécution réelle (fichier du jour créé + miroir + logs).
- **Limites documentées** : restauration de la base **live** = arrêt serveur requis (SQLite, fichier unique) ; boot d'un second serveur sur la copie restaurée impossible (4 Go RAM, next-server 2,5 Go — risque OOM) → vérification au niveau ORM Prisma (même moteur que l'app) + SQLite intégrité + compteurs.

### C-2 — Création et changement de thèse (commit `6436ed7`)
- **Avant** (reproduit, capture `c2-before-dashboard-cta.png`) : CTA → éditeur ré-ouvrait « Urbanisme durable », aucun dialogue, aucun moyen UI de revenir à la liste.
- **Après** : `dashboard-page.tsx` CTA → `CreateThesisDialog` (nouveau mode contrôlé, trigger interne masqué) ; `editor-page.tsx` bouton « Changer de thèse » → liste « Mes thèses » ; correction ciblée 3 fichiers (+53/−11).
- **Vérifications UI réelle** (agent-browser, captures `c2-*.png`) : création de la 2ᵉ thèse (« AUDIT-C2 — Thèse de test », POST 201, DB 2 thèses) ; sélection des deux thèses dans les deux sens ; persistance F5 ; **isolation des contenus prouvée** (chapitres thèse-scopés, FK + cascade, groupBy DB) ; suppression de la thèse de test en cascade **sans orphelin** ; DB finale = état propriétaire exact ; thèse réelle intacte (7 chapitres / 2 295 mots).
- **⚠️ Fait produit majeur soumis à votre arbitrage** : le modèle `Reference` est **global par conception** (aucune colonne `thesisId`, API sans filtre thèse) — les références bibliographiques sont donc **partagées entre toutes les thèses**. L'isolation exigée pour les *contenus* (chapitres) et *documents* est réelle ; celle des *références* ne peut pas être vérifiée car elle n'existe pas architecturalement. **Décision produit requise** : (a) accepter le partage global (état actuel), ou (b) ajouter `thesisId` à Reference avec migration — hors périmètre de l'autorisation actuelle.
- **TNR** : réouverture de la thèse active inchangée (F5) ; panneau liste non contrôlé inchangé ; 1 658 tests verts ; lint 0 erreur.

### C-3 — Confirmation avant toute suppression (commit `f1b5ec5`)
- **Avant** (reproduit, captures `c3-before-*.png`) : clic poubelle = DELETE immédiat, irréversible, sans dialogue.
- **Après** : composant partagé `src/components/common/confirm-delete-dialog.tsx` (AlertDialog shadcn, variant destructive, état isPending) appliqué à **16 actions destructives** : références, thèse (cascade), chapitre, sources, notes, expérimentations ×2, analyses carto, parties de plan, onglet recherche (fermeture = DELETE persisté + effacement), articles, ImportedDoc (+ blob), entrée juridique, stories, sprints (cascade). 2 actions déjà conformes non touchées (veille académique, confirm natif livres) ; ~20 actions d'état local non persistant (aucune donnée DB) consignées sans traitement — inventaire complet `evidence/c3-revalidation.json`.
- **Vérifications UI réelle** : **Annuler → 0 requête réseau, 0 modification DB** (ligne présente) ; **Confirmer → DELETE 200** (ligne disparue) — vérifié pour références, thèse, chapitre (captures `c3-*.png`) ; les 13 autres traitées par vérification code (honnêteté consignée).
- **TNR** : 1 658 tests verts **sans aucune adaptation de test** (0 test ne cliquait un delete) ; lint 0 erreur.

### C-4 — Durcissement Tauri (commit `93d8d08`)
- **Avant** : capabilities `shell:allow-open` + `shell:allow-execute` (0 usage front vérifié) ; `csp: null`.
- **Après** : capabilities = `core:default` seul ; CSP explicite (`default-src 'self'; script-src 'self' 'unsafe-inline'; …; object-src 'none'; frame-ancestors 'none'`) + devCsp (HMR). Justification topologie : la webview desktop est **naviguée vers le serveur Next standalone (127.0.0.1)** → tout est same-origin ; les intégrations externes restent côté Node ; 0 image distante ; `unsafe-inline` requis par les scripts inline Next (App Router).
- **Vérifications** : JSON valides ; web inchangé (HTTP 200, lint 0 erreur) ; `tauri_plugin_shell::init()` conservé côté Rust **sans aucune permission accordée** (aucune commande shell autorisée).
- **Limite documentée (test impossible ici)** : le build Tauri Windows est irréalisable dans l'environnement (pas de cargo/Windows). **Conformément à votre exigence, aucun installeur ne sera produit/distribué sans votre build + smoke test de validation.** Statut : corrigée, non revalidée côté desktop.

## 3. TNR globaux (fin de cycle)

- **Suite automatisée** : `bun run test:run` → **78 fichiers, 1 658/1 658 verts** (18,2 s) ; `bun run lint` → **0 erreur** (247 warnings, niveau baseline).
- **Six golden paths de la baseline, re-parcourus dans l'application réelle** (preuve consolidée `evidence/tnr-golden-paths.json` + captures `tnr-gp*.png`) :
  1. **Consulter/rédiger** — éditeur, contenu réel éditable, 7 chapitres ✅
  2. **Créer une nouvelle thèse** — dialogue ouvert par le CTA (ex-❌) ✅
  3. **Références CRUD** — liste intacte ; suppression confirmée ✅
  4. **Génération IA** — `POST /api/ai-writing/stream` 200, résultat + sceau ✅
  5. **RAG thèse** — réponse « d'après les extraits » avec citation « [Chapitre 1 - Introduction générale et problématique] » ✅
  6. **Recherche thèses en ligne** — route ligne rouge → 200, thèses HAL réelles ✅
  7. **Export DOCX** — HTTP 200, 17 514 o, **magic bytes ZIP valides** (fichier Word authentique) ✅
- **Invariants** : lignes rouges **0 diff** vs origin/main ; `db/custom.db` skip-worktree intact (corpus 16 docs / 6 737 798 car. jamais commité) ; 4 commits poussés, aucun commit-snapshot.

## 4. Régressions et incidents

- **Régressions applicatives : aucune** (TNR verts + golden paths OK + DB propriétaire exacte à chaque étape).
- **Incident environnemental (non imputable aux corrections)** : 1 OOM kernel du serveur dev pendant C-2 (box 4 Go ; next-server ~2,5 Go documenté à la baseline) — redémarré, zéro perte de travail (worklog R-2). *Risque récurrent documenté : un reboot du poste en usage réel est sans conséquence depuis C-1 (jobs requeue + backup au boot).*

## 5. Anomalies restantes (ouvertes, hors autorisation)

13 fiches ⚠️ restent ouvertes (registre `09`) : P2 — AUD-FUNC-004 (persistance vue), AUD-FUNC-005 (double POST suspecté), AUD-HYD-001 (hydratation div>p), AUD-EXPORT-001 (DOCX sans TOC/styles réels), AUD-REL-001 (Overpass sans timeout), AUD-SEC-002/003 (purge historique `.env` BFG + révoke APINex — **action propriétaire**), AUD-UX-001 (corpus non découvrable), AUD-UX-002 (panneau flottant « Livrable du test » — *bloque des clics en hit-test, observé au TNR GP-4*) ; P3 — AUD-FUNC-001 (\n littéral), AUD-DOC-001/002, AUD-DATA-001, AUD-SEC-004/006/007.

## 6. Réserves avant GO final — soumises à votre validation

1. **33 vues sur 47 non exécutées en UI** (C-19) : à passer en UI réelle avant diffusion large — **ou à accepter explicitement comme risque résiduel**.
2. **Builds selon les modes de distribution prévus** : web de production (interdit ici ; dernière preuve verte 2026-09-18) et **desktop Tauri Windows** (impossible ici) — validation propriétaire obligatoire avant distribution (inclut le smoke test C-4 : app fonctionnelle sous CSP durcie).
3. **Décision produit — références globales** (fait découvert en C-2, §2-C-2) : partager entre thèses (statu quo) ou scoper par thèse (migration).
4. **Purge de l'historique git** (AUD-SEC-002/003, P2) : `git rm --cached .env` + BFG + révoke APINex chez le fournisseur — coordination propriétaire.
5. **Risques résiduels acceptés à ce stade** (à confirmer explicitement) : vues non testées (C-19), dette P3, dépendances externes variables (Overpass/APInex).

## 7. Critères de sortie restants (vers GO pleine)

1. Votre validation des réserves §5 (+ décision produit références).
2. C-19 : pass UI des 33 vues restantes (peut être exécuté au prochain cycle sur autorisation).
3. Build web vert du HEAD corrigé (hors environnement) + build Windows + smoke test C-4 (propriétaire).
4. Corrections P2/P3 au fil des cycles autorisés.
5. Update de ce rapport en **v1.2** après chaque vague ; la v1.0 reste la référence immuable.

---
*Preuves : `audit/baseline/evidence/` — c1-backup-initial.json, c1-restore-test.json, c2-revalidation.json (+10 captures), c3-revalidation.json (+11 captures), c4-tauri-hardening.json, tnr-golden-paths.json (+8 captures). Aucune preuve inventée ; chaque verdict adossé à une capture, une sortie de commande, une requête HTTP ou une vérification DB datée du 2026-10-09. Aucun secret copié. Worklog : sections R-1 à R-5. Specs : `specs/audit-remediation-p1/`.*
