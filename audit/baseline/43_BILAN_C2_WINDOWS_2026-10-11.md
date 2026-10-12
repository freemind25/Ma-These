# 43 — BILAN C2 WINDOWS — CONTRÔLES EXÉCUTÉS, ÉCARTS ET DEMANDE DE COMPLÉMENT

**Cycle :** audit-final-v1.2 · vague 18 · **Date :** 2026-10-11
**Statut : VERDICT `PROBLEMES` — AUCUN SUCCÈS DÉCLARÉ, AUCUN VERDICT DESKTOP_WINDOWS_VALIDE.** Exécution de l'étape 1 du message du propriétaire (2026-10-11) : « Préparez et réalisez la vérification C2 sur le candidat figé `7dff2c6`, conformément au doc 39. Transmettez les huit preuves attendues, les sorties brutes et les résultats de contrôle. »
**Fondements :** doc 39 (cadre de réception, protocole §3) · doc 24 (check-list d'exécution, §2 pré-contrôles, §7 preuves) · règle d'écarts doc 39 §4 : **tout écart → ARRÊT + signalement immédiat ; aucun succès déclaré avant vérification complète ; aucun correctif**.

---

## §1 — Ce qui a été exécuté, où, et limites du périmètre

Le C2 (build Windows Tauri + smoke) est **exécuté par le propriétaire sur sa machine Windows** (doc 39 §1, doc 24 §0). L'environnement d'audit (bac à sable Linux) ne peut ni produire l'installeur NSIS ni les captures d'une machine Windows. La vérification réalisée ici couvre donc **exactement deux choses** :

1. **Les contrôles C2 exécutables en lecture seule sur le dépôt et les bases versionnées** (pré-contrôles doc 24 §2 + cohérence dépôt doc 24 §5.2) — **exécutés le 2026-10-11**, sorties brutes en §3 ;
2. **Le contrôle de complétude des 8 preuves attendues** (doc 39 §3 étape 1) — exécuté, résultat : **6 items sur 8 non reçus** (§2).

Conformément au protocole doc 39 §3 : item manquant = demande de complément, **aucune vérification déclarée** ; écart détecté = ARRÊT + signalement immédiat.

## §2 — Tableau de contrôle des 8 preuves (doc 39 §2)

| # | Preuve (doc 24 §7) | Présence | Verdict partiel | Détail |
|---|---|---|---|---|
| 1 | `c2-build-windows.json` (gabarit doc 24 §8 rempli) | **NON REÇUE** | demande de complément | aucune occurrence du fichier dans l'espace de travail |
| 2 | Captures `c2-01`…`c2-13` (naming Windows doc 24 §7.2) | **NON REÇUES** | demande de complément | les `c2-*.png` présents dans `evidence/` sont les preuves du **volet web C1/C2-web antérieur** (isolation, cleanup) — pas les 13 captures Windows ; `c2-windows-checklist-pre-remplie.md` est la checklist **obsolète v1** (préparée sur `fb60ae1`, doc 24 §0 : à ne pas utiliser) |
| 3 | Versions (Tauri, rustc, Bun, Node, winver) | **NON REÇUES** | demande de complément | relevés impossibles hors machine Windows |
| 4 | Empreinte d'arbre + `git rev-parse HEAD` + `git status` **de la machine Windows** | **NON REÇUES** (sorties Windows) — **empreinte de référence re-vérifiée côté audit : CONFORME** | contrôle partiel PASS (dépôt) | `git archive --format=tar 7dff2c6 \| sha256sum` = `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e` (= référence dev 2026-10-10) ; tag `candidat-app-audit-v1.2` → `7dff2c6c98f8be59edb64b34f8a1eb021745a435` intact ; arbre propre ; confinement `7dff2c6..HEAD` sur src/prisma/db/src-tauri/configs = vide. Les sorties brutes **de la machine Windows restent exigées** (elles ne sont pas substituables) |
| 5 | Pré-contrôles drift DB (2 exit codes) | **EXÉCUTÉS côté audit** | **ÉCART — exit 2 sur `urbanisme-test.db`** | `custom.db` : **exit 0** (« No difference detected ») — conforme ; `urbanisme-test.db` : **exit 2 — DRIFT** (§4) |
| 6 | Chemin + taille installeur NSIS `Ma Thèse_1.10.8_x64-setup.exe` | **NON REÇUE** | demande de complément | aucun `.exe`/`.msi` dans l'espace de travail ; nom/version attendus re-vérifiés au dépôt (§3.4) |
| 7 | Déclaration d'écarts (même mineure) | **NON REÇUE** | demande de complément | — |
| 8 | Confirmation de nettoyage `AUDIT-C2-` | **NON REÇUE** | demande de complément | aucun objet `AUDIT-C2-` dans l'espace de travail (normal : objets créés sur la machine de test) |

## §3 — Sorties brutes des contrôles exécutés côté audit (2026-10-11)

### §3.1 Identité du candidat (contrôle premier et bloquant, doc 39 §3.2)

```
$ git archive --format=tar 7dff2c6 | sha256sum
8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e  -        ← = référence dev 2026-10-10 : CONFORME

$ git rev-parse candidat-app-audit-v1.2^{commit}
7dff2c6c98f8be59edb64b34f8a1eb021745a435                                ← tag intact

$ git status --porcelain
(vide) — arbre propre

$ git diff --name-only 7dff2c6..HEAD -- src prisma db src-tauri package.json tsconfig.json next.config.ts
(vide) — confinement du candidat prouvé (HEAD ne diffère du candidat que par des marqueurs documentaires)
```

### §3.2 Drift DB #1 — `db/custom.db` (base réelle) : **exit 0 — conforme**

```
$ bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code
No difference detected.
exit=0
```

### §3.3 Drift DB #2 — `db/urbanisme-test.db` : **exit 2 — DRIFT (écart, cf. §4)**

```
$ bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/urbanisme-test.db --exit-code

[-] Removed tables
  - SoutenancePrep
  - LegalRef
  - Article
  - ArticleVersion
  - ImportedDoc

[*] Redefined table `Chapter`
[*] Redefined table `ChapterVersion`
[*] Redefined table `CustomBookSkill`
[*] Redefined table `Job`

[*] Changed the `Article` table
  [-] Removed index on columns (thesisId)
[*] Changed the `ArticleVersion` table
  [-] Removed index on columns (articleId)
[*] Changed the `ImportedDoc` table
  [-] Removed index on columns (thesisId)
[*] Changed the `LegalRef` table
  [-] Removed index on columns (domaine)
[*] Changed the `SoutenancePrep` table
  [-] Removed unique index on columns (thesisId)
  [-] Removed index on columns (thesisId)
exit=2
```

### §3.4 Cohérence dépôt au candidat (valeurs attendues doc 24 §5.2) : **CONFORME**

- **CSP production** (`tauri.conf.json` au commit `7dff2c6`) : valeur lue **identique caractère pour caractère** à l'attendu doc 24 §5.2 (`default-src 'self'; script-src 'self' 'unsafe-inline'; … frame-ancestors 'none'`).
- **Capabilities** (`src-tauri/capabilities/default.json` au candidat) : `permissions: ["core:default"]` seul · `windows: ["main"]` · **aucune permission shell** — conforme.
- **Produit/version** : `"productName": "Ma Thèse"`, `"version": "1.10.8"` — motif d'installeur attendu confirmé (`Ma Thèse_1.10.8_x64-setup.exe`, cible NSIS).

### §3.5 Preuve de non-modification par les contrôles (lecture seule prouvée)

```
db/custom.db         : 265 330 688 o · mtime 2026-10-11 06:45:23.410462155 (inchangé)
                       SHA-256 756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d (inchangé, AVANT=APRÈS)
db/urbanisme-test.db : 552 960 o · mtime 2026-10-02 17:26:56 (inchangé — dernière synchro documentée 2026-10-02)
                       SHA-256 16f3c3f4b42cdcaa1be1235ec593ff6beda3fbea6ed8104803ac0eb5a7584ae5
git status après contrôles : (vide) — arbre propre
```

### §3.6 Outils éprouvés — hashes consignés (doc 41 §2.6)

8 fichiers présents au candidat et **inchangés depuis** (`git diff 7dff2c6..HEAD -- audit/baseline/tools/` vide) :

| Fichier | SHA-256 |
|---|---|
| consistency-check.mjs | `da0ef147bc50e85f067274bababb2a7a159aaf334be603d5da26a72851ea1b7e` |
| db-inventory.mjs | `84f5111eb89baf263c863443f6b1954803f0f28b4011175a3e574ab0a017d52f` |
| export-references.mjs | `1391622e3af39d4c6844c3acb7dd275bd9dc6ba3c5ba8f362958698132e52946` |
| inverse-migration.mjs | `7848936f158bec9efe65caec0b81fc89ff624c9faeec38c806a41b5c6538b7ed` |
| isolation-tests.mjs | `580c6faedeacadb1d9f5cde51f6539f48e49581f1584973bbbb0cd3350b73c87` |
| migrate-references-to-thesis.mjs | `212652f3a2e5911f1e6f8ab67f37d2e3d7e7302878f270341b0ab553f29911b8` |
| schema-rehearsal.prisma | `c854ca0230844f69f44058991ff89eccb00498070630b55fe04398cd16b2915b` |
| setup-test-thesis.mjs | `5e9a07753a664d4307544fed4cd0094c78ed76af2e1db464e189076b08066eb0` |

> Note de comptage : doc 41 §2.6 mentionne « 7 fichiers » ; le dossier en contient **8** (7 scripts `.mjs` + `schema-rehearsal.prisma`). Les 8 sont présents **au candidat** et inchangés. Simple écart de libellé documentaire, signalé pour exactitude.

## §4 — ÉCART DÉTECTÉ N°1 : drift `urbanisme-test.db` (exit 2) — signalement immédiat

**Constat.** Le critère doc 24 §2 / doc 39 §2 item 5 est `exit 0 et 0`. Résultat : `custom.db` **exit 0** (conforme) mais `urbanisme-test.db` **exit 2** : la base de test reflète un état de schéma antérieur (fichier intact depuis le **2026-10-02**, dernière ré-synchro documentée à cette date) — le datamodel a évolué depuis (5 tables absentes, 4 tables redéfinies, 5 index manquants, cf. §3.3).

**Qualification.**
- Première exécution consignée du drift ×2 sur `urbanisme-test.db` dans l'environnement d'audit : **aucune exécution antérieure de ce contrôle n'est retrouvée** dans les preuves (la preuve T3 vague 4 portait sur `custom.db` + une copie de drift fabriquée). L'état de désynchronisation est **préexistant** (aucune écriture depuis le 2026-10-02) ; sa **détection est nouvelle** (2026-10-11).
- `db/custom.db` (base réelle) **n'est pas concernée** : exit 0, SHA-256 et mtime inchangés, intégrité conservatoire prouvée.
- Conséquence directe : **si le C2 est exécuté tel quel sur la machine Windows** (doc 24 §2), le pré-contrôle drift s'arrêtera sur `urbanisme-test.db` (exit 2 = ARRÊT avant build). Le C2 est donc **bloqué en l'état** sur ce point.

**Aucun correctif exécuté** (règle doc 39 §4 : aucun correctif de code ni de configuration). Le fichier est **versionné au candidat figé** et **embarqué dans l'installeur** (ressource `tauri.conf.json`) : toute correction modifierait l'arbre du candidat et exigerait un arbitrage et un GO spécifiques. Options soumises à décision du propriétaire (aucune retenue, aucune exécutée) :
- **(a)** Ré-synchroniser `urbanisme-test.db` sur le datamodel courant (équivalent `db push` sur la base de test) — modification d'un fichier versionné → commit dédié autorisé + impact empreinte candidat (nouveau tag) ;
- **(b)** Accepter le drift documenté **pour la base de test uniquement** et ajuster par écrit le critère C2 item 5 (exit 0 exigé sur `custom.db` seul, écart `urbanisme-test.db` consigné comme écart accepté) — l'app utilise `custom.db`, la base de test n'est qu'une ressource embarquée ;
- **(c)** Exclure `urbanisme-test.db` des ressources de l'installeur — modification `tauri.conf.json` → impact candidat, idem (a).

## §5 — Verdict C2 (doc 39 §3.4)

> **`PROBLEMES`** — en l'état, sans que le build Windows ait été tenté :
> 1. **Complétude non satisfaite** : 6 items sur 8 non reçus (demande de complément — doc 39 §3.1) ;
> 2. **Écart détecté** : drift exit 2 sur `db/urbanisme-test.db` (item 5) — bloque l'exécution C2 telle que spécifiée, arbitrage propriétaire requis (§4).

**Aucun verdict `DESKTOP_WINDOWS_VALIDE` n'est prononcé. Aucun succès n'est déclaré.** Le C2 demeure le dernier critère GO non exécuté (doc 39 §5) et n'autorise rien par lui-même.

## §6 — Actions nécessaires (toutes à décision/charge du propriétaire — rien n'est exécuté)

1. **Arbitrage sur l'écart §4** : option (a), (b) ou (c) — formalisation écrite requise avant toute reprise du C2 ;
2. **Exécution du C2 sur la machine Windows** conformément au doc 24 (check-list d'exécution) puis **transmission des 8 preuves** (contrôle à réception selon doc 39 §3) — sauf ajustement écrit du critère item 5 (option b) ;
3. Rappels inchangés : aucune diffusion du binaire, base de la machine de test uniquement, objets `AUDIT-C2-` créés puis nettoyés, résultats C2 rapportés séparément du volet web C1.

## §7 — Statu quo

Candidat `7dff2c6` figé et tagué (empreinte re-vérifiée conforme) · `db/custom.db` intacte (SHA-256 prouvé AVANT=APRÈS) · aucun correctif, aucune modification de code, de configuration, de schéma ou de base · aucun push, BFG, GO A, GO B, levée de P7, migration · statu quo conservatoire intégral.

---
*Bilan de vérification C2 — ne constitue ni un GO ni une exécution supplémentaire. Signalement d'écart effectué conformément au doc 39 §4.*
