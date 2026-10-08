# Preuves — cycle « ocr-rss-purge »

(rempli aux Groupes A-D — mesure AVANT correctif d'abord)

## Groupe A — T1 : banc RSS par page, baseline AVANT tout correctif (CA-1)

Date : 2026-10-08, 14:41 → 14:50 (UTC). Aucune modification du code applicatif
(l'échantillonnage est externe, aligné sur `progressNote` écrit par le handler à
chaque page — CA-1.1). Serveur de dev réglé comme en exploitation :
`NODE_OPTIONS="--max-old-space-size=1400 --enable-source-maps"`.

### Dispositif

- **Fixture réelle** : « Lurbanisme des réseaux - Copie.pdf » (scan Dupuy,
  44 231 436 octets, 69 pages sans couche texte) réimporté en recette live
  via `POST /api/article-imports` → 201 en 4,6 s (confirme au passage le
  correctif du cycle import-size-limit : 44 Mo passent en un seul import).
- **Job** : `POST /api/article-imports/ocr {importedDocId, lang: "fra"}` —
  plafond 30 pages (défaut), le scan offrant 69 pages vides.
- **Échantillonneur** : `specs/ocr-rss-purge/banc/echantillonneur.mjs`
  (processus externe, 1 lecture/s de `/proc/<pid>/status` VmRSS + lecture du
  `progressNote` du job en base — filtre `--job-id` ajouté après une première
  fausse détection de fin sur un ancien job « done » des recettes du
  propriétaire, 09:40/09:42 ; CSV conservé : `baseline-avant-run1-incomplete.csv`).
- **Serveur** : redémarré proprement avant la mesure (kill explicite wrapper +
  next-server — leçon start-stop-daemon ; stabilisation 55 s).

### Courbe baseline (run 3, job `cmuzniig40000kn4hbob68c5v`)

RSS au repos : 1,97 Go (après stabilisation post-compilation `/`).
RSS moyen par page (extrait du CSV `banc/baseline-avant.csv`) :

| Page | RSS min | RSS moy | RSS max (Go) |
|------|---------|---------|--------------|
| 1/30 | 2,03 | 2,22 | 2,26 |
| 3/30 | 2,20 | 2,28 | 2,37 |
| 6/30 | 2,39 | 2,50 | 2,57 |
| 9/30 | 2,59 | 2,68 | 2,72 |
| 12/30 | 2,65 | 2,74 | 2,77 |
| 15/30 | 2,68 | 2,80 | 2,84 |
| 18/30 | 2,81 | 2,91 | 2,95 |
| 21/30 | 2,91 | 3,02 | 3,05 |
| 24/30 | 2,99 | 3,10 | 3,13 |
| 27/30 | 3,07 | 3,13 | 3,19 |
| **28/30** | 3,05 | 3,07 | **3,10 → GONE** |

- Croissance : **+36 Mo/page en moyenne, plancher monotone** (les dents de scie
  intra-page ≈ +0,15-0,25 Go montent puis redescendent un peu — le
  `terminate()` du worker tesseract libère le WASM — mais le **plancher** d'une
  page au suivant ne redescend jamais).
- Forme : linéaire, sans palier → rétention cumulative, pas un pics isolés.

### OOM KILL capturé (gravité réévaluée)

```
oom-kill: constraint=CONSTRAINT_NONE, global_oom, task=next-server (v1, pid=13984
Out of memory: Killed process 13984 (next-server (v1))
  total-vm: 41 067 324 kB, anon-rss: 3 247 264 kB
```

- **Le kernel a tué le serveur à la page 28/30, RSS 3,25 Go** (dmesg 14:50:35).
- Conséquence mesurée : le job reste « running » en base, le travail des 27
  pages déjà OCRisées est **perdu** (le bloc n'est fusionné qu'en fin de job) ;
  marqué `failed` manuellement avec motif consigné pour éviter le re-run auto
  du worker (`requeueStaleJobs`).
- Le défaut ② n'est donc plus seulement « redémarrage systématique
  contraignant » : **un job OCR de 30 pages peut mourir OOM** sur la box 4 Go
  même démarrée fraîche, et perdre son travail.

### Non-retombée (2e constat, runs 1-2)

- Run 1 (14:36, 30/30 pages, confiance 82 %) : RSS 1,95 → **2,75 Go** après job
  (stabilisé), non retombé sans redémarrage.
- Run 2 (14:41, 30/30, confiance 82 %) : post-job **2,82 Go**.
- La mémoire n'est rendue ni au GC, ni à l'OS : croissance monotone confirmée
  sur trois runs indépendants.

### Précision (référence CA-3)

Runs 1-2 (identiques, 30 pages, fra) : confiance moyenne **82 %**, 30/30 pages
avec texte, 0 échec — valeur de référence pour la comparaison après correctif.

## Groupe B — T2 : départage des hypothèses par mesure

(à venir — h1 GC explicite inter-pages, h2 rétention native, h3 copies)
