# 44 — CHECKLIST OPÉRATIONNELLE S1 — FENÊTRE COMMUNE (PRÉPARATION, SANS EXÉCUTION)

**Cycle :** audit-final-v1.2 · vague 18 · **Date :** 2026-10-11
**Statut : CHECKLIST PRÉPARÉE — RIEN N'EST EXÉCUTÉ.** Exécution de l'étape 2 du message du propriétaire (2026-10-11) : « Préparez la checklist opérationnelle de S1 à partir du doc 41 et du doc 34, sans écrire sur la base réelle. Précisez les commandes prévues, les fichiers concernés, les sorties attendues, les contrôles bloquants et la procédure d'arrêt. Les vérifications d'inventaire et d'intégrité doivent porter exclusivement sur la copie de sauvegarde. »
**Fondements :** doc 41 (dossier GO A — préconditions §2, points d'arrêt §4, retours arrière §7) · doc 34 (checklist de démarrage §3, séquence §4) · doc 27-A.2 (commandes exactes) · doc 30 §5 (critères bloquants par étape).
**Instructions du propriétaire intégrées et contraignantes :** (i) inventaire et intégrité **exclusivement sur la copie de sauvegarde** ; (ii) déclaration de conformité des préconditions **présentée avant la première écriture** sur la base réelle ; (iii) tout écart = ARRÊT immédiat, aucun contrôle échoué ou incomplet réputé accepté implicitement ; (iv) aucune migration sans GO A écrit.

---

## §0 — Paramètres verrouillés (rappel, doc 34 §1)

| Paramètre | Valeur |
|---|---|
| Candidat de départ | `7dff2c6c98f8be59edb64b34f8a1eb021745a435` (tag `candidat-app-audit-v1.2`, jamais déplacé) · empreinte archive `8ae37eda…87e75e` |
| Base réelle | `db/custom.db` — 265 330 688 o · SHA-256 de référence `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` |
| Mode | A — arrêt à chaque PA, poursuite uniquement après accord écrit · B-strict (zéro écriture de test sur la base réelle) |
| Écritures autorisées | Uniquement la migration M-4/M-5/M-6 précédée de la sauvegarde bloquante + commit schéma dédié (4 lignes) |
| Retour arrière | Voie 7b (restauration byte-identique) par défaut |
| Durée S1 | 60–90 min · préavis 24 h · dates fixées dans le GO écrit |

## §1 — Phase PRÉ-DÉMARRAGE (aucun accès base)

| # | Contrôle | Commande | Sortie attendue | Bloquant |
|---|---|---|---|---|
| 1.1 | GO écrit reçu | — (texte modèle doc 41 §9 : dates + tag R2 + mode A/B-strict [+ levée P7 si lot 1 en S2]) | décision horodatée consignée | **OUI** |
| 1.2 | Serveur arrêté | `curl -s localhost:3000` | échec connexion (aucun serveur actif, aucun utilisateur) | **OUI** |
| 1.3 | Arbre propre | `git status --porcelain` | vide | **OUI** |
| 1.4 | Identité du candidat | `git rev-parse candidat-app-audit-v1.2^{commit}` puis `git archive --format=tar 7dff2c6 \| sha256sum` | `7dff2c6c98f8be59edb64b34f8a1eb021745a435` · empreinte `8ae37edab22fea51f6a4a13a16cd21a8f78c3d55f81c61851e343d43f987e75e` | **OUI** |
| 1.5 | Confinement du candidat | `git diff --name-only 7dff2c6..HEAD -- src prisma db src-tauri package.json tsconfig.json next.config.ts` | vide (HEAD ≠ candidat uniquement par marqueurs documentaires) | **OUI** |
| 1.6 | Outils éprouvés présents | `sha256sum audit/baseline/tools/rehearsal-refs/*` | 8 fichiers, hashes = doc 43 §3.6 | **OUI** |
| 1.7 | Absence fichiers journal WAL | `ls db/` | uniquement `custom.db` + `urbanisme-test.db` (aucun `-wal`/`-shm`) | **OUI** |

> **Note d'ajustement documentaire (à ratifier dans le GO).** Doc 41 §2.3 prévoit « `git rev-parse HEAD` = `7dff2c6…` ». Depuis le gel, HEAD a avancé de **marqueurs d'environnement documentaires uniquement** (docs d'audit + worklog, consignés vague par vague). Le contrôle d'identité est donc exercé par **(1.4) tag intact + empreinte archive re-calculée** et **(1.5) confinement prouvé** — combinaison équivalente et plus rigoureuse en l'état. Le hash complet du commit + arbre propre restent le critère décisif (annexe doc 24).

## §2 — Phase SAUVEGARDE BLOQUANTE (lecture de la base réelle ; **écriture sur la copie uniquement**)

> Principe : la base réelle n'est **jamais ouverte en écriture** et **jamais interrogée** — elle n'est que la **source d'une copie fichier**. Toute vérification (inventaire, intégrité, état logique, absence de 2ᵉ thèse) porte **exclusivement sur la copie** (instruction propriétaire du 2026-10-11), la conformité de la copie à la base étant prouvée par le double SHA-256 (§2.2).

### 2.1 Création de la copie horodatée

```bash
mkdir -p audit/baseline/evidence/backups
cp --preserve=timestamps db/custom.db \
   audit/baseline/evidence/backups/custom-$(date +%Y%m%dT%H%M%S).db
```

| Fichier créé | Rôle |
|---|---|
| `audit/baseline/evidence/backups/custom-<TS>.db` | sauvegarde byte-identique (voie 7b) + support de tous les contrôles pré-écriture |

### 2.2 Double SHA-256 (deux outils indépendants, deux passes) — **BLOQUANT**

```bash
# Passe 1
sha256sum db/custom.db audit/baseline/evidence/backups/custom-<TS>.db
# Passe 2 (outil indépendant)
openssl dgst -sha256 db/custom.db audit/baseline/evidence/backups/custom-<TS>.db
# Tailles
stat -c '%s %n' db/custom.db audit/baseline/evidence/backups/custom-<TS>.db
```

**Sortie attendue (toutes identiques) :**
- SHA-256 base = SHA-256 copie = `756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d` (valeur re-calculée au démarrage de S1 ; toute divergence avec la référence du jour = ARRÊT) ;
- Tailles = 265 330 688 o (base) = 265 330 688 o (copie) ;
- Passe 1 = passe 2 (indépendance des outils prouvée).

**Échec → ARRÊT IMMÉDIAT** (empreinte non identique, taille différente, passe divergente, opération incomplète) — aucune écriture sur la base réelle, consignation, signalement.

### 2.3 Inventaire + intégrité + état logique — **EXCLUSIVEMENT SUR LA COPIE** — **BLOQUANT**

```bash
bun audit/baseline/tools/rehearsal-refs/db-inventory.mjs \
    audit/baseline/evidence/backups/custom-<TS>.db \
    audit/baseline/evidence/migration-inventory-before.json
```

**Sortie attendue (lecture seule, ouverture SQLite READONLY — script hashé doc 43 §3.6) :**

| Contrôle | Valeur attendue |
|---|---|
| Nombre de tables | **30** |
| `Reference` | **4** |
| `Thesis` | **1** (« Urbanisme durable ») — absence de 2ᵉ thèse prouvée |
| `foreign_key_check` | **0 violation** |
| `integrity_check` | **ok** |
| SHA-256 consigné au journal | = valeur §2.2 |

**Échec → ARRÊT IMMÉDIAT.** Un contrôle incomplet ou une sortie non récupérée est traité **comme un échec** (jamais comme un succès).

### 2.4 Déclaration de conformité des préconditions S1 — **PRÉSENTATION BLOQUANTE AVANT LA PREMIÈRE ÉCRITURE**

Les contrôles §1 + §2 sont présentés **ensemble, avec preuves** (sorties brutes, empreintes, horodatages, JSON d'inventaire), sous forme de **déclaration de conformité unique** au propriétaire. **La première écriture sur la base réelle (M-4/M-5) n'a lieu qu'après cette présentation.** Gabarit :

> « Déclaration de conformité des préconditions S1 — [date/heure]. GO écrit : [référence]. Serveur : arrêté. Candidat : tag intact, empreinte `8ae37eda…` re-calculée conforme, confinement vide, arbre propre. Outils : 8/8 hashes conformes. Sauvegarde : copie `custom-<TS>.db`, double SHA-256 (2 passes, 2 outils) identiques = `756c0158…8126d`, tailles identiques. Inventaire **sur copie** : 30 tables, Reference 4, Thesis 1, 0 violation FK, integrity ok, aucune 2ᵉ thèse. Conclusion : préconditions déclarées conformes sur preuves — demande d'autorisation de passage à M-2. »

## §3 — Phase MIGRATION M-0→M-7 (sous GO A uniquement — écritures sur la base réelle)

> Séquence doc 27-A.2 / doc 34 §4, reprise intégralement — commandes exactes, aucun improvisé. Les inventaires « avant » (M-3) sont exécutés **sur la copie** (équivalence prouvée par le double SHA §2.2 — l'état de la copie EST l'état de la base avant écriture) ; les contrôles **post-écriture** portent nécessairement sur la base réelle (lectures).

| Étape | Commande | Sortie attendue / bloquant |
|---|---|---|
| M-2 Export réversible | `bun audit/baseline/tools/rehearsal-refs/export-references.mjs db/custom.db audit/baseline/evidence/references-export-before-<TS>.json` | `rowCount: 4` · integrity ok · SHA base consigné — ≠ 4 → **ARRÊT** |
| M-3 Inventaire avant | `db-inventory.mjs audit/baseline/evidence/backups/custom-<TS>.db audit/baseline/evidence/migration-inventory-before.json` *(sur copie — §2.3 déjà exécuté ; re-lecture du JSON vaut M-3)* | 4 / 1 / 30 / 0 FK — référence des comparaisons post-écriture |
| M-4 Amendement schéma + generate | commit **dédié** : `prisma/schema.prisma` **4 lignes exactement** (`thesisId String?` + relation Cascade + `@@index([thesisId])` + `references Reference[]`) puis `bunx prisma generate` | diff = 4 lignes exactement (contrôle `git diff` avant commit) — tout écart → **ARRÊT** |
| M-5 db push | `bunx prisma db push --skip-generate` | ~1 s · comptages **== M-3** · integrity ok · FK check 0 — toute divergence → **ARRÊT + rollback 7b** |
| M-6 Attribution | `bun audit/baseline/tools/rehearsal-refs/migrate-references-to-thesis.mjs db/custom.db audit/baseline/evidence/migration-attribution-journal.json` | `rowsUpdated = 4` · **0 ambiguë** · **0 sans thèse** · journal horodaté 4 entrées · 0 dangling — tout écart → **ARRÊT** |
| M-7 Consistency | `bun audit/baseline/tools/rehearsal-refs/consistency-check.mjs db/custom.db audit/baseline/evidence/references-export-before-<TS>.json audit/baseline/evidence/migration-consistency.json` *(2ᵉ argument = export JSON de M-2)* | verdict **PASS** obligatoire (4==4, diff = `thesisId` seul) — ≠ PASS → **ARRÊT** |

**B-strict rappelée** : aucune écriture de test sur la base réelle à aucun moment (isolation prouvée par le harnais uniquement).

## §4 — Contrôles bloquants transversaux et procédure d'ARRÊT

**Déclencheurs d'arrêt immédiat (doc 41 §6, doc 34 §6)** : toute divergence de comptage · `integrity_check ≠ ok` · violation FK · dangling ≠ 0 · `rowsUpdated ≠ 4` · diff M-7 ≠ « thesisId seul » · toute divergence d'empreinte (§1.4) · toute sortie incomplète ou non récupérée (traitée comme échec). **Aucune anomalie n'est traversée, même en cours de session.**

**Procédure d'arrêt (dans l'ordre, sans improvisation) :**
1. Cesser toute opération — ne rien « réparer » ;
2. Consigner sorties brutes + horodatage au journal de fenêtre ;
3. **Signalement immédiat** au propriétaire (nature de l'écart, étape, preuves) ;
4. **Rollback voie 7b par défaut** (avant toute autre action, doc 41 §7) :

```bash
# Vérifier la sauvegarde (SHA attendu = 756c0158…8126d consigné en §2.2)
sha256sum audit/baseline/evidence/backups/custom-<TS>.db
# Restaurer byte-identique (serveur arrêté)
cp --preserve=timestamps audit/baseline/evidence/backups/custom-<TS>.db db/custom.db
bunx prisma generate
# Re-contrôles (sur copie fraîche re-créée puis sur base : integrity ok · colonne thesisId absente · 30 tables)
sha256sum db/custom.db   # attendu : == SHA sauvegarde
```

5. Voie 7a (inverse chirurgical `inverse-migration.mjs <db> <journal> <out>`) uniquement sur instruction écrite du propriétaire ;
6. La reprise après arrêt exige une **décision écrite explicite** — le silence ne vaut jamais acceptation.

## §5 — Rapport PA1 (fin de S1 — doc 41 §4)

Contenu : SHAs (sauvegarde, avant, après) · inventaires avant/après · verdict PASS M-7 · hash du commit schéma · journal de fenêtre horodaté. → Accord attendu du propriétaire : **« GO S2 »** (rien ne s'exécute sans lui).

## §6 — Ce que S1 ne fait pas

Aucun push (E3 différé, re-vérification doc 38 juste avant tout push) · aucun BFG/réécriture · aucune création de 2ᵉ thèse réelle · aucune modification de code hors commit schéma dédié · aucune écriture de test sur la base réelle · aucun déplacement du tag `candidat-app-audit-v1.2` · aucune action hors périmètre §3 du doc 41 · aucune exécution tant que le GO écrit n'est pas reçu.

## §7 — Point de coordination signalé (sans effet sur S1)

L'écart C2 `urbanisme-test.db` (drift exit 2 — doc 43 §4) est un point **C2** : il ne figure pas parmi les préconditions S1 du doc 41 §2 et ne bloque donc pas S1 en lui-même. L'arbitrage demandé au propriétaire (options a/b/c doc 43 §4) reste toutefois **préalable à tout C2 Windows**. S'il souhaite lier explicitement la résolution de cet écart au GO A, cela relève de sa décision écrite — elle n'est ni supposée ni anticipée ici.

---
*Checklist de préparation — ne constitue ni un GO ni une exécution. Statu quo conservatoire intégral maintenu.*
