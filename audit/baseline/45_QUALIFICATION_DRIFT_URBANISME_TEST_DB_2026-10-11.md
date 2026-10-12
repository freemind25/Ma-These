# 45 — QUALIFICATION DU DRIFT `urbanisme-test.db` (ANALYSE STRICTEMENT LECTURE SEULE) — OPTIONS A/B/C, RECOMMANDATION, CONDITIONS DE REPRISE C2

**Cycle :** audit-final-v1.2 · vague 19 · **Date :** 2026-10-11
**Statut : ANALYSE PRÉPARÉE — AUCUNE OPTION APPROUVÉE, AUCUNE EXÉCUTÉE.** Répond aux points 1 et 2 du message du propriétaire (2026-10-11) : « Préparez une analyse strictement en lecture seule du drift constaté… Comparez les options A, B et C du bilan C2, avec leurs risques et leurs preuves justificatives. N'exécutez aucune resynchronisation, aucun correctif et aucune modification du candidat. »
**Fondements :** doc 43 (bilan C2, écart §4, options a/b/c) · doc 24 (check-list C2, §2 pré-contrôles, §9 red lines) · doc 39 (cadre de réception, §4 règle d'écarts) · preuves historiques `specs/prod-readiness-audit/` (T7 drift 2026-09-18, ré-synchro consignée) · `.github/workflows/build-desktop.yml` (garde-fou CI présent au candidat).

---

## §1 — Méthode et preuve de lecture seule

Toutes les mesures ci-dessous sont des **lectures** : `prisma migrate diff` (comparaison sans écriture, prouvé au cycle build-desktop-pipeline T3) · inspection SQLite en **mode `ro` URI** (`file:…?mode=ro`, connexion impossible en écriture) · commandes git et greps. **Preuve de non-modification (AVANT = APRÈS l'ensemble des mesures) :**

```
db/custom.db         : SHA-256 756c01587cc54a25db37c2f099266506aa01ffcff440870a61b43e441b38126d · 265 330 688 o (inchangé)
db/urbanisme-test.db : SHA-256 16f3c3f4b42cdcaa1be1235ec593ff6beda3fbea6ed8104803ac0eb5a7584ae5 · 552 960 o (inchangé)
git status --porcelain : (vide) — arbre propre · candidat 7dff2c6 et tags intacts
```

## §2 — Constat factuel : le gap exact (datamodel courant → base de test)

**Direction doc 24 §2** (datamodel → base) : `exit 2` — drift confirmé. **Direction inverse** (base → datamodel) — le gap est **intégralement additif** (aucune suppression de table, de colonne ou de données requise pour rejoindre le datamodel) :

| Catégorie | Détail exact |
|---|---|
| **Tables absentes (5)** | `SoutenancePrep` · `LegalRef` · `Article` · `ArticleVersion` · `ImportedDoc` |
| **Colonnes manquantes (7)** | `Chapter.stamp` · `ChapterVersion.stamp` · `Job.progress` · `Job.progressNote` · `CustomBookSkill.description` · `CustomBookSkill.source` · `CustomBookSkill.enabled` |
| **Index manquants (6)** | `Article(thesisId)` · `ArticleVersion(articleId)` · `ImportedDoc(thesisId)` · `LegalRef(domaine)` · `SoutenancePrep(thesisId)` **unique** · `SoutenancePrep(thesisId)` simple |

Le datamodel compte **30 modèles** ; la base de test en contient **25** (§4).

## §3 — Datation et historique : une récurrence, pas un accident

| Date | Événement | Preuve |
|---|---|---|
| 2026-09-16/18 | Audit prod-readiness : drift **déjà détecté** sur la base de test (4 tables `Experiment*`/`SavedSearch*` + 6 index) — qualifié « question recette » | `specs/prod-readiness-audit/tasks.md` l.24 · `preuves.md` l.139-155 |
| 2026-09-18→28 | **Ré-synchro exécutée** (push chemin absolu — 1ʳᵉ tentative chemin relatif inefficace, Prisma résout `file:` depuis `prisma/`) puis commitée : la base de test rejoint l'ère du schéma **25 tables** | `specs/prod-readiness-audit/preuves.md` l.363-373 · commit `c9a05e8` (2026-09-28, dernier commit touchant `db/urbanisme-test.db`) |
| 2026-09-28 | Création du **garde-fou CI** : build refusé si l'une des deux bases dérive (`set -e` avant tout build) — « ne jamais distribuer un installeur avec une base désynchronisée (défaut exact constaté sur urbanisme-test.db) » | `.github/workflows/build-desktop.yml` l.44-56 |
| 2026-10-02 | `SoutenancePrep` ajouté au schéma (3404a5d) — poussé sur `custom.db` **uniquement** → le drift de la base de test **recommence ici** | `git log -S "model SoutenancePrep"` · mtime `custom.db` vs test |
| 2026-10-07 | `LegalRef` (a890fab) · `Article`/`ArticleVersion`/`ImportedDoc` (8847715) ajoutés — idem, base de test non resynchronisée | `git log -S` par modèle |
| 2026-10-11 | **Drift détecté à nouveau** au pré-contrôle C2 (doc 43 §3.3) — 1ʳᵉ exécution consignée de ce contrôle sur la base de test dans l'environnement d'audit | doc 43 §3.3 · présent document §2 |

**Conclusion structurelle** : chaque évolution de schéma depuis le 2026-09-28 a été poussée sur `custom.db` sans re-synchronisation de la base de test. **Tant qu'aucune discipline de synchro n'est arrêtée, tout futur changement de schéma recréera ce drift** (la base de test n'est resynchronisée par aucun script du dépôt — `package.json` ne contient aucune commande la ciblant).

## §4 — Contenu réel de la base de test (inspection `mode=ro`)

| Mesure | Valeur |
|---|---|
| Tables | **25** — AgileSprint, AgileStory, Chapter, ChapterVersion, CustomBookSkill, DoctoralToolbox, DocumentChunk, ElementAnalyse, Experiment, ExperimentRun, Job, LicenseKey, NotebookEntry, Part, Reference, ResearchSource, ResearchTab, SavedSearch, SavedSearchResult, SessionVerification, Thesis, ThesisCadrage, ThesisCadrageField, ThesisCadrageVersion, TypeAnalyseMethodologique |
| Données | Thesis **1** · Chapter **7** · **Reference 12** · Experiment/ExperimentRun/SavedSearch **0** |
| `integrity_check` | **ok** |
| `foreign_key_check` | **0 violation** |

**Point d'attention** : la base de test n'est **pas une copie** de la base réelle — elle contient **son propre jeu de données** (Reference **12** contre **4** dans `custom.db`). Une ré-synchro ne toucherait donc **pas** les données réelles ; inversement, toute confusion entre les deux fichiers resterait interdite (red line doc 24 §9.2 inchangée).

## §5 — Références à `urbanisme-test.db` dans le code, la configuration et l'installeur

| Emplacement | Référence | Effet |
|---|---|---|
| `src-tauri/tauri.conf.json` l.43 | `"resources": { "../db/*": "db/", … }` — **glob** : **tout fichier de `db/` est embarqué dans l'installeur** | `urbanisme-test.db` (comme `custom.db`) est embarqué dans chaque installeur NSIS |
| `src-tauri/src/lib.rs` l.145-158, 218 | Le runtime Tauri résout **`custom.db` uniquement** (`exe_dir/data/custom.db` ou ressource `db/custom.db`) et positionne `DATABASE_URL` en conséquence | **Aucune référence runtime à `urbanisme-test.db`** — l'application livrée ne la lit ni ne l'écrit |
| `src/` (tout le code applicatif) | **Aucune occurrence** (recherche exhaustive hors node_modules) | la base de test n'est référencée par aucun code applicatif |
| `.env` | `DATABASE_URL` (seule clé) — valeur pointant `custom.db` (occurrence vérifiée, valeur non consignée) | les flux dev/prisma ciblent la base réelle par défaut |
| `package.json` | `db:push` = `prisma db push --accept-data-loss` sans URL explicite → suit `DATABASE_URL` ; **aucun script ne cible la base de test** | la désynchronisation n'est pas causée par un script : elle vient de l'**absence de discipline de synchro** |
| `.github/workflows/build-desktop.yml` l.44-56 | **Garde-fou CI** : `set -e` + `prisma migrate diff --exit-code` sur **les deux** bases **avant** tout build — présent **au candidat `7dff2c6`** (créé 2026-09-28, `c9a05e8`) | **Le pipeline du projet refuse de produire un installeur avec la base de test désynchronisée — en l'état, un build CI échouerait au step « Garde-fou »** |
| `docs/EXPLOITATION-SERVEUR.md` l.39 | « `urbanisme-test.db` = base du test de production » | documentation d'exploitation |
| Historique (`specs/`, `FICHE_SYNTHESE.md`, `public/RAPPORT-CORRECTIONS-ANNEXE-A1-A13.md`) | détection 2026-09-18, ré-synchro 2026-09-28, mention devenue obsolète « poussées sur custom.db et urbanisme-test.db » | l'écart actuel est la **récurrence** d'un défaut déjà traité une fois |

## §6 — Conséquences possibles sur le fonctionnement du produit livré

1. **Fonctionnel : aucune.** Le produit installé n'utilise que `custom.db` (résolution runtime `lib.rs`, prouvée ci-dessus) ; la base de test embarquée est **inerte** à l'exécution. Aucune fonctionnalité ne peut en être affectée.
2. **Pipeline de production : bloqué en l'état.** Le garde-fou CI du candidat lui-même (`build-desktop.yml`, `set -e`) **échoue** sur le drift de la base de test : **aucun installeur ne peut être produit par le pipeline du projet** tant que le drift existe. C'est exactement le défaut que ce garde-fou a été créé pour empêcher de distribuer.
3. **Artefact embarqué incohérent.** Un build **local** (voie doc 24, hors CI) produirait un installeur embarquant une base de test obsolète (ère 25 tables) — sans effet fonctionnel (point 1), mais avec un risque de **confusion en maintenance** (outils/tests pointant un jour vers cette base trouveraient des tables/manques incohérents avec le code livré) et un poids additionnel négligeable (~0,5 Mo).
4. **Récurrence structurelle.** Sans discipline de synchro, chaque évolution de schéma recrée le drift (§3) — le garde-fou CI le recaptrera à chaque build, bloquant la production à chaque fois.

## §7 — Comparaison des options A / B / C (doc 43 §4)

| Critère | **A — Ré-synchroniser la base de test** | **B — Accepter le drift documenté (critère ajusté)** | **C — Exclure la base de test de l'installeur** |
|---|---|---|---|
| Nature | Push additif sur `db/urbanisme-test.db` (chemin **absolu** requis — épisode 2026-09-18) + preuves (diff re-exécuté exit 0, comptages AVANT=APRÈS, integrity ok) | Ajustement **écrit** du critère (doc 24 §2, doc 39 item 5) : exit 0 exigé sur `custom.db` seul, écart test consigné + registre 09 | Modifier `tauri.conf.json` (glob `../db/*` → listing explicite ou déplacement du fichier) |
| Effet sur le candidat figé | **Modification d'un fichier versionné** → confinement rompu → commit dédié + **requalification d'identité** (nouvelle empreinte, **nouveau tag**) | **Aucun** — candidat intact, C2 exécutable sur `7dff2c6` tel quel | **Modification de configuration versionnée** → requalification d'identité comme A |
| Effet sur le garde-fou CI | **Rétabli** (exit 0 ×2) — production CI redevenue possible | **Non rétabli** — le build CI échouerait toujours : un installeur produit localement sous B serait un artefact **que le standard du candidat lui-même refuse de distribuer** | **Non rétabli** — le garde-fou porte sur le **fichier**, pas sur l'embarquement : **C ne résout ni le drift ni le blocage CI** |
| Risque données | **Faible** — gap 100 % additif (§2, aucune suppression) ; procédure déjà démontrée (2026-09-18/28) ; données propres propres à la base de test (§4) ; survie à prouver par comptages AVANT=APRÈS | Aucun sur données — mais **charge documentaire** (exception à maintenir dans doc 24, doc 39, registre 09) et **risque d'oubli** de la résolution | Aucun sur données ; mais touche la **configuration** (red line C2 explicite : aucune modification de code ni de configuration) |
| Coût gouvernance | GO spécifique + requalification identité — **sauf si exécuté au refigeage R2 déjà prévu (S4) : coût marginal ~nul** | Faible immédiat, **récurrent** (récurrence structurelle non traitée) | Moyen (config + requalification) pour un bénéfice nul sur le problème réel |
| Bénéfices | Critère doc 24/CI satisfait tel quel · installeur cohérent · standard du candidat respecté · **récurrence traitée si discipline arrêtée** | Chemin le plus rapide vers un C2 sur `7dff2c6` · zéro modification du candidat | Installeur allégé sans ressource obsolète — **pertinent seulement en complément de A, jamais seul** |
| Verdict analytique | **Traite la cause** | Traite le **symptôme**, contredit le standard interne | **Ne traite pas le problème** (drift et CI inchangés) |

## §8 — Recommandation argumentée (aucune option approuvée — décision au propriétaire)

**Recommandation : Option A, exécutée au refigeage R2 de S4** (ajoutée par écrit au périmètre du refigeage dans le GO A), pour quatre raisons :

1. **Le gap est purement additif** (§2) : le push est prévisible, sans perte de données possible par construction, et la procédure a déjà été exécutée avec succès une fois (2026-09-18/28, précaution chemin absolu documentée) — le risque opérationnel est minimal et les preuves de survie sont simples (comptages AVANT=APRÈS §4, `integrity_check` ok, diff re-exécuté = exit 0 ×2).
2. **Le coût d'identité est déjà engagé** : la fenêtre S1-S4 prévoit de toute façon un refigeage unique avec nouveau tag R2 (doc 41 §5) — intégrer la ré-synchro à ce refigeage ajoute un fichier à requalifier, pas un processus nouveau. Exécuter A **avant** la fenêtre créerait au contraire une requalification anticipée complète (empreinte, tag, doc 24 §0) pour un gain nul.
3. **Le standard du projet est clair** : le garde-fou CI créé par le projet lui-même (présent au candidat) qualifie un installeur avec base désynchronisée de défaut interdit à la distribution. L'option B reviendrait à bâtir une exception permanente contre le standard interne — charge documentaire récurrente et contradiction durable, là où A rétablit la conformité.
4. **La récurrence structurelle est traitée seulement par A** (+, si le propriétaire le souhaite, une discipline de synchro systématique de la base de test à chaque évolution de schéma — point à inscrire au registre des pratiques). B et C laissent le problème se reproduire à chaque cycle.

**Variante de déblocage anticipé du C2 (si le propriétaire ne souhaite pas attendre le R2)** — strictement bornée, soumise à son arbitrage : conserver `7dff2c6` tel quel et exécuter le C2 avec un **écart documenté temporaire** — critère item 5 réécrit par écrit : `custom.db` **exit 0 obligatoire** (déjà prouvé), `urbanisme-test.db` **exit 2 connu, consigné registre 09, résolution engagée au R2** ; l'installeur C2 demeure un **artefact interne jamais diffusé** (red line doc 24 §9.1 inchangée, ce qui neutralise la conséquence pipeline §6.2). Le verdict C2 prendrait alors la forme « VALIDE AVEC ÉCART DOCUMENTÉ (résolution R2) » au lieu de `DESKTOP_WINDOWS_VALIDE` pur — formulation et portée à faire valider explicitement par le propriétaire avant toute exécution. **Cette variante n'est ni retenue ni exécutée.**

**Option C : non recommandée** — elle ne traite ni le drift ni le garde-fou CI (§7), touche la configuration au candidat, et ne se justifie éventuellement qu'en complément de A (allègement de l'installeur).

## §9 — Preuves C2 restant à obtenir (machine Windows) et conditions de reprise après arbitrage

**Verdict maintenu : `PROBLEMES`** (doc 43 §5) tant que les critères et preuves ne permettent pas de conclure.

**Preuves strictement à obtenir sur la machine Windows** (doc 24 §7 — 7 items Windows + 1 dépendant de l'arbitrage) :

| # | Preuve | Condition de contrôle après arbitrage |
|---|---|---|
| 1 | `c2-build-windows.json` (gabarit doc 24 §8 intégral) | `commit_teste` = candidat exécuté (7dff2c6 en variante B temporaire / nouveau candidat si A anticipé) |
| 2 | Captures `c2-01`…`c2-13` | chaque GP déclaré PASS doit avoir sa capture |
| 3 | Versions Tauri/rustc/Bun/Node/winver | relevés tels quels, aucune exigence épinglée |
| 4 | Empreinte archive + `git rev-parse HEAD` + `git status` **Windows** | variante B : `8ae37eda…87e75e` attendue ; variante A anticipée : **nouvelle empreinte consignée dans le doc 24 §0 mis à jour avant exécution** |
| 5 | Drift ×2 (exit codes **Windows**) | **dépend de l'arbitrage** : standard actuel = exit 0 ×2 ; variante B temporaire = exit 0 (custom) + exit 2 (test) accepté et consigné ; après A = exit 0 ×2 |
| 6 | Chemin + taille installeur NSIS `Ma Thèse_1.10.8_x64-setup.exe` | aucun `.msi` attendu |
| 7 | Déclaration d'écarts (même mineure) | explicite même si vide |
| 8 | Confirmation nettoyage `AUDIT-C2-` | thèse réelle de la machine de test intacte |

**Conditions de reprise du contrôle (doc 39 §3), dans l'ordre** : (i) **arbitrage écrit** du propriétaire sur A/B/variante (aucune retenue par défaut) ; (ii) si A anticipé : commit dédié autorisé + requalification complète (nouvelle empreinte consignée, **nouveau tag**, doc 24 §0 mis à jour) ; (iii) prérequis machine doc 24 §1 (1.1-1.10) et red lines §9 respectés ; (iv) exécution doc 24 (build, installation, smoke GP-1→GP-8, CSP/capabilities, arrêt, nettoyage) ; (v) transmission des 8 preuves ; (vi) contrôle de réception doc 39 §3 (complétude → identité → cohérence croisée → verdict) ; (vii) consignation (registre 09 fiche C2, archivage `evidence/c2-*`).

## §10 — Statuts S1 et périmètre (points 3 et 4 du message)

- **S1** : la checklist **doc 44 demeure le document de préparation** — rien n'est exécuté, `db/custom.db` non touchée (SHA-256 prouvé AVANT=APRÈS). La déclaration de conformité S1 ne sera produite **qu'après exécution réelle de tous les contrôles requis**, avec présentation des preuves **avant la première écriture** sur la base réelle.
- **Périmètre** : candidat `7dff2c6` figé · aucun push, BFG, GO B, levée de P7, changement de schéma, diffusion externe · la présente instruction ne constitue pas un GO A.

## §11 — Statu quo

Aucune ré-synchronisation, aucun correctif, aucune modification du candidat, du schéma, de la configuration ou des bases (SHA-256 des deux fichiers prouvés inchangés, arbre propre, tags intacts). Les options A/B/C et la variante bornée demeurent **non approuvées et non exécutées** — décision écrite du propriétaire requise.

---
*Analyse de qualification lecture seule — ne constitue ni un GO ni une exécution. Recommandation soumise, non décision.*
