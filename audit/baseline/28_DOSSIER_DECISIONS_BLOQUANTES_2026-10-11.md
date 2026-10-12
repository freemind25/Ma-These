# 28 — DOSSIER DE DÉCISIONS BLOQUANTES — présentation séparée pour arbitrage du propriétaire

**Cycle :** audit-final-v1.2 · vague 6 · **Date :** 2026-10-11
**Objet :** répondre à l'exigence de la 4ᵉ décision du propriétaire : « présentez chaque décision bloquante séparément, avec les éléments factuels nécessaires à mon arbitrage. »
**Lecture :** chaque fiche est **auto-suffisante** (objet, faits vérifiés, options, conséquences, ce qui se déclenche à votre réponse). Aucune décision n'est considérée comme prise implicitement. En l'absence de réponse : **statu quo conservatoire** (candidat figé, base intacte, rien n'exécuté).

> **MISE À JOUR 2026-10-11 — orientations reçues (5ᵉ décision du propriétaire)** : ① **A1 sous conditions** (pré-requis finaux présentés avant GO → **doc 30**) · ② **B1** même fenêtre (aucune 2ᵉ thèse avant validation du cycle) · ③ examen préalable → justification C-A complète + D4 + D5 (**doc 31**) · ④ C2 selon doc 24, vérification des 8 preuves à réception, aucun succès déclaré avant vérification complète · ⑤ push maintenu en attente, **aucun push sans confirmation explicite E1/E2**, re-vérification complète juste avant opération · ⑥ gel maintenu (révocation + plan final + fenêtre) · ⑦ **correctif DIFFÉRÉ** (G2), surveillance + contournement continues (registre 09 mis à jour). Les fiches ci-dessous sont conservées telles quelles pour traçabilité des options ; les orientations ne valent pas autorisation d'exécuter une opération bloquée avant validation de son périmètre et de ses prérequis.

---

## DÉCISION ① — GO écrit sur la migration réelle des références (docs 21 + 25)

**Objet :** autoriser ou non l'exécution de la migration « références rattachées par thèse » sur la base réelle `db/custom.db` (étapes 0-8 du doc 21), le GO étant suspendu depuis votre 3ᵉ décision.

**Éléments factuels vérifiés :**
- La migration rattache les **4 références existantes** à la thèse « Urbanisme durable » au niveau des données (colonne `thesisId`, index, cascade) — journal d'attribution horodaté, réversibilité doublement prouvée (rollback chirurgical 4/4 + restauration byte-identique, répétition générale sur copie).
- Elle **ne change rien au comportement des 8 consommateurs applicatifs** (précision d'honnêteté doc 25 §1) : bibliothèque toujours affichée globalement jusqu'au cycle applicatif (décision ②).
- **Risques inter-thèses R1-R5** (doc 25 §3) : aucun ne peut se matérialiser tant qu'une seule thèse existe ; la migration ne les crée pas et n'en aggrave qu'un seul (R4 — cascade devenue active, comportement voulu et confirmé par dialogue).
- **Option B enregistrée** (votre choix) : zéro écriture de test sur la base réelle — preuve d'isolation = répétition 16/16 sur copie + suite vitest du cycle applicatif.
- Runbook prêt : doc 27 partie A (commandes exactes, pré-vol, critères d'arrêt, rollback voie 7b, livrables).

**Options :**
- **A1 — GO avec fenêtre unique** : migration PUIS cycle applicatif (décision ②) dans la même session → l'état intermédiaire n'est jamais exposé à l'usage ; une seule revalidation finale.
- **A2 — GO migration seule** : état intermédiaire documenté (sans risque à 1 thèse) ; cycle applicatif dans une seconde fenêtre (nouvelle autorisation).
- **A3 — Maintien de la suspension** : rien n'exécute ; la préparation reste prête (doc 27).

**Si GO (A1 ou A2), vous recevrez** : journal d'attribution (4 entrées), rapport d'ambiguïté (attendu 0), preuves SHA doubles, verdict PASS `consistency-check`, TNR + captures UI.

---

## DÉCISION ② — Autorisation du cycle applicatif d'isolation par thèse (P1-P4, 2-3 j)

**Objet :** lever la red line « aucune modification de code » pour le **périmètre `references` uniquement**, afin d'achever l'isolation applicative que la migration seule ne livre pas.

**Éléments factuels vérifiés :**
- Les 8 consommateurs (doc 25 §2, liste fermée audité) filtrent/envoient déjà tout sauf `thesisId` ; le socle de données n'est exploitable qu'une fois les règles API posées (une API ne peut pas filtrer sur une colonne inexistante — la migration est le prérequis).
- Risques couverts par le cycle : **R1** (lecture inter-thèses — certain dès la 2ᵉ thèse), **R2** (modification/suppression inter-thèses par id — le principal risque opérationnel), **R3** (créations globales récurrentes), filtre rendu obligatoire → 400/404 explicites.
- Contenu : API (`thesisId` obligatoire + gardes 404) → UI (4 vues + DOCX scopés) → **12-16 tests d'isolation vitest** (la preuve de l'option B, zéro écriture de test sur la base réelle) → revalidation à 2 thèses (protocole prouvé). Design complet : doc 27 partie C.
- Effort : 2-3 j (cohérent avec l'estimation v1.0, roadmap 10 action C-17). Contribution collatérale : 0 route `references` sans zod (réduit AUD-SEC-004).

**Options :**
- **B1 — Autoriser, fenêtre unique** (combinée à A1) : exécution conjointe migration + cycle, revalidation unique.
- **B2 — Autoriser, fenêtre séparée** : cycle planifié après la migration et une nouvelle coordination.
- **B3 — Différer** : les risques R1-R3 restent sans effet tant qu'une seule thèse existe ; à réévaluer avant toute création d'une 2ᵉ thèse (recommandation : ne pas créer de 2ᵉ thèse avant ce cycle).

**À noter :** si l'option B ou C de la décision ③ est retenue, les deux cycles de code peuvent partager la même fenêtre et le même refigeage de candidat.

---

## DÉCISION ③ — AUD-SEC-004 : option A / B / C + décisions D4 / D5 (doc 23 §6)

**Objet :** clore la seule anomalie de sécurité ouverte (41/99 routes sans schéma zod, pondérée **Basse**) en choisissant : justification acceptée ou traitement avant GO.

**Éléments factuels vérifiés (doc 23, recompte exact à HEAD) :**
- 10/41 routes mutantes avec écriture base (dont 4 déjà partiellement validées + chaîne upload audité ✅) · 15/41 sans écriture · 16/41 lecture seule.
- Modèle de menace : app **mono-utilisateur locale**, serveur **loopback uniquement** (Tauri spawn 127.0.0.1:14325) — aucune exploitabilité à distance démontrée ; conséquences d'un payload malformé bornées (400/500 JSON, rejet Prisma sans écriture partielle) — prouvé live (T1/T3).
- Le bénéfice principal du zod est la **prévention de régression de contrat front/back** (S4 — 2 occurrences P2 corrigées), plus que la défense intrusion.
- Design du lot 1 (10 routes destructives) prêt : doc 27 partie B — schémas calqués sur les gardes existantes, zéro changement de comportement observable.

**Options (D1) :**
- **C-A — Justification acceptée** (recommandation de l'auditeur, défendable sur pièces) : AUD-SEC-004 → « résiduel documenté, accepté » ; plan §5 différé post-GO (v1.3). **Impact délai : 0.** La règle 6.4 est satisfaite par la justification.
- **C-B — Lot 1 avant GO** : les 10 routes destructives seulement (0,5-1 j + revalidation). **Impact délai : ~1 j.** Exige levée de red line code (refigeage candidat + nouveau tag).
- **C-C — Traitement complet** : lots 1+2+3 (2-3 j + revalidation complète). **Impact délai : ~3 j.** Mêmes exigences.

**Sous-décisions séparées (une réponse chacune) :**
- **D4 — vecteur d'origine locale S3** (site distant → 127.0.0.1) : *non traité par zod*. Option : accepter comme résiduel documenté (recommandé tant que l'app n'est pas diffusée largement — données locales, restauration prouvée) **ou** exiger une vérification d'origine (header Origin/Host) avant diffusion large.
- **D5 — 2 raw SQL GET** (`book-skills`, `legal-refs`, échappement manuel `'`→`''`, mitigé) : accepté tel quel en local (recommandé, risque non démontré) **ou** paramétrage exigé au prochain cycle touchant ces routes (inscription registre, sous-tâche P3).

**Ce qui se déclenche à votre réponse** : option C-B/C-C → exécution du lot selon doc 27 partie B dans la fenêtre autorisée, refigeage + nouveau tag, TNR + 7 GP rejoués. Option C-A → inscription backlog v1.3, mise à jour registre 09 + doc 04 + doc 23 (traçabilité D6, à ma charge).

---

## DÉCISION ④ — C2 Windows : votre exécution sur votre machine (action, pas arbitrage)

**Objet :** dernier critère GO non exécuté — build Windows Tauri + smoke CSP, **par vos soins**, sur le candidat exact.

**Éléments factuels :**
- Check-list complète et prête : **doc 24** (prérequis machine 1.1-1.10, pré-contrôles checkout/empreinte/drift DB, build NSIS attendu, 7 GP + persistance avec critères PASS, CSP/capabilities valeurs exactes, tableau PASS/FAIL global).
- **Candidat à tester** : `7dff2c6c98f8be59edb64b34f8a1eb021745a435` — empreinte arbre de référence `8ae37eda…87e75e` (divergence = ARRÊT + signalement, hash commit = critère décisif).
- ⚠️ **Ne pas utiliser** la check-list vague 4 (`evidence/c2-windows-checklist-pre-remplie.md`, préparée sur `fb60ae1` — obsolète).
- Règle d'or du doc 24 : tout écart → **arrêt + signalement**, aucun correctif à la main pendant l'exécution.

**Ce que je fais dès votre signal** : accompagnement à l'exécution (réponses aux questions pas-à-pas), puis **vérification des 8 preuves retournées** (gabarit `c2-build-windows.json`, empreinte, smoke CSP) et consignation au registre. Toute divergence est signalée immédiatement (votre exigence P2).

---

## DÉCISION ⑤ — Push GitHub : rétablissement des identifiants (blocage externe)

**Objet :** pousser les travaux clôturés vers `origin/main` — **push normal uniquement**, dès rétablissement sécurisé des identifiants.

**Éléments factuels vérifiés (re-vérification complète du 2026-10-11, lecture seule) :**
- `origin/main` = `f4ca696` (inchangé) · arbre de travail **propre** · `git ls-remote` toujours en échec d'authentification (identifiants absents depuis le rollback — aucun push tenté en aveugle).
- **⚠️ Divergence signalée (exigence P3 « références n'ont pas changé »)** : la liste annoncée au rapport 26 était **6 commits** ; depuis, un **marqueur d'environnement automatique `938510a`** (daté 2026-10-11, UUID — mécanisme de session, sans code ni doc métier ; il contient le doc 26 + worklog) a été committé automatiquement. **Liste à jour : 7 commits + 2 tags** :

| # | Commit | Nature |
|---|---|---|
| 1 | `d17488a` | Marqueur d'environnement |
| 2 | `7dff2c6` | **Applicatif** — fix A1C1-02 |
| 3 | `24415b7` | **Docs** vague 4 |
| 4 | `1381350` | **Docs** preuves vague 4 |
| 5 | `af98588` | Marqueur d'environnement |
| 6 | `e35a295` | **Docs** vague 5 |
| 7 | `938510a` | Marqueur d'environnement (doc 26 + worklog) |

- **2 tags en attente** : `candidat-app-audit-v1.2` → `7dff2c6` · `candidat-docs-audit-v1.2` → `24415b7` (cibles re-vérifiées le 2026-10-11, inchangées).
- Les présents docs 27-28 s'ajouteront via le même mécanisme de marqueurs ; la liste sera **re-vérifiée et reconsignée au moment du push** (aucun force-push, rebase ou amend — commande unique : `git push origin main --tags`).

**Options :**
- **E1 — Rétablir les identifiants dans l'environnement sécurisé** (mécanisme `.gh-askpass.sh` ou équivalent) → j'exécute le push normal et je consigne la sortie + vérification post-push (log vide vs origin).
- **E2 — Vous poussez vous-même** depuis un autre environnement (je fournis la liste exacte + la commande).
- **E3 — Différer** : l'état local reste la référence ; le push n'est pas un prérequis des décisions ①-③.

---

## DÉCISION ⑥ — BFG / purge d'historique APINex (figée — 3 conditions)

**Objet :** autoriser un jour la purge de l'historique git (exposition ancienne clé APINex) — jusqu'ici **aucune purge, aucune réécriture, aucun force-push**.

**Éléments factuels :**
- Plan exécutable prêt (doc 13 §7) ; audit non destructif consigné (`a5-git-audit.json`) ; `.env` désuivi.
- Les 3 conditions que VOUS avez posées restent toutes ouvertes : **(1) confirmation de la révocation de l'ancienne clé** — statut inconnu de mon côté, seul vous/le fournisseur pouvez le confirmer ; **(2) approbation explicite du plan BFG** ; **(3) coordination de la fenêtre**.
- La nouvelle clé ne transitera que **par canal sécurisé** — jamais dans le dépôt ni l'historique.

**Options :** **F1** — vous confirmez la révocation → je vous soumets le plan §7 pour approbation formelle puis la fenêtre ; **F2** — maintien du gel (statu quo). *Recommandation : traiter cette décision indépendamment du GO applicatif — la révocation de clé est un acte de sécurité externe, sans lien technique avec les décisions ①-③.*

---

## DÉCISION ⑦ — A1V4-01 (P3, non bloquante GO) : corriger ou différer

**Objet :** arbitrer le correctif du défaut d'auto-save découvert en vague 4.

**Éléments factuels vérifiés (registre 09) :**
- Après démarrage/rechargement, l'éditeur affiche `chapters[0]` mais `activeChapterId` reste `null` tant qu'aucun onglet n'est cliqué → la saisie dans le chapitre affiché par défaut n'est **pas sauvegardée**, sans indicateur visible (`editor-page.tsx` l.226 / l.86 / l.92).
- **Flux normal non affecté** : dès qu'un onglet est cliqué, tout fonctionne (PUT 200 prouvé — GP-1 validé).
- **Contournement documenté** (votre exigence P5, respectée : aucun correctif écrit) : cliquer l'onglet du chapitre avant de saisir.
- Correctif proposé : sélectionner `chapters[0]` au mount si null — 1-2 lignes + test. Conséquence inévitable : modification de code → nouveau commit + revalidation + **refigeage candidat + nouveau tag** (jamais d'écriture sur `7dff2c6`).

**Options :** **G1 — corriger dans la prochaine vague de code autorisée** (regroupable avec décision ② et/ou ③ — un seul refigeage) ; **G2 — différer post-GO** (v1.3, contournement documenté entre-temps).

---

## Synthèse — grille de réponse rapide

| Décision | Question | Si accord |
|---|---|---|
| ① | GO migration ? fenêtre unique ou deux ? | exécution doc 27-A à la fenêtre coordonnée |
| ② | Autoriser cycle isolation ? fenêtre unique ou séparée ? | exécution doc 27-C |
| ③ | AUD-SEC-004 : A / B / C ? D4 ? D5 ? | C-B/C-C → exécution doc 27-B |
| ④ | C2 Windows | votre exécution doc 24 — je vérifie les 8 preuves |
| ⑤ | Push : E1 / E2 / E3 ? | push normal + consignation |
| ⑥ | BFG : révocation confirmée ? | plan §7 soumis pour approbation |
| ⑦ | A1V4-01 : G1 / G2 ? | regroupé avec la prochaine vague de code |

**En l'absence de réponse sur une fiche : statu quo conservatoire pour cette fiche uniquement** — les autres décisions avancent indépendamment.
