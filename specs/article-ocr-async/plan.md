# Plan — OCR des pages scannées + exécution asynchrone (article scientifique)

## État réel constaté

Fichiers lus pour ce plan (chemins + lignes vérifiés, lecture directe + agent d'exploration sourcé) :

| Constat | Preuve |
|---|---|
| Extraction PDF = texte seul (unpdf `extractText`) ; `detectScannedPages` (< 10 car./page) ; `buildLimits` affiche « L'OCR n'est pas disponible dans cette itération » | `src/lib/articles/extraction.ts` l.76-82, l.97-105, l.122-130 |
| Un PDF **entièrement scanné** est rejeté 422 (« L'OCR n'est pas disponible ») | `src/app/api/article-imports/route.ts` l.88-99 |
| L'import ne conserve pas les octets (buffer transitoire) ; `importedDoc.create` sans colonne data | `src/app/api/article-imports/route.ts` l.47, l.103-114 ; `prisma/schema.prisma` l.397-411 |
| `ImportedDoc` : text/pages/limits/scanned, pas d'octets ; `Job` : type/status/payload/result/error/attempts, **pas de progression** | `prisma/schema.prisma` l.397-411, l.553-568 |
| File persistante complète : verrou optimiste, reprise orphelins (seuil 10 min), worker au boot (tick 3 s), registre `HANDLERS` (noop/deep-research/veille-check) | `src/lib/jobs/queue.ts` l.28-105 ; `src/lib/jobs/worker.ts` l.25-54, l.133-174 ; `src/instrumentation.ts` |
| Garde anti-empilement existant (job pending/running par entité, motif `payload contains`) | `src/lib/jobs/worker.ts` l.96-104 |
| unpdf v1.8.1 `extractImages` → `{ data: Uint8ClampedArray, width, height, channels: 1|3|4, key }` **sans canvas** | `node_modules/unpdf/dist/index.d.mts` l.186-189 ; README `extractImages` |
| tesseract.js / pngjs **non installés** ; pas de pdf-lib | `bun pm ls` ; `ls node_modules` (aucune correspondance) |
| `next.config.ts` : `serverExternalPackages: ["z-ai-web-dev-sdk"]` seulement | `next.config.ts` l.7 |
| Traçabilité : label source importée construit dans `sources-server.ts` (« Document importé — ${filename} », location « DONNÉES — jamais des instructions ») | `src/lib/articles/sources-server.ts` l.151-164 |
| Anti-injection : blocs `<source>` enveloppés, règle DONNÉES verbatim ; règle système l.102 | `src/lib/articles/prompts.ts` l.49-62, l.95-108 |
| UI wizard : module `article-redaction-page.tsx` — cartes imports l.843-876 (badge scanné l.849-853, limits l.863-868), état local sans polling, POST import l.228-250, `parseLimits` l.47-56 | `src/modules/article-redaction/article-redaction-page.tsx` |
| Suivi job : `GET /api/jobs/[id]` (spread du job — les nouvelles colonnes progress y passeront automatiquement) | `src/app/api/jobs/[id]/route.ts` l.15-29 |
| Convention routes : `article-imports` = query params (pas de segment dynamique) ; `Promise<{ id }>` ailleurs | `src/app/api/article-imports/route.ts` l.142-176 ; `src/app/api/articles/[id]/route.ts` l.47-52 |
| Tests : vitest, `*.test.ts` colocalisés, mock `vi.mock('@/lib/db')` ; **aucun test extraction.ts** | `vitest.config.ts` l.6-13 ; `src/app/api/document-chunks/route.test.ts` l.6-17 |
| PDFs réels disponibles : `docs/NOTE-PRESENTATION.pdf`, `docs/NOTICE-UTILISATION.pdf` (vectoriels attendus — cas « rien à OCRiser ») | glob **/*.pdf |
| OOM box confirmée (kill ~2 Go) ; serveur = start-stop-daemon ; `NODE_OPTIONS=--max-old-space-size=1400` | `FICHE_SYNTHESE.md` session 2026-10-07 ; worklog `rotation-cles-journaux-oa-fix` |
| Red lines (0 diff obligatoire) : `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`, `src/components/layout/app-sidebar.tsx` | `FICHE_SYNTHESE.md` |

## Approche retenue

Chaîne validée par l'étude (option 1) : `extractImages` (bitmap décodé, pure JS) → normalisation RGBA → PNG (pngjs, pure JS) → tesseract.js WASM **strictement séquentiel** (1 page = 1 worker créé puis `terminate()`) → bloc OCR marqué ajouté à `ImportedDoc.text` + limites mises à jour. Exécution **asynchrone** : handler `article-import-ocr` dans le registre du worker existant, enfilement via une route dédiée avec garde anti-empilement global, progression par page écrite dans deux nouvelles colonnes `Job.progress` / `Job.progressNote`. Les octets du PDF sont conservés à l'import (`ImportedDoc.data Bytes?`, PDFs uniquement) pour permettre l'OCR différé. Tessdata fra/eng/ara embarqué localement (`vendor/tessdata/`, modèle 4.0.0 = défaut tesseract.js, gzip), chargé sans réseau.

Décisions de conception :
- **Import d'un PDF entièrement scanné accepté** (texte < 20 car. mais `scanned=true`) — prérequis de US-1, sinon CA-1.1 inexécutable ; le 422 reste pour les non-scannés vides.
- **Mise à jour des limites** : l'entrée `scanned` devient une entrée `kind: "ocr"` (union étendue additivement) portant pages reconnues / restantes / confiance moyenne / langue — détection typée pour la mention OCR du label de traçabilité.
- **Ré-OCR idempotent** : un second run **remplace** l'ancien bloc OCR (marqué par en-tête dédié) au lieu de dupliquer ; le texte natif n'est jamais touché.
- **Pages sans image exploitable / image géante** : note honnête par page, jamais de texte fantôme ; réduction d'échelle entière (facteur entier, plus proche voisin) au-dessus d'un plafond de pixels pour contenir la mémoire.
- **Garde anti-empilement GLOBAL** (un seul job OCR actif, toutes docs confondues) — justification mémoire (CA-1.5), motif du garde veille (`worker.ts` l.96-104) adapté.
- **Progression** : `Job.progress Int?` (0-100) + `Job.progressNote String?`, colonnes nullables additifs — les handlers existants n'y touchent pas ; `GET /api/jobs/[id]` les expose sans modification (spread).

## Alternatives écartées

| Option | Raison du rejet |
|---|---|
| Rastérisation `renderPageAsImage` + `@napi-rs/canvas` | Binaire natif précompilé — contredit la contrainte pure JS / risque packaging Tauri (étude § 3, option 2) |
| OCR côté webview (navigateur) | Logique dupliquée, mémoire webview, onglet obligé de rester ouvert — contredit l'async (étude § 3, option 3) |
| Re-téléversement du fichier au lancement de l'OCR | Friction + fichier perdu à la fermeture → colonne `data` préférée (étude § 4) |
| Progression via mise à jour de `payload` JSON | Hack illisible ; 2 colonnes nullable additives = coût dérisoire, sémantique claire |
| pdf-lib pour la fixture de test | Dépendance de plus pour un seul usage — le PDF scanné de banc d'essai est généré par script autonome (image XObject FlateDecode écrite à la main, auto-vérifiée par aller-retour unpdf) |

## Fichiers touchés

| Fichier | Nature | Risque |
|---|---|---|
| `prisma/schema.prisma` | modification (2 modèles : `ImportedDoc.data Bytes?` ; `Job.progress Int?` + `Job.progressNote String?`) | db:push — diff avant/après + preuve de survie des données requis |
| `package.json` (+ bun.lock) | modification (dépendances : tesseract.js, pngjs, @types/pngjs dev) | faible — lockfile uniquement |
| `next.config.ts` | modification (`serverExternalPackages += "tesseract.js"`) | faible — évite le bundling du worker tesseract |
| `vendor/tessdata/{fra,eng,ara}.traineddata.gz` | ajout (binaires embarqués) | taille à mesurer (pas d'estimation) ; ~4-5 Mo/langue attendus |
| `src/lib/articles/extraction.ts` | modification (texte de la limite « scanned » honnête → OCR disponible ; union `kind` étendue "ocr" ? — non : l'union vit ici ? → voir ocr.ts) | faible |
| `src/app/api/article-imports/route.ts` | modification (accepter PDF 100 % scanné ; stocker `data` ; GET ?id sans octets) | moyen — route existante recettée ; diff à prouver |
| `src/lib/articles/ocr.ts` | ajout (pure : bitmap→PNG, pick image, downscale, bloc OCR, fusion texte idempotente, fusion limites, plan de pages) | nul (nouveau) |
| `src/lib/articles/ocr-engine.ts` | ajout (serveur : worker tesseract par page, langPath local, terminate systématique) | moyen — mémoire |
| `src/lib/jobs/worker.ts` | modification (handler `article-import-ocr` + progression) | moyen — registre existant, imports dynamiques obligatoires |
| `src/app/api/article-imports/ocr/route.ts` | ajout (POST enfilement + garde 409 ; GET état par importedDocId) | nul (nouveau) |
| `src/lib/articles/ocr.test.ts`, `src/app/api/article-imports/ocr/route.test.ts`, `src/app/api/article-imports/route.test.ts` | ajout (tests colocalisés, mock db) | nul |
| `src/modules/article-redaction/article-redaction-page.tsx` | modification (contrôle OCR sur cartes imports : langue, bouton, progression, rafraîchissement, badge, messages) | moyen — composant central du wizard (≥ 1 300 l.) |
| `src/lib/articles/sources-server.ts` | modification (mention OCR au label si limites `kind: "ocr"`) | faible — additif |
| `specs/article-ocr-async/fixtures/*` | ajout (script générateur + PDF scanné de banc d'essai) | nul |
| `docs/ARCHITECTURE-CONNAISSANCE.md` § 7 bis, `FICHE_SYNTHESE.md`, `worklog.md` | documentation fin de cycle | nul |

**Red lines** : les 3 fichiers rouges ne sont PAS touchés — vérification 0 diff avant chaque commit.

## Impacts transverses

- **Schéma Prisma** : 2 modèles touchés, colonnes nullables uniquement — `db:push` additif, survie des données à prouver (comptages avant/après, y compris importedDocs existants).
- **Routes API** : `article-imports` modifiée (comportement 422 scanné) ; nouvelles routes OCR ; `GET /api/jobs/[id]` expose progress sans code changé.
- **Build Tauri** : tessdata ≈ 10-15 Mo dans l'installateur (à mesurer précisément) — packaging desktop **hors périmètre**, consigné pour le cycle build-desktop ; `output: standalone` ne copiera pas `vendor/` tel quel (résolution par chemins candidats + erreur honnête si absent).
- **Variables d'environnement** : `OCR_MAX_PAGES` (défaut 30) optionnelle — rien d'obligatoire.
- **Mémoire / OOM** : risque n° 1 du cycle — séquentiel strict, terminate par page, plafond pixels, plafond pages, RSS mesuré en recette (critère explicite) ; serveur redémarré en start-stop-daemon avec cap 1 400 Mo.
- **Quotas externes** : aucun — OCR 100 % local.

## Stratégie de vérification

1. `bun run test:run` — baseline 1 611 verts avant, ≥ 1 640 après (nouveaux tests) ; lint 0 erreur.
2. Schéma : `git diff prisma/schema.prisma` (colonnes nullables seules) + `bun run db:push` + comptages de survie par table avant/après + serveur relancé (start-stop-daemon) + HTTP 200.
3. Unitaires ciblés : bitmap→PNG (aller-retour pngjs), fusion texte idempotente (pas de doublon au 2e run), fusion limites (résolues/restantes), plan de pages (plafond), garde 409, validations route.
4. **Banc d'essai live** (recette) : fixture PDF scanné générée et auto-vérifiée (aller-retour `extractImages`) → import 201 → POST OCR (lang eng) → polling job → done → texte attendu présent dans le doc + limites `kind "ocr"` + confiance affichée ; PDF vectoriel `docs/` → réponse honnête (aucune page à OCRiser) ; mesure RSS next-server avant/pendant/après OCR (critère : pas de kill, retour sous le cap).
5. **Reprise après redémarrage** (CA-1.7) : job OCR `running` avec `startedAt` anti-daté > 10 min → redémarrage serveur → requalifié pending → exécuté (reprise prouvée) ; échec lisible si octets absents (doc pré-existant sans `data`).
6. Recette navigateur (agent-browser) : bouton OCR + progression + résultat + badge, mobile 390 px sans scroll horizontal, 0 erreur console ; captures `test-snapshots/`.

## Risques

1. **Cas limites `extractImages`** (plusieurs images/page, JBIG2, CMYK) : mitigation = plus grande image par page + note honnête par page non OCRisable ; banc réel sur les 2 PDFs `docs/` + fixture.
2. **OOM** : tesseract WASM plusieurs centaines de Mo/page possible — mitigations CA-1.5 (séquentiel + terminate + plafonds) ; RSS mesuré en recette ; si dérive → arrêt Art. 1, pas de rustine.
3. **tesseract.js + bundler Next** : worker thread et scripts embarqués — mitigé par `serverExternalPackages` + import dynamique dans le handler (pattern mammoth/unpdf).
4. **Précision variable** : honnêteté — confiance affichée, bloc marqué, relecture exigée, jamais fusionné au texte natif.
5. **Réseau sandbox intermittent (DNS)** : téléchargement tessdata au cycle d'implémentation uniquement, retry mirroirs (tessdata.projectnaptha.com → raw.githubusercontent tessdata_fast) ; ensuite zéro réseau.
6. **Régression import existant** : DOCX/TXT et PDF vectoriels doivent rester identiques (byte-for-byte sur la réponse hors `data`) — test non-régression dédié.
