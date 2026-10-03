# Preuves — Pack Soutenance

Toutes les commandes listées ont été réellement exécutées dans /home/z/my-project.
Horodatage local (TZ='Etc/GMT-1') collé à côté de chaque bloc.

## Groupe A — Schéma (T1)

16:36 — État initial de la base (avant toute modification) : diff entre base et datamodel = vide

```
$ bunx prisma migrate diff --from-url "file:./db/custom.db" --to-schema-datamodel prisma/schema.prisma --script
-- This is an empty migration.
```

16:37 — Comptage des lignes AVANT `db:push` (script bun temporaire `.tmp-count-rows.ts`, supprimé après usage)

```
$ bun .tmp-count-rows.ts
COUNTS_BEFORE {"thesis":1,"chapter":7,"reference":4,"doctoralToolbox":0}
```

16:37 — Diff migration APRÈS ajout du modèle `SoutenancePrep` : seule table ajoutée, 0 colonne modifiée sur les tables existantes

```
$ bunx prisma migrate diff --from-url "file:./db/custom.db" --to-schema-datamodel prisma/schema.prisma --script
-- CreateTable
CREATE TABLE "SoutenancePrep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thesisId" TEXT NOT NULL,
    "slides" TEXT NOT NULL DEFAULT '[]',
    "speech" TEXT NOT NULL DEFAULT '',
    "speechDurationMin" INTEGER NOT NULL DEFAULT 15,
    "questions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SoutenancePrep_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SoutenancePrep_thesisId_key" ON "SoutenancePrep"("thesisId");

-- CreateIndex
CREATE INDEX "SoutenancePrep_thesisId_idx" ON "SoutenancePrep"("thesisId");
```

16:38 — `db:push` + comptage des lignes APRÈS : survie des données prouvée (identiques)

```
$ bun run db:push
Datasource "db": SQLite database "custom.db" at "file:/home/z/my-project/db/custom.db"

🚀  Your database is now in sync with your Prisma schema. Done in 17ms

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client (v6.19.2) to ./node_modules/@prisma/client in 202ms

$ bun .tmp-count-rows.ts
COUNTS_AFTER {"thesis":1,"chapter":7,"reference":4,"doctoralToolbox":0}
```

16:38 — Lignes rouges avant commit T1 (sortie vide exigée)

```
$ git diff HEAD --stat -- src/components/layout/app-sidebar.tsx src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts
(vide)
```

## Groupe B — T2 (route de persistance)

16:41 — Incident transitoire : le client Prisma en mémoire du serveur de développement (démarré à 15:00, avant `db:push`) ne connaissait pas `soutenancePrep`. Résolution sans redémarrage manuel : `touch next.config.ts` — Next.js dev relui-même sa configuration (comportement natif « Restarting the server to apply the changes »), le nouveau client généré par `db:push` est chargé. Preuve dans dev.log :

```
✓ Starting...
✓ Ready in 1257ms
```

16:43 — Enchaînement curl complet sur http://localhost:3000 (TID = cmsmyrdfs0000pa2sews4vo90, unique thèse existante)

```
=== GET 1 (attendu null) ===
{"data":null}
HTTP 200

=== PUT upsert (7 points -> 6 normalisés) ===
{"data":{"id":"cmur4takj0001px4jeu8wtjfp","thesisId":"cmsmyrdfs0000pa2sews4vo90","slides":[{"title":"Titre et contexte","points":["Point 1","Point 2","Point 3","Point 4","Point 5","Point 6"]},{"title":"Problématique","points":["Question de recherche"]}],"speech":"Discours de test pour la preuve.","speechDurationMin":15,"questions":[],"createdAt":"2026-10-02T15:42:32.132Z","updatedAt":"2026-10-02T15:42:32.132Z"}}
HTTP 200

=== GET 2 (persistant) ===
{"data":{"id":"cmur4takj0001px4jeu8wtjfp",... "slides":[{"title":"Titre et contexte","points":["Point 1","Point 2","Point 3","Point 4","Point 5","Point 6"]},...],"speech":"Discours de test pour la preuve.","speechDurationMin":15,"questions":[],...}}
HTTP 200

=== PUT 400 (durée invalide) ===
{"error":"Données invalides","details":{"formErrors":[],"fieldErrors":{"speechDurationMin":["Invalid input"]}}}
HTTP 400

=== PUT 404 (thèse inconnue) ===
{"error":"Thèse non trouvée"}
HTTP 404
```

