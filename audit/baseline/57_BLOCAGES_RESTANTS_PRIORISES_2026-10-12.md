# 57 — LISTE DES BLOCAGES RESTANTS — PRIORISATION POUR LA MISE EN PRODUCTION « MA THÈSE »

**Cycle :** audit-final-v1.2 · vague 35 (préparation documentaire — zéro opération technique)
**Date :** 2026-10-12 · **Fondements :** BASELINE_AUDIT_REPORT v1.2 (§3-ter/§2) · docs 28/31/42/44 (décisions) · docs 39/43 (C2) · docs 40/13 (sécurité externe) · docs 46/50/52/54 (R2, récupération) · worklog (prod-readiness, build-desktop-pipeline, security-openalex-rotation).
**Lecture :** chaque blocage indique son débloqueur (OP = propriétaire, PLT = opérateur plateforme, AGT = agent sous autorisation écrite), son impact MEP et l'autorisation requise. « Diffusable » = ouverture aux premiers utilisateurs / distribution.

---

## Niveau 0 — Blocants directs de la mise en production (chaîne critique)

| # | Blocage | État précis | Débloqueur | Impact MEP | Autorisation requise |
|---|---|---|---|---|---|
| **B-01** | **Lignée Git candidate absente du magasin** — commits `7dff2c6…`/`24415b7f…` + `ce2f634`/`0207f96`/`dc59ea1`/`7179458` + 2 tags candidat : ABSENTS (mesuré 14:19 et re-confirmé) ; seule voie à l'identique = instantané plateforme | Demande formalisée et transmise (dossier 54 + annexes 51-53 dans `/home/sync/upload/demande-operateur-recuperation-r2-20261012/`) — **attente opérateur** ; à défaut : Option A (état actuel conservé) ou Option B (reconstruction documentée autorisée explicitement) | PLT puis OP | **Critique** — sans candidat vérifiable : ni C2, ni re-jeu des validations finales, ni R2 finalisation | Aucune (gel maintenu) ; toute restauration → vérification rapport 52 §5 + **accord écrit** préalable |
| **B-02** | **Finalisation R2 bloquée** (doc 46 §5bis étapes 6-12) — commit base de test + tags `…-R2` + empreinte archive ; étapes 1-5 déjà validées (§4.3bis PASS v2.2, 30/30) | Prêt, conditionné (rapport 52 §6 : 4 préconditions lecture seule) | AGT (après B-01 + accord OP) | Critique — le candidat final post-R2 n'existe pas tant que non fait | Accord écrit sur la restauration + reprise §5bis (sans db:push, sans répétition des contrôles validés) |
| **B-03** | **C2 Windows non exécuté** — dernier critère GO non exécuté ; verdict antérieur `PROBLEMES` (6/8 preuves non reçues ; drift `urbanisme-test.db` **résolu depuis par R2** mais contrôle à re-passer sur le candidat final) | Check-list doc 24 prête · cadre de réception doc 39 prêt | OP (machine Windows) + AGT (vérification 8 preuves) | Critique — critère 6 du GO | Aucune autorisation d'écriture ; exécution propriétaire + signalement immédiat de tout écart |
| **B-04** | **Migration réelle S1 non autorisée** (références rattachées par thèse, M-0→M-7 sur `db/custom.db`) — checklist doc 44 prête (60-90 min, préavis 24 h, mode A + B-strict) | Dossiers GO A complets (docs 30/32/34) — **GO écrit spécifique requis** | OP | Majeur — critère 4 du GO ; l'app reste mono-thèse sans risque tant qu'aucune 2ᵉ thèse n'est créée | **GO A écrit** (dates S1-S4, tag, mode A, B-strict) |
| **B-05** | **Cycle applicatif d'isolation P1-P4 non autorisé** (API + UI + 12-16 tests Vitest ; 2-3 j, S2-S3 de la fenêtre commune) | Design complet doc 27-C ; refigeage candidat unique prévu | OP | Majeur — prérequis avant toute création d'une 2ᵉ thèse (orientation ②) | Inclus dans le GO A (S2/S3) |
| **B-06** | **Lot 1 AUD-SEC-004 non exécuté** (zod sur les 10 routes destructives) — décision **D1=C-B formalisée le 2026-10-11**, exécution bloquée | Spécification route par route prête (docs 27-B/35/42) | OP (levée P7 périmètre doc 35 §3 + **GO B écrit**) | Modéré — risque résiduel Basse, app loopback mono-utilisateur ; le GO B peut être reporté avec justification écrite | **Levée P7 limitée + GO B distinct** |
| **B-07** | **Recommandation motivée finale + GO MEP** — décision finale du propriétaire sur le paquet de preuves complet | Attend G-1…G-8 (doc 55 §3) | OP | Critique (dernière porte) | **GO MEP écrit** |

## Niveau 1 — Sécurité externe (indépendants du GO applicatif, obligatoires avant/pendant la diffusion)

