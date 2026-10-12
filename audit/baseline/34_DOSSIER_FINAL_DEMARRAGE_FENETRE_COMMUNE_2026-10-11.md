# 34 — DOSSIER FINAL DE DÉMARRAGE — FENÊTRE COMMUNE MIGRATION + ISOLATION (MODE A, B-STRICT)

**Cycle :** audit-final-v1.2 · vague 9 · **Date :** 2026-10-11
**Statut : DOSSIER DE DÉMARRAGE PRÉSENTÉ — N'EST PAS UN GO, N'EN PRÉSUME AUCUN.** Répond au point 1 de la 7ᵉ décision propriétaire (2026-10-11) : « Cette confirmation porte sur la méthode et la coordination. Elle ne constitue pas encore mon GO d'exécution de la migration réelle. Merci de maintenir les préparatifs et de me soumettre le dossier final de démarrage avant toute écriture sur `db/custom.db` ou modification de `prisma/schema.prisma`. »
**Fondements :** doc 30 (pré-requis finaux) · doc 32 (calendrier + coordination) · doc 27-A (commandes) · doc 21/25 (séquence, clarification).

---

## §1 — Paramètres verrouillés (confirmations 6ᵉ + 7ᵉ décisions, désormais définitifs)

| Paramètre | Valeur verrouillée |
|---|---|
| Variante re-pass UI | **B-strict** — preuve isolation 2 thèses par harnais Vitest uniquement · zéro création de thèse de test (même jetable) sur `db/custom.db` · re-pass UI mono-thèse en consultation |
| Structure de fenêtre | **Plusieurs sessions coordonnées** S1→S4 (doc 32 §2), app **inutilisée** entre S1 et l'accord de clôture |
| Mode de coordination | **Mode A** — arrêt à chaque point d'arrêt PA1-PA4, poursuite **uniquement après votre accord écrit** (« GO S2 »…) ; aucune anomalie n'est traversée |
| Écritures sur la base réelle | Uniquement la migration elle-même (M-4/M-5/M-6), précédées de la sauvegarde bloquante ; **zéro écriture de test** |
| Retour arrière | Voie **7b restauration byte-identique** par défaut ; jamais d'amend/rebase/force sur le candidat figé |
| Candidat de départ | `7dff2c6c98f8be59edb64b34f8a1eb021745a435` (tag `candidat-app-audit-v1.2`, jamais déplacé) · empreinte arbre `8ae37eda…87e75e` |

## §2 — Calendrier à dater dans votre GO (grille à compléter)

| Session | Contenu | Durée | Date proposée (à confirmer) |
|---|---|---|---|
| S1 | Gel + sauvegarde bloquante + migration M-0→M-7 + verdict PASS | 60–90 min | J0 = ____ (créneau 9h-12h GMT-1 par défaut) |
| S2 | P1 API (isolation) **+ lot 1 AUD-SEC-004 si D1=C-B confirmé** (doc 35 §6) | 1–2 j | J1 = ____ |
| S3 | P2 UI (4 vues + DOCX scopés) + P3 tests Vitest d'isolation (12-16) | 0,5–1 j | J2 = ____ |
| S4 | Revalidation unique (TNR ~1 670+, lint, GP harnais, re-pass UI mono-thèse) + consignation + refigeage + nouveau tag | 0,5–1 j | J3 = ____ |
| Clôture | Remise du paquet de preuves (doc 32 §7) → votre décision de clôture écrite → reprise d'usage | — | — |

Le calendrier exact et les créneaux seront fixés **dans votre GO** (§8). L'espacement entre sessions est libre (base gelée, contrôle de continuité SHA à chaque réouverture) ; un enchaînement serré est recommandé pour limiter la période d'inutilisation.

## §3 — Checklist de démarrage finale (S1 — toutes les lignes doivent être vertes avant la première écriture)

