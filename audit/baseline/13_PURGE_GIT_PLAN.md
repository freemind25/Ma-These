# Plan de purge de l'historique Git — AUD-SEC-002/003 (cycle audit-final-v1.2)

**Statut : PRÊT — EN ATTENTE des 3 conditions propriétaire** (mise à jour v1.2, T4) : **(i)** confirmation de la **révocation de l'ancienne clé** exposée auprès du fournisseur APINex, **(ii)** validation du présent plan, **(iii)** fenêtre de coordination explicite (personnes + clones). **AUCUNE réécriture d'historique, AUCUN force-push, AUCUNE exécution de BFG avant ces trois conditions.**

**v1.2** — la section 7 ci-dessous constitue la **version exécutable prête** (prérequis chiffrés, procédure pas-à-pas avec commandes exactes, contrôles bloquants, checklist post-purge, critères de réussite/arrêt, rollback). Les sections 1-6 ci-dessus sont conservées comme **historique v1.0** (périmètre établi par l'audit A5, prérequis initiaux, procédure synthétique, preuves attendues, risques, règle de confidentialité).

**v1.0 (historique) — Statut : PRÉPARÉ — exécution subordonnée** (instructions propriétaire point 8) : ① présentation de ce plan, ② confirmation de la rotation/révocation de la clé exposée auprès du fournisseur APINex, ③ fenêtre de coordination explicite (personnes + clones). **Aucune réécriture ni force-push avant ces trois conditions.**

## 1. Périmètre établi par l'audit A5 (`evidence/a5-git-audit.json`)

- **Élément à purger** : le fichier `.env` de **toute** l'historique (10 commits concernés, de `eda4dac` initial à `c9a05e8`).
- **Secret concerné** : `APINEX_API_KEY` (nom seul consigné) — présente dans l'historique publié via `.env` aux commits porteurs `04dc5ab` et `763ee5d` (retraits : `b25f426`, `7260947`).
- **Sans objet** : PAT GitHub (0 dans l'historique) ; les références masquées des documents suivis (analyse de longueur : aucune clé réelle).
- **Refs à réécrire** : `main` + tags `v1.10.7`, `v1.10.8` → **force-push requis**.
- `.env` est désormais **désuit à HEAD** (commit `6158f4e`) — la purge ne traite que le passé.

## 2. Prérequis d'exécution

1. ✅ Sauvegarde vérifiée (bundle + miroir — refaite à frais le jour J).
2. ⬜ **Confirmation propriétaire** : révocation/rotation de la clé exposée confirmée auprès du fournisseur APINex.
3. ⬜ **Coordination** : annonce de la fenêtre ; inventorier les clones actifs (sandbox développeur + propriétaire) ; convenir que personne ne pousse pendant la fenêtre ; prévoir le réalignement après force-push.

## 3. Procédure (fenêtre coordonnée, ~30 min)

```bash
# 3.1 — sauvegarde fraîche
git bundle create tf-avant-purge.bundle --all && git bundle verify tf-avant-purge.bundle
git clone --mirror origin tf-mirror-avant-purge.git

# 3.2 — clone miroir de travail
git clone --mirror origin tf-purge.git && cd tf-purge.git

# 3.3 — purge (outil au choix, checksum vérifié au téléchargement)
java -jar bfg.jar --delete-files .env tf-purge.git
#   ou équivalent : git filter-repo --invert-paths --path .env
cd tf-purge.git && git reflog expire --expire=now --all && git gc --prune=now --aggressive

# 3.4 — VÉRIFICATIONS AVANT PUBLICATION (blocage si échec)
git log --all -G 'sk-apx[A-Za-z0-9]{20,}' --oneline        # attendu : 0 ligne
git log --all --oneline -- .env                            # attendu : 0 commit
# scan des objets résiduels ; revérifier tags réécrits

# 3.5 — publication coordonnée
git push --force origin main --tags

# 3.6 — vérifications post-publication
git clone origin tf-verif.git && cd tf-verif.git
git log --all -G 'sk-apx[A-Za-z0-9]{20,}' --oneline        # attendu : 0
git log --all --oneline -- .env                            # attendu : 0

# 3.7 — réalignement des clones
# sandbox + propriétaire : re-clone (recommandé) ou fetch + reset --hard origin/main
```

## 4. Preuves attendues (critère de sortie n° 7)

1. Bundle pré-purge conservé + vérifié.
2. Sorties 3.4 et 3.6 (0 correspondance) archivées dans `evidence/` — **sans reproduction des valeurs**.
3. Table de correspondance hashes pré→post (pour la traçabilité des rapports).
4. Confirmation écrite de la révocation côté fournisseur (propriétaire).
5. Inventaire des clones réalignés.

## 5. Risques et mesures

| Risque | Mesure |
|---|---|
| Réécriture de tous les hashes | table de correspondance pré/post ; les rapports d'audit citent les hashes pré-purge comme référence historique (documenté) |
| Clones obsolètes réintroduisant l'ancien historique | coordination + réalignement 3.7 ; vérification post par re-scan |
| Indisponibilité outil (BFG non installé ici) | téléchargement BFG jar (java présent) ou `git-filter-repo` (pip), checksum vérifié avant usage |
| Perte accidentelle | double sauvegarde (bundle + miroir) avant toute opération |

## 6. Règle de confidentialité (v1.0, maintenue en v1.2)

Aucune valeur de secret, clé ou donnée sensible ne sera reproduite dans les preuves, les logs ou les rapports — uniquement des chemins de fichiers, hashes de commits et comptages.

---

## 7. VERSION EXÉCUTABLE PRÊTE — v1.2 (T4, préparée 2026-10-10, NON exécutée)

> Cette section est le plan d'exécution de référence. Elle reprend et chiffre le périmètre v1.0 (§1-§5, établi par l'audit A5, preuve `evidence/a5-git-audit.json`). **Exécution interdite sans les 3 conditions propriétaire (i)/(ii)/(iii).**

### 7.0 Objet et règle absolue

- **Objet** : la **clé APINex historique** (variable `APINEX_API_KEY` — nom seul consigné) a été **exposée dans l'historique git** via le fichier `.env` (suivi depuis le commit initial), et l'historique est **publié sur origin** (`github.com/freemind25/ThesisFrame`). La purge vise à retirer `.env` (donc le secret) de **toute** l'historique publié.
- **Règle absolue** : cette clé historique est **COMPROMISE — JAMAIS RÉUTILISER**, ni localement, ni ailleurs. Toute clé de remplacement est **nouvelle**, fournie par le propriétaire **par canal sécurisé** (gestionnaire de secrets / remise directe), et **n'apparaîtra ni dans les preuves, ni dans les logs, ni dans Git** (`.env`/`.env.local` désuivis et ignorés — cf. commit `6158f4e`).

### 7.1 Prérequis chiffrés (état mesuré 2026-10-10, baseline `6f853ac`)

| Prérequis | Valeur mesurée / exigence |
|---|---|
| Taille du dépôt | `.git` ≈ **185 Mo** sur disque (loose 121,43 MiB + packs 61,44 MiB, 3 809 objets) ; à l'audit A5 : bundle **78 Mo** (« complete history ») + miroir **155 Mo** — refaits à frais le jour J |
| Nombre de commits | **253** sur `main` (tous réécrits après le premier commit `.env`) |
| Chemins/fichiers contenant le secret | **`.env` uniquement** (audit A5 §4 : 0 PAT GitHub, la clé fournie par IM jamais commitée, aucune autre clé) — référence : `evidence/a5-git-audit.json` §4 et `13_PURGE_GIT_PLAN.md` v1.0 §1 |
| Commits concernés | 11 commits touchent `.env` : **10 dans le périmètre de purge** (`eda4dac` initial → `c9a05e8`) + `6158f4e` (désuivi). **Commits porteurs du secret : `04dc5ab`, `763ee5d`** (retraits : `b25f426`, `7260947`) |
| Refs à réécrire | `main` + tags `v1.10.7`, `v1.10.8` (ancêtres des commits `.env`) → **force-push requis** (§7.3, protections) |
| Profil des participants | 2 contextes uniquement : **propriétaire** (freemind25, clone(s) personnel(s)) + **sandbox développeur** (ce dépôt, sessions agents). Aucun collaborateur externe identifié — inventaire des clones actifs à re-confirmer à l'ouverture de la fenêtre |
| Fenêtre de coordination | ~30-45 min, hors activité d'édition ; personne ne pousse pendant la fenêtre ; annonce préalable aux 2 contextes |
| Outils | **java 21 présent** (BFG jar téléchargeable, checksum vérifié) ; alternative `git-filter-repo` (pip) — au choix le jour J |
| Conditions propriétaire | **(i)** révocation de l'ancienne clé **confirmée** auprès du fournisseur APINex (obligatoire AVANT la publication, sinon la purge ne sert à rien — le secret reste compromis même hors historique) · **(ii)** validation de ce plan · **(iii)** fenêtre coordonnée |

### 7.2 Procédure pas-à-pas (commandes exactes — exécution unique, en fenêtre)

```bash
# ── 0. Outil (jour J) ──
curl -LO https://repo1.maven.org/maven2/com/github/rtyley/bfg-repo-cleaner/1.14.0/bfg-1.14.0.jar
# vérifier le checksum publié (bfg-1.14.0.jar.sha1) AVANT usage — sinon ABANDON
curl -sL https://repo1.maven.org/maven2/com/github/rtyley/bfg-repo-cleaner/1.14.0/bfg-1.14.0.jar.sha1 -o /tmp/bfg.sha1
echo "$(cat /tmp/bfg.sha1)  bfg-1.14.0.jar" | sha1sum -c -

# ── 1. Sauvegarde fraîche + vérification (rollback de l'opération) ──
git bundle create tf-avant-purge-$(date +%Y%m%d-%H%M).bundle --all
git bundle verify tf-avant-purge-*.bundle            # attendu : « records a complete history »
git clone --mirror origin tf-mirror-avant-purge.git  # 2e sauvegarde indépendante
# ranger le bundle + le miroir HORS du dépôt (support durable) avant toute suite

# ── 2. Clone miroir de travail ──
git clone --mirror origin tf-purge.git && cd tf-purge.git

# ── 3. Exécution BFG (le secret n'étant plus suivi à HEAD depuis 6158f4e,
#      la protection HEAD par défaut de BFG suffit — NE PAS passer --no-blob-protection) ──
java -jar ../bfg-1.14.0.jar --delete-files .env ../tf-purge.git
cd ../tf-purge.git && git reflog expire --expire=now --all && git gc --prune=now --aggressive

# ── 4. CONTRÔLES BLOQUANTS AVANT PUBLICATION (tout échec = ARRÊT, cf. §7.5) ──
git log --all --oneline -- .env                                   # attendu : 0 ligne
git log --all -G 'sk-apx[A-Za-z0-9]{20,}' --oneline               # attendu : 0 commit (pickaxe)
git cat-file --batch-all-objects --batch-check="%(objecttype) %(objectname) %(objectsize)" \
  | awk '$1=="blob" {print $2}' \
  | while read o; do git cat-file blob $o | grep -qE 'sk-apx[A-Za-z0-9]{20,}' && echo "RESIDU: $o"; done
                                                                  # attendu : aucun RESIDU
git for-each-ref                                                  # vérifier refs réécrites + tags
git log --format='%H %s %cI' --all > /tmp/post-hashes.txt         # table de correspondance pré→post
# (appairage par sujet+date contre la sortie équivalente du miroir pré-purge — traçabilité des rapports)

# ── 5. Publication coordonnée (JAMAIS de force-push sur main hors fenêtre validée) ──
git push --force origin main
git push --force origin 'refs/tags/*:refs/tags/*'

# ── 6. Vérification post-publication (re-scan indépendant) ──
git clone origin tf-verif-purge.git && cd tf-verif-purge.git
git log --all --oneline -- .env                                   # attendu : 0
git log --all -G 'sk-apx[A-Za-z0-9]{20,}' --oneline               # attendu : 0
git count-objects -vH                                             # taille pack post-purge (à archiver)
git rev-parse origin/main                                         # SHA candidat final

# ── 7. Réalignement de CHAQUE clone existant (propriétaire + sandbox) ──
#    RECOMMANDÉ : re-clone propre (le sandbox porte des fichiers NON suivis critiques
#    — db/custom.db, .env, upload/, preuves — à sauvegarder/restaurer autour du re-clone).
#    Sinon (clone conservé) :
git fetch origin --prune
git tag -l | xargs git tag -d && git fetch --tags --force
git reset --hard origin/main
git reflog expire --expire=now --all && git gc --prune=now   # éliminer les vieux objets locaux
# contrôle local final : git log --all -G 'sk-apx[A-Za-z0-9]{20,}' --oneline  → 0
```

### 7.3 Protections de publication

- **Jamais de force-push sur `main` sans fenêtre validée** (condition iii) et confirmation écrite de la révocation (condition i).
- Publication **uniquement depuis le miroir de travail post-contrôles** (§7.2 étapes 4→5) — jamais depuis un clone de travail classique.
- Aucun autre ref (branche de fonctionnalité, ref cachée) ne doit exister : `git for-each-ref` contrôlé à l'étape 4 ; tout ref inattendu = arrêt et inventaire avant publication.
- Les rapports d'audit citent les **hashes pré-purge** comme référence historique (documenté v1.0 §5) ; la table de correspondance pré→post est archivée dans `evidence/` (hashes uniquement, jamais de valeur de secret).

### 7.4 Checklist post-purge (sur le commit candidat re-poussé)

1. **Clone frais** + `bun install` sans erreur.
2. **TNR complet : `bun run test` → 1 658/1 658 verts** (référence v1.1/v1.2).
3. **Lint : 0 erreur** (baseline warnings inchangée).
4. **C1 — build web production** (procédure `14_PROCEDURE_BUILD_WEB.md`) + parcours critiques.
5. **C2 — build Windows + smoke CSP durcie** (procédure `15_PROCEDURE_BUILD_WINDOWS.md`).
6. **Vérification remote** : taille pack post-purge archivée, SHA `origin/main` = SHA candidat, scans §7.2 étape 6 tous à 0.
7. **Mise à jour documentation d'audit** : présent plan (statut → exécuté + date + hash post-purge), `BASELINE_AUDIT_REPORT_v1.2.md` (critère 7 → ✅), registre AUD-SEC-002/003, preuves `evidence/purge-post-*.json` (sans valeur de secret).
8. Inventaire signé des **clones réalignés** (2 contextes).

### 7.5 Critère de réussite, critère d'arrêt, rollback

**Critère de réussite (TOUT requis)** :
- scans §7.2 étapes 4 et 6 : **0 correspondance** (fichier `.env`, pickaxe `sk-apx…`, blobs) sur l'historique local ET sur un clone frais d'origin ;
- `main` + les 2 tags réécrits et publiés ; table de correspondance pré→post archivée ;
- checklist §7.4 entièrement verte (1 658 tests, lint, C1, C2) ;
- tous les clones réalignés ; ancienne clé confirmée **révoquée** côté fournisseur ; aucune clé nouvelle dans Git/preuves/logs.

**Critère d'arrêt (STOP immédiat, rien n'est publié)** :
- toute condition propriétaire (i)/(ii)/(iii) absente → **aucune exécution du tout** ;
- checksum du BFG jar non vérifiable → changer d'outil (`git-filter-repo`) ou reporter ;
- tout contrôle §7.2 étape 4 non conforme après purge → **ne pas publier**, analyser, re-purger si besoin depuis le miroir pré-purge de travail ;
- détection d'un résidu de secret post-publication (étape 6) → secret toujours considéré compromis : s'assurer de la révocation (i), re-planifier une seconde purge, ne réutiliser sous aucun prétexte la clé ;
- tout doute opérationnel (refs inattendus, clones non identifiés, interruption réseau) → arrêt + rollback + report de la fenêtre.

