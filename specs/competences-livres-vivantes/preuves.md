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

## Groupe E — Tests / non-régression

**Tâches : T11, T12.**

- 18:16 — T11 : `bun run test:run` → **69 fichiers / 1548 tests, tous verts** (baseline 68/1531 + 1 nouveau fichier `book-skills.test.ts` + 17 tests : 11 unitaires pures, 3 chapter-draft, 2 ai-writing, 1 stream — **zéro régression**). Durée 16,17 s.
- 18:18 — T11 : `bun run lint` → **0 erreur / 231 warnings** (= baseline). Lignes rouges : 0 diff.
- 18:19 — T12 : section « 6 bis. Canal “Compétences livres” » ajoutée à `docs/ARCHITECTURE-CONNAISSANCE.md` (bibliothèque pure, accès serveur, points d'injection, règle d'intégrité, plafonds de budget, renvoi vers la spec du cycle).

**Compte rendu de groupe :**

```
### Groupe E — Tests / non-régression
Tâches : T11, T12
Fichiers modifiés : docs/ARCHITECTURE-CONNAISSANCE.md (section 6 bis)
Vérifications exécutées : suite complète 69/1548 verts ; lint 0 erreur baseline 231 ; lignes rouges 0 diff
Sorties : réelles, ci-dessus
Critères d'acceptation couverts : CA-3.1 (non-régression byte-identique prouvée par tests), couverture transverse
Écart au plan : aucun
Statut proposé : à recetter (délégation)
```

## Recette — navigateur en conditions réelles (délégation propriétaire)

Navigateur : agent-browser (chromium headless). Serveur : dev 3000 (HTTP 200).

### Déroulé