- [ ] **GO écrit** du propriétaire couvrant : docs 30/32/34 + dates S1-S4 + mode A + B-strict + nom du nouveau tag
- [ ] Serveur port 3000 arrêté, aucun utilisateur actif (`curl localhost:3000` échoue)
- [ ] `git rev-parse HEAD` = `7dff2c6c98f8be59edb64b34f8a1eb021745a435`, `git status` propre, empreinte arbre = `8ae37eda…87e75e` re-calculée
- [ ] Inventaire lecture seule : Reference **4** / Thesis **1** / 30 tables / 0 violation FK / `integrity_check` = ok
- [ ] Aucune 2ᵉ thèse existante (orientation ② respectée)
- [ ] Scripts éprouvés `audit/baseline/tools/rehearsal-refs/` présents, hashes consignés au journal
- [ ] Sauvegarde créée et contrôlée (double SHA identiques + inventaire sur copie + integrity ok) — **bloquant avant toute écriture**
- [ ] **Levée expresse de la red line P7 pour le périmètre des fichiers du lot 1 (doc 35 §3)** — D1=C-B **CONFIRMÉ le 2026-10-11** (formalisée) : cette levée est désormais requise dans votre GO, ainsi que le GO spécifique distinct du lot 1

## §4 — Séquence d'exécution de référence (résumé — textes intégraux : docs 30 §6 + 27-A.2)

`0` gel des écritures → `1` sauvegarde horodatée + double SHA + inventaire copie (bloquant) → `2` export réversible 4 références → `3` inventaire avant → `4` amendement `prisma/schema.prisma` (commit dédié, 4 lignes exactement : `thesisId String?` + Cascade + `@@index` + `references Reference[]`) + `prisma generate` → `5` `prisma db push --skip-generate` (~1 s, contrôles bloquants) → `6` attribution (`4 / 0 ambiguë / 0 sans thèse`) → `7` `consistency-check` (verdict **PASS** obligatoire) → `7-bis` option B : zéro écriture de test → phase C (S2/S3) → phase R (S4) → consignation.

## §5 — Rapports aux points d'arrêt (mode A — contenu de chaque accord demandé)

| PA | Rapport remis | Votre accord attendu |
|---|---|---|
| **PA1** (fin S1) | SHAs + inventaires avant/après + verdict PASS + commit schéma | « GO S2 » |
| **PA2** (fin S2) | Diff P1 API (+ diff lot 1 si retenu) + tests ciblés verts | « GO S3 » |
| **PA3** (fin S3) | Résultats 12-16 tests Vitest d'isolation + 0 route `references` sans zod | « GO S4 » |
| **PA4** (fin S4) | **Paquet de preuves complet** (11 items, doc 32 §7) + rapport de fenêtre horodaté | **Décision de clôture écrite** → reprise d'usage |

## §6 — Critères d'arrêt et retour arrière (rappel bloquant, inchangés)

Toute divergence de comptage, tout `integrity_check ≠ ok`, toute violation FK, tout dangling ≠ 0, tout test en échec, toute divergence d'empreinte → **ARRÊT IMMÉDIAT** (même en cours de session), aucun correctif improvisé, signalement, puis rollback voie 7b avant toute autre action. Échec en phase C : base maintenue en état M (cohérent, doc 25 §3), décision vous revient.

## §7 — Preuves avant clôture

Les **11 preuves** du doc 32 §7 (SHAs, inventaires, journal d'attribution, rapport d'ambiguïté 0, verdicts PASS, commits, tests, TNR/lint/GP, captures UI, nouveau tag + empreinte, registre + v1.2, journal de fenêtre) sont remises **en paquet unique à PA4**. Aucune proposition de clôture sans paquet complet.

## §8 — Formalisation de votre GO (texte modèle — à compléter/ajuster)

> « Je donne mon **GO d'exécution** pour la fenêtre commune migration + isolation conformément aux documents 30, 32, 34 [et 35 si D1=C-B] : sessions S1-S4 aux dates ____, mode A (arrêt à chaque PA, poursuite après mon accord écrit), variante B-strict verrouillée, zéro écriture de test sur la base réelle, rollback voie 7b. Nom du nouveau tag candidat : ____. [Le lot 1 AUD-SEC-004 est autorisé selon le doc 35, périmètre §2, intégré à S2.] »

## §9 — Engagements conservatoires en l'absence de GO

Rien n'est exécuté : base réelle en l'état (265 330 688 o), candidat figé, aucune écriture `db/custom.db`, aucune modification `prisma/schema.prisma`, aucune modification de code. Les préparatifs restent maintenus et actualisés jusqu'à votre GO.

---
*Ce dossier verrouille les paramètres de méthode confirmés par vos 6ᵉ et 7ᵉ décisions et prépare la demande de GO. Il ne constitue ni un GO ni une exécution.*
