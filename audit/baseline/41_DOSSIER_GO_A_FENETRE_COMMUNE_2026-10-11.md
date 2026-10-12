# 41 — DOSSIER GO A — FENÊTRE COMMUNE MIGRATION + ISOLATION (MODE A, B-STRICT)

**Cycle :** audit-final-v1.2 · vague 15 · **Date :** 2026-10-11
**Statut : DOSSIER PRÊT — CECI N'EST PAS UN GO.** Répond au point 4 (volet A) de la confirmation documentaire du propriétaire (2026-10-11) : « Les dossiers GO A et GO B séparés, avec leurs préconditions, périmètres, points d'arrêt, critères de réussite et procédures de retour arrière. »
**Fondements :** doc 30 (pré-requis finaux) · doc 32 (calendrier S1-S4, coordination B-strict) · doc 34 (dossier final de démarrage) · doc 21/25/27 (séquence, clarification, runbooks) · répétition générale doc 18 (16/16, double rollback).

---

## §1 — Objet du GO A

Autoriser, **par écrit**, l'exécution de la fenêtre commune : **migration réelle des références** sur `db/custom.db` (phase M) **puis cycle applicatif d'isolation** (phase C) **puis revalidation unique** (phase R), en plusieurs sessions coordonnées **S1→S4** (mode A) avec l'application **inutilisée entre S1 et l'accord de clôture**. Le GO A est **indépendant** du GO B (lot 1 AUD-SEC-004, doc 42) — il peut être accordé sans lui, et réciproquement (sauf clause d'articulation, cf. §2 et §8).

## §2 — Préconditions (toutes bloquantes, vérifiées au démarrage de S1)

| # | Précondition | Vérification |
|---|---|---|
| 1 | **GO écrit du propriétaire** couvrant : docs 30/32/34/41 + dates S1-S4 + mode A + variante B-strict + **nom du nouveau tag candidat** (proposition : `candidat-app-audit-v1.2-R2`) | décision horodatée consignée |
| 2 | Serveur port 3000 **arrêté**, aucun utilisateur actif | `curl localhost:3000` échoue |
| 3 | **Identité du candidat** : `git rev-parse HEAD` = `7dff2c6c98f8be59edb64b34f8a1eb021745a435` · arbre propre · empreinte arbre re-calculée = `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e` | `git status` vide + `git archive \| sha256sum` |
| 4 | **État logique de départ** : Reference **4** / Thesis **1** (« Urbanisme durable ») / 30 tables / 0 violation FK / `integrity_check` = ok | `db-inventory.mjs` lecture seule |
| 5 | **Aucune 2ᵉ thèse existante** (orientation ②) | inventaire §4 |
| 6 | Scripts éprouvés **présents et inchangés** : `audit/baseline/tools/rehearsal-refs/` (7 fichiers) | présence + hashes consignés au journal |
| 7 | **Sauvegarde créée et contrôlée dans la fenêtre** (après gel, avant toute écriture) : copie horodatée dans `audit/baseline/evidence/backups/` · double SHA base/copie **identiques** · inventaire exécuté **sur la copie** · `PRAGMA integrity_check` = ok | **bloquante** — aucune écriture tant que non verte |
| 8 | (uniquement si lot 1 intégré à S2) **levée expresse de P7** + **GO B** accordés (doc 42) | sinon S2 exécute P1 seule |

**Contrôle de continuité entre sessions** (à l'ouverture de chaque Sn, n≥2) : SHA de `db/custom.db` identique à celui consigné à la clôture de la session précédente · `git status` propre · aucun serveur actif — toute divergence = ARRÊT.

## §3 — Périmètre du GO A (écritures autorisées, rien d'autre)

- **Sur la base réelle `db/custom.db`** : uniquement la migration elle-même — étapes M-2 (export réversible 4 références) → M-5 (`prisma db push`, ~1 s) → M-6 (attribution `4/0/0`) → M-7 (`consistency-check`, verdict PASS obligatoire) — **précédées de la sauvegarde bloquante (§2.7)**. Amendement `prisma/schema.prisma` : **commit dédié, 4 lignes exactement** (`thesisId String?` + relation Cascade + `@@index` + `references Reference[]`).
- **Sur le code** : phase C en **commits dédiés** — P1 API (thesisId obligatoire, filtres GET, gardes 404, zod sur le groupe `references`, binding `activeThesisId` côté serveur) → P2 UI (4 vues + DOCX scopés) → P3 (12-16 tests Vitest d'isolation, **exécutés sur le harnais, jamais sur `db/custom.db`**).
- **B-strict (verrouillée)** : **zéro écriture de test sur la base réelle** — preuve d'isolation 2 thèses par le harnais Vitest uniquement ; re-pass UI **mono-thèse en consultation**.
- **Interdits pendant la fenêtre** : push (différé E3), BFG/réécriture, création d'une 2ᵉ thèse réelle, toute modification hors périmètre, tout amend/rebase/force sur le candidat figé.

## §4 — Points d'arrêt (mode A — arrêt obligatoire à chaque PA, poursuite après accord écrit uniquement)

| Session | Contenu | Point d'arrêt — rapport remis | Accord attendu |
|---|---|---|---|
| **S1** (J0, 60-90 min) | Préconditions §2 + sauvegarde + migration M-0→M-7 | **PA1** : SHAs, inventaires avant/après, verdict PASS, commit schéma | « GO S2 » |
| **S2** (J1, 1-2 j) | P1 API isolation **(+ lot 1 si GO B + levée P7)** | **PA2** : diff P1 (+ diff lot 1 le cas échéant) + tests ciblés verts | « GO S3 » |
| **S3** (J2, 0,5-1 j) | P2 UI + P3 tests Vitest d'isolation | **PA3** : résultats 12-16 tests + 0 route `references` sans zod | « GO S4 » |
| **S4** (J3, 0,5-1 j) | Revalidation unique + consignation + **refigeage unique** + nouveau tag | **PA4** : **paquet de 11 preuves** (doc 32 §7) + rapport de fenêtre horodaté | **Décision de clôture écrite** → reprise d'usage |

Règles de coordination (doc 32) : préavis 24 h · **aucune anomalie traversée** (arrêt même en cours de session) · droit de retrait du propriétaire à tout moment (état le plus avancé documenté : état M cohérent / état C = base M + commits dédiés non poussés) · journal de fenêtre horodaté (débuts, fins, contrôles, verdicts) remis au rapport final.

## §5 — Critères de réussite

**Par étape (contrôles bloquants, doc 30 §5)** : M-1 sauvegarde SHA double + inventaire copie · M-2 export rowCount = 4 · M-3 inventaire 4/1/0 FK · M-5 comptages == M-3, integrity ok, FK check = 0 · M-6 `rowsUpdated` = 4, 0 dangling, ambiguïtés = 0 · M-7 verdict **PASS** (`diff vs export = thesisId` seul) · C-P1..P3 : 12-16 tests verts, 0 route `references` sans zod, schémas calqués (payloads valides → réponses identiques) · R : TNR **~1 670 verts**, lint **0 erreur**, 7 GP rejoués, re-pass UI mono-thèse consultation.

**Finaux (à PA4)** : paquet de 11 preuves complet (`migration-reelle-shas.json`, journal d'attribution 4 entrées, rapport d'ambiguïté 0, verdicts PASS, TNR/lint/GP, captures UI, commits + nouveau tag + empreinte consignée, registre 09 + v1.2, journal de fenêtre) · **un seul refigeage** · tag `candidat-app-audit-v1.2` → `7dff2c6` **jamais déplacé** · aucune proposition de clôture sans paquet complet.

## §6 — Critères d'arrêt

Toute divergence de comptage, tout `integrity_check ≠ ok`, toute violation FK, tout dangling ≠ 0, tout test en échec, toute divergence d'empreinte §2 → **ARRÊT IMMÉDIAT, aucun correctif improvisé, signalement, puis rollback §7 avant toute autre action.**

## §7 — Procédures de retour arrière (toutes deux démontrées en répétition générale)

| Voie | Procédure | Quand | Contrôle de réussite |
|---|---|---|---|
| **7a — inverse chirurgical** | `inverse-migration.mjs <db> <journal> <out>` — ré-attribution NULL guidée par le journal (ne touche que les lignes du journal) | anomalie détectée M-6/M-7 **avant** phase C | re-dump : identité stricte avec l'export réversible (démontré 4/4) |
| **7b — restauration byte-identique** (**voie robuste, par défaut**) | re-vérifier SHA sauvegarde → `cp <sauvegarde> db/custom.db` (serveur arrêté) → `prisma generate` → re-contrôles | toute anomalie après M-7, ou en cas de doute | SHA base == SHA sauvegarde · colonne `thesisId` absente · 30 tables · integrity ok |
| **Code (phase C/R)** | abandon des commits de session (non poussés) ou `git revert` des commits dédiés — **jamais** d'amend/rebase/force sur le candidat figé | échec C ou R attribuable au code | base en état M + code revenu à l'état candidat, TNR verte re-constatée |

## §8 — Ce que le GO A n'autorise PAS

- Le lot 1 AUD-SEC-004 **sauf clause expresse** (texte modèle ci-dessous) + GO B + levée P7 (doc 42).
- Le push GitHub (E3 différé — liste doc 38), le BFG/réécriture d'historique, la diffusion externe.
- La création d'une **2ᵉ thèse réelle** avant la validation de la phase R par le propriétaire (orientation ②).
- Le déplacement du tag existant `candidat-app-audit-v1.2` (seul un **nouveau** tag sur un nouveau commit est possible).
- Toute écriture de test sur la base réelle (B-strict) et toute action hors périmètre §3.

## §9 — Texte modèle du GO A (à compléter par le propriétaire)

> « Je donne mon **GO d'exécution** pour la fenêtre commune migration + isolation conformément aux documents 30, 32, 34 et 41 : sessions S1-S4 aux dates ____, mode A (arrêt à chaque PA, poursuite après mon accord écrit), variante B-strict verrouillée, zéro écriture de test sur la base réelle, rollback voie 7b par défaut. Nom du nouveau tag candidat : ____. [Le cas échéant : "Le lot 1 AUD-SEC-004 est autorisé selon le doc 35/42, périmètre §3, intégré à S2" — vaut aussi levée de P7 pour son périmètre exact.] »

## §10 — En l'absence de GO A

Rien n'est exécuté : base réelle en l'état (265 330 688 o, SHA-256 `756c0158…38126d`), candidat figé, aucune écriture `db/custom.db`, aucune modification `prisma/schema.prisma`, aucune modification de code. Les préparatifs restent maintenus et actualisés.

---
*Dossier de préparation — ne constitue ni un GO ni une exécution. Statu quo conservatoire intégral maintenu.*
