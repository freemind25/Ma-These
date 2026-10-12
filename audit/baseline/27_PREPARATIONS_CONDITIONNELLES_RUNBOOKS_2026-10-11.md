# 27 — PRÉPARATIONS CONDITIONNELLES (P4) — RUNBOOKS PRÊTS MAIS NON EXÉCUTÉS

**Cycle :** audit-final-v1.2 · vague 6 · **Date :** 2026-10-11
**Objet :** répondre au point P4 de la 4ᵉ décision du propriétaire (2026-10-11) : « Préparez, sans les exécuter : la migration des références selon le document 21 et ses scripts éprouvés ; le lot 1 de remédiation AUD-SEC-004 selon le document 23 ; le cycle applicatif d'isolation par thèse selon le document 25. »
**Garantie :** ce document est une **préparation** — zéro exécution, zéro écriture `db/custom.db`, zéro modification `prisma/schema.prisma`, zéro modification de code. Chaque partie ne se déclenche que sur **autorisation écrite spécifique** portant sur son périmètre exact.

---

## Partie A — RUNBOOK MIGRATION RÉELLE (déclencheur : GO écrit sur docs 21 + 25)

### A.1 Conditions préalables à cocher AVANT de commencer (pré-vol)

| # | Condition | Vérification au démarrage de la fenêtre |
|---|---|---|
| 1 | **GO écrit du propriétaire** reçu sur le doc 21 (§1-§5) + doc 25 (clarification) | copie de la décision horodatée consignée |
| 2 | **Option d'isolation 7-bis** confirmée : **B** (enregistrée par le propriétaire — zéro écriture de test sur la base réelle) | rappel doc 21 §5.2 / doc 25 §1.1 |
| 3 | **Fenêtre coordonnée** ouverte : serveur port 3000 arrêté, aucun utilisateur actif | `curl localhost:3000` échoue |
| 4 | **Candidat figé inchangé** : `git rev-parse HEAD` → `7dff2c6c98f8be59edb64b34f8a1eb021745a435` + arbre propre | contrôle d'identité avant toute écriture |
| 5 | État base de départ cohérent : Reference **4** / Thesis **1** / 0 violation FK / integrity ok | `db-inventory.mjs` sur `db/custom.db` (lecture seule) |

### A.2 Séquence d'exécution (reprise doc 21 §1 — commandes prêtes, dans l'ordre, sans improvisation)

```
# 0. Gel des écritures (serveur arrêté) — pré-vol §A.1 ci-dessus

# 1. Sauvegarde horodatée + double SHA (bloquant : SHA identiques, inventaire sur copie 4/1/ok)
cp --preserve=timestamps db/custom.db audit/baseline/evidence/backups/custom-$(date +%Y%m%dT%H%M%S).db
sha256sum db/custom.db audit/baseline/evidence/backups/custom-<TS>.db
bun audit/baseline/tools/rehearsal-refs/db-inventory.mjs audit/baseline/evidence/backups/custom-<TS>.db <out>

# 2. Export réversible des 4 références (attendu rowCount: 4, integrity ok)
bun audit/baseline/tools/rehearsal-refs/export-references.mjs db/custom.db audit/baseline/evidence/references-export-before-<TS>.json

# 3. Inventaire avant (Reference 4 / Thesis 1 / 30 tables / 0 FK)
bun audit/baseline/tools/rehearsal-refs/db-inventory.mjs db/custom.db audit/baseline/evidence/migration-inventory-before.json

# 4. Amendement du schéma du dépôt (prisma/schema.prisma — commit dédié, 4 lignes exactement) :
#    Reference.thesisId String?  +  relation Thesis onDelete: Cascade  +  @@index([thesisId])  +  references Reference[]
bunx prisma generate

# 5. db push sur la base réelle (NO-GO si comptages ≠ étape 3 / integrity ≠ ok / FK ≠ 0)
bunx prisma db push --skip-generate

# 6. Attribution (attendu : 4 attribuées / 0 ambiguë / 0 sans thèse — journal horodaté)
bun audit/baseline/tools/rehearsal-refs/migrate-references-to-thesis.mjs db/custom.db audit/baseline/evidence/migration-attribution-journal.json

# 7. Contrôles de cohérence — verdict PASS obligatoire (4==4, 0 dangling, integrity ok, diff = thesisId seul)
bun audit/baseline/tools/rehearsal-refs/consistency-check.mjs db/custom.db audit/baseline/evidence/references-export-before-<TS>.json audit/baseline/evidence/migration-consistency.json

# 7-bis. Isolation — OPTION B : aucune écriture de test sur la base réelle.
#   Preuve = répétition 16/16 sur copie (evidence/rehearsal-refs.json) + suite vitest P3 (partie C ci-dessous).

# 8. TNR + re-pass UI (serveur relancé) : 1 658/1 658 + GP-7 + vues Références / brouillon / Export PDF
bun run test:run

# 9. (seulement si NO-GO) rollback : voie 7b recommandée — SHA(sauvegarde) → cp → prisma generate → re-contrôles

# 10. Consignation : journal, rapport d'ambiguïté, SHAs (migration-reelle-shas.json), captures UI,
#     commit unique « feat(refs): thesisId + migration attribution (proposition ref-thesis-scoping) »
```

