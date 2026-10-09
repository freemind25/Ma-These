# Plan de purge de l'historique Git — AUD-SEC-002/003 (cycle audit-final-v1.2)

**Statut : PRÉPARÉ — exécution subordonnée** (instructions propriétaire point 8) : ① présentation de ce plan, ② confirmation de la rotation/révocation de la clé exposée auprès du fournisseur APINex, ③ fenêtre de coordination explicite (personnes + clones). **Aucune réécriture ni force-push avant ces trois conditions.**

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

## 6. Règle de confidentialité

Aucune valeur de secret, clé ou donnée sensible ne sera reproduite dans les preuves, les logs ou les rapports — uniquement des chemins de fichiers, hashes de commits et comptages.
