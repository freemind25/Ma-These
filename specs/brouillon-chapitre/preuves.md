# Preuves — Générateur de brouillon de chapitre (Task ID: 4-b)

Horodatage : `TZ='Etc/GMT-1' date '+%H:%M'` (heure de l'environnement sandbox).
Lignes rouges vérifiées avant chaque commit : `git diff HEAD --stat -- src/components/layout/app-sidebar.tsx src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts` → vide.

---

## T1 — src/lib/markdown-to-html.ts (convertisseur minimal liste blanche)

- 17:15 — `bun run lint` après création du fichier → `✖ 231 problems (0 errors, 231 warnings)` (0 erreur, avertissements préexistants).
- Fichier créé : `src/lib/markdown-to-html.ts` — `markdownToHtml()` (liste blanche h2/h3/p/ul/ol/li/strong/em/blockquote, échappement `escapeHtml` avant rendu, gras puis italique), `htmlToPlainText()` (strip tags + décodage entités, pour plainText à l'insertion).
- Tests unitaires : couverts en T3 (le test accompagne la tâche Tests).

Progression : [T1] fichier créé, lint 0 erreur.
