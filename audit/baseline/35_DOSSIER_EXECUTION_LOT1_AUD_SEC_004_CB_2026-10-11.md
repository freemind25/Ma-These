# 35 — DOSSIER D'EXÉCUTION LOT 1 AUD-SEC-004 (D1 = C-B) — PÉRIMÈTRE, FICHIERS, TESTS, CALENDRIER, REFIGEAGE

**Cycle :** audit-final-v1.2 · vague 9 · **Date :** 2026-10-11
**Statut : DOSSIER PRÉSENTÉ POUR ARBITRAGE — AUCUNE EXÉCUTION, AUCUN CODE ÉCRIT.** Répond au point 2 de la 7ᵉ décision propriétaire (2026-10-11) : « D1 : C-B, lot 1 sur les 10 routes destructives, avec revalidation et nouveau candidat ; D4 : D4-accept… ; D5 : D5-accept… Ces orientations ne valent pas encore autorisation d'exécuter le lot 1 ni de modifier le code. Merci de me présenter le périmètre exact, les fichiers et routes concernés, le plan de tests, le calendrier intégré à la fenêtre commune et le plan de refigeage avant de demander le GO spécifique. »
**Fondements :** doc 31 (formulaire §9) · doc 33 (conséquences précises) · doc 27-B (spécification route par route, extraite du code HEAD le 2026-10-11) · doc 23 (constat, motif).

---

## §1 — Formalisation proposée du formulaire §9 du doc 31 (pré-rempli selon votre orientation — à confirmer)

| # | Point | Case correspondant à votre orientation (7ᵉ décision) |
|---|---|---|
| **D1** | AUD-SEC-004 | ☑ **C-B** — lot 1 (10 routes destructives) avant GO (~1 j + revalidation + refigeage) · ☐ C-A · ☐ C-C |
| **D4** | vecteur d'origine locale | ☑ **D4-accept** — résiduel documenté, **réévaluation obligatoire avant toute diffusion large** (condition inscrite au registre) · ☐ D4-contrôle |
| **D5** | 2 raw SQL GET | ☑ **D5-accept** — **paramétrage des 2 routes inscrit au backlog** (sous-tâche P3 registre) · ☐ D5-paramètre |
| **D6** | traçabilité | mise à jour registre 09 + doc 04 + docs 23/31 à ma charge après votre confirmation |

**Mode de formalisation** : votre confirmation écrite expresse (une ligne du type « Je confirme le formulaire §9 tel que pré-rempli dans le doc 35 ») vaudra décision formelle. À réception : registre 09 + doc 04 + doc 31 mis à jour (D6), et le lot 1 reste **bloqué** jusqu'au GO spécifique distinct demandé en §8.

**▶ FORMALISATION EFFECTUÉE le 2026-10-11** : le propriétaire a **confirmé le formulaire §9 tel que pré-rempli** (message écrit : D1 = C-B avec revalidation complète et nouveau candidat · D4 = D4-accept avec réévaluation obligatoire avant toute diffusion large et inscription au registre · D5 = D5-accept avec paramétrage des 2 routes GET reporté au backlog, sous-tâche P3). **D6 exécutée le jour même** : registre 09 (fiche AUD-SEC-004 → « DÉCISION FORMALISÉE »), doc 04 (recommandation actualisée), doc 23 (en-tête), doc 31 (statut + §9). **Le lot 1 RESTE BLOQUÉ** : aucune modification de code, aucune migration, aucune écriture sur `db/custom.db`, aucun push avant la **levée expresse et écrite de la red line P7** (périmètre exact : §3) et un **GO spécifique distinct**. Le candidat `7dff2c6` et son tag existant restent figés et inchangés.

## §2 — Périmètre exact : les 10 routes mutantes destructives (chemins complets re-vérifiés à HEAD le 2026-10-11)

