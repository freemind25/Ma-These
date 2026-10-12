# 59 — PLAN D'EXÉCUTION ORDONNÉ ET CALENDRIER PROPOSÉ — REPRISE PUIS MISE EN PRODUCTION « MA THÈSE »

**Cycle :** audit-final-v1.2 · vague 35 (préparation documentaire — zéro opération technique)
**Date :** 2026-10-12 · **Fondements :** docs 44/34 (fenêtre commune, durées) · docs 42/35 (GO B) · docs 24/39 (C2) · rapport 52 §6 (R2 étapes 6-12) · doc 13 §7 + doc 40 (BFG) · docs 28/30/32 (décisions et coordination).
**Principe :** chaque phase démarre uniquement après l'autorisation écrite correspondante ; chaque phase se termine par un rapport de preuves ; le silence ne vaut jamais acceptation. **Tant que la réponse de l'opérateur n'est pas parvenue, seul P0 est actif (gel intégral).**

---

## §1 — Vue d'ensemble (chaîne critique et parallèles)

```
P0 attente opérateur (gel)
   └► P1 réception archive → vérification lecture seule → présentation → ACCORD ÉCRIT
        └► P2 restauration lignée + préconditions → R2 finalisation (6-12) → candidat final post-R2
             ├► P3 fenêtre commune (GO A) : S1 migration → S2 P1+lot1 (GO B) → S3 P2/P3 → S4 revalidation + refigeage
             │        └► candidat final refigé (tag …-R2 ou nouveau)
             │             └► P4 C2 Windows (propriétaire) ──────────────┐
             └► P5 sécurité externe (parallèle, indépendant)             │
                  (révocations, rotations, BFG, push)                     ▼
P6 D4 réévaluation (avant diffusion large) ───────────────► P7 GO MEP + build/release final
```

## §2 — Phases détaillées

### P0 — Attente opérateur (ACTIF — gel intégral)
- Contenu : aucune opération technique ; dépôt/bases/preuves scellés ; marqueurs plateforme capturent l'état.
- Sortie : livraison d'une archive dans `/home/sync/upload/` (copie, sans écrasement) **ou** confirmation écrite d'absence.
- Autorisation : aucune requise (statu quo).

### P1 — Réception et vérification de l'instantané (~1-2 h, lecture seule)
- Prérequis : archive déposée en copie ; propriétaire informé.
- Actions : protocole rapport 52 §5 (empreinte archive → extraction `/tmp/verif-snapshot/` → HEAD `7179458…` attendu, 4 tags, cat-file ×6, arbres `8ae37eda…`/`1dab90e5…`, témoin 23 994 o, SHAs bases si présents).
- Sortie : **rapport de vérification présenté au propriétaire** → autorisation écrite de restauration requise (ou passage Option B).
- Autorisation : présentation gratuite ; restauration = accord écrit.

### P2 — Restauration + finalisation R2 (~1-2 h, après accord écrit)
- Prérequis : 4 préconditions lecture seule (rapport 52 §6) ; serveurs arrêtés ; arbre propre.
- Actions : restauration de la lignée ; étapes 6-12 (commit base de test → validation preuves → tag `candidat-app-audit-v1.2-R2` → empreinte archive → mises à jour docs → commit documentaire → tag `candidat-docs-audit-v1.2-R2`) — **sans db:push, sans répétition des contrôles validés** ; C2 final préparé pour R2.
- Sortie : candidat final post-R2 identifié, empreinte consignée (doc 24 §0).
- Autorisation : accord écrit P1 (couvre la séquence) ; tags nouveaux uniquement, jamais déplacés.

### P3 — Fenêtre commune migration + isolation (GO A — 3 à 4,5 j ouvrés, préavis 24 h)
| Session | Contenu | Durée | Point d'arrêt | Autorisation |
|---|---|---|---|---|
| S1 | Checklist doc 44 (PRÉ-DÉMARRAGE + SAUVEGARDE BLOQUANTE + déclaration de conformité) → migration M-0→M-7 → verdict PASS | 60-90 min | PA1 → « GO S2 » | GO A écrit |
| S2 | P1 API isolation **+ lot 1 AUD-SEC-004** (si GO B ; un seul refigeage) | 1-2 j | PA2 → « GO S3 » | GO A + GO B + levée P7 |
| S3 | P2 UI (4 vues + DOCX scopés) + P3 tests Vitest isolation (12-16) | 0,5-1 j | PA3 → « GO S4 » | GO A |
| S4 | Revalidation unique (TNR ~1 670+, lint, GP harnais, re-pass mono-thèse) + consignation + **refigeage + nouveau tag** | 0,5-1 j | PA4 → décision de clôture écrite | GO A |
- Preuves finales : paquet 11 items (doc 32 §7). Retour arrière : RA-1/RA-2 (doc 58).

