# 51 — RECHERCHE D'INSTANTANÉ GIT EN LECTURE SEULE — RÉSULTAT : AUCUN INSTANTANÉ FIABLE SUR LA MACHINE — ARRÊT — 2026-10-12

**Cycle :** audit-final-v1.2 · vague 31 · **Statut : RECHERCHE CIBLÉE EN LECTURE SEULE EXÉCUTÉE CONFORMÉMENT À L'AUTORISATION LIMITÉE DU PROPRIÉTAIRE — AUCUN INSTANTANÉ CONTENANT L'HISTORIQUE GIT ATTENDU N'EST DISPONIBLE SUR LA MACHINE — ARRÊT SANS RESTAURATION NI RECONSTRUCTION, CONFORMÉMENT À L'INSTRUCTION « Si aucun instantané fiable n'est disponible, arrêtez-vous et présentez les options restantes ».**

---

## §0 — Objet et autorisation

Décision du propriétaire (2026-10-12, reproduction intégrale consignée dans la session) : « priorité à la récupération de l'environnement, sans reconstruction d'historique ». Autorisation **limitée à une recherche ciblée en lecture seule** afin d'identifier un instantané ou une copie de l'environnement contenant l'historique Git attendu (commits et tags du candidat initial), avec obligations : (1) préserver l'état actuel et les preuves de la vague 30 ; (2) vérifier le contenu réel des instantanés **sans se fier uniquement aux noms de fichiers ou aux journaux** ; (3) vérifier la cohérence avec les SHA consignés ; (4) présenter résultats, empreintes et provenance **avant toute restauration**. Interdictions : aucune restauration sans nouvelle autorisation écrite ; aucune reconstruction d'historique ni recréation de tags ; aucun commit/tag/push/force-push ; aucune modification des bases, de la sauvegarde ni des preuves historiques ; aucune relance `db:push` ; aucun déplacement/suppression visant à masquer l'anomalie.

## §1 — Méthode (strictement lecture seule)

Commandes employées (aucune n'écrit dans le dépôt, les bases, la sauvegarde ou les preuves) :
- Git en mode verrous optionnels désactivés : `git --no-optional-locks rev-parse / log / tag -l / cat-file -t / count-objects -v / fsck --full --no-progress / stash list / reflog --date=iso / rev-parse / worktree list` ;
- listage et lecture d'archive par flux : `tar -tvf` (listage), `tar -xOf` (extraction **vers stdout uniquement**, zéro écriture disque) ;
- balayage de noms de fichiers y compris cachés : `rg --files --hidden --glob '**/.git/HEAD'`, `--glob '**/*.bundle'`, stat ;
- empreintes : `sha256sum` ; horodatages : `stat -c` ; lecture de fichiers de référence : Read.

Artefacts d'analyse créés (hors projet, /tmp volatile, usage preuve uniquement) : `/tmp/r31-repolist.txt` (listage intégral de l'archive, SHA-256 `a05afd02d5a17e67b84f81b60ea8bbee1def551eb179e21dbd0b3e2fb116ca9c`), `/tmp/r31-repolist-err.txt` (0 ligne). Aucun autre fichier créé ou modifié, hors le présent rapport et l'append worklog (pratique de consignation standard des vagues).

## §2 — Référentiel attendu (preuves antérieures, docs 38 et 50)

| Élément | Valeur consignée | Source |
|---|---|---|
| Commit candidat applicatif | `7dff2c6c98f8be59edb64b34f8a1eb021745a435` (tag `candidat-app-audit-v1.2`, arbre `8ae37eda…e75e`) | doc 38 §3-4 |
| Commit candidat documentaire | `24415b7f19ed89b44201e436f3026680eddd84ad` (tag `candidat-docs-audit-v1.2`, arbre `1dab90e5…85aa`) | doc 38 §3-4 |
| Chaîne docs vagues 14-15 | `d17488a`(1er) · `1381350` · `af98588` · `e35a295` · `938510a` · `dcbc5db` · `fd16fe0` · `11a5517` · `bb657be` · `8a84548` · `dc5c3f3` · `835bdee` · `4a1694f` · `b276a32` · `b5fd7ac` | doc 38 §3 |
| Commits postérieurs (vagues 16-29) | `ce2f634` · `0207f96` · `dc59ea1` · `7179458` (HEAD attendu) | doc 50 §2.2 |
| Tags existants hors candidat | `v1.10.7` → `058b80c` · `v1.10.8` (annoté) → `f0e1a4b` | doc 38 §4 |

