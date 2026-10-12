# 42 — DOSSIER GO B — LOT 1 AUD-SEC-004 (D1 = C-B) : PRÉCONDITIONS, PÉRIMÈTRE, POINTS D'ARRÊT, CRITÈRES DE RÉUSSITE, RETOUR ARRIÈRE

**Cycle :** audit-final-v1.2 · vague 15 · **Date :** 2026-10-11
**Statut : DOSSIER PRÊT — CECI N'EST PAS UN GO. LE LOT 1 RESTE BLOQUÉ (P7 + GO B REQUIS).** Répond au point 4 (volet B) de la confirmation documentaire du propriétaire (2026-10-11) : « Les dossiers GO A et GO B séparés, avec leurs préconditions, périmètres, points d'arrêt, critères de réussite et procédures de retour arrière. »
**Fondements :** doc 35 (dossier d'exécution lot 1 — intégralité à lire avant tout travail) · doc 27-B (spécification route par route, extraite du code HEAD) · docs 23/31/33 (justification, arbitrage, conséquences) · décision formalisée (2026-10-11) : **D1 = C-B · D4 = D4-accept · D5 = D5-accept — sans autorisation d'exécution**.

---

## §1 — Objet du GO B

Autoriser, **par écrit**, l'exécution du **lot 1 d'AUD-SEC-004** : ajout de schémas zod sur les **10 routes mutantes destructives** (validation durcie des entrées), selon la règle d'or « schémas calqués » (§4), avec revalidation et **refigeage du candidat** (nouveau tag). AUD-SEC-004 est pondérée **Basse** (app mono-utilisateur locale, serveur loopback) — le lot 1 traite la prévention de régression de contrat front/back et le durcissement des entrées destructives. Les **conditions D4/D5** restent inscrites : réévaluation obligatoire avant toute diffusion large (D4) · paramétrage des 2 raw SQL GET au backlog v1.3, sous-tâche P3 (D5).

## §2 — Préconditions (toutes bloquantes)

| # | Précondition | Note |
|---|---|---|
| 1 | **Levée expresse et écrite de la red line P7** (aucune modification de code), **limitée au périmètre exact des fichiers §3** — rien d'autre | la levée n'est **pas permanente** : elle vaut pour le lot 1 uniquement |
| 2 | **GO B écrit, spécifique et distinct** (du GO A) | un GO A seul ne débloque pas le lot 1 |
| 3 | **Articulation choisie dans le GO** : (a) **intégré à S2** de la fenêtre commune (recommandé — un seul refigeage, une seule revalidation, doc 35 §5) **ou** (b) session code dédiée hors fenêtre | si (a) : le PA2 couvre le lot 1 (cf. §5) |
| 4 | **Nom du nouveau tag candidat confirmé** (proposition : `candidat-app-audit-v1.2-R2`) | le tag `candidat-app-audit-v1.2` → `7dff2c6` n'est jamais déplacé |
| 5 | (si articulation S2) dates S1-S4 fixées dans le GO A | cohérence avec doc 34 §2 |

**Indépendance** : le GO B peut être accordé sans GO A (session dédiée) — le refigeage unique est alors reporté à la première fenêtre autorisée, ou fait l'objet d'un refigeage propre à la session dédiée (au choix du propriétaire dans le GO).

## §3 — Périmètre exact (toute la modification, rien que la modification)

**10 routes mutantes destructives** (liste exacte, chemins re-vérifiés à HEAD, payloads et schémas à créer détaillés dans le doc 35 §2) : `article-imports` (POST multipart métadonnées + DELETE — **le fichier reste sous la chaîne upload dédiée, intouchée**), `references/import`, `research-tabs/[id]` (PUT/DELETE), `thesis/[id]/research-tabs`, `thesis/[id]/doctoral-toolbox`, `veille`, `veille/[id]` (DELETE/PATCH), `veille/[id]/results`, `veille/[id]/check`, `types-analyse/seed`.

**Fichiers :**

| Action | Fichier |
|---|---|
| **Créer** | `src/lib/parse-body.ts` (helper `parseBody(request, schema)` → 400 `{error, details}`) |
| **Modifier** | `src/lib/api-schemas.ts` (ajout des schémas du lot, convention existante) |
| **Modifier** | les 10 fichiers `route.ts` ci-dessus (branchement `parseBody`, suppression des typeof manuels remplacés) |
| **Modifier** | `src/lib/api-schemas.test.ts` (extension des tests) |
| **NE PAS toucher** | chaîne d'upload `article-imports` (fichier : MIME liste blanche + magic bytes + 50 Mo), parsers BibTeX/RIS, `prisma/schema.prisma`, `db/custom.db`, **tout autre fichier** |

**Extraction mécanique à l'entrée du lot (1ʳᵉ heure)** : `grep -nE "request\.json|formData|body\." <route>` ×10 + lecture des modèles Prisma → **figer chaque schéma champ-à-champ avant d'écrire la moindre ligne de code**.

## §4 — Règle d'or (verrouillée)

**« Schémas calqués »** : chaque schéma remplace la garde manuelle existante à l'identique — tout payload valide aujourd'hui doit produire une **réponse identique** (statut + corps) avant/après ; seuls les payloads invalides voient leur réponse durcie (**400 zod** avant tout traitement métier). Aucun changement de contrat observable pour les usages légitimes.

## §5 — Points d'arrêt

1. **Figeage des schémas** (spécification champ-à-champ) consigné **avant** la première écriture de code — écart détecté entre doc 27-B et le code HEAD → ARRÊT + signalement.
2. **Comparaison avant/après** (§6) : toute divergence sur un payload valide → ARRÊT + signalement, aucun ajustement « à la main ».
3. **Mode A (si intégré à S2)** : le lot 1 s'arrête au **PA2** — rapport = diff P1 **et** diff lot 1 + tests du lot ; le « GO S3 » du propriétaire vaut acceptation des deux.
4. **Session dédiée** : rapport de fin de session (diff, tests, critères §6) remis au propriétaire avant tout refigeage.
5. **Tout écart** (test en échec, divergence d'empreinte, écriture involontaire) → ARRÊT immédiat + signalement ; aucune base jamais touchée par ce lot (cf. §7).

## §6 — Critères de réussite

- **10/10 routes** importent zod et passent par `parseBody` (vérification : `grep -lE "from ['\"]zod"` inclut les 10).
- **Tests unitaires des schémas verts** (valide / invalide / limite / clés inconnues, par route — extension `api-schemas.test.ts`).
- **Comparaison avant/après sans écart** sur les 10 routes (payloads valides → réponses identiques), exécutée **sur le harnais de test** (B-strict).
- **TNR complète ~1 670 verts** (cible avec les tests ajoutés) · **lint 0 erreur**.
- **GP ciblés sur les familles du lot** (veille, imports, recherche-tabs, toolbox) rejoués sur le harnais ; la couverture mutative UI réelle reste celle, consignée, des preuves `v4r-*` du candidat `7dff2c6`.
- **Commits dédiés distincts par nature** : A = schéma + migration références (M-4) ; B = cycle d'isolation P1/P2/P3 ; C = lot 1 (`fix(security): AUD-SEC-004 lot 1 — zod sur les 10 routes destructives`) · **un seul refigeage** · nouveau tag (`…-R2`) posé après revalidation commune S4 (si fenêtre commune) · consignation registre 09 (AUD-SEC-004 → « lot 1 traité au cycle audit-final-v1.2 ») + v1.2 + empreinte arbre du nouveau candidat.

## §7 — Procédures de retour arrière

- **La base `db/custom.db` n'est jamais modifiée par le lot 1** — aucun rollback de données n'est donc nécessaire ; les red lines base (zéro écriture de test sur la base réelle) s'appliquent à chaque étape.
- **Code** : abandon des commits de la session (non poussés) ou `git revert` des commits dédiés — **jamais** d'amend/rebase/force sur le candidat figé.
- **Candidat** : `7dff2c6` et son tag restent **intacts quoi qu'il arrive** — en cas d'échec du lot, l'état applicatif de référence demeure le candidat actuel (aucune perte possible).
- Après retour arrière : TNR verte re-constatée sur l'état revenu, rapport au propriétaire, décision de nouvelle tentative reportée à un arbitrage écrit.

## §8 — Ce que le GO B n'autorise PAS

- Le push GitHub (E3 différé — liste doc 38), le BFG/réécriture d'historique, la diffusion externe.
- Toute route hors des 10 listées, toute modification du contrat d'upload, toute migration, toute écriture sur `db/custom.db`.
- Une levée P7 **générale** : la levée est limitée au périmètre §3 (fichiers listés — rien d'autre).
- La clôture de D4/D5 : **D4-accept** impose une réévaluation avant toute diffusion large ; **D5-accept** inscrit le paramétrage des 2 raw SQL GET (`book-skills`, `legal-refs`) au **backlog v1.3** (sous-tâche P3 du registre).
- La mise en production / ouverture aux premiers utilisateurs (interdites avant l'accord écrit final du propriétaire sur les preuves).

## §9 — En l'absence de GO B

Le lot 1 reste **PRÊT MAIS BLOQUÉ** : aucune ligne de code, aucun fichier modifié ; AUD-SEC-004 reste « DÉCISION FORMALISÉE — exécution en attente » au registre ; la fenêtre commune reste exécutable sans lui (P1 seule en S2) ; statu quo conservatoire intégral.

---
*Dossier de préparation — ne constitue ni un GO ni une exécution. Statu quo conservatoire intégral maintenu.*
