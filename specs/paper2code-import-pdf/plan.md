# Plan — Paper2Code import PDF

## État réel constaté

- `src/modules/paper2code/paper2code-page.tsx` (431 l.) : composant client unique du module.
  Champ `paperText` (l.80), textarea l.226-232, compteur l.222-224, garde bouton
  `paperText.length < 200` (l.268), POST JSON `/api/paper2code/generate` (l.137).
- `src/app/api/paper2code/generate/route.ts` : garde serveur `paperText.length < 200` (l.229),
  le texte part en entier dans le prompt planning (l.41) — aucune troncature à adapter.
- `src/lib/articles/extraction.ts` (151 l.) : logique pure réutilisable telle quelle —
  `detectFileType` (l.25), `validateFileSize` (l.37), `MAX_IMPORT_BYTES` 50 Mo (l.10),
  `checkMagicBytes` `%PDF` (l.49), `extractPdf` unpdf dynamique (l.76), `detectScannedPages`
  (l.97).
- `src/app/api/article-imports/route.ts` (202 l.) : pattern d'upload maison — pré-contrôle
  `content-length` avant parsing multipart (l.33-41), FormData champ `file` (l.43-49),
  415 format / 413 taille / 415 magic bytes / 422 extraction (l.51-103).
- Pattern UI drag & drop existant : `src/modules/references/references-page.tsx`
  (input hidden + ref, zone dashed, onDrop/onDragOver/onDragLeave, preview).
- `unpdf` ^1.8.1 déjà dans package.json — aucune nouvelle dépendance.

## Approche retenue

1. Nouvelle route `POST /api/paper2code/extract-pdf` (Node runtime, FormData) qui réutilise
   `extraction.ts` : pré-contrôle content-length, PDF seul (415 sinon), 413 taille,
   415 magic bytes, extraction par pages, détection scanné, texte joint `\n\n`.
   Réponse : `{ text, pages, chars, warnings: string[] }`. Sans persistance DB.
2. Frontend : zone de dépôt dashed dans la carte « Article source », au-dessus du textarea
   — drag & drop + clic (input hidden `.pdf`), appel POST, pré-remplissage `paperText`,
   affichage fichier/pages/caractères + avertissements, toasts. Le collage reste inchangé.
3. Constante client locale 50 Mo (commentaire renvoyant à `MAX_IMPORT_BYTES`) pour ne pas
   tirer `extraction.ts` (imports dynamiques serveur) dans le bundle client.

## Alternatives écartées

- Réutiliser `/api/article-imports` : il persiste en base un `ArticleImport` — hors
  périmètre (US sans persistance) et couplage inutile.
- Extraction PDF côté client (pdfjs) : parseur lourd dans le bundle, s'écarte de la maison
  qui extrait côté serveur (unpdf dynamique).
- Extension du module à DOCX/TXT : demande explicite PDF seul (anti-pattern : élargir).

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| src/app/api/paper2code/extract-pdf/route.ts | création | faible — route additive, zéro modification existante |
| src/modules/paper2code/paper2code-page.tsx | modification | modéré — carte « Article source » uniquement ; pipeline et résultats intacts |
| specs/paper2code-import-pdf/* | création | documentation SDD |

## Impacts transverses

Aucun : pas de schéma Prisma, pas de variable d'environnement, pas de build Tauri,
pas de quota d'API externe. La taille de body multipart est déjà plafonnée par la
configuration de transport (proxyClientMaxBodySize 64 Mo — cf. article-imports l.29-31).
Note desktop : l'extraction reste serveur — dans le build Tauri embarqué, la route s'exécute
dans le serveur Node packagé (aucun `public/` ni config à changer).

**Écart constaté en implémentation (T1, preuve curl)** : la règle de rate limit existante
`^\/api\/paper2code` (5 req/5 min — `src/lib/rate-limit.ts` l.57, dimensionnée pour la
*génération* IA coûteuse en tokens) capture aussi `/api/paper2code/extract-pdf`, qui n'appelle
aucun LLM (parsing local). Un chercheur essayant plusieurs articles serait bridé par une
limite pensée pour les coûts IA. Correctif : règle dédiée ajoutée AVANT le pattern générique
(first match wins) : `^\/api\/paper2code\/extract-pdf` → 12 req/60 s. Impact : 1 ligne
dans `src/lib/rate-limit.ts`, annoncée ici conformément au protocole (mise à jour du plan,
pas de rustine silencieuse).

## Stratégie de vérification

- curl réel sur la route avec un PDF textuel du dépôt (`docs/NOTE-PRESENTATION.pdf`) :
  200 + JSON text/pages/chars ; PDF > 50 Mo → 413 ; TXT renommé .pdf → 415 ; sans fichier → 400.
- `bun run lint` 0 erreur.
- Recette navigateur (dev server Ma-These sur 3001, agent-browser) : zone visible,
  import réel du PDF → champ rempli, compteur, badge fichier/pages, avertissement
  scanné sur un PDF image si disponible — sinon le cas scanné reste prouvé par curl.
- `bun run test:run` sur les tests existants du module paper2code (aucun test écrit ici,
  pas de code de test dans ce cycle).

## Risques

- Rejet du formulaire FormData par le body parser Next 16 : aucune trace connue
  (article-imports l.43 fonctionne en prod) — pattern copié tel quel.
- Articles PDF multi-colonnes : l'extraction unpdf peut mixer les colonnes — avertissement
  existant de la maison (« structure de titres non garantie ») adapté dans la réponse
  (warning générique) ; l'utilisateur garde la possibilité d'éditer le texte collé dans le
  textarea avant génération (CA-1.7).
- Bundle client : veiller à ne PAS importer `extraction.ts` depuis le composant client
  (constante locale) pour ne pas embarquer unpdf/mammoth.
