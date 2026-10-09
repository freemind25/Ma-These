# Proposition technique — Rattachement des références bibliographiques à chaque thèse

**Cycle proposé : `ref-thesis-scoping`** · **Statut : PROPOSITION — soumise à autorisation distincte du propriétaire. Aucune modification de schéma, migration ou transformation de données exécutée à ce stade.**
Décision produit (propriétaire, IM 2026-10-10) : « les références bibliographiques doivent être rattachées à chaque thèse ». GO final conditionné à la mise en œuvre revalidée ou à une décision de report formelle.

## 0. État actuel vérifié (facts)

- `prisma/schema.prisma` — modèle `Reference` : **aucune colonne `thesisId`, aucune relation** ; index `type`, `year` ; 4 références réelles en DB.
- `GET /api/references` : filtres `type/search/source/favorites` uniquement — **aucun filtre thèse** (fait mesuré, cycle C-2 v1.1).
- **Consommateurs à adapter** (8 points d'usage) : vues `references-page`, `arxiv-search` (sauvegarde vers bibliothèque), `brouillon-chapitre`, `export-pdf` ; API `references/import`, `references/bibtex`, `references/[id]` ; export DOCX (bibliographie interne).
- Comportement actuel : bibliothèque **globale partagée** entre toutes les thèses (constat v1.1 §2-C-2).

## 1. Schéma proposé

```prisma
model Reference {
  // ... champs existants inchangés ...
  thesisId   String?
  thesis     Thesis?  @relation(fields: [thesisId], references: [id], onDelete: Cascade)
  // ...
  @@index([thesisId])
  // @@index([type]), @@index([year]) conservés
}
// Côté Thesis : references Reference[]
```

**Choix documentés :**
| Décision | Proposition | Alternative rejetée et pourquoi |
|---|---|---|
| Nullabilité | `thesisId String?` — nullable de façon permanente | Colonne requise dès le départ : oblige à attribuer toutes les refs en une migration unique et rend le rollback plus rigide. Nullable + invariant applicatif (API exige thesisId à la création) = migration douce, réversible, et gestion explicite des non-attribuables |
| `onDelete` | **Cascade** : supprimer une thèse supprime ses références | `SetNull` : produirait des références orphelines invisibles dans toutes les vues thèse (perte de données illusoire) — incohérent avec le comportement chapitres/documents déjà en cascade |
| Index | `@@index([thesisId])` | Index composite `([thesisId, type])` : over-ingénierie pour le volume visé ; restera mesurable plus tard |
| Unicité `bibtexKey` | reste non contraint au niveau DB (contrôle par thèse à l'export si souhaité) | Contrainte globale unique : casserait l'import multi-thèses de clés identiques |

## 2. Contraintes d'intégrité et règles API

- **Création** (`POST /api/references`, `/import`, `/bibtex`) : `thesisId` **obligatoire** (zod), validé par existence de la thèse (FK check) → 400 si absent/inconnu.
- **Lecture/liste/recherche** (`GET /api/references`) : filtre `thesisId` **obligatoire** → 400 si absent ; la réponse ne contient jamais les références d'une autre thèse.
- **Modification/suppression** (`PUT`/`DELETE /api/references/[id]`) : le client passe le contexte thèse ; si `ref.thesisId ≠ contexte` → **404** (pas de fuite d'existence).
- **Exports** (`bibtex`, DOCX bibliographie, export-pdf) : systématiquement scopés par thèse.
- **Schémas zod** sur toutes les routes du groupe `references` (contribue aussi à réduire AUD-SEC-004 sur ce groupe).
- Aucune fonctionnalité de partage inter-thèses (sauf fonctionnalité explicitement conçue et autorisée plus tard).

## 3. Migration de données sûre et réversible

1. **Pré-requis** : sauvegarde vérifiée (outils C-1 : backup + `integrity_check` + compteurs) **et** export JSON de la table `Reference` (script dédié, réversible).
2. **Répétition générale sur copie** : copie de `db/custom.db` → `db:push` sur la copie → vérification (compteurs identiques, `integrity_check=ok`, 0 violation FK) → **seulement ensuite** push sur la DB réelle.
3. **Attribution des références existantes** (script `scripts/migrate-references-to-thesis.ts`, idempotent) :
   - **Cas univoque** (état actuel : 1 seule thèse) : les 4 références → attribuées à « Urbanisme durable », journal d'attribution consigné.
   - **Cas multi-thèses** (futur) : chaque référence avec `createdAt`/usage non déterminant est listée dans un **rapport d'ambiguïté** ; attribution à la thèse active du moment + journal ; les cas non attribuables automatiquement restent `thesisId=null`.
   - **Non-attribuables** : jamais supprimés — visibles via un filtre dédié « non attribuées » pour résolution manuelle (aucune perte silencieuse).
4. **Rollback** : `restore-db.ts` (procédure C-1 prouvée) — restauration complète ; ou inverse surgical via l'export JSON (mise à null des `thesisId` attribués). Procédure de retour arrière **testée** avant le push réel.
5. **Vérifications post-migration** : compteurs (4 réf attribuées, 0 orphelin), intégrité SQLite, FK check, re-pass UI (vue références, export DOCX GP-7, brouillon-chapitre).

## 4. Tests automatisés d'isolation (nouveaux, vitest)

- Création de 2 thèses A/B ; référence créée dans A → **invisible** via `GET ?thesisId=B` ; visible via A.
- `PUT`/`DELETE` de la réf A avec contexte B → 404 (et la réf A reste intacte).
- `POST` sans `thesisId` → 400 ; avec `thesisId` inconnu → 400.
- `import` + `bibtex` scopés par thèse ; export DOCX : bibliographie de A ne contient pas les refs de B.
- Recherche (`search`) et `favorites` filtrés par thèse.
- Estimation : 12-16 tests ; la suite passe de 1 658 → ~1 670+.

## 5. Risques et mesures

| Risque | Mesure |
|---|---|
| Oubli d'un consommateur (8 points d'usage) | liste fermée §0 + grep de vérification + tests d'isolation croisés |
| `db:push` SQLite (reconstruction de table) | répétition générale sur copie obligatoire avant push réel (§3.2) |
| Références orphelines | nullable + filtre « non attribuées » + vérification post-migration (0 orphelin exigé) |
| Régression UX (vues global→scopé) | re-pass UI réelle type A1 sur les 4 vues consommatrices + GP-3/GP-7 |
| Perturbation des tests existants | adaptation mesurée des tests de routes concernés ; tout écart au comptage documenté |

## 6. Effort et séquencement proposé

- **Effort estimé** : 2 à 3 jours de cycle dédié (schéma+migration 0,5 j · API+zod 0,5-1 j · UI 0,5-1 j · tests 0,5 j · revalidation UI+TNR 0,5 j).
- **Positionnement recommandé** : après la vague 2 du cycle courant (A1/A2/A3) et **avant les builds propriétaire C1/C2** — afin que les builds de distribution portent le schéma final validé.
- **Critères de validation avant « revalidée »** : tests d'isolation verts + TNR global vert (suite étendue) + re-pass UI réel (références, export DOCX, brouillon) + 0 orphelin + preuves consignées (`preuves.md`) + registre et v1.2 mis à jour.

## 7. Décisions attendues du propriétaire (autorisation distincte)

1. GO / non-GO sur la proposition (schéma Cascade, nullable, règles API §2, migration §3).
2. Le cas échéant : fenêtre d'exécution (après vague 2, avant builds C1/C2).
3. À défaut de GO : **décision de report formelle et explicite** (consignée ; le GO final ne pourra alors être sollicité que sur cette base documentée).
