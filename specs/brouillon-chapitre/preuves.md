# Preuves — Générateur de brouillon de chapitre (Task ID: 4-b)

Horodatage : `TZ='Etc/GMT-1' date '+%H:%M'` (heure de l'environnement sandbox).
Lignes rouges vérifiées avant chaque commit : `git diff HEAD --stat -- src/components/layout/app-sidebar.tsx src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts` → vide.

---

## T1 — src/lib/markdown-to-html.ts (convertisseur minimal liste blanche)

- 17:15 — `bun run lint` après création du fichier → `✖ 231 problems (0 errors, 231 warnings)` (0 erreur, avertissements préexistants).
- Fichier créé : `src/lib/markdown-to-html.ts` — `markdownToHtml()` (liste blanche h2/h3/p/ul/ol/li/strong/em/blockquote, échappement `escapeHtml` avant rendu, gras puis italique), `htmlToPlainText()` (strip tags + décodage entités, pour plainText à l'insertion).
- Tests unitaires : couverts en T3 (le test accompagne la tâche Tests).

Progression : [T1] fichier créé, lint 0 erreur — commit f6680e6.

## T2 — src/app/api/chapter-draft/stream/route.ts (POST SSE)

- 17:20 — `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)` (0 erreur).
- 17:20 — `bunx tsc --noEmit` → 84 erreurs identiques SANS et AVEC les nouveaux fichiers (baseline préexistante, toutes dans des fichiers non touchés, ex. src/app/api/thesis/route.test.ts) ; 0 erreur dans `chapter-draft` / `markdown-to-html`.
- Route créée : zod {chapterId, targetWords 300-8000, referenceIds ≤ 20 (défaut [])} ; chapitre 404 si inconnu ; contexte thèse (titre/auteur/discipline + titres chapitres + cadrage actif via include isActive) ; bibliographie prompt « - Auteur (année). Titre » ; prompt strict citations « (Auteur, année) » uniquement, aucune invention ; generateCompletionStream temperature 0.6 / maxTokens 12 000 ; relais SSE + UNE relance de continuation si troncature (reprise 4 000 derniers caractères, concaténation espacée comme deep-research) ; chunk done terminal.
- Note environnement : le serveur de développement auto-lancé sur :3000 est arrêté depuis 16:17 (dev.log figé, `ss` ne montre plus le port 3000, processus next absent ; seul subsiste un `bun run dev` pid 1375 dont l'enfant est `node index.js` :3005, hors projet). Les preuves `curl` (400 zod, 404, SSE) seront exécutées au moment de la vérification navigateur ; lint + typecheck font foi pour le commit.

Progression : [T2] route SSE créée, lint 0 erreur, tsc baseline inchangée — commit 13e2521.

## T3 — Tests (markdown-to-html + route chapter-draft/stream)

- 17:22 — `bunx vitest run src/lib/markdown-to-html.test.ts src/app/api/chapter-draft/stream/route.test.ts` → 2 fichiers, 35 tests (1 échec corrigé : regex gras non gourmande `/\*\*(.+?)\*\*/g` pour autoriser l'italique imbriqué ; 2ᵉ passage 35/35).
- 17:22 — `bunx vitest run` (suite complète) → `Test Files 67 passed (67)` / `Tests 1506 passed (1506)` — baseline 65 fichiers / 1471 tests inchangée + 2 fichiers / 35 tests nouveaux.
- Couverture : titres ##/### (+ normalisation #/####), gras/italique imbriqués, listes -/1., blockquote, paragraphes, échappement `<script>` / `<div>` (aucune balise hors liste blanche), htmlToPlainText ; route : 400 zod (chapterId manquant, targetWords < 300 / > 8000 / non entier, > 20 références), 404 chapitre inconnu, succès SSE (chunks transmis + un seul done, maxTokens 12 000 vérifié, prompt sans référence = « AUCUNE citation », avec références = « BIBLIOGRAPHIE AUTORISÉE » + « Bertholet (2012). La ville durable en question » + cadrage actif), relance de continuation unique si troncature, aucune relance si ponctuation terminale, relais du chunk error. Aucun appel IA réel (generateCompletionStream / generateCompletion / db mockés).
- 17:23 — `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)` (0 erreur).

Progression : [T3] tests verts — suite complète 67 fichiers / 1506 tests — commit 1979c92.

## T4 — Navigation (ViewId, entrée Rédaction, page.tsx)

- 17:28 — `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)` (baseline exacte).
- `app-store.ts` : ViewId union + `"brouillon-chapitre"` (après soutenance) ; NAVIGATION_ITEMS : entrée après « Assistant IA » — label « Brouillon de chapitre », icône `PenTool` (présente dans ICON_MAP, app-sidebar l.71-77 — non modifié), catégorie `redaction`, badge `IA`.
- `page.tsx` : import `BrouillonChapitrePage` + case `brouillon-chapitre` (juste après ai-writing).
- Suite vitest complète re-vérifiée après la page (T5) : 1506/1506 (voir T5) — `app-store.test.ts` (unicité ViewId, premier = dashboard) vert.

Progression : [T4] navigation enregistrée (sidebar Rédaction, badge IA) — commit d9d6ae7.

## T5 — Page du module (src/modules/brouillon-chapitre/brouillon-chapitre-page.tsx)

- 17:28 — `bun run lint` après création (avertissement react-hooks/exhaustive-deps corrigé par useMemo sur `chapters`) → `✖ 231 problems (0 errors, 231 warnings)` (baseline exacte).
- 17:27/17:28 — `bunx vitest run` → 1506/1506 verts (65 fichiers préexistants + 2 nouveaux en T3 ; la page n'ajoute pas de test, conforme tasks.md).
- Page créée (~480 lignes) : états vides sans thèse/sans chapitres (aucun appel IA) ; Select chapitre (présélection 1er chapitre) ; Input longueur cible préremplie (targetWordCount si ≥ 500 sinon 2000) ; recherche + liste Checkbox de références (GET /api/references, max 20, max-h-96 overflow-y-auto) ; « Générer le brouillon » (SSE live) / « Arrêter » (AbortController) ; aperçu ReactMarkdown + Badge compteur « X mots / cible Y » (même comptage que l'éditeur) ; chips de rappel des références ; « Copier » ; « Insérer dans le chapitre » → AlertDialog (texte contractuel : remplacement + version automatique) → markdownToHtml + htmlToPlainText + countWords → useUpdateChapter (PUT /api/chapters/[id], invalidations thesisKeys.all) → toast succès mentionnant l'historique de versions ; toasts erreurs (génération, insertion) ; libellés 100 % français, aucun emoji, composants shadcn.

Progression : [T5] page créée, lint baseline, suite verte — commit 96340b0.

## T6 — Entrée dans le guide intégré (usage-guide-dialog.tsx)

- 17:30 — `bun run lint` → `✖ 231 problems (0 errors, 231 warnings)` (baseline exacte).
- Section « Brouillon de chapitre (IA) » ajoutée dans la catégorie « Assistants IA », juste après « Assistant IA d'écriture » et avant « Mon IA de thèse (RAG) » : description, flux pas-à-pas (chapitre cible + longueur, références autorisées 20 max, génération en direct + Arrêter, aperçu + compteur + Copier / Insérer), garde-fou d'insertion (remplacement + version automatique), règle de citations « (Auteur, année) », persistance (brouillon en session, chapitre en base). Import `PenTool` ajouté aux icônes lucide du dialog. Mots-clés de recherche inclus (brouillon, chapitre, premier jet…).

Progression : [T6] entrée guide intégré ajoutée.
