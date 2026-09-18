# Preuves — veille-academique

## Groupe A — Schéma (T1)

### 1. Dump AVANT — comptes de toutes les tables (bun + `$queryRawUnsafe` sur `sqlite_master`, script temporaire supprimé après usage)

```
AgileSprint: 0
AgileStory: 0
Chapter: 7
ChapterVersion: 0
CustomBookSkill: 58
DoctoralToolbox: 0
DocumentChunk: 1
ElementAnalyse: 1
Experiment: 1
ExperimentRun: 1
Job: 0
LicenseKey: 0
NotebookEntry: 1
Part: 0
Reference: 4
ResearchSource: 0
ResearchTab: 0
SessionVerification: 2
Thesis: 1
ThesisCadrage: 0
ThesisCadrageField: 0
ThesisCadrageVersion: 0
TypeAnalyseMethodologique: 1
```

23 tables — données réelles présentes (Thesis 1, Chapter 7, Reference 4, CustomBookSkill 58…).

### 2. Modification du schéma

`prisma/schema.prisma` : append après `model Job` (fin de fichier, l.466-508) — modèles `SavedSearch` et `SavedSearchResult`, **purement additifs** (aucune ligne des modèles existants modifiée — `git diff prisma/schema.prisma` n'affecte que des lignes ajoutées).

### 3. `bun run db:push` (alias `prisma db push --accept-data-loss`, package.json l.12)

```
$ prisma db push --accept-data-loss
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": SQLite database "custom.db" at "file:/home/z/my-project/db/custom.db"

🚀  Your database is now in sync with your Prisma schema. Done in 16ms

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 202ms
```

### 4. Dump APRÈS — 25 tables, tous les comptes existants identiques

```
AgileSprint: 0        | AgileStory: 0          | Chapter: 7
ChapterVersion: 0     | CustomBookSkill: 58    | DoctoralToolbox: 0
DocumentChunk: 1      | ElementAnalyse: 1      | Experiment: 1
ExperimentRun: 1      | Job: 0                 | LicenseKey: 0
NotebookEntry: 1      | Part: 0                | Reference: 4
ResearchSource: 0     | ResearchTab: 0         | SavedSearch: 0
SavedSearchResult: 0  | SessionVerification: 2 | Thesis: 1
ThesisCadrage: 0      | ThesisCadrageField: 0  | ThesisCadrageVersion: 0
TypeAnalyseMethodologique: 1
```

**Zéro perte de ligne** : les 23 comptes d'avant sont strictement identiques après push. Deux tables nouvelles à 0 (`SavedSearch`, `SavedSearchResult`).

### 5. Vérification des index réellement créés (`sqlite_master`)

```json
[
 { "name": "SavedSearchResult_savedSearchId_idx",
   "sql": "CREATE INDEX \"SavedSearchResult_savedSearchId_idx\" ON \"SavedSearchResult\"(\"savedSearchId\")" },
 { "name": "SavedSearchResult_savedSearchId_externalId_key",
   "sql": "CREATE UNIQUE INDEX \"SavedSearchResult_savedSearchId_externalId_key\" ON \"SavedSearchResult\"(\"savedSearchId\", \"externalId\")" }
]
```

L'unicité `@@unique([savedSearchId, externalId])` (CA-2.2, déduplication) est bien un index unique en base.

### 6. Smoke test CRUD (create → doublon → cascade delete), base rendue propre ensuite

```
crud: create ok, duplicate externalId → DUP-REFUSE (P2002)
cascade delete → résultats restants: 0
total SavedSearch: 0 | total SavedSearchResult: 0
```

- Création veille + résultat : OK.
- Doublon `externalId` même veille : refusé par Prisma (`P2002` = violation d'unicité).
- Suppression de la veille : cascade effective (0 résultat restant).
- État final : 0 / 0 — le smoke test ne laisse aucun résidu.
