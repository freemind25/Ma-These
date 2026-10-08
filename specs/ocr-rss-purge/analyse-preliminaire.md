# Analyse préliminaire — RSS OCR non purgé entre pages (défaut ②)

Date : 2026-10-08 · Déclencheur : « commencez le traitement par ordre prioritaire » (IM) · Statut : ouverture — zéro code

## 1. Constat (consigné en recette n° 3)

- RSS next-server : 1,66 Go → **3,0 Go** après 31 pages OCR (pic max historique), non retombé ; redémarrage systématique après gros job OCR requis ; seuil de kill box ~2 Go (dmesg : 2 next-server tués à ~2 Go en compile).
- Impact : risque d'OOM sur jobs longs ; exploitation contraignante.

## 2. État du code (sourcé)

- `src/lib/articles/ocr-engine.ts` : 1 page = 1 worker tesseract + `terminate()` systématique — déjà correct.
- `src/lib/articles/ocr.ts` : bitmap → RGBA (Uint8ClampedArray) → PNG (Buffer) — **copies multiples** de plusieurs Mo par page.
- `unpdf.extractImages` : bitmaps extraits par page (pdf.js).
- Handler : séquentiel strict, plafond 30 pages/job.

## 3. Hypothèses (à départager par mesure, pas par intuition)

- **h1 — pression GC insuffisante** : entre deux pages, aucun point de collecte ; V8 conserve les tampons image (le heap cap 1400 Mo pousse le RSS via buffers natifs/externes).
- **h2 — mémoire WASM/native des workers** : `terminate()` libère le worker mais la mémoire du processus peut ne pas être rendue à l'OS (fragmentation).
- **h3 — copies redondantes** : RGBA + PNG + encodage = ~3-4× la taille du bitmap par page en vie simultanée.

## 4. Pistes (testées une à une sur banc mesuré)

- **p1 — point de GC explicite entre pages** : `--expose-gc` + `global.gc()` après chaque page (équiv. prod Tauri : NODE_OPTIONS du packaging + instrumentation — pas un artefact dev-only).
- **p2 — réduire les copies** : construire le PNG directement depuis le bitmap, réutiliser un buffer de travail.
- **p3 — instrumentation** : échantillonnage RSS par page (script de banc) pour objectiver chaque piste — la mesure PRÉCÈDE le correctif.
- **p4 — si h2 confirmé** : sous-traiter l'OCR à un processus enfant court (une page = un process) — plus lourd, dernier recours.

## 5. Méthode de verdict

Banc : job OCR ≥ 30 pages (fixture + gros PDF bruité du cycle import-size-limit), RSS échantillonné avant/pendant/après ; non-régression précision (fixture crénelée/lissée, confiances comparables) ; critère CA-2 borné.
