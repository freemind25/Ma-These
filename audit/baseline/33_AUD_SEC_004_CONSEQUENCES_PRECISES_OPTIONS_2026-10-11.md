# 33 — AUD-SEC-004 — CONSÉQUENCES PRÉCISES DE CHAQUE OPTION (COMPLÉMENT AU DOC 31)

**Cycle :** audit-final-v1.2 · vague 8 · **Date :** 2026-10-11
**Statut : PRÉSENTÉ POUR ARBITRAGE — AUCUNE REMÉDIATION LANCÉE, AUCUNE OPTION PRÉSUMÉE ACCEPTÉE.** Répond au point 2 de la 6ᵉ décision propriétaire (2026-10-11) : « Je réserve ma décision définitive sur D1, D4 et D5 jusqu'à l'examen du document 31 et de son formulaire §9. Merci de me présenter les conséquences précises de chaque option et de ne lancer aucune remédiation de code avant mon GO écrit sur le périmètre retenu. »
**Canal de réponse : le formulaire §9 du doc 31 reste le document de décision** (une case cochée par point D1 / D4 / D5 ; D6 traçabilité à ma charge après décision). Le présent dossier **ne remplace pas** le doc 31 : il en détaille les conséquences opérationnelles, option par option.

---

## §1 — D1 : conséquences précises des trois options AUD-SEC-004

| Dimension | **C-A** — justification acceptée, plan différé v1.3 | **C-B** — lot 1 (10 routes destructives) avant GO | **C-C** — complet (41 routes) avant GO |
|---|---|---|---|
| Code modifié | **0 ligne** — le candidat `7dff2c6` reste strictement identique | 10 routes D + motif `parseBody(request, schema)` + schémas (doc 27-B déjà spécifié route par route) | 10 D + 15 C + 16 L = 41 routes + motif + schémas |
| Impact délai GO | **Zéro jour** | **~1-2 j** (0,5-1 j code + revalidation + refigeage) | **~3-5 j** (3 j code + revalidation lourde + refigeage) |
| Revalidation exigée | Aucune (candidat inchangé) | TNR 1 658+ · lint 0 erreur · GP ciblés sur les 10 routes · **refigeage candidat + nouveau tag obligatoire** | TNR 1 658+ · lint · GP élargis · refigeage obligatoire · surface de régression la plus large (41 routes retouchées) |
| Effet sur la fenêtre commune (doc 32) | Aucun — fenêtre purement migration + isolation | **Articulation possible** : lot 1 exécuté dans la phase C (doc 30 §6.2), **un seul refigeage** pour isolation + lot 1 | Même articulation possible, mais phase C étendue (~+3 j), fenêtre allongée d'autant |
| Risque couvert en plus | Néant (statu quo) | Payloads malformés sur les **10 routes mutantes destructives** → rejet 400 avant traitement (veille, imports, recherche-tabs, toolbox, seed) | En plus : 15 POST calcul/IA (bornes, enums) + 16 GET (plafonds, enums) |
| Risque résiduel restant | S1 négligeable · S3 bas (non traité par zod) · **S4 non prévenu en avant** (dérive de contrat) | S1 négligeable · S3 bas · S4 prévenu sur le CRUD persistant uniquement | S1 négligeable · S3 bas · **S4 prévenu au maximum** (0 route sans zod, critère `grep` = 99) |
| Registre 09 après décision | AUD-SEC-004 → « résiduel documenté, accepté » ; lots 1-2-3 au backlog v1.3 | « Lot 1 traité au cycle audit-final-v1.2 » ; lots 2-3 au backlog v1.3 | « Clôturé intégralement » ; plus aucune route sans zod |
| Ce que vous renoncez à éviter | Toute future dérive de contrat S4 devra être attrapée par les tests/TNR ex post | Bornes manquantes sur POST IA/GET restent possibles | Coût/délai maximal avant GO, pour un risque S1 déjà négligeable et un S3 que zod ne traite pas |

**Lecture synthétique** : C-A = statu quo documenté, zéro délai ; C-B = protection ciblée des 10 routes destructives pour ~1-2 j ; C-C = protection totale pour ~3-5 j avec la plus grande surface de régression. Le bénéfice marginal de C-C porte essentiellement sur S4 (qualité/prévention de régression), pas sur la sécurité d'exploitation (S1/S3).

## §2 — D4 : conséquences précises (vecteur d'origine locale S3)

