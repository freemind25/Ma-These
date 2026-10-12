# 56 — PLAN DE TESTS FINAL « MA THÈSE » — FONCTIONNEL · SÉCURITÉ · RÉGRESSION · INTÉGRITÉ DES DONNÉES

**Cycle :** audit-final-v1.2 · vague 35 (préparation documentaire — zéro opération technique)
**Date :** 2026-10-12 · **Fondements :** doc 08 (matrice) · doc 24 (check-list C2) · doc 39 (8 preuves C2) · doc 44 (contrôles S1) · doc 46 (comparateur v2.2, R2) · docs 30/32/34 (fenêtre commune) · preuves consolidées (`vague4-candidat-7dff2c6.json`, `isolation-fix.json`, `a2-*.json`, `tnr-golden-paths.json`, R2-01…R2-10).
**Règle transversale :** chaque test porte sur un état identifié (candidat exact + empreinte) ; tout écart = ARRÊT + signalement ; aucun succès déclaré avant vérification complète ; aucune écriture de test sur `db/custom.db` (B-strict).

---

## §1 — Axe RÉGRESSION AUTOMATISÉE (à re-jouer sur le candidat final)

| # | Test | Commande / méthode | Critère PASS | Preuve attendue |
|---|---|---|---|---|
| R-1 | Suite vitest complète | `bun run test:run` | 1 658/1 658 verts (≈1 670 si lot 1 exécuté) | sortie horodatée consignée |
| R-2 | Lint | `bun run lint` | 0 erreur (warnings = baseline 247, exit 0) | sortie horodatée |
| R-3 | Identité du candidat | `git archive --format=tar <candidat> \| sha256sum` | empreinte = référence du candidat testé | empreinte consignée (journal + doc 24 §0) |
| R-4 | Confinement du candidat | `git diff --name-only <candidat>..HEAD -- src prisma db src-tauri package.json tsconfig.json next.config.ts` | vide (HEAD ne diffère que par marqueurs documentaires) | sortie brute |

## §2 — Axe FONCTIONNEL (UI réelle — golden paths et re-pass)

| # | Test | Méthode | Critère PASS | Preuve attendue |
|---|---|---|---|---|
| F-1 | 7 golden paths canoniques (GP-1 rédaction, GP-2 création thèse, GP-3 références CRUD, GP-4 génération IA, GP-5 RAG cité, GP-6 thèses en ligne, GP-7 export DOCX) | agent-browser sur le candidat, clics réels | 7/7 ; GP-4/GP-5 « échec propre ≠ FAIL » si clé IA absente (doc 24) | JSON gabarit `vague4-candidat-7dff2c6.json` re-rempli + captures |
| F-2 | 16 actions destructives avec confirmation (Annuler = 0 requête ; Confirmer = exactement la requête attendue ; cascades conformes) | protocole `a2-lot1/a2-lot2` (re-pass sur harnais, B-strict) | 16/16 conformes aux 6 contrôles | JSON + captures + comptages DB avant/après vides |
| F-3 | 47 vues — statuts maintenus | aucune régression constatée sur les 44 validées ; les 3 bloquées extérieur restent documentées (36 APInex, 44 LibreTranslate, 45 limitation) | aucun nouveau verdict ❌ | registre 09 à jour |
| F-4 | Re-pass mono-thèse en consultation après S1 (fenêtre commune) | navigation consultative (doc 34 §1, variante B-strict) | aucune anomalie nouvelle ; état DB inchangé (diff 30 tables vide) | captures + diff JSON |
| F-5 | Contournement A1V4-01 (P3, G2 différé) | cliquer l'onglet du chapitre avant saisie | flux normal OK (contournement documenté) | consignation registre |

## §3 — Axe SÉCURITÉ