### P4 — C2 Windows (propriétaire, 0,5-1 j, après P3)
- Prérequis : candidat final refigé (P3-S4) ; check-list doc 24 (jamais la version obsolète `fb60ae1`) ; cadre doc 39.
- Actions : exécution sur machine Windows (8 pré-contrôles, build NSIS, 7 GP + persistance, CSP/capabilities) → 8 preuves → vérification agent (doc 39 §3).
- Sortie : verdict `DESKTOP_WINDOWS_VALIDE` ou `PROBLEMES: <liste>` (tout écart → ARRÊT + signalement).
- Autorisation : exécution propriétaire ; aucune écriture côté agent.

### P5 — Sécurité externe (parallélisable dès maintenant — aucune dépendance au GO applicatif)
| Action | Responsable | Effort | Débloque |
|---|---|---|---|
| Révoquer les 2 clés GitHub transités par chat | OP | minutes | B-09 |
| Rotation de la clé OpenAlex (ancienne clé toujours active) | OP / fournisseur | heures | B-08 |
| Confirmation de révocation APINex (5 éléments, doc 40) | OP / fournisseur | heures | B-10 → condition (i) BFG |
| Approbation plan BFG (doc 13 §7) + fenêtre coordonnée | OP puis AGT | 0,5 j + fenêtre | B-11 (publication propre de l'historique) |
| Push des commits/tags (E1/E2) — liste re-vérifiée juste avant | OP puis AGT | 0,5 h | B-12 (⚠️ nécessite P2 si la lignée a été restaurée) |

### P6 — Réévaluation D4 avant diffusion large (0,5 j si contrôle exigé)
- Condition inscrite au registre (D4-accept) : vérification Origin/Host (`src/middleware.ts`) ou acceptation motivée renouvelée — à trancher **avant tout premier utilisateur**.
- Autorisation : décision écrite (D4-contrôle ou maintien motivé).

### P7 — Mise en production (0,5-1 j, après G-1…G-9 verts)
- Actions : bump version (ex. v1.10.9) sur le candidat final → build CI (workflow prouvé) + smoke → neutralisation des releases v1.10.7/v1.10.8 pré-audit (B-14) → **GO MEP écrit du propriétaire** sur le paquet complet → publication contrôlée (RA-7 disponible en repli).
- Sortie : installeur tracé (empreinte) + release publiée + consignation.

### P-ALT — Option B (si l'opérateur confirme l'absence d'instantané)
- Choix du propriétaire entre : **Option A** (état actuel conservé, historique d'origine manquant — MEP impossible en l'état sans candidat refigé) ou **Option B** (nouvelle lignée Git explicitement documentée comme reconstruction : re-commit du contenu actuel + repose des tags **nouveaux** — jamais de réutilisation des noms/hashes d'origine — puis re-vérification complète R-1…B-1 du doc 56 avant reprise en P2-bis).
- Coût estimé : +0,5-1 j + revalidation complète ; les SHA `7dff2c6…`/`24415b7f…` d'origine ne reviendront jamais — le traçage s'appuie sur les empreintes de contenu consignées (fichiers, arbres, bases).

## §3 — Calendrier proposé (en jours relatifs — J0 = réponse de l'opérateur ; créneaux 9h-12h GMT-1 par défaut, préavis 24 h pour chaque fenêtre)

| Échéance | Phase | Durée | Autorisation à la veille |
|---|---|---|---|
| J0 | P1 vérification de l'archive | 1-2 h | — (présentation) |
| J0+1 | P2 restauration + R2 (6-12) | 1-2 h | accord écrit P1 |
| J1-J4 | P3 fenêtre commune S1→S4 (PA1-PA4) | 3-4,5 j ouvrés | GO A (+ GO B + levée P7 si lot 1 en S2) |
| J5-J6 | P4 C2 Windows (propriétaire) | 0,5-1 j | candidat final refigé |
| J0-Jn (parallèle) | P5 sécurité externe | au fil de l'eau | — |
| J6-J7 | P6 D4 réévaluation + P7 GO MEP + build/release | 1-2 j | G-1…G-9 verts |
| **Total** | **~6-9 jours calendaires après J0** (~5-6 j d'activité effective), en enchaînement serré | | |

**Scénario Option B :** ajouter ~1-1,5 j (refigeage + revalidation complète) → total ~8-10 jours.
**Si l'opérateur tarde :** P5 (sécurité externe) peut être traitée dès maintenant sur simple décision du propriétaire — elle ne touche ni le dépôt ni les bases.

## §4 — Règles transversales (rappel)

Mode A (arrêt à chaque PA, poursuite après accord écrit) · B-strict (zéro écriture de test sur la base réelle) · jamais d'amend/rebase/force-push · tags créés jamais déplacés · tout écart = ARRÊT + signalement immédiat · preuves horodatées à chaque étape · l'app reste inutilisée entre S1 et l'accord de clôture.

---
*Plan d'exécution — préparation documentaire. N'ordonne aucune exécution : chaque phase attend l'autorisation écrite correspondante du propriétaire.*