| # | Fichier (existe, vérifié) | Méthodes | Payload actuel (état vérifié doc 27-B.2) | Schéma zod à créer | Gardes à conserver |
|---|---|---|---|---|---|
| 1 | `src/app/api/article-imports/route.ts` | POST (multipart), DELETE | `formData()` — fichier + métadonnées | schéma des **champs métadonnées seulement** — **le fichier reste sous la chaîne upload dédiée** (MIME liste blanche + magic bytes + double contrôle 50 Mo, audité ✅ — **intouchée**) | chaîne upload intacte |
| 2 | `src/app/api/references/import/route.ts` | POST | `formData()` : `content` (BibTeX/RIS/CSL-JSON, trim requis) + `format` | `{ content: z.string().min(1), format: z.enum([...formats]) }` | parsers dédiés inchangés |
| 3 | `src/app/api/research-tabs/[id]/route.ts` | PUT, DELETE | JSON partiel : `title?`, `pinned?`, `notes?`, `links?`, `quotes?` (string|array → stringify) | `updateResearchTabSchema` : champs optionnels, unions string/array, rejet clés inconnues | garde existence → 404 |
| 4 | `src/app/api/thesis/[id]/research-tabs/route.ts` | POST | JSON : `title` requis string non vide, `pinned?`, `notes?`, `links?`, `quotes?`, `todos?` | `createResearchTabSchema` : title requis trim 1-255, optionnels typés | garde existence thèse |
| 5 | `src/app/api/thesis/[id]/doctoral-toolbox/route.ts` | POST, PUT | JSON : `checklist`, `milestones`, `documents`, `contacts` (string|objet/array → stringify), `notes?` | `create/updateDoctoralToolboxSchema` : unions typées, bornes de longueur calibrées à l'entrée du lot | garde 404 |
| 6 | `src/app/api/veille/route.ts` | POST | JSON : `label`/`query` (typeof + trim), `source` (enum) | `createSavedSearchSchema` — **remplace** la validation manuelle | messages 400 équivalents |
| 7 | `src/app/api/veille/[id]/route.ts` | DELETE, PATCH | JSON partiel : `label?` (trim), `autoCheck?` (boolean) | `updateSavedSearchSchema` : label optionnel trim, boolean strict | garde existence |
| 8 | `src/app/api/veille/[id]/results/route.ts` | PATCH | JSON : `all: true` **ou** `ids: string[]` | `updateResultsSchema` : union typée | `updateMany` reste scoppé `savedSearchId` |
| 9 | `src/app/api/veille/[id]/check/route.ts` | POST (indirect) | pas de corps métier (déclenche le worker) | schéma trivial (corps vide accepté) | garde existence côté `run-check.ts` |
| 10 | `src/app/api/types-analyse/seed/route.ts` | POST | JSON (aucune garde actuelle) | `seedTypeAnalyseSchema` — spec champ-à-champ **figée à l'entrée du lot** (lecture `create` + modèle Prisma) | garde d'existence seed créée |

## §3 — Fichiers concernés (toute la modification, rien que la modification)

| Action | Fichier | Contenu |
|---|---|---|
| **Créer** | `src/lib/parse-body.ts` | helper commun `parseBody(request, schema)` → 400 `{error, details: flatten()}` (motif de référence : `references/route.ts` l.55-65) |
| **Modifier** | `src/lib/api-schemas.ts` | ajout des schémas du lot (convention `createXSchema`/`updateXSchema` existante, 23 routes, déjà testée) |
| **Modifier** | les 10 fichiers `route.ts` du tableau §2 | branchement `parseBody` + schéma ; suppression des typeof manuels remplacés |
| **Modifier** | `src/lib/api-schemas.test.ts` | extension des tests des nouveaux schémas |
| **Ne PAS toucher** | chaîne upload `article-imports` (fichier), parsers BibTeX/RIS, `prisma/schema.prisma`, `db/custom.db`, tout autre fichier | aucun changement de contrat, aucune migration |

**Règle d'or (inchangée)** : les schémas sont **calqués sur les gardes manuelles existantes** — remplacement, pas changement de comportement. Payloads valides aujourd'hui → acceptés identiquement après. Payloads malformés → **400** avant tout traitement métier.
**Extraction complémentaire à l'entrée du lot (1ʳᵉ heure, mécanique)** : `grep -nE "request\.json|formData|body\." <route>` ×10 + lecture des modèles Prisma → figer chaque schéma champ-à-champ **avant** écriture du code.

## §4 — Plan de tests (conforme B-strict : aucun test mutatif sur la base réelle)