| # | Test | Méthode | Critère PASS | Preuve attendue |
|---|---|---|---|---|
| S-1 | Pré-contrôles drift DB ×2 | `bunx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-url file:db/custom.db --exit-code` (idem `urbanisme-test.db`) | **exit 0 et 0** (sur le candidat final post-R2, l'écart historique `urbanisme-test.db` est résolu par R2) | 2 sorties brutes (item 5 des 8 preuves C2) |
| S-2 | CSP production exacte | lecture `tauri.conf.json` au candidat (ligne CSP) | identique caractère pour caractère à doc 24 §5.2 | sortie brute + comparaison |
| S-3 | Capabilities minimales | lecture `src-tauri/capabilities/default.json` | `permissions: ["core:default"]` seul · `windows: ["main"]` · aucune permission shell | sortie brute |
| S-4 | Smoke CSP desktop (propriétaire, machine Windows) | doc 24 : premier démarrage, 13 captures `c2-01`…`c2-13`, arrêt processus | verdict `DESKTOP_WINDOWS_VALIDE` (doc 39 §3) | `c2-build-windows.json` + 13 captures + relevés versions |
| S-5 | Lot 1 AUD-SEC-004 (si GO B exécuté) | comparaison avant/après sur les 10 routes destructives (payloads valides → réponses identiques ; invalides → 400 zod) | 10/10 via `parseBody` · tests schémas verts · 0 divergence sur payloads valides | doc 42 §6 (critères complets) |
| S-6 | Contrôles audit 04 déjà acquis (à maintenir verts) | rate-limiting IA, gardes 404, chaîne upload (MIME + magic bytes + 50 Mo), rejet Prisma sans écriture partielle | aucune régression | registre 09 |
| S-7 | Hygiène secrets (avant MEP) | scan `sk-apx` historique (0 valeur réelle en fichiers suivis) · vérification `.env` désuivi · aucune clé dans l'installeur (clé OpenAlex vidée depuis `0543a4f`) | 0 secret actif dans l'arbre et le binaire | sortie grep + doc 40 |

## §4 — Axe INTÉGRITÉ DES DONNÉES

| # | Test | Méthode | Critère PASS | Preuve attendue |
|---|---|---|---|---|
| D-1 | Empreintes des bases AVANT/APRÈS chaque opération | `sha256sum db/custom.db db/urbanisme-test.db` (double passe : sha256sum + openssl) | AVANT = APRÈS sur toute session non autorisée à écrire ; valeurs de référence doc 55 §1 | consignation horodatée |
| D-2 | Intégrité SQLite (sur copie pour les pré-contrôles, doc 44 §2.3) | `db-inventory.mjs` sur la copie de sauvegarde | 30 tables · Reference 4 · Thesis 1 · 0 violation FK · `integrity_check ok` | `migration-inventory-before.json` |
| D-3 | Comparateur resync v2.2 (base de test) | `resync-testdb-compare-contenu.mjs` v2.2 (`85cfee28…d233`) + suite `4ccd6a2b…78a6` | §4 + §4.3bis PASS (déjà validé vague 30, 30/30) — re-jeu non requis sauf divergence | preuves R2-01…R2-10 |
| D-4 | Migration S1 (sous GO A) | séquence M-0→M-7 doc 44 §3 (export 4 réf → push → attribution 4/0 ambiguë → consistency PASS) | verdict PASS obligatoire · 4/4/0/0 | journal d'attribution + `references-export-before-<TS>.json` + verdicts |
| D-5 | Restauration DB testable (hors base réelle) | `scripts/restore-db.ts` vers /tmp (pré-restore automatique) | diff stats vide = complétude | JSON type `c1-restore-test.json` |
| D-6 | Sauvegarde quotidienne active | log `[backup]` + présence `backups/custom-YYYY-MM-DD.db` + miroir `TF_BACKUP_MIRROR_DIR` | backup du jour présent | relevé |

## §5 — Axe BUILDS

| # | Test | Méthode | Critère PASS | Preuve attendue |
|---|---|---|---|---|
| B-1 | Build web production (C1) | procédure doc 14 sur le candidat final | exit 0 · smoke standalone 7/7 (port 3100, base jetable VACUUM INTO) | gabarit `c1-build-web.json` re-rempli |
| B-2 | Build Windows NSIS (C2) | doc 24 sur machine Windows du propriétaire | installeur `Ma Thèse_<version>_x64-setup.exe` + 13 captures + 8 preuves (doc 39) | `c2-build-windows.json` complet |
| B-3 | Build CI (canal de reproductibilité) | workflow `.github/workflows/build-desktop.yml` (push tag `v*` ou workflow_dispatch) — déjà prouvé (runs 35373767136, 35382304899 SUCCESS) | run vert · artefact `windows-installer` · release draft version suivante | URL run + logs |
| B-4 | Installeur MEP final | construit depuis le candidat final, version bumpée (ex. v1.10.9), signature/publish décidés par le propriétaire | binaire testé (S-4) et tracé (empreinte) | release draft consignée — **publication = acte propriétaire (GO MEP)** |

## §6 — Ordre d'exécution recommandé et conditions

1. **Après restauration/reconstruction de la lignée (P-1)** : R-3/R-4 → R-1/R-2 → D-1 → F-1 → B-1.
2. **Après R2 finalisation (P-5)** : re-figeage du candidat final → S-1/S-2/S-3 → B-2 (propriétaire).
3. **Fenêtre commune (GO A)** : contrôles doc 44 §1-§2 (PRÉ-DÉMARRAGE + SAUVEGARDE BLOQUANTE) → S1 → D-4 → S2/S3 (F-2/F-4, S-5) → S4 revalidation (R-1/R-2/F-1 sur le nouveau candidat refigé) → paquet PA4.
4. **Avant GO MEP** : tous les axes verts → checklist doc 55 §3 (G-1…G-9).
5. **Jamais** : aucune exécution de ce plan sans l'autorisation écrite correspondante (GO A, GO B, GO restauration, GO MEP) — le présent plan est une préparation, pas une autorisation.

---
*Plan de tests — ne constitue ni un GO ni une exécution. B-strict : zéro écriture de test sur `db/custom.db` à aucun moment.*