## §3 — État actuel du dépôt `/home/z/my-project/.git` (mesuré 2026-10-12, vague 31)

- `HEAD` = **`717d137be31c00e7afbad87f177c2750ab82a7e5`** (marqueur d'environnement UUID `4513c587…`, créé **2026-10-12 13:02:42** — après la restauration, mécanisme de marqueurs documenté) ; parent = `d17488afdb0cf0451ba6ee7c673e383e1ce8a2b8` ; puis `f4ca696…`.
- Tags : **`v1.10.7`, `v1.10.8` uniquement** — les 2 tags candidat absents.
- `cat-file -t` sur les 6 commits attendus → **ABSENT ×6**.
- reflog HEAD : dernière entrée historique **2026-10-10 21:07:39** (amend `315bf99` → `d17488a`), puis marqueur post-restauration — le `.git` est tronqué à l'état du 2026-10-10 soir.
- `count-objects -v` : 2 715 objets libres / 1 340 en pack / 2 packs / 0 garbage. `fsck` : 6 commits pendants = **anciens stash WIP 2026-09-28 → 2026-10-09** (aucun de la chaîne perdue). `stash list` vide. `ORIG_HEAD` = `6436ed77…` (2026-10-09). `alternates` absent. 1 worktree (principal).

## §4 — Découverte du mécanisme de persistance de l'environnement (`/start.sh`)

`/start.sh` (lecture seule) documente le canal de persistance : à l'arrêt d'instance, un crochet « pre-stop » écrit `/home/sync/repo.tar` ; à chaque démarrage, si ce fichier existe, l'environnement **efface le projet** (hors points de montage) et **restaure** `tar xf $ARCHIVE -C /home/z/my-project` — tolérant aux échecs d'extraction (« continuing with partially-restored project »). C'est donc la **source exacte** de la restauration du 2026-10-12 12:57, et le seul canal de persistance visible du bac à sable.

## §5 — Inspection au niveau contenu de `/home/sync/repo.tar` (la pièce maîtresse)

**Empreintes et provenance** : SHA-256 **`cb7e5eab704210d41a58b2e1b194907fe9da2d1b4369fc3344579c8133ee9272`** · 489 210 576 octets · mtime **2026-10-11 23:49:09.155495941 +0000** · écrit APRÈS la dernière activité propre (~21:05) et AVANT la restauration (12:57 le 12) — c'est l'archive qui a produit l'état actuel.

Listage intégral (`tar -tvf`) : **4 181 entrées, exit 0, 0 erreur**. Preuves **au niveau du contenu** (extraction vers stdout / chemins d'objets adressés par contenu) :

| Vérification | Résultat | Interprétation |
|---|---|---|
| `.git/refs/heads/main` (contenu réel) | **`d17488afdb0cf0451ba6ee7c673e383e1ce8a2b8`** | la ref de l'archive pointe exactement sur l'état dégradé actuel |
| `.git/refs/tags/` | `v1.10.7` → `058b80c10b03…` · `v1.10.8` → `3f70bc29e4f1…` (objet de tag annoté, cible `f0e1a4b` conforme doc 38) | **aucun tag candidat** dans l'archive |
| `.git/logs/HEAD` (5 dernières entrées) | dernière = amend `315bf99` → `d17488af…` à l'epoch 1791666459 = **2026-10-10 21:07:39** | le reflog de l'archive s'arrête au 10-10 soir |
| Objets libres aux SHA perdus | **aucun** chemin `objects/7d/ff2c6…`, `objects/24/415b7…`, etc. (les objets Git sont nommés par leur SHA-1 : l'absence du chemin prouve l'absence de l'objet) | les 6 commits attendus ne sont pas dans l'archive |
| Packs | `pack-42d03321…` (2026-10-03) · `pack-32c71e10…` (58,3 Mo, 2026-10-**09** 17:27) | antérieurs aux commits candidats (10-11 06:35) — ne peuvent pas les contenir |
| `packed-refs` / `alternates` / `worktrees` | absents | pas de source d'objets cachée |
| Bases dans l'archive | `db/custom.db` 265 330 688 o (mtime 2026-10-10 17:02) · `db/urbanisme-test.db` **552 960 o (mtime 2026-10-02 17:26 — état pré-resync)** | l'archive ne contient pas non plus l'état post-R2 des bases |
| Arbre de travail | `audit/baseline/` docs **00-23 uniquement** ; `worklog.md` 361 232 o (mtime 2026-10-10 18:27) | l'archive ne contient ni docs 24-50, ni preuves R2, ni v2.2 |

**Conclusion §5** : `/home/sync/repo.tar` = instantané de l'état **2026-10-10 ~21:07**. Son mtime (23:49 le 10-11) contradictoire avec son contenu (10-10 21:07) est établi factuellement ; le mécanisme d'écriture (prestop.py, cité mais non accessible) échappe au bac à sable.

## §6 — Zones balayées sans résultat (recherche exhaustive visible)

| Zone | Résultat |
|---|---|
| `/home/z` et `/tmp` (y compris cachés) | un seul `.git/HEAD` = dépôt courant ; **aucun `*.bundle`**, aucune archive snapshot/backup |
| `/tmp/my-project` (copie 2026-10-11 20:57:58) | **aucun `.git`** (vérifié : `test -d`, `test -f`, énumération des entrées cachées) ; contient bases (custom intègre + test post-push) et pièces R2-01..04 — conformément doc 50 §2.6, capital de récupération **hors Git** |
| `/var`, `/opt`, `/srv`, `/mnt`, `/media`, `/root`, `/lost+found`, `/usr/local` | aucun `.git/HEAD` accessible ; rien de pertinent |
| `/app/temp/repo.tar` | **inaccessible** (permission denied — isolation plateforme entre code agent et espace utilisateur) ; la zone `/app/temp` (mtime 2026-10-10 10:42) est un staging de template initial (scaffold), sans rapport avec la lignée du candidat ; contenu invérifiable depuis le bac à sable |
| `.git` courant (magasin) | objets perdus ABSENT ×6 ; commits pendants = anciens stash ; pas d'alternates ; pas de stash |

## §7 — CONCLUSION : aucun instantané fiable disponible — ARRÊT

1. L'unique copie de dépôt sur la machine (`.git` courant) est tronquée à l'état du 2026-10-10 21:07 — conforme à la constatation vague 30.
2. L'unique archive de persistance (`/home/sync/repo.tar`) — source de la restauration du 10-12 — **ne contient pas, et n'a jamais contenu, la lignée des vagues 14-28** : vérifié au niveau contenu (refs, reflog, objets adressés par SHA, packs datés), pas seulement par noms.
3. Aucune autre copie Git accessible (bundles, alternates, worktrees, stash, zones système) ; `origin` n'a jamais reçu ces commits (push interdit par le protocole).
4. **Les objets Git perdus (`7dff2c6…`, `24415b7…`, `ce2f634`, `0207f96`, `dc59ea1`, `7179458`, 2 tags candidat) ne sont récupérables à l'identique que depuis une source située HORS du bac à sable** (instantané de plateforme). Conformément à l'instruction : **ARRÊT** — aucune restauration, aucune reconstruction, aucun tag recréé.

## §8 — Découverte critique additionnelle : le canal de persistance ne contient PAS l'état courant (risque plateforme)

`repo.tar` (l'état qui sera restauré à la prochaine re-création d'instance si le mécanisme se répète) = état du 10-10. L'état courant — docs 24-50, comparateur v2.2 + suite 30/30, preuves R2-01..10, `worklog.md` complet (vagues 1-30), `db/custom.db` intègre (`756c0158…8126d`), `db/urbanisme-test.db` post-push R2 (`6b72e1dc…65fb8`) — **n'est dans aucune archive visible**. Constat vague 30 §2.4/§2.6 confirmé et étendu : la copie `/tmp/my-project` (20:57) est elle-même volatile et antérieure à la vague 30.

**Recommandation (aucune action exécutée — décision au propriétaire)** : avant toute nouvelle re-création d'instance, faire sécuriser par la plateforme un instantané/export de l'état courant (`/home/z/my-project` et, si possible, l'historique des versions de `/home/sync/repo.tar`). Toute opération locale dans `/home/sync` (remplacement de l'archive) relèverait d'une restauration/écriture et n'a PAS été exécutée.

## §9 — Hypothèse de cause racine (invérifiable de l'intérieur, marquée comme telle)

L'archive écrite le 10-11 **23:49:09** contient un état du 10-10 **21:07** : l'écrivain du tar n'a pas lu l'état courant. Hypothèse la plus cohérente avec tous les constats : une **instance parallèle restée à l'état du 10-10** (recyclée à 23:49) a écrasé `repo.tar` avec son état périmé ; le démarrage du 10-12 12:57 a ensuite restauré cet état. Les composantes plateforme (prestop, orchestration FC) ne sont pas accessibles depuis le bac à sable — cette hypothèse ne peut être confirmée que côté plateforme.

## §10 — Options restantes soumises au propriétaire (aucune exécutée)

1. **Restauration au niveau plateforme (hors sandbox)** d'un instantané du projet postérieur au 2026-10-11 ~21:05 UTC — idéalement capturé le 2026-10-12 **avant** la restauration de 12:57, afin de restituer à la fois les objets Git perdus (état 7179458 + 4 tags) **et** l'état de travail de la vague 30 (v2.2, preuves, docs 49-50). À défaut : tout instantané entre le 2026-10-11 06:35 et 21:05 contiendrait déjà commits candidat + 2 tags candidat (la reprise §4.3bis/étape 6 resterait alors applicable aux preuves déjà consignées). Après restauration : re-vérification complète des préconditions avant toute écriture.
2. **Reconstruction d'historique explicitement autorisée** (option 2 du doc 50, inchangée — lignée neuve documentée comme telle, SHA perdus non restaurables à l'identique, dossier de traçabilité dédié).
3. **Statu quo documenté** — avec la recommandation de sécurisation plateforme du §8 AVANT toute nouvelle recycle.
4. **Toute autre instruction.**

## §11 — Red lines respectées (vague 31)

0 écriture dans `.git` (aucune commande mutante, verrous optionnels désactivés) · 0 écriture dans `db/custom.db` (SHA/mtime vérifiés inchangés : 265 330 688 o, 2026-10-11 06:45:23) et `db/urbanisme-test.db` (622 592 o, 2026-10-11 20:52:26) · 0 modification de `repo.tar`, de la sauvegarde, des preuves historiques · 0 commit, 0 tag, 0 push, 0 restauration, 0 reconstruction · 0 relance `db:push` · aucun déplacement/suppression · seules écritures : le présent rapport (51) et l'append worklog vague 31, artefacts d'analyse `/tmp/r31-*`.

---

*Rapport vague 31 — recherche en lecture seule exécutée dans le cadre strict de l'autorisation limitée du propriétaire ; absence d'instantané fiable établie au niveau contenu ; arrêt conformément à l'instruction ; décision écrite requise (options §10) ; recommandation de sécurisation plateforme urgente (§8).*