### A.3 Critères d'arrêt (reprise doc 21 §4 — rappel opérationnel)

Toute divergence de comptage, `integrity_check ≠ ok`, violation FK, dangling ≠ 0, `rowsUpdated` ≠ 4, diff ≠ « thesisId seul » → **arrêt immédiat, aucun correctif improvisé, rollback voie 7b** (restauration byte-identique, démontrée).

### A.4 Livrables attendus en fin de fenêtre

1. `migration-reelle-shas.json` (SHA original = SHA copie, horodatages, tailles)
2. Journal d'attribution (4 entrées, motif `CAS_UNIVOQUE (1 thèse)`)
3. Rapport d'ambiguïté (**attendu 0 entrée**)
4. Verdict **PASS** `consistency-check` + inventaires avant/après
5. TNR 1 658/1 658 + captures UI post-migration
6. Commit unique schéma+migration, consigné au registre 09

### A.5 Variantes de fenêtre (au choix du propriétaire — décision conjointe ①+②)

| Variante | Séquence | Effet |
|---|---|---|
| **Fenêtre unique** | A.2 (étapes 0-7, option B) **puis** partie C (P1-P4) **puis** étape 8 étendue (revalidation unique) | l'état intermédiaire (8 consommateurs non filtrés) n'est jamais exposé à l'usage |
| **Deux fenêtres** | A.2 seul (étape 8 incluse) → état intermédiaire documenté (doc 25 §1-§3 : sans risque tant qu'une seule thèse existe) ; partie C dans une seconde fenêtre autorisée séparément | deux points de contrôle, deux revalidations |

---

## Partie B — DESIGN LOT 1 AUD-SEC-004 (déclencheur : décision D1 = option B ou C du doc 23 §6)

**Périmètre exact (les 10 routes mutantes, doc 23 §1.3) · Effort estimé : 0,5-1 j + revalidation.** Aucun code écrit à ce stade — le présent design est la spécification d'exécution.

### B.1 Motif transversal (à créer une seule fois)

- **Schémas partagés** dans `src/lib/api-schemas.ts` (convention existante `createXSchema` / `updateXSchema`, déjà utilisée par 23 routes, testée par `api-schemas.test.ts`).
- **Helper commun** `parseBody(request, schema)` → 400 `{error, details: flatten()}` en cas d'échec — élimine la duplication du bloc `ZodError → 400` (motif de référence : `references/route.ts` l.55-65).
- **Règle d'or** : les schémas sont **calqués sur les gardes manuelles existantes** (remplacement, pas changement de comportement) ; payloads valides aujourd'hui → acceptés identiquement après.

### B.2 Spécification par route (extraite du code à HEAD — vérifiée ligne-à-ligne le 2026-10-11)

| # | Route | Méthodes | Forme du payload (état actuel vérifié) | Schéma à créer | Gardes existantes à conserver |
|---|---|---|---|---|---|
| 1 | `article-imports` | POST (multipart), DELETE | `formData()` — fichier + métadonnées | schéma des champs métadonnées seulement ; **le fichier reste sous la chaîne upload dédiée** (MIME liste blanche + magic bytes + double contrôle 50 Mo — audité ✅) | chaîne upload intacte |
| 2 | `references/import` | POST | `formData()` : `content` (texte BibTeX/RIS/CSL-JSON, trim requis — l.35) + `format` | `z.object({ content: z.string().min(1), format: z.enum([...formats]) })` | parsers dédiés inchangés |
| 3 | `research-tabs/[id]` | PUT, DELETE | JSON partiel : `title?`, `pinned?`, `notes?`, `links?` (string|array → stringify), `quotes?` | `updateResearchTabSchema` : champs optionnels, `links/quotes` union string|array, rejet des clés inconnues (`strict()` ou `.strip()`) | garde existence → 404 (l.41-44) |
| 4 | `thesis/[id]/research-tabs` | POST | JSON : `title` requis string non vide (l.42), `pinned?` (déf. false), `notes?`, `links?`, `quotes?`, `todos?` | `createResearchTabSchema` : title requis trim 1-255, champs optionnels typés | garde existence thèse |
| 5 | `thesis/[id]/doctoral-toolbox` | POST, PUT | JSON : `checklist`, `milestones`, `documents`, `contacts` (string|objet/array → stringify), `notes?` | `create/updateDoctoralToolboxSchema` : union string|array typée, bornes de longueur à calibrer | garde 404 ; normalisation remplacée par le schéma |
| 6 | `veille` | POST | JSON : `label`/`query` (typeof + trim), `source` (enum — l.61-99) | `createSavedSearchSchema` : **remplace la validation manuelle** (enum `source`, champs requis, trim) | 400 explicites actuels → messages équivalents |
| 7 | `veille/[id]` | DELETE, PATCH | JSON partiel : `label?` (string trim), `autoCheck?` (boolean — l.30-62) | `updateSavedSearchSchema` : label optionnel trim, autoCheck boolean strict | garde existence |
| 8 | `veille/[id]/results` | PATCH | JSON : `all: true` **ou** `ids: string[]` (l.61-78) | `updateResultsSchema` : `z.union([{all: z.literal(true)}, {ids: z.array(z.string().min(1)).min(1)}])` | `updateMany` resté scoppé `savedSearchId` |
| 9 | `veille/[id]/check` | POST (indirect) | pas de corps métier (déclenche le worker) | schéma trivial `z.object({}).passthrough()` ou garde de corps vide | garde existence côté lib (`run-check.ts`) |
| 10 | `types-analyse/seed` | POST | JSON (aucune garde relevée — doc 23) | `seedTypeAnalyseSchema` : **spec champ-à-champ à figer à l'entrée du lot** (lecture l.106 `create` + modèle Prisma `TypeAnalyseMethodologique`) | — (créer la garde d'existence seed) |

