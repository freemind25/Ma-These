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

Progression : [T2] route SSE créée, lint 0 erreur, tsc baseline inchangée.