- 18:23 — Ouverture `/` (HTTP 200), navigation « Livres-compétences » → onglet « Bibliothèque » : 58 ressources listées, recherche + bouton « Nouvelle ressource » présents, **tous les interrupteurs `checked=false`** (CA-2.1 confirmé sur données réelles). Capture `test-snapshots/competences-biblio-initiale.png`.
- 18:24 — CA-4.1 (T10) : compteurs de mots affichés **positifs** (« 6000 mots », « 417 », « 473 », « 490 », « 570 ») — plus aucun nombre négatif.
- 18:25 — CA-1.1/CA-2.1 : création via formulaire (« Recette cycle — Savoir de démonstration », auteur, provenance, description d'usage, tags, contenu ; interrupteur **désactivé par défaut** dans le formulaire) → carte créée, champs repris à l'identique (vérif DOM + API).
- 18:26 — CA-2.2 : activation de l'interrupteur sur la carte → badge « **Injectée** » (émeraude), plus de « Hors IA » ; API `enabled: true`. Capture `test-snapshots/competences-carte-injectee.png`.
- 18:27 — CA-2.3 : **rechargement complet** de la page → navigation → l'interrupteur de la ressource est toujours `checked=true` (état persistant en base).
- 18:28 — CA-1.2 : édition (titre → « Recette cycle — Savoir édité », description mise à jour) → « Enregistrer » → API : `{'title': 'Recette cycle — Savoir édité', 'description': 'Usage mis à jour pendant la recette', 'enabled': True}` — persistance prouvée, `enabled` préservé.
- 18:30 — CA-3.2 en conditions réelles : génération d'un brouillon (`POST /api/chapter-draft/stream`, chapitre « Revue de littérature » de la thèse « Urbanisme durable », 300 mots) **avec la compétence active en base** → **HTTP 200**, 2 événements (chunk + done), brouillon de 2 633 caractères produit, « done » unique. (La présence effective de la section « COMPÉTENCES LIVRES » dans le message système est prouvée par les tests vitest du Groupe C ; l'appel live prouve que la voie d'injection fonctionne sans crash ni dégradation sur données réelles.)
- 18:32 — CA-1.3 : suppression via l'UI (poubelle + confirm natif) → `count final: 58` — **base restaurée à l'état initial**, données de test retirées.
- 18:33 — Mobile 390×844 : **pas de scroll horizontal** sur l'onglet Bibliothèque ; footer poussé naturellement par le contenu long (aucun chevauchement) ; captures `test-snapshots/competences-biblio-mobile-390.png`, `competences-mobile-390.png`, `competences-biblio-desktop.png`.
- 18:34 — `agent-browser errors` → vide ; console → **0 erreur**. Navigateur fermé.

### Défauts découverts pendant la recette (corrigés dans leur groupe)

1. **POST 400 en création UI** (18:26, 1re tentative) — cause racine : l'UI envoie `null` pour les champs optionnels (auteur, provenance, description, tags) alors que le schema POST n'acceptait que `undefined` (`.optional()` ; le PUT utilisait déjà `.nullish()`). Correctif : `.nullish()` sur les 4 champs du `createSchema` (`src/app/api/book-skills/route.ts`) — re-testé curl 201 avec `null` + re-test UI complet vert. Compte rendu additionnel Groupe D ci-dessus.
2. **Base « readonly database » ponctuelle** (18:25) — le processus serveur antérieur (démaré avant la normalisation T2a) a rendu l'erreur SQLite `attempt to write a readonly database` au premier POST UI ; écriture shell saine, disque 22 %. Redémarrage propre du serveur dev → POST 201. Comportement environnemental (box OOM-prone connue), aucune modification de code.

**Compte rendu de recette (délégation) :**

```
### Recette navigateur — compétences-livres-vivantes
Tâches recettées : T1→T12 (tous les groupes)
Vérifications exécutées : 15 contrôles UI/API live + 1548 tests + lint
CA couvertes : CA-1.1, CA-1.2, CA-1.3, CA-2.1, CA-2.2, CA-2.3, CA-3.1 (tests), CA-3.2 (tests + live), CA-3.3 (tests), CA-3.4 (where enabled + recette), CA-3.5 (tests), CA-3.6 (tests), CA-4.1 — 14/14
Défauts trouvés/corrigés : POST nullish (corrigé + re-recetté), readonly ponctuel (environnement)
Écart au plan : aucun non documenté
Statut : RECETTÉE (délégation propriétaire — révisable à son retour)
```

## Recette déléguée — les 58 ressources par ordre de récence (2026-10-03, 19:14-19:22)

Demande du propriétaire : « faites le teste pour les 58 par ordre de récence » (IM, 19:0x). Exécution en conditions réelles : données de production (58 ressources), librairie pure réelle (`src/lib/ai/book-skills.ts`), UI, génération live, puis restauration intégrale de l'état initial.

### A. Données réelles + simulation du canal (script lecture seule, supprimé après)

```
TOTAL ressources: 58
Actifs actuellement (enabled=true): 0
Ordre updatedAt DESC respecté: OUI                    ← critère de la sélection « récence d'abord »

12 premières ressources par récence (état actuel):
 1. [ 30000 car.] maj=2026-08-23T11:11 ○hors IA Guide to Academic and Scientific Publication…
 2. [  2087 car.] maj=2026-08-23T10:46 ○hors IA How to Write and Publish a Scientific Paper (8e ed.)
 3. [  2363 car.] … Maitriser la Structure en Entonnoir de la Revue de Litterature
 4. [  2449 car.] … 6 Prompts IA pour la Recherche
 5. [  2848 car.] … The Research Prompt Handbook
 6. [  1491 car.] … A Manual for Writers of Research Papers, Theses, and Dissertations (8e ed.)

SIMULATION « 58 actives »: injectées=6, ignorées(budget)=52, 11745/12000 car.
  INJ 1. How to Write and Publish a Scientific Paper (2087) … INJ 6. Template_rapport_these (507)
  SKIP 1. Guide to Academic and Scientific Publication (30000 car.) — trop volumineuse seule
Section 58 actives: 14292 car. | mention budget: PRÉSENTE | règle intégrité: PRÉSENTE
INDEX: « [L1] Guide to Academic… — contenu non injecté (budget) »
Section avec les 0 active(s) actuelle(s): null → prompts byte-identiques (CA-3.1)
```

**Constat notable** : la ressource la plus récente (Guide to Academic…, 30 000 car., import initiale) dépasse seule le plafond de 12 000 car. — même activée, elle ne peut jamais être injectée en contenu intégral ; elle reste visible en index avec la mention « contenu non injecté (budget) ». Comportement conforme à CA-3.3 (plafond protecteur) — à connaître pour l'usage : les ressources utiles au contenu intégral doivent rester ≤ 12 000 car.

### B. Recette UI (agent-browser, 19:16-19:19)

- Onglet Bibliothèque : **58 switches comptés** ; les cartes suivent le même ordre de récence que la base (rang 1 = Guide 30k, rang 2 = How to Write…).
- Activation rangs 1 + 2 → **2 badges « Injectée »**, 56 « Hors IA » ; base : `actives: 2` (PUT 200 — réseau : `PUT /api/book-skills/7a4cf5f65db34bfc8015 200`).
- **Persistance** : reload complet + renavigation → switches `checked=true` (2), badges « Injectée » 2, « Hors IA » 56 (2+56 = 58).
- Restauration via les mêmes interrupteurs → UI 0 active, base **0/58**.

### C. Génération live avec compétences actives (19:20)

- Thèse « Urbanisme durable » activée via la carte de l'éditeur (store `activeThesisId` — le reload l'avait réinitialisée à `null`, comportement d'état client connu).
- Brouillon de chapitre : Chapitre 1, cible 400 mots → **« Aperçu du brouillon — 237 mots / cible 400 »** avec contenu structuré réel. **Aucune insertion** (pas de confirmation cliquée — rien persisté).
- Réseau : `POST /api/chapter-draft/stream → 200` ; `GET /api/book-skills → 200`. **0 erreur page** (agent-browser errors vide).
- La géante (rang 1) est entrée en index-only + la rang 2 en contenu intégral — les deux chemins exercés en une génération.

### D. Restauration de l'état initial (19:21-19:22)

- Activation/deactivation avait avancé `updatedAt` des 2 ressources testées (effet de bord du PUT) → **timestamps d'origine restaurés** depuis git HEAD (`87d2e8a2…` → 2026-08-23T11:11:40.130Z ; `7a4cf5f65db…` → 2026-08-23T10:46:32.802Z).
- **Comparaison logique live vs HEAD** : CustomBookSkill 58/58 lignes identiques (id, enabled, updatedAt, longueur contenu) ; compteurs égaux sur thesis/chapter/chapterVersion/cadrage/job/entry/source/sprint/story/documentChunk.
- Diff binaire résiduel `db/custom.db` = compteurs internes SQLite (donnée logiquement identique, prouvée ci-dessus) — commité avec cette consignation, conforme à la convention du dépôt.

### E. Responsive

- Viewport 390×844 (onglet Bibliothèque) : **pas de scroll horizontal** (scrollWidth ≤ clientWidth+1).
- Captures : `test-snapshots/competences-58-recette-mobile.png`, `test-snapshots/competences-58-recette-desktop.png`.

```
### Recette déléguée — 58 ressources (récence)
Périmètre : données réelles + librairie pure + UI + génération live + restauration
CA couvertes : CA-3.1 (null à 0 active), CA-3.2 (index + contenu live), CA-3.3 (plafond + mention budget), CA-2.2/2.3 (interrupteurs + persistance badges)
Défauts trouvés : aucun défaut produit — 1 constat d'usage (ressource 30k jamais injectable en intégral, par design) ; 1 effet de bord test→timestamps, restauré
Écart au plan : aucun
Statut : RECETTÉE (délégation propriétaire — révisable à son retour)
```

## Validation déléguée du cycle (2026-10-03, ~19:30) + micro-changement « taille conseillée »

### Validation propriétaire
À la question « (a) ajouter l'indication de taille dans l'UI ; (b) considérer le cycle comme validé par votre recette déléguée — Votre avis ? », le propriétaire a répondu **« oui »** (IM, 2026-10-03, 19:30). Les deux points sont pris en charge : le cycle compétences-livres-vivantes est **VALIDÉ par recette déléguée** (choix conservateurs de la spec compris), et l'indication de taille est livrée ci-dessous (voie rapide).

### Micro-changement — voie rapide (assess-taille-conseillee.md)
Périmètre réel : `src/modules/livres-competences/livres-competences-page.tsx` — **12 insertions, 1 fichier** ; import de la constante `BOOK_SKILLS_CONTENT_BUDGET_CHARS` depuis la librairie pure (pas de valeur codée en dur).

- Lint : `✖ 231 problems (0 errors, 231 warnings)` — **0 erreur, baseline exacte**.
- Lignes rouges avant commit : `git diff HEAD --stat` sur les 3 fichiers = **vide (0 diff)**.
- Recette navigateur (19:47-19:50) :
  - Dialog « Nouvelle ressource » : compteur affiché « **0 caractères — taille conseillée ≤ 12 000 pour une injection intégrale (au-delà, la ressource reste en index « contenu non injecté (budget) »).** »
  - Saisie de 46 caractères → compteur « **46 caractères** » (comptage live) — via fill Playwright (la manipulation directe `.value` + event ne traverse pas React contrôlé : 2 tentatives eval non probantes, méthode remplacée).
  - Saisie de 12 050 caractères → compteur « **12 050 caractères** » + classe **ambre** vérifiée (`p.className.includes('amber') → COULEUR AMBRE`).
  - Escape sans enregistrer → base inchangée : **58 ressources, 0 active** (aucun parasite créé).
- Capture : `test-snapshots/competences-compteur-dialog.png`.