**Rollback de l'opération elle-même (= le bundle de sauvegarde §7.2 étape 1)** :
```bash
# restauration complète de l'état pré-purge (uniquement en fenêtre, décision explicite) :
git clone tf-avant-purge-*.bundle tf-restaure.git   # ou réutiliser tf-mirror-avant-purge.git
cd tf-restaure.git
git push --force origin 'refs/*:refs/*'             # re-pousse main + tags d'origine
# puis réaligner les clones (§7.2 étape 7) — l'ancienne clé reste révoquée (i),
# le rollback ne la « réactive » pas ; re-planifier la purge séparément.
```

### 7.6 Règle de confidentialité renforcée (v1.2)

- La clé APINex historique n'est **jamais** écrite dans ce plan, les preuves, les logs ou les commandes (le motif public `sk-apx…` sert uniquement de format de scan, comme à l'audit A5).
- **Toute clé nouvelle sera transmise par canal sécurisé** (remise directe / gestionnaire de secrets) et **n'apparaîtra ni dans les preuves, ni dans les logs, ni dans Git** ; elle ne vivra que dans `.env`/`.env.local` (désuivis, ignorés).
- Preuves archivées attendues : sorties de scan (comptages 0), table de correspondance de hashes, tailles de packs, confirmation de révocation (attestation propriétaire) — **sans reproduction de valeurs**.