1. **Tests unitaires des schémas** (motif `api-schemas.test.ts`) : valide / invalide / limite / clés inconnues, par route.
2. **Comparaison avant/après** sur les 10 routes : payloads valides → **réponses identiques** (aucun changement observable), exécutée sur le harnais de test.
3. **TNR complète** : 1 658+ verts (cible ~1 670 avec les tests ajoutés).
4. **Lint** : 0 erreur.
5. **Golden paths ciblés** sur les familles du lot (veille, imports, recherche-tabs, toolbox) — rejoués sur le harnais (règle B-strict) ; la couverture mutative UI réelle reste celle, consignée, des preuves `v4r-*` du candidat `7dff2c6`.
6. **Critère de fin lot 1** : les 10 routes importent zod (`grep -lE "from ['\"]zod"` les inclut toutes) · tests verts · réponses identiques.

## §5 — Calendrier intégré à la fenêtre commune (mode A, B-strict — un seul refigeage, une seule revalidation)

| Session | Contenu révisé (lot 1 intégré) | Durée |
|---|---|---|
| S1 | Gel + sauvegarde + migration M-0→M-7 + PASS *(inchangée)* | 60-90 min |
| **S2 (étendue)** | P1 API isolation **puis lot 1 AUD-SEC-004** (commits dédiés distincts) | 1–2 j |
| S3 | P2 UI + P3 tests Vitest d'isolation *(inchangée)* | 0,5–1 j |
| S4 (commune) | **Une seule revalidation** : TNR ~1 670+ · lint · GP harnais · re-pass UI mono-thèse → consignation → **refigeage unique** | 0,5–1 j |

Le **PA2** (fin de S2) couvrira le diff P1 **et** le diff lot 1 + tests du lot ; votre « GO S3 » en mode A vaudra acceptation des deux. Le lot 1 peut aussi s'exécuter **hors fenêtre** dans une session code dédiée si vous préférez séparer les sujets (au choix dans votre GO).

## §6 — Plan de refigeage (aucun amend/rebase, tags jamais déplacés)

1. **Commits dédiés distincts par nature** (traçabilité maximale) :
   - commit A : schéma + migration références (M-4, doc 21 étape 10) ;
   - commit(s) B : cycle d'isolation P1/P2/P3 ;
   - commit C : lot 1 AUD-SEC-004 (`fix(security): AUD-SEC-004 lot 1 — zod sur les 10 routes destructives`).
2. **Revalidation commune S4** sur l'ensemble (TNR, lint, GP, re-pass UI B-strict).
3. **Nouveau tag candidat** : nom proposé **`candidat-app-audit-v1.2-R2`** (le tag `candidat-app-audit-v1.2` → `7dff2c6` n'est **jamais** déplacé ; procédure D3 doc 23). Nom à confirmer dans votre GO.
4. **Consignation** : registre 09 (AUD-SEC-004 → « lot 1 traité au cycle audit-final-v1.2 ») + v1.2 + rapport de fenêtre + empreinte arbre du nouveau candidat consignée.

## §7 — Ce que le GO spécifique devra couvrir (demande qui vous sera soumise après votre confirmation §1)

- [ ] Confirmation écrite de la formalisation §9 (D1=C-B, D4-accept, D5-accept)
- [ ] **Levée expresse de la red line P7** pour le périmètre exact du §3 (fichiers listés — rien d'autre)
- [ ] Articulation : lot 1 **dans S2 de la fenêtre commune** (recommandé — un seul refigeage) **ou** session code dédiée hors fenêtre
- [ ] Nom du nouveau tag candidat (proposition : `candidat-app-audit-v1.2-R2`)
- [ ] Dates S1-S4 (dossier final doc 34 §2)

## §8 — Statu quo conservatoire

En l'absence de confirmation §1 ou de GO spécifique : **aucune exécution, aucun code écrit** — AUD-SEC-004 reste « orientation propriétaire reçue, formalisation en attente » au registre ; le lot 1 reste prêt (spécification route par route, doc 27-B) ; la fenêtre commune reste en préparation (doc 34).

---
*Sources : doc 27-B (spécification extraite du code HEAD, vérifiée ligne-à-ligne) · doc 23 (motif, critère de fin) · doc 31 §6/§9 · doc 33 (conséquences) · doc 34 (dossier de démarrage). Vérification de l'existence des 10 fichiers à HEAD effectuée le 2026-10-11 — aucune modification.*
