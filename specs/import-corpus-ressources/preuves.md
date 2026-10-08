# Preuves — cycle import-corpus-ressources

Date : 2026-10-08 · Serveur : HTTP 200 avant/après (redémarrage préventif post-jobs) · Zéro code modifié.

## 1. Imports (T2) — `POST /api/article-imports`

| Ressource (upload/) | Taille | HTTP | Durée | id (fin) | Pages | `scanned` | textLength |
|---|---|---|---|---|---|---|---|
| `_OceanofPDF.com_Rethinking_Urbanism_…_Garth_Myers.pdf` | 37,0 Mo | **201** | 5,12 s | `h20tpg` | 252 | true (10 p. vides) | 560 418 |
| `_OceanofPDF.com_The_Concise_Townscape_…_Gordon_Cullen.pdf` | 42,8 Mo | **201** | 4,29 s | `xjru5p` | 100 | true (100 p. vides) | 198 |
| `_OceanofPDF.com_The_New_Yorker_-_October_5_2026_….pdf` | 36,8 Mo | **201** | 5,45 s | `nhx5wn` | 74 | true (2 p. vides) | 337 773 |

- **CA-1 ✓** : 3/3 en 201, aucun 413 (plafond 50 Mo du cycle import-size-limit conforté : 42,8 Mo passent en direct) ni 500 ; détection `scanned` honnête (pages sans texte extractible < 10 car. listées dans les limites).

## 2. OCR asynchrone (T3) — `POST /api/article-imports/ocr`

| Doc | Job | Résultat | Détail |
|---|---|---|---|
| Myers | `cmuzsd4n60003kn6a817s6ec4` | **failed** (honnête) | 10/10 pages « aucune image exploitable » → pages réellement **vides** (intercalaires/versos blancs du livre), aucun contenu manquant ; texte intégral déjà présent (560 k car. / 242 p. de contenu) |
| Cullen | `cmuzsh3s70004kn6af191divy` | **done** | 100/100 pages OCR (eng), confiance moyenne **34 %** — scan ancien de qualité médiocre (référence Dupuy : 82 %) → limite `ocr` consignée, **relecture humaine exigée** ; textLength après fusion : 62 598 |
| New Yorker | `cmuzso0qf0005kn6a4txspz6f` | **done** | 2/2 pages (couvertures), confiance 39 % ; textLength : 339 024 |

- Garde anti-empilement respectée (jobs séquentiels, aucun 409).
- **CA-2 ✓** : chaque page vide d'un document scanné a reçu sa tentative OCR ; échec comme succès restent lisibles et motivés.

## 3. RSS en conditions réelles (re-validation `ocr-rss-purge`, 05a1a80)

Job réel de **100 pages** (Cullen) échantillonné par `specs/ocr-rss-purge/banc/echantillonneur.mjs` (`--job-id`, 1 s) :

- **181 échantillons** — départ 2,39 Go, **max 2,58 Go**, fin 2,28 Go, dernière valeur au `done` : 2,33 Go.
- Courbe **plate** sur 100 pages (préuve : `preuves/rss-ocr-cullen-100p.csv`, 181 lignes horodatées alignées sur « Page i/100 »).
- **Aucun OOM, aucun redémarrage requis pendant le job** — le correctif tient au-delà des bancs de 30 pages.
- RSS serveur après les 3 jobs (2,98 Go) → **redémarrage préventif** post-recette (hygiène établie) : HTTP 200, RSS 2,36 Go.

## 4. État final d'exploitation (T4)

| Doc (fin d'id) | textLength final | Limites (`buildLimits`) | Verdict |
|---|---|---|---|
| `h20tpg` (Myers) | 560 418 | `scanned` (10 p. vides listées), `no-headings` | Exploitable — couche texte native complète |
| `xjru5p` (Cullen) | 62 598 | `ocr` (relecture humaine), `no-headings`, `no-biblio` | Exploitable sous réserve — texte OCR bruité (conf. 34 %) |
| `nhx5wn` (New Yorker) | 339 024 | `ocr` (2 couvertures), `no-headings`, `no-biblio` | Exploitable — couche texte native + couvertures OCR |

- **CA-3 ✓** : 3/3 documents exploitables ; chaque limite est consignée honnêtement, rien n'est masqué.
- **CA-4 ✓** : aucun fichier code modifié, red lines 0 diff ; le push porte uniquement `specs/` + `worklog.md`.

## 5. Incident de push et décision d'hygiène (consignée)

- Premier push refusé par GitHub : **GH001 — « File db/custom.db is 162.80 MB; this exceeds GitHub's file size limit of 100.00 MB »** (les 3 PDF sont embarqués en base, colonne `data Bytes?` du cycle article-ocr-async).
- **Décision** : la base avec le corpus importé est un **état LOCAL propriétaire** — elle n'est jamais commitée ni poussée. Motifs cumulés : (a) limite technique GitHub 100 Mo/blob, (b) les documents PDF ne quittent pas la machine de l'utilisateur (le dépôt ne porte que code + preuves). Cohérent avec l'hygiène des cycles précédents (« db restaurée HEAD — imports non commités ») ; ici la base locale est **conservée telle quelle** (les documents restent dans l'application), seule la version git n'est pas suivie.
- `git status` post-convergence affiche donc `M db/custom.db` en permanence : c'est l'état attendu et documenté.

## 6. Verdict

**CONVERGÉ** — les 3 ressources demandées sont dans le corpus et exploitables ; le correctif ocr-rss-purge est re-validé en conditions réelles (100 pages, courbe plate). Révisable si le propriétaire constate autre chose en recette UI.
