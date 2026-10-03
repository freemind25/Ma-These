# Preuves — Compétences livres vivantes

Toutes les heures sont en `TZ='Etc/GMT-1'`.

## 0. Cadre du cycle

- **Délégation propriétaire** (IM, session du jour) : « vous êtes le spécialiste, faites pour le mieux et comme j'ai un problème de connexion, veuillez terminez toutes les actions avant de revenir pour moi pour avis ». Conséquence : les points d'arrêt Étapes 2/3/5 (validation spec, plan, recettes de groupe) sont traités sous délégation, choix conservateurs consignés dans `spec.md` § « Zones floues », révisables au retour du propriétaire.
- **Précédents appliqués** : `veille-academique` (choix conservateurs dérivés du texte de spec), `recette-3-cycles` (recette déléguée consignée).
- 17:27 — Analyse skills.sh/find-skills livrée au propriétaire ; comparaison architecturale (CustomBookSkill jamais injecté dans l'IA — preuve : grep `customBookSkill|CustomBookSkill` sur `src` = 2 routes API + page UI uniquement).
- 17:57 — Cycle ouvert. `git log --oneline -6` : tête `bc33dc3`, arbre propre (`git status --short` vide).
- 17:59 — Comptes avant modification : `CustomBookSkill: 58` lignes (prisma count). Lignes rouges : `git diff HEAD --stat -- src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts src/components/layout/app-sidebar.tsx` → **0 diff**.
- Artefacts spec/plan/tasks + preuves initiales committés avant toute modification de code (une tâche = un commit).

## Groupe A — Schéma

**Fichiers modifiés : `prisma/schema.prisma` (+3 lignes). Tâche : T1.**

- 18:00 — Diff avant/après : `git diff --stat prisma/schema.prisma` → « 1 file changed, 3 insertions(+) » (champs `description`, `source`, `enabled @default(false)` — additifs purs, aucune colonne retirée).
- 18:00 — `bun run db:push` → « ✔ Generated Prisma Client (v6.19.2) » (sync réussie, aucune perte signalée).
- 18:00 — Survie des données (Article 6) :
  - avant : `CustomBookSkill: 58` ;
  - après : `APRÈS total: 58 | enabled=false: 58` ; échantillon : `{"title":"The Complete Book of Grant Writing","description":null,"source":null,"enabled":false}` — les lignes existantes passent toutes à `enabled=false` (opt-in strict, CA-2.1 fondamental).
- Lignes rouges avant commit : 0 diff (vérifié 17:59, inchangé — fichier non concerné).

**Compte rendu de groupe :**

```
### Groupe A — Schéma
Tâches : T1
Fichiers modifiés : prisma/schema.prisma (+3)
Vérifications exécutées : diff schema ; db:push ; comptes avant/après 58=58 ; champs nouveaux null/false sur lignes existantes
Sorties : voir ci-dessus (réelles)
Critères d'acceptation couverts : fondations CA-2.1, CA-3.4
Écart au plan : aucun
Statut proposé : à recetter (délégation)
```

## Groupe B — Backend / routes API

**Fichiers modifiés : `src/app/api/book-skills/route.ts`, `src/app/api/book-skills/[id]/route.ts`. Tâches : T2a, T2, T3, T4.**

### T2a — Écart Article 4 : bug préexistant P2010 découvert et corrigé

- 18:02 — Serveur dev relancé (il était tombé — OOM connu) : `NODE_OPTIONS=--max-old-space-size=1200 setsid -f bash -c 'bun run dev >> dev.log 2>&1'` → HTTP 200.
- 18:03 — `curl /api/book-skills` → 500, dev.log : `P2010` « Conversion failed: input contains invalid characters » sur le `SELECT` brut. Reproduction hors serveur : la **même requête** échoue sous Node en pleine hauteur, passe sous bun, passe en LIMIT 3 — et l'**ancienne** requête (sans les colonnes ajoutées) échoue à l'identique → **défaut préexistant, non introduit par le cycle**.
- 18:04 — Bissection SQL : `SELECT id, "createdAt" FROM CustomBookSkill` (58 lignes) → FAIL ; par ligne → **8 lignes fautives**, toutes créées le 2026-08-23 ; `CAST("createdAt" AS TEXT)` = `2026-08-23T08:16:35.787667` (texte, **6 décimales**) là où les lignes saines stockent des entiers epoch-ms (`1787386113854`). Le convertisseur Node de Prisma rejette le texte ISO 6 décimales.
- 18:04 — Correctif T2a : `UPDATE` des 8 lignes → entiers epoch-ms (parsing ISO JS ; sous-millisecondes perdues, sans effet métier). Preuves : `AVANT total: 58` → `APRÈS total: 58` ; requêtes complètes ancienne + nouvelle → **OK 58 lignes sous Node**. Plan et tasks amendés AVANT le correctif (Article 4).

### T2 / T3 / T4 — preuves curl (18:05)

- `GET /api/book-skills` → `count: 58` ; ligne 1 : `{'title': 'Guide to Academic and Scientific Publication…', 'description': None, 'enabled': False, 'source': None}` — **nouveaux champs présents** (T2).
- `POST` avec `description/source/tags/enabled` → **HTTP 201**, créé `cmusn7tvu0000mut7ri9kqi6a` `enabled: True` (T3).
- `POST` description de 501 caractères → **HTTP 400** (T3).
- `PUT` (title/description/enabled) → **HTTP 200** ; re-GET → `title: 'Test cycle competences (édité)' | desc: 'Description éditée' | enabled: False` — **persistance prouvée** (T4).
- `PUT` id inconnu → **HTTP 404** (T4).
- Nettoyage : DELETE ressource de test → HTTP 200, `count final: 58` (état restauré).

**Compte rendu de groupe :**

```
### Groupe B — Backend / routes API
Tâches : T2a, T2, T3, T4
Fichiers modifiés : src/app/api/book-skills/route.ts (SELECT + type + zod), src/app/api/book-skills/[id]/route.ts (zod PUT + P2025→404) ; données : 8 horodatages normalisés
Vérifications exécutées : T2a bissection + comptes 58=58 + requêtes complètes OK ; T2 GET champs présents ; T3 POST 201/400 ; T4 PUT 200 + re-GET + 404
Sorties : réelles, ci-dessus
Critères d'acceptation couverts : CA-1.1, CA-2.2 (fondations API), CA-2.3 (fondation)
Écart au plan : T2a ajoutée (bug préexistant P2010 — cf. plan § Écart) ; T2-T4 dans un commit unique (même périmètre fichier, preuves séparées par tâche)
Statut proposé : à recetter (délégation)
```
