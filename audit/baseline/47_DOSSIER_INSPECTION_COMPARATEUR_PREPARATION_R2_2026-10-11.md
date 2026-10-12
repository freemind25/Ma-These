# 47 — DOSSIER D'INSPECTION INDÉPENDANTE DU COMPARATEUR DE CONTENU + PRÉPARATION OPÉRATIONNELLE R2 — vague 27 (2026-10-11)

**Statut : dossier d'inspection mis à disposition du propriétaire — GEL des outils de comparaison consigné — reproductibilité de la suite synthétique prouvée (2 exécutions indépendantes, 18/18) — RIEN N'EST EXÉCUTÉ sur les bases — resynchronisation, tags R2, push et diffusion RESTENT SUSPENDUS jusqu'aux vérifications R2 et à l'autorisation écrite du propriétaire.**

---

## §1 — Objet

Lors de sa revue de la vague 26, le propriétaire a formulé une réserve explicite :

> « Une dernière réserve : je m'appuie ici sur votre rapport. Sans examiner directement les scripts et les sorties de tests, je ne peux pas certifier indépendamment leur implémentation. »

Le présent dossier lève cette dépendance au rapport : il donne au propriétaire les chemins exacts, les rôles, les **empreintes de gel SHA-256**, les **commandes exactes de re-exécution** et la correspondance avec le runbook doc 46 v3.3 — afin qu'il puisse inspecter et certifier l'implémentation **par lui-même**, sans intermédiaire.

Le propriétaire a par ailleurs prescrit (vague 26) : *« Ne modifiez plus les outils de comparaison sans découvrir un nouveau défaut concret. Le prochain travail doit porter sur la préparation opérationnelle. »* Ce dossier constitue précisément ce travail de préparation : **aucun outil n'a été modifié**, aucune base touchée.

## §2 — Gel des outils de comparaison (consigné)

À compter de la vague 27, les artefacts listés en §3-§4 sont **GELÉS** :

- **Interdiction de modification** des outils de comparaison, de la suite de tests, de la référence de contenu et du DDL attendu ;
- **Seule levée de gel possible** : la découverte d'un **défaut concret nouveau** (constaté, pas spéculé), **validé par écrit par le propriétaire** — avec, dans ce cas : correction, re-run complet de la suite, mise à jour des empreintes du présent dossier, et consignation au worklog ;
- **Toute divergence entre les SHA-256 ci-dessous et les fichiers présents = altération** → arrêt, investigation, et aucune fenêtre R2 avant clarification ;
- Le gel est compatible avec la distinction posée par le propriétaire : **valider les outils de contrôle n'autorise en rien la modification de la base de test** — celle-ci reste soumise au GO signé (doc 46 v3.3 §7).

## §3 — Inventaire des artefacts