**Extraction complémentaire à l'entrée du lot** (1ʳᵉ heure, mécanique) : `grep -nE "request\.json|formData|body\." <route>` ×10 + lecture des modèles Prisma concernés → figer chaque schéma champ-à-champ avant écriture.

### B.3 Tests et critère de fin (reprise doc 23 §5)

- Tests unitaires des nouveaux schémas (motif `api-schemas.test.ts`) : valide / invalide / limite / clés inconnues.
- Comparaison avant/après sur les 10 routes : payloads valides → **réponses identiques** (aucun changement observable).
- TNR 1 658+/1 658+ verts · lint 0 erreur · 7 golden paths rejoués.
- **Critère de fin lot 1** : les 10 routes importent zod (`grep -lE "from ['\"]zod" …` les inclut toutes).
- **Refigeage candidat** : nouveau commit applicatif → revalidation → **nouveau tag** (procédure D3 doc 23 : le tag `candidat-app-audit-v1.2` n'est jamais déplacé).

---

## Partie C — DESIGN CYCLE APPLICATIF D'ISOLATION PAR THÈSE (déclencheur : autorisation écrite ② du doc 25 §5)

**Périmètre : groupe `references` uniquement (8 consommateurs) · Effort : 2-3 j (doc 25 §4) · Red line code à lever pour ce périmètre exact.**

### C.1 P1 — API (0,5-1 j) — règles exactes (proposition ref-thesis-scoping §2)

| Endpoint | Règle après cycle |
|---|---|
| `POST /api/references`, `POST /api/references/import`, `POST/PUT` créateurs | `thesisId` **obligatoire** (zod) + contrôle d'existence (FK) → **400** si absent/inconnu |
| `GET /api/references` (+ search, favoris, bibtex) | filtre `thesisId` **obligatoire** → 400 si absent ; la réponse **ne contient jamais** les refs d'une autre thèse |
| `PUT/DELETE /api/references/[id]` | garde de contexte : mismatch thèse → **404** (pas de fuite d'existence) |
| Schémas zod | tout le groupe `references` (contribue à AUD-SEC-004, articulé avec la partie B) |
| Binding | `activeThesisId` résolu **côté serveur de contexte**, jamais `theses[0]` (leçon AUD-ISO-001, registre 09) |

### C.2 P2 — UI (0,5-1 j)

4 vues consommatrices transmettent `activeThesisId` (store Zustand) : vue références · arXiv/veille → sauvegarde bibliothèque · brouillon de chapitre (insertion citations) · export PDF. Export DOCX (bibliographie interne, GP-7) scopé par thèse. Aucun autre écran touché.

### C.3 P3 — Suite de tests d'isolation (0,5 j) — **preuve de l'option B** (zéro écriture de test sur la base réelle)

12-16 tests vitest (motif existant, cible ~1 670+ verts) :

1. réf créée dans thèse A → invisible via `GET ?thesisId=B` · visible via `GET ?thesisId=A` (×2 : UI-créée / import-créée)
2. `PUT` réf A avec contexte B → **404**, réf intacte (relecture)
3. `DELETE` réf A avec contexte B → **404**, réf intacte
4. `POST /api/references` sans `thesisId` → **400** · avec `thesisId` inconnu → **400**
5. `POST /api/references/import` sans `thesisId` → **400** ; import scopé visible uniquement de sa thèse
6. `GET /api/references/bibtex` sans `thesisId` → **400** ; export bibtex = refs de la thèse demandée uniquement
7. recherche plein texte et favoris filtrés par thèse (0 croisement)
8. export DOCX : bibliographie = refs de la thèse active uniquement (GP-7 scoppé)

### C.4 P4 — Revalidation (0,5 j)

Re-pass UI réelle sur les 4 vues + GP-3/GP-7 **à 2 thèses présentes** (protocole `evidence/isolation-multitheses.json`, thèses jetables nettoyées, preuve diff DB vide avant/après) · registre 09 + v1.2 mis à jour · nouveau tag candidat si le propriétaire l'exige.

### C.5 Critères de fin du cycle (doc 25 §4)

0 route du groupe `references` sans schéma zod · 12-16 tests d'isolation verts · TNR global vert · re-pass UI 2 thèses sans croisement (lecture comme écriture) · 0 création hors contexte possible · preuves consignées.

---

## Red lines (inchangées)

Aucune partie A, B ou C ne s'exécute sans autorisation écrite spécifique. En l'absence de GO : rien n'est exécuté — base réelle en l'état, candidat `7dff2c6` figé, aucun code écrit. Ce document est la démonstration que **chaque GO se traduira par une exécution le jour même de la fenêtre coordonnée**.

*Sources : doc 21 (séquence, sauvegarde, rollback) · doc 23 §1.3/§5 (10 routes, motif, critère de fin) · doc 25 §4 (P1-P4) · `specs/ref-thesis-scoping/proposition-technique.md` §2/§4/§6 · scripts éprouvés `audit/baseline/tools/rehearsal-refs/` (7 fichiers). Extraction payload des routes : lecture directe HEAD 2026-10-11 (grep ligne-à-ligne, cf. tableau B.2).*