| # | Blocage | État précis | Débloqueur | Impact |
|---|---|---|---|---|
| **B-08** | **Rotation de la clé OpenAlex non effective** — l'ancienne clé (fuite historique `lib.rs`, vidée du code depuis `0543a4f`) était **toujours active** (HTTP 200 vérifié) ; installeurs v1.10.7/v1.10.8 propres (builds postérieurs à 0543a4f) mais **l'historique poussé contient la valeur** | Rotation à faire par le propriétaire auprès du fournisseur | OP | Majeur avant diffusion (repo privé aujourd'hui) |
| **B-09** | **Révocation des 2 clés GitHub transités par chat** (la 1ʳᵉ invalide mais transitée ; la 2ᵉ valide, utilisée pour push/CI) | À révoquer après usage — jamais consignées dans le dépôt | OP | Majeur |
| **B-10** | **Révocation APINex historique non confirmée** (clé exposée dans l'historique via `.env` suivi depuis le commit initial ; désuivie depuis `6158f4e`) | Cadre doc 40 prêt — confirmation attendue (5 éléments) | OP / fournisseur | Condition (i) du plan BFG |
| **B-11** | **Purge BFG non exécutée** — 3 conditions : révocation confirmée (B-10) + plan approuvé + fenêtre coordonnée | Plan exécutable doc 13 §7 | OP (approbation + fenêtre) puis AGT | Bloque la « publication propre » de l'historique ; n'empêche pas l'exécution locale |
| **B-12** | **Push GitHub en attente** — ~16+ commits + 2 tags candidats (liste à re-vérifier E3 juste avant) ; identifiants absents de l'environnement | ⚠️ dépend de B-01 : la lignée candidate étant absente du magasin local, le push ne devient possible qu'après restauration/reconstruction | OP (E1/E2) | Blocage de la sauvegarde distante des travaux d'audit |
| **B-13** | **D4 — vecteur d'origine locale (S3)** : D4-accept = résiduel documenté, **réévaluation obligatoire avant toute diffusion large** (contrôle Origin/Host ~0,5 j si exigé) | Inscrit au registre (condition de sortie) | OP à l'échéance | Obligatoire avant diffusion large |
| **B-14** | **Releases GitHub v1.10.7/v1.10.8 déjà PUBLIÉES avec du code pré-audit** (sans les correctifs `6f853ac`/`7dff2c6` — builds du 2026-09) | Binaire à ne pas diffuser ; remplaçant à construire depuis le candidat final (version bumpée, ex. v1.10.9) | OP (dépublication/obsolescence à décider) | Confusion de version / risque de diffusion du mauvais binaire |

## Niveau 2 — Non bloquants GO (qualité, robustesse, suivi) — planifiables post-MEP

| # | Élément | Détail | Renvoi |
|---|---|---|---|
| B-15 | ~20 fiches P3/P4 ouvertes au registre 09 (aucune bloquante) | dont A1V4-01 (P3, contournement documenté, G2 différé) ; AUD-FUNC-001 `\n` littéral ; toasts/use-toast ; pagination listes | registre 09 · doc 10 (C-13…C-20) |
| B-16 | D5 — paramétrage des 2 raw SQL GET (`book-skills`, `legal-refs`) | Backlog v1.3, sous-tâche P3 (D5-accept formalisé) | doc 31 §8 |
| B-17 | Lots 2-3 AUD-SEC-004 (15 POST + 16 GET) | Backlog v1.3 ordre 1→2→3 (spec prête pour lot 2 bornes à calibrer) | doc 31 §6 |
| B-18 | Réserves environnementales | R-OVERPASS (endpoints inaccessibles en sandbox — preuve au poste réel requise) · R-MD4 ×2 (supervision production + timeout hébergeur) · 37 routes API sans test automatisé · ~247 warnings lint qualifiés | worklog prod-readiness-audit-6/7 |
| B-19 | Vues dépendantes externes | 36 APInex (nouvelle clé requise par canal sécurisé), 44 LibreTranslate (services publics morts — à re-qualifier ou retirer de l'UI), 45 limitation externe 3 sources | registre 09 |
| B-20 | Artefact plateforme inexpliqué `backups/custom-2026-10-12.db` (222 609 408 o, état antérieur de custom.db, 12:34) | Origine à clarifier côté plateforme (demande incluse au dossier 54 §2 P1-P3) | rapport 52 §1.7 |
| B-21 | CI de régression continue (lint + vitest + build web) sur chaque push | Non créée — prérequis recommandé au build desktop récurrent (C-20) | doc 10 §P3 |

## §4 — Grille de lecture (qui bloque quoi)

```
B-01 lignée ──► B-02 R2 ──► candidat final ──► B-03 C2 ──┐
   │                                    │                ├──► B-07 GO MEP ──► diffusion (G-7/B-13 avant diffusion large)
   └──► B-12 push (sauvegarde distante) │                │
B-04 GO A (S1) ──► B-05 (S2/S3) ──► S4 refigeage ────────┘
B-06 GO B (lot 1) ──► (peut partager S2 — un seul refigeage)
B-08/B-09/B-10/B-11 sécurité externe ──► indépendants (B-11 bloque la publication d'historique, pas le GO local)
B-14 releases obsolètes ──► à neutraliser avant toute diffusion
```

**Aucun de ces blocages ne peut être levé par l'agent sans autorisation écrite explicite** (levée P7, GO A, GO B, accord de restauration, GO MEP) ni par une opération technique non demandée.

---
*Liste des blocages — préparation documentaire. Statu quo conservatoire intégral maintenu (gel dépôt + bases).*