Note : le 7e point envoyé (« Point 7 excédentaire ») est tronqué par la normalisation serveur (cap 6), le reste est persisté tel quel.

16:44 — Lignes rouges avant commit T2 : vide (`git diff HEAD --stat -- <3 fichiers>` sans sortie).

## Groupe B — T3 (route de génération IA)

16:47 — Validation d'entrée

```
=== POST 400 zod (type invalide) ===
{"error":"Données invalides","details":{"formErrors":[],"fieldErrors":{"type":["Invalid option: expected one of \"slides\"|\"speech\"|\"questions\""]}}}
HTTP 400

=== POST 404 (thèse inconnue) ===
{"error":"Thèse non trouvée"}
HTTP 404
```

16:48 — Génération réelle des slides (fournisseur par défaut du sandbox, sans config navigateur) : HTTP 200 en 7,5 s, JSON extrait + normalisé + persisté. Extrait de la réponse :

```
{"data":{"id":"cmur4takj0001px4jeu8wtjfp","thesisId":"cmsmyrdfs0000pa2sews4vo90","slides":[{"title":"Titre et auteur","points":["Thèse : Urbanisme durable","Auteur : Marie Dupont","[à compléter : contexte institutionnel]"]},{"title":"Contexte et enjeux","points":[...]},...
```

16:48 — Log serveur de comptage du contexte (plafond prouvé) :

```
[POST /api/soutenance/generate] Contexte thèse : 540 caractères (plafond 40000, chapitres inclus : 7/7, champs de cadrage : 0)
```

16:49 — Génération réelle des questions : HTTP 200 ; lecture du record persistant :

```
questions familles: [{"family":"Fond théorique","n":2},{"family":"Méthodologie","n":2},{"family":"Résultats","n":2},{"family":"Limites et perspectives","n":2},{"family":"Ouverture","n":2}]
total questions: 10
slides: 10
```

16:51 — Génération réelle du discours (durationMin 10) : HTTP 200 en 33 s ; `speech length: 9418` (~1 500 mots), `durationMin: 10`, progression intertitres `[Salutations et remerciements d'ouverture]` etc.

16:53 — Nettoyage après preuve : suppression de la ligne de test (`deleteMany` → `DELETED soutenancePrep: 1`) pour recetter les états vides dans le navigateur.

16:53 — Lignes rouges avant commit T3 : vide.

## Groupe C — T4 (navigation)

16:57 — `bun run test:run` complet après ajout du ViewId et de l'entrée de navigation : suite inchangée et verte (unicité des ids vérifiée par app-store.test.ts).

```
 Test Files  63 passed (63)
      Tests  1452 passed (1452)
```

Entrée ajoutée à NAVIGATION_ITEMS (catégorie méthodologie, badge IA, icône ClipboardCheck — présent dans ICON_MAP de la sidebar, qui reste inchangée) :

```
{
  id: "soutenance",
  label: "Soutenance",
  icon: "ClipboardCheck",
  description: "Préparation de la soutenance : slides, discours, questions du jury",
  badge: "IA",
  category: "methodologie",
},
```

16:58 — Lignes rouges avant commit T4 : vide.

## Groupe C — T6 (guide intégré)

17:02 — Entrée « Soutenance » ajoutée dans la catégorie « Méthodologie & Vérification » du guide intégré (usage-guide-dialog.tsx), format {id, title, icon, keywords[], content}, icône ClipboardCheck déjà importée. Lint : 0 erreur ; page d'accueil compile (GET / → 200).

## Groupe D — T7 (tests)

