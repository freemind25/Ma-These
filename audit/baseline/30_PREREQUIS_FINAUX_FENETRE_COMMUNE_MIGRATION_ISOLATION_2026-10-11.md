# 30 — DOSSIER DE PRÉ-REQUIS FINAUX — FENÊTRE COMMUNE « MIGRATION RÉELLE + ISOLATION APPLICATIVE »

**Cycle :** audit-final-v1.2 · vague 7 · **Date :** 2026-10-11
**Statut : DOSSIER PRÉSENTÉ POUR EXAMEN PRÉALABLE — AUCUNE EXÉCUTION.** Répond à l'orientation **A1 sous conditions** + **B1** du propriétaire (5ᵉ décision, 2026-10-11) : « Avant tout démarrage, présentez-moi les prérequis finaux : sauvegarde vérifiée, empreinte, contrôles d'intégrité, critères d'arrêt, procédure de retour arrière et séquence exacte des opérations. »
**Interdits maintenus :** aucune écriture sur `db/custom.db`, aucune modification de `prisma/schema.prisma`, aucune création de 2ᵉ thèse, **avant GO écrit spécifique du propriétaire sur le présent dossier.**
**Fondements :** doc 21 (séquence, sauvegarde §2, rollback §4) · doc 25 (clarification, cycle P1-P4) · doc 27 (runbooks A/B/C, spécification par route) · répétition générale `18_REPETITION_GENERALE_MIGRATION_REFS.md` (16/16, double rollback).

---

## §1 — Objet de la fenêtre commune (orientation A1 + B1)

Une **session unique coordonnée** réalisant, dans l'ordre :
1. **Phase M — Migration des références** (doc 21 étapes 0-7-bis, isolation 7-bis en **option B** : zéro écriture de test sur la base réelle) ;
2. **Phase C — Cycle applicatif d'isolation** (P1 API → P2 UI → P3 tests vitest — la preuve de l'option B), périmètre `references` uniquement ;
3. **Phase R — Revalidation unique** (TNR complète + re-pass UI, dont 7 golden paths) ;
4. **Consignation** (registre 09, v1.2, tag candidat).

Effet : l'état intermédiaire (8 consommateurs non filtrés, doc 25 §1-§3) n'est **jamais exposé à l'usage** — il n'existe que le temps de la phase C, à serveur arrêté.