| Artefact (`audit/baseline/evidence/`) | Rôle |
|---|---|
| `resync-testdb-rows-dump.mjs` (v2) | Vidage de contenu ligne à ligne, canonisé (NULL, nombres, chaînes, BLOB base64 étiqueté, réels non finis `{"__real":…}`, PK composées, tables sans PK, doublons) ; tri déterministe indépendant de l'ordre physique ; **garde SQL exacte** : tout INTEGER hors plage JS-safe ±(2^53−1) = **REFUS de vidage (exit 2)** plutôt que comparaison arrondie ; lecture seule (`ro` + `PRAGMA query_only=1`) |
| `resync-testdb-compare-contenu.mjs` (v2.1) | Comparateur AVANT/APRÈS : R1 tables préexistantes présentes, R2 contenu **ligne à ligne** (pas seulement SHA), R3 empreinte globale restreinte, R4 conditionnelle 5 nouvelles tables (présentes → toutes présentes et vides ; absentes → préservation pure), R5 aucune table inattendue ; note dédiée « COMPTAGES IDENTIQUES MAIS CONTENU DIVERGENT » ; PASS exit 0 / FAIL exit 1 |
| `resync-testdb-contenu-tests.mjs` | Suite synthétique 18 tests (A : ordre physique + canonisation ; B : faux positifs/négatifs + garde ; D : scénario R2 25+5) — bases jetables `/tmp/v26-tests`, **aucune base réelle** |
| `resync-testdb-rows-avant.json` | Référence de contenu AVANT (25 tables / 38 lignes, empreinte `faed00f9…80f6d`, stable v1→v2) — **preuve d'outillage uniquement** : la référence utilisée au R2 sera reconstituée immédiatement avant l'opération (doc 46 §2.7bis, règle d'exclusivité) |
| `resync-testdb-compare.mjs` + `resync-testdb-inventory.mjs` | Contrôles historiques (comptages §4.3, inventaire 30 tables) — maintenus, non substitués |
| `resync-testdb-ddl-attendu.sql` | DDL attendu **figé** (référence `ab2c312b…07e3355`, doc 46 §2.11) |
| `resync-testdb-contenu-tests-vague26.txt` / `-vague27.txt` | Transcripts des deux exécutions de la suite |
| `resync-testdb-compare-contenu-demo-vague26.txt` | Démonstration sur données réelles : identité PASS + variante SYNTHÉTIQUE corrompue FAIL |
| `resync-testdb-verif-vague27.txt` | Transcript V1-V10 de la vague 27 (pré/post contrôles + re-run + gel) |
| `../46_RUNBOOK_RESYNC_URBANISME_TEST_DB_2026-10-11.md` (v3.3, 358 l.) | Runbook définitif : préconditions, rupture option A, contrôles §4, GO §7 |

## §4 — Empreintes de gel (SHA-256)

Relevées le 2026-10-11 (transcript `resync-testdb-verif-vague27.txt`, §V9-V10) :

```
f4ef4673e30f58cc0d82507839275c5f59e028dbb4bb40edab7268e493d5bf0f  resync-testdb-rows-dump.mjs
23fc22f23255d070241f1897d665ae469e73e70944afaafed4c4e581e8fd4ed7  resync-testdb-compare-contenu.mjs
894f9a18d5532981171c28972d1ce73049a98f601e1695296b31c7b09f8431dd  resync-testdb-contenu-tests.mjs
1815e70a4dfaa3fd643188b9ebdc577917e864317ddcb41cfeb87f6ed0ce3d59  resync-testdb-compare.mjs
9697e644b37d6c5e591f00f158e83503adf69837f3d3cb6c362568cbea7bcbcf  resync-testdb-inventory.mjs
d2a9d5000556392849f72dd4adb389006a86f288b8cc85965a8c08914f24ba77  resync-testdb-rows-avant.json
ab2c312ba1fa021e064903b92153932f1574fd4a19642d94fee99020407e3355  resync-testdb-ddl-attendu.sql
e85612430a7fac3ba5f577f9276508719e3423b4da551b7874fc0a3817f7b4a6  resync-testdb-contenu-tests-vague26.txt
e85612430a7fac3ba5f577f9276508719e3423b4da551b7874fc0a3817f7b4a6  resync-testdb-contenu-tests-vague27.txt  ← identique
e2966f08a6a74fd1eddf5f355a3c43ac9e4e5cf70bd95476fe9dc56c4eefa1e0  resync-testdb-compare-contenu-demo-vague26.txt
820202f44a87cc4560353f6f0c6e3ccc7ad465fe427b077bda4eea461e03db84  46_RUNBOOK_RESYNC_URBANISME_TEST_DB_2026-10-11.md
```

Empreintes des bases réelles au moment du gel (V1 = V8, AVANT = APRÈS) : `custom.db` **756c0158…38126d** (inode 527789, liens 1, mtime référence inchangé) ; `urbanisme-test.db` **16f3c3f4…7584ae5** (inode 527790, liens 2).

## §5 — Reproductibilité prouvée (vague 27)

- **Deux exécutions indépendantes** de la suite (vague 26 puis vague 27, processus distincts) → **transcripts octet pour octet identiques** (même SHA-256 `e8561243…f7b4a6`) : sortie **déterministe**.
- Résultat : **18/18 conformes, exit 0**, à chaque exécution.
- Lecture seule des bases réelles **prouvée** : SHAs AVANT=APRÈS identiques (V1/V8 du transcript vague 27), inodes/liens/mtime inchangés ; toutes les bases de test vivent dans `/tmp/v26-tests` (jetable).

## §6 — Comment inspecter (commandes exactes)

```bash
cd /home/z/my-project

# 1. Lire les trois scripts (l'implémentation elle-même)
#    audit/baseline/evidence/resync-testdb-rows-dump.mjs        (vidage canonisé + garde)
#    audit/baseline/evidence/resync-testdb-compare-contenu.mjs  (règles R1-R5)
#    audit/baseline/evidence/resync-testdb-contenu-tests.mjs    (les 18 tests)

# 2. Re-exécuter la suite synthétique — attendu : 18/18, exit 0, bases /tmp uniquement
bun audit/baseline/evidence/resync-testdb-contenu-tests.mjs

# 3. Démonstration sur données réelles (lecture seule)
bun audit/baseline/evidence/resync-testdb-rows-dump.mjs db/urbanisme-test.db > /tmp/vidage-controle.json
bun audit/baseline/evidence/resync-testdb-compare-contenu.mjs /tmp/vidage-controle.json /tmp/vidage-controle.json
#    attendu : PASS (exit 0)
bun audit/baseline/evidence/resync-testdb-compare-contenu.mjs /tmp/vidage-controle.json \
    audit/baseline/evidence/resync-testdb-rows-corrompu-SYNTHETIQUE-DEMO.json
#    attendu : FAIL (exit 1) + note « COMPTAGES IDENTIQUES MAIS CONTENU DIVERGENT »
#    (la variante SYNTHETIQUE-DEMO est un fichier d'étiquetage explicite — jamais une base réelle)

# 4. Vérifier les empreintes de gel (toute divergence = altération → arrêt)
sha256sum audit/baseline/evidence/resync-testdb-rows-dump.mjs \
          audit/baseline/evidence/resync-testdb-compare-contenu.mjs \
          audit/baseline/evidence/resync-testdb-contenu-tests.mjs \
          audit/baseline/evidence/resync-testdb-rows-avant.json
```

Garanties : lecture seule (`ro` + `PRAGMA query_only=1`), sorties déterministes, aucune écriture sur `db/custom.db` ni `db/urbanisme-test.db` (preuve AVANT=APRÈS V1/V8).

## §7 — Portée (honnête, reprise de doc 46 §9bis)

**Ce que la suite prouve** : les scénarios testés sont détectés exactement comme prévu — identité (PASS), cellule modifiée à comptage inchangé, ligne ajoutée/supprimée, NULL↔'', BLOB modifié, réel non fini, garde grands INTEGER (refus plutôt qu'incertitude), 5 nouvelles vides acceptées / non vides rejetées / table inattendue rejetée, indépendance de l'ordre physique — avec sortie déterministe.

**Ce qu'elle ne prouve pas** : l'absence de tout autre défaut possible, ni la réussite d'une resynchronisation réelle. La revue valide le **mécanisme** ; l'opération reste soumise au GO signé + reconfirmation intégrale des préconditions au moment R2.

## §8 — Correspondance plan de la fenêtre R2 (propriétaire, vague 26) ↔ doc 46 v3.3

| Point du propriétaire | Couverture doc 46 v3.3 |
|---|---|
| 1. Reconfirmer toutes les préconditions | §7.3 (reconfirmation **intégrale au moment R2** ; mesures vagues 21-26 = indicatives) + §2 (préconditions bloquantes) |
| 2. SHA, sauvegarde indépendante, liens physiques, DDL attendu | §1.1-§1.3 (liens + indépendance de la sauvegarde), §2.10 (liens re-mesurés), §2.11 (hash DDL == `ab2c312b…07e3355`), §7.3 |
| 3. Reconstituer et préserver la référence de contenu | §2.7bis (vidage AVANT **immédiatement avant le push** ; règle d'exclusivité point C : référence reconstituée au R2, conservée sans modification) |
| 4. Présenter les résultats au propriétaire pour décision écrite | §7 (GO définitif, 12 preuves attendues §7.7) + §10 (règle : **le dépôt d'un rapport ne vaut jamais autorisation**) |
| 5. N'exécuter que sur autorisation explicite | §7.1 (périmètre exclusif), §7.2 (ordre immuable en 12 étapes), §6 (critères d'arrêt + **journaux SQLite préservés**), §7.5 (plan de restauration) |
| 6. Examiner l'intégralité des preuves avant tags R2 | §5bis/§7.2 (tag app R2 à l'étape 8 ; tag docs R2 à l'étape 12, **uniquement après validation des preuves et du commit documentaire**) + §7.8 (discipline des tags) |

Les **7 contrôles de protection** maintenus en totalité (aucune substitution — point D) : SHA `custom.db` en premier contrôle ; intégrité SQLite + FK ; comptages des préexistantes ; **contenu exact ligne à ligne** (§4.3bis) ; 5 nouvelles tables + 6 index (§4.4) ; staging + périmètre Git (§4.5-§4.6) ; dérive Prisma ×2 + garde-fou CI (§4.7, §5).

## §9 — Gouvernance (inchangée)

- **Suspendus jusqu'aux vérifications R2 + autorisation écrite** : resynchronisation, création des tags R2, push, BFG/force-push, levée de P7, toute diffusion ; C2 Windows : verdict `PROBLEMES` maintenu ; S1 et GO B suspendues.
- Comparateur gelé (§2) ; base réelle `custom.db` et base `urbanisme-test.db` intouchées (preuves §4) ; tags R2 non créés ; push non effectué.
- L'empreinte du présent dossier est consignée dans le worklog (vague 27).

---
*Doc 47 — créé en vague 27 sur la revue du propriétaire (vague 26) : gel des outils, dossier d'inspection indépendante, reproductibilité prouvée, correspondance R2 consignée. Ne constitue ni un GO ni une exécution.*