17:00 — Première exécution : 1 échec dans un test mal écrit (assertion sur la réponse mockée au lieu de l'argument d'upsert) — corrigé, puis suite complète :

```
$ bun run test:run
 Test Files  65 passed (65)
      Tests  1471 passed (1471)
   Start at  15:58:05
   Duration  15.80s
```

(63 fichiers / 1 452 tests avant le cycle ; +2 fichiers, +19 tests = 65 / 1 471, tous verts.)

Couverture ajoutée :
- route.test.ts (persistance) : GET null, GET record désérialisé, GET 500 ; PUT upsert normalisé (7 points -> 6), upsert partiel, cap 13 -> 12 slides, 404 thèse inconnue, 400 zod flatten (duration 17), 400 slide sans titre, 500 db.
- generate/route.test.ts (génération) : 400 type inconnu, 400 thesisId manquant, 404 thèse inconnue, 502 JSON IA non structuré (slides), 502 (questions), succès slides depuis bloc ```json avec normalisation (13 -> 12 slides, 8 -> 6 points), succès discours avec durée persistée, 500 generateCompletion en échec, cap 15 -> 12 questions toutes familles (generateCompletion et db mockés — aucun appel IA réel dans les tests).

## Groupe E — T8 (notice d'utilisation)

17:04 — docs/NOTICE-UTILISATION.md : nouvelle sous-section « 7.10 Soutenance — préparation de la soutenance orale » (dans la section 7 « Méthodologie et vérification », cohérente avec la catégorie de navigation du module) : 3 onglets, libellés exacts des boutons (« Générer les slides », « Copier le plan », « Durée cible », « Générer le discours », « Générer 10 questions », « Relancer la génération ? »…), flux pas-à-pas en 5 étapes, persistance par thèse. Mise à jour de la sous-section 10.1 (liste des données persistées en base) : ajout de « préparation de soutenance (slides, discours, questions du jury) ». La table des matières ne liste que les 13 sections de niveau 1 — inchangée. Compteurs globaux (README/AGENTS/NOTE-PRESENTATION) : hors périmètre de ce cycle, gérés par l'orchestrateur.

## Recette propriétaire (déléguée — « faites pour le mieux ») — 2026-10-03 16:54

Environnement : serveur dev port 3000 (HTTP 200), thèse active « Urbanisme durable » (cmsmyrdfs0000pa2sews4vo90, 7 chapitres).

- Ouverture module (navigateur) : « Thèse : Urbanisme durable » affiché, 3 onglets Slides/Discours/Questions du jury présents. Capture `test-snapshots/recette-soutenance-0-accueil.png`.
- Génération slides : 1er appel → **502 « Réponse IA non structurée, relancez la génération »** (variance ponctuelle du modèle, comportement par design) ; 3 appels consécutifs ensuite → **HTTP 200 ×3**, upsert sur le même enregistrement (`cmusjlqfd0001muv02x4ygiyk`). Contexte thèse journalisé : « 1709 caractères (plafond 40000, chapitres inclus : 7/7, champs de cadrage : 0) ».
- Persistance : rechargement complet de la page + retour sur le module → plan de slides **restauré** (« Régénérer les slides » + « Copier le plan »). Capture `test-snapshots/recette-soutenance-1-slides-restaures.png`.
- Génération discours (durée 15 min) : HTTP 200, texte oral structuré (« [Salutations et remerciements d'ouverture]… »), boutons Régénérer/Copier présents.
- Génération questions : HTTP 200, « 10 questions regroupées par famille (fond théorique, méthodologie, résultats, limites et perspectives, ouverture) » avec « Angle de réponse » par question. Capture `test-snapshots/recette-soutenance-2-questions.png`.
- Enregistrement API (GET /api/thesis/[id]/soutenance) : `slides : 11` éléments, `speech : 10609` caractères, `questions : 10` éléments, `speechDurationMin : 15`.
- Erreurs console : 0 sur tout le parcours.

Verdict de recette : **ACCEPTÉ** (12/12 critères d'acceptation confirmés en conditions réelles).
