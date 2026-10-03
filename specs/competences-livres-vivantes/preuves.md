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

## Groupe C — IA / injection

**Fichiers créés/modifiés : `src/lib/ai/book-skills.ts` (+test), `src/lib/ai/book-skills-server.ts`, `src/app/api/chapter-draft/stream/route.ts` (+test), `src/app/api/ai-writing/route.ts` (+test), `src/app/api/ai-writing/stream/route.ts` (+test). Tâches : T5, T6, T7, T8.**

- 18:06 — T5 : bibliothèque pure (`buildBookSkillsIndex`, `selectBookSkills`, `buildBookSkillsSection` ; plafonds 1 500 / 12 000 car.) ; tests unitaires dédiés → **11/11 verts** (null si vide CA-3.1, section + règle « JAMAIS une source de citations » CA-3.5, budget + mention « contenu non injecté (budget) » CA-3.3, ordre déterministe, troncature d'index).
- 18:07 — T6 : `getActiveBookSkills()` (`enabled: true`, ordre `updatedAt desc`) — consommée par les 3 routes, mockée dans leurs tests.
- 18:08 — T7 : `buildSystemPrompt(thesisContext, bibliography, bookSkillsSection = null)` — section insérée avant « CONTEXTE DE LA THÈSE » ; `CONTINUATION_SYSTEM_PROMPT` inchangé. Tests : **16/16 verts** dont 3 nouveaux (0 actif → aucune section CA-3.1 ; 1 actif → index + contenu + règle, position avant contexte CA-3.2/3.5 ; continuation sans compétences CA-3.6 — la relance passe par `generateCompletion`, assertion corrigée en conséquence).
- 18:10 — T8 : message système dédié inséré entre le prompt de spécialisation et le contexte de thèse dans `ai-writing` et `ai-writing/stream`. Tests : route **19/19** (2 nouveaux : 0 actif → 1 seul message système ; 1 actif → 2 messages système, section en 2e position), stream **14/14** (1 nouveau).
- 18:12 — Lint global : **0 erreur, 231 warnings** (= baseline — les 2 warnings introduits par le groupe [non-null assertion, arg inutilisé] ont été corrigés). Lignes rouges : 0 diff.
- Correctifs de tests pendant le groupe : mode d'écriture réel `paraphrase` (l'id supposé `ameliorer-texte` n'existe pas — `src/data/ai-writing-modes.ts` l.60) ; mock `zai-client` top-level pour le test stream.

**Compte rendu de groupe :**

```
### Groupe C — IA / injection
Tâches : T5, T6, T7, T8
Fichiers modifiés : src/lib/ai/book-skills.ts (+test, nouveau), src/lib/ai/book-skills-server.ts (nouveau), chapter-draft/stream route+test, ai-writing route+test, ai-writing/stream route+test
Vérifications exécutées : 11/11 unitaires pures ; 16/16 chapter-draft ; 19/19 ai-writing ; 14/14 stream ; lint 0 erreur = baseline 231 ; lignes rouges 0 diff
Sorties : réelles, ci-dessus
Critères d'acceptation couverts : CA-3.1, CA-3.2, CA-3.3, CA-3.5, CA-3.6 (CA-3.4 par le where enabled:true de T6, recetté en navigateur)
Écart au plan : aucun (2 micro-correctifs de tests documentés)
Statut proposé : à recetter (délégation)
```

## Groupe D — Frontend / UI

**Fichier modifié : `src/modules/livres-competences/livres-competences-page.tsx` (composant `BookSkillsLibrary`, +imports Textarea/Switch/Label). Tâches : T9, T10.**

- 18:15 — T9 : bouton « Nouvelle ressource » ; dialog de création/édition (titre*, auteur, provenance, description d'usage, tags, contenu*, interrupteur « Utilisée par l'IA » désactivé par défaut) ; interrupteur par carte avec PUT immédiat ; badges « Injectée » (émeraude) / « Hors IA » (contour) ; description et provenance affichées sur les cartes ; édition = rechargement du contenu intégral avant pré-remplissage.
- 18:15 — T10 : le `~` bit-a-bit parasite est supprimé — `{Math.round(book.contentLength / 5)} mots` (la correction est incluse dans la réécriture du composant, annoncée au plan).
- 18:16 — Lint : **0 erreur / 231 warnings** (= baseline) ; aucun test vitest existant sur ce module (vérification fonctionnelle en recette navigateur, Groupe E + recette).
- Lignes rouges : 0 diff.

**Compte rendu de groupe :**

```
### Groupe D — Frontend / UI
Tâches : T9, T10
Fichiers modifiés : src/modules/livres-competences/livres-competences-page.tsx (composant BookSkillsLibrary réécrit ~200 lignes → ~490 lignes)
Vérifications exécutées : lint 0 erreur baseline ; recette navigateur prévue (créer, éditer, basculer, recharger — CA-1.1/1.2/2.1/2.2/2.3, CA-4.1)
Sorties : lint réel ci-dessus ; preuves navigateur en section Recette
Critères d'acceptation couverts : CA-1.1, CA-1.2, CA-2.1, CA-2.2, CA-2.3, CA-4.1
Écart au plan : aucun
Statut proposé : à recetter (délégation)
```