| Dimension | **D4-accept** (recommandé par le doc 31) | **D4-contrôle** — vérification Origin/Host avant GO |
|---|---|---|
| Code modifié | **0 ligne** | Middleware `src/middleware.ts` (existant, matcher `/api/:path*`) + liste d'origines légitimes + tests |
| Impact délai GO | Zéro | **~0,5-1 j** (code + tests + revalidation + refigeage) |
| Effet S3 | Non traité — réévaluation **obligatoire avant toute diffusion large** (condition inscrite au registre si accepté) | **Traité** : toute requête dont `Origin`/`Host` ne figure pas dans la liste est rejetée avant traitement |
| Risque technique propre | Néant | **Calibrage de la liste d'origines de la webview Tauri Windows** : un contrôle mal calibré peut **casser l'app** en production (requêtes légitimes rejetées). Le calibrage fiable exige le contrôle **C2 Windows** (doc 24) — ordre recommandé si D4-contrôle : C2 d'abord, implémentation ensuite |
| Articulation fenêtre commune | Aucune | Peut être groupé avec le lot 1 (C-B) dans la phase C étendue — **un seul refigeage** ; sinon session code dédiée |
| Registre 09 | « S3 résiduel accepté — réévaluation avant diffusion large » | « S3 traité par contrôle d'origine » |

## §3 — D5 : conséquences précises (2 raw SQL GET `book-skills`, `legal-refs`)

| Dimension | **D5-accept** (recommandé par le doc 31) | **D5-paramètre** — paramétrage avant GO |
|---|---|---|
| Code modifié | **0 ligne** | 2 routes GET : `$queryRawUnsafe` + échappement manuel → `$queryRaw` paramétré (~0,5 h ciblée) |
| Impact délai GO | Zéro (sous-tâche P3 inscrite : « paramétrage au prochain cycle touchant ces routes ») | **~0,5-1 j** réels : le code est rapide mais constitue une **modification de code → red line P7** : levée explicite requise + revalidation + **refigeage candidat** |
| Effet sur le risque | Inchangé — risque **non démontré** : lecture seule, échappement `''` en place, T3 prouve le traitement en littéral | Robustesse maximale : paramétrage natif SQLite, plus de construction de chaîne |
| Articulation fenêtre commune | Aucune | Groupable dans la même session code que C-B/D4-contrôle (un seul refigeage) |

## §4 — Conséquences des combinaisons (ce que votre GO devra préciser)

| Combinaison | Effet sur la fenêtre commune (doc 32) | Effet sur le candidat |
|---|---|---|
| **C-A + D4-accept + D5-accept** (tout statu quo) | Fenêtre purement migration + isolation, conforme aux docs 30/32, **aucun impact** | `7dff2c6` reste le candidat ; un seul nouveau tag à la clôture (cycle isolation) |
| **C-B seul** (± D5-accept/D4-accept) | Lot 1 exécuté **dans la phase C** (doc 30 §6.2) : fenêtre allongée de ~0,5-1 j, **un seul refigeage** pour isolation + lot 1 | Nouveau candidat = candidat isolation + lot 1 |
| **C-B et/ou C-C + D4-contrôle et/ou D5-paramètre** | Toutes les modifications de code (isolation + sécurité) regroupées en sessions S2/S3 étendues — **un seul refigeage commun** ; à préciser au GO (périmètre exact des groupes de commits) | Nouveau candidat unique ; revalidation unique en S4 |
| **C-C complet** | Fenêtre allongée de ~3 j au total (phase C étendue) | Nouveau candidat = isolation + 41 routes zod |

Dans toutes les combinaisons avec modification de code : **le candidat `7dff2c6` actuel n'est pas détruit** (tags conservés) ; le nouveau candidat fait l'objet d'un nouveau tag et d'une consignation dédiée ; aucun amend/rebase/force-push.

## §5 — Ce que votre décision devra comporter (rappel)

1. **Une réponse par point** dans le formulaire §9 du doc 31 : D1 (C-A / C-B / C-C) · D4 (accept / contrôle) · D5 (accept / paramètre).
2. **Si une option de code est retenue** (C-B, C-C, D4-contrôle, D5-paramètre) : votre GO écrit devra **lever expressément la red line P7** pour le périmètre exact retenu (routes/fichiers listés), préciser l'articulation avec la fenêtre commune (même fenêtre ou session dédiée), et couvrir le refigeage + revalidation correspondants.
3. **Si tout statu quo** : aucune instruction supplémentaire — la fenêtre commune reste conforme aux docs 30/32, et la traçabilité D6 (registre 09 + doc 04 + docs 23/31) est exécutée à ma charge immédiatement après réception de votre décision.

**En l'absence de décision : statu quo conservatoire** — aucune remédiation, aucune modification de code, AUD-SEC-004 maintenu « options présentées » au registre, fenêtre commune inchangée.

---
*Fondements : doc 31 (justification C-A complète, D4, D5, formulaire §9) · doc 23 (constat reproductible, modèle de menace, contrôles compensatoires) · doc 27-B (spécification lot 1 route par route) · doc 30/32 (fenêtre commune). Aucune modification de code, aucune écriture base — présentation d'arbitrage uniquement.*