**Durée estimée** : demi-journée à une journée (M ≈ 30-45 min hors re-pass · C ≈ 2-3 j de travail répartis — la fenêtre commune peut s'étaler sur plusieurs sessions coordonnées tant que l'app n'est pas utilisée entre M et la fin de C, voir §10 point 4).

---

## §2 — Pré-conditions bloquantes (toutes vérifiées au démarrage, aucune ne peut manquer)

| # | Pré-condition | Vérification au démarrage |
|---|---|---|
| 1 | **GO écrit du propriétaire** sur le présent dossier (séquence, sauvegarde, arrêt, rollback, variante §6.3) | décision horodatée consignée |
| 2 | **Fenêtre coordonnée** : serveur port 3000 arrêté, aucun utilisateur actif, durée disponible conforme §1 | `curl localhost:3000` échoue |
| 3 | **Identité du candidat** : `git rev-parse HEAD` = `7dff2c6c98f8be59edb64b34f8a1eb021745a435` + arbre propre + empreinte arbre = `8ae37eda…87e75e` (re-calculée le 2026-10-11 : conforme) | `git status` vide + `git archive … \| sha256sum` |
| 4 | **État logique de départ** : Reference **4** / Thesis **1** (« Urbanisme durable ») / 0 violation FK / integrity ok | `db-inventory.mjs` lecture seule |
| 5 | **Aucune 2ᵉ thèse créée** (orientation ② — règle respectée tant que le cycle n'est pas validé) | inventaire §4 |
| 6 | Scripts éprouvés présents et inchangés : `audit/baseline/tools/rehearsal-refs/` (7 fichiers) | présence + hashes consignés au journal |

---

## §3 — Sauvegarde vérifiée (phase M, étape 1 — créée DANS la fenêtre, avant toute écriture)

1. **Création** : `cp --preserve=timestamps db/custom.db audit/baseline/evidence/backups/custom-<TS>.db` (après gel des écritures, avant toute autre action).
2. **Contrôles bloquants avant de poursuivre** (les trois doivent être vrais) :
   - `sha256sum db/custom.db <copie>` → **SHA identiques** (copie byte-identique) ;
   - inventaire exécuté **sur la copie** : Reference 4 / Thesis 1 / 30 tables / integrity ok / 0 violation FK ;
   - `PRAGMA integrity_check` sur la copie → `ok`.
3. **Capacité de restauration prouvée en amont** (pas de confiance aveugle) : cycle A3 (restauration + contrôle d'identité démontrés) + voie 7b de la répétition — la vérification SHA dans la fenêtre reconstitue la même garantie.
4. **Règle de variance** (doc 21 §2.5) : si le worker applicatif a écrit des lignes `Job` depuis la dernière capture, le SHA de départ diffère des sessions antérieures — **sans importance** : la référence est le SHA mesuré dans la fenêtre sur la base gelée, consigné dans `evidence/migration-reelle-shas.json`.
5. **Valeur de référence actuelle (indicative)** : taille `db/custom.db` = **265 330 688 octets** (constatée le 2026-10-11).

---

## §4 — Empreintes et valeurs de référence (à comparer au démarrage et à l'arrivée)

| Objet | Valeur de référence | Contrôle dans la fenêtre |
|---|---|---|
| Commit candidat | `7dff2c6c98f8be59edb64b34f8a1eb021745a435` | `git rev-parse HEAD` — identique |
| Empreinte arbre de référence | `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e` | `git archive --format=tar 7dff2c6 \| sha256sum` — identique |
| État logique DB | 1 thèse `cmsmyrdfs0000pa2sews4vo90` « Urbanisme durable » · 7 chapitres · **4 références** (`cmsn1z0bt…`, `cmsz0h3w8…`, `cmsz38jar…`, `cmu4daa0b…`) · résidu INITIAL_* (1 entrée toolbox) | `db-inventory.mjs` avant/après |
| Taille base | 265 330 688 o | à l'étape 1 (variance SHA possible, cf. §3.4) |
| Comportement applicatif | inchangé à l'issue de M (condition 3 du GO) ; scopé à l'issue de C | étape 8 / phase R |

---

## §5 — Contrôles d'intégrité (bloquants, par étape)

| Étape | Contrôle | Seuil bloquant |
|---|---|---|
| M-1 sauvegarde | SHA double + inventaire copie + integrity | toute divergence → ARRÊT |
| M-2 export | rowCount = 4, integrity ok, 0 violation FK | écart → ARRÊT |
| M-3 inventaire avant | Reference 4 / Thesis 1 / 0 FK | écart → ARRÊT |
| M-5 db push | comptages == M-3 · integrity ok · foreign_key_check = 0 · durée normale (~1 s) | écart → rollback §8 |
| M-6 attribution | `rowsUpdated` = 4 · 0 dangling · journal complet (4 entrées, motif CAS_UNIVOQUE) · ambiguïtés = 0 | écart → rollback §8 |
| M-7 cohérence | verdict **PASS** `consistency-check` : 4==4, 0 dangling, integrity ok, **diff vs export = `thesisId` seul** | écart → rollback §8 |
| M-7-bis isolation | **option B** : aucune écriture — preuve = répétition 16/16 sur copie + suite vitest P3 (phase C) | — |
| C-P1..P3 | 12-16 tests d'isolation verts · 0 route `references` sans zod · schémas calqués (payloads valides → réponses identiques) | écart → phase C stoppée, base en état M (cohérent, doc 25 §3) |
| R (étape 8) | TNR **1 658+ verts** (cible ~1 670 avec les tests P3) · lint 0 erreur · 7 GP rejoués · re-pass UI (§6.3) | écart attribuable au push/cycle → rollback §8 |

---

## §6 — Séquence exacte des opérations (fenêtre commune)

### 6.1 Phase M — migration (doc 21 étapes 0-7-bis, commandes doc 27-A.2 — résumé)

```
0. Gel des écritures (serveur arrêté) + pré-conditions §2
1. Sauvegarde horodatée + double SHA + inventaire copie  (§3 — bloquant)
2. Export réversible 4 références                        (rowCount 4)
3. Inventaire avant                                       (4/1/0 FK)
4. Amendement prisma/schema.prisma — COMMIT DÉDIÉ, 4 lignes exactement
   (thesisId String? + relation Cascade + @@index + references Reference[]) + prisma generate
5. bunx prisma db push --skip-generate                    (~1 s)
6. migrate-references-to-thesis.mjs                       (4 attribuées / 0 ambiguë / 0 sans thèse)
7. consistency-check.mjs                                  (verdict PASS obligatoire)
7-bis. Isolation — OPTION B : zéro écriture de test sur la base réelle
       (preuve : répétition 16/16 sur copie + suite vitest P3 en phase C)
```

### 6.2 Phase C — cycle applicatif d'isolation (design complet : doc 27 partie C)

```
P1 API (0,5-1 j)  : thesisId obligatoire (zod + FK → 400) sur POST/import/bibtex
                    · filtre GET obligatoire (→ 400 si absent) · garde PUT/DELETE → 404
                    · zod sur tout le groupe references · binding activeThesisId côté serveur (jamais theses[0])
P2 UI  (0,5-1 j)  : 4 vues + DOCX scopés (activeThesisId du store)
P3 TEST (0,5 j)   : 12-16 tests vitest d'isolation (preuve option B) — exécutés sur le harnais de test, jamais sur db/custom.db
```

**Point de contrôle entre M et C** : verdict PASS M-7 consigné avant toute écriture de code. **En cas d'échec C** : la base reste en état M (état cohérent documenté doc 25 §3 — la migration n'est pas annulée pour autant, décision au propriétaire).

### 6.3 Phase R — revalidation unique (étape 8 étendue)

TNR complète (~1 670 verts) · lint 0 erreur · 7 golden paths · re-pass UI des 4 vues consommatrices + GP-3/GP-7.
**Variante à arbitrer au GO (point soumis séparément — voir §10)** : la re-pass UI à 2 thèses utilise soit (i) **2 thèses jetables** créées puis supprimées via l'UI, preuve diff DB vide avant/après (règle de test établie, protocole `isolation-multitheses.json`), soit (ii) **variante B-strict** : preuve d'isolation 2-thèses **uniquement par le harnais de test vitest** (zéro création même jetable sur la base réelle), re-pass UI mono-thèse.

### 6.4 Consignation (fin de fenêtre)

`migration-reelle-shas.json` · journal d'attribution (4 entrées) · rapport d'ambiguïté (0 attendu) · verdicts PASS · captures UI · commit unique schéma+migration (doc 21 étape 10) · commit(s) cycle applicatif · **refigeage candidat + nouveau tag** · registre 09 + v1.2 mis à jour.

---

## §7 — Critères d'arrêt consolidés

**Critère global : toute divergence de comptage, tout `integrity_check ≠ ok`, toute violation FK, tout dangling ≠ 0, tout test d'isolation en échec, toute divergence d'empreinte §4 → ARRÊT IMMÉDIAT, aucun correctif improvisé, retour arrière §8 avant toute autre action, signalement au propriétaire.** Aucun écart n'est traité « à la main » pendant la fenêtre.

## §8 — Procédure de retour arrière (double voie, toutes deux démontrées)

| Voie | Procédure | Quand | Contrôle de réussite |
|---|---|---|---|
| **7a — inverse chirurgical** | `inverse-migration.mjs <db> <journal> <out>` — ré-attribution NULL guidée par le journal (garde : ne touche que les lignes du journal) | anomalie détectée M-6/M-7 avant phase C | re-dump : identité stricte avec l'export réversible (démontré 4/4 en répétition) |
| **7b — restauration byte-identique** (voie **robuste, par défaut**) | re-vérifier SHA sauvegarde → `cp <sauvegarde> db/custom.db` (serveur arrêté) → `prisma generate` → re-contrôles | toute anomalie après M-7, ou en cas de doute | SHA base == SHA sauvegarde · colonne `thesisId` absente · 30 tables · integrity ok (démontré en répétition) |
| **Code (phase C)** | la phase C s'exécute en commits dédiés **après** PASS M-7 ; retour arrière code = abandon des commits de la session (non poussés) ou `git revert` des commits dédiés — **jamais** d'amend/rebase sur le candidat figé | échec C ou R attribuable au code | base en état M + code revenu à l'état candidat ; TNR verte re-constatée |

## §9 — Livrables de fin de fenêtre (réception par le propriétaire)

1. `migration-reelle-shas.json` (SHAs, horodatages, tailles) · 2. journal d'attribution (4 entrées) · 3. rapport d'ambiguïté (0 attendu) · 4. verdicts PASS (consistency-check + isolation 16/16 répétition + 12-16 vitest) · 5. TNR/lint/GP/re-pass UI consignés · 6. commits + nouveau tag candidat · 7. registre 09 + v1.2 à jour · 8. rapport de fenêtre (déroulé, écarts éventuels, temps réel vs estimé).

## §10 — Checklist de décision finale (ce que votre GO écrit doit couvrir)

- [ ] **GO écrit sur le présent dossier** (séquence §6, sauvegarde §3, intégrité §5, arrêt §7, rollback §8)
- [ ] **Variante re-pass UI** (§6.3) : (i) 2 thèses jetables avec diff DB vide **ou** (ii) B-strict vitest uniquement
- [ ] **Calendrier de fenêtre** coordonné (dates/horaires ; la phase C peut s'étaler sur plusieurs sessions tant que l'app reste inutilisée entre M et la fin de C+R)
- [ ] **Confirmation** : aucune 2ᵉ thèse réelle ne sera créée avant votre validation de la phase R (orientation ② respectée)
- [ ] (rappel) décision AUD-SEC-004 **indépendante** (doc 31) — sans impact sur cette fenêtre si C-A ; articulation possible du lot 1 avec P1 si C-B/C-C (un seul refigeage)

**En l'absence de GO : rien n'est exécuté** — base réelle en l'état, candidat figé, préparations conservées.

---
*Ce dossier consolide : doc 21 (séquence/sauvegarde/rollback), doc 25 §4 (cycle P1-P4), doc 27-A.2 et 27-C (commandes et design). Aucune modification de code, aucune écriture base, aucune migration effectuée par la présente.*
