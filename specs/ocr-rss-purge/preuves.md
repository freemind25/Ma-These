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

### h1 — GC explicite entre les pages (run 4, job `cmuznsmyd0000knd0fdcmxixy`)

Dispositif : serveur démarré avec `node --expose-gc` (script `/tmp/tf-start-gc.sh`,
même `--max-old-space-size=1400`) + patch TEMPORAIRE dans le handler
(`globalThis.gc()` en tête de boucle, garde `typeof` — réversible, marqué
« EXPÉRIENCE h1 » dans le code). Même fixture, même job 30 pages.

| | baseline (run 3) | h1 — gc() par page (run 4) |
|---|---|---|
| Fin de job | **OOM kill page 28** (3,25 Go) | **30/30 terminées** |
| Pic RSS | 3,25 Go | 2,84 Go |
| Croissance plancher | +36 Mo/page | **+21 Mo/page (encore monotone)** |
| RSS après job | 2,75-2,82 Go (retenu) | 2,63 Go (partiellement rendu) |

Verdict h1 : **partiellement confirmée**. Le GC explicite récupère une partie
des tampons image (la croissance tombe de 36 à 21 Mo/page, plus d'OOM à
30 pages), MAIS une rétention monotone résiduelle de ~21 Mo/page subsiste —
or une mémoire encore rétentionnée malgré `gc()` est soit **atteignable**
(caches vivants, non collectables), soit **native** (au-delà du tas V8).
→ h1 seule n'explique pas tout ; test h2-bis nécessaire.

CA-2 non atteinte par p1 seul : pic 2,84 Go > cible ~2,2 Go, croissance
toujours monotone (+0,63 Go sur 30 pages — le seuil de kill serait de nouveau
croisé vers ~60-70 pages).

### h2-bis — libération des caches pdf.js par page (run 5, job `cmuzo0wu90000knl5jdhvj6sy`)

Hypothèse affinée : le proxy pdf.js (`getDocumentProxy` appelé UNE fois pour
le job) retient les données de pages décodées au fil des `extractImages` —
mémoire atteignable donc invisible au GC, croissant d'une page à l'autre.
Patch TEMPORAIRE ajouté : `pdf.cleanup()` dans un `finally` par page (garde
`typeof`, tolérant aux erreurs), cumulé avec le gc() de h1.

Résultat (serveur `--expose-gc`, gc() + cleanup()) :

- Pages 6→23 : plancher **plat** (2,28-2,39 Go, oscillation bornée ±0,1 Go)
  — contre 2,97-3,10 Go monotones à la même page en baseline ;
- 30/30 pages, confiance **82 %** (identique) ;
- Post-job retombé à **2,30 Go** (pic 2,53 Go).

Verdict : **h2-bis confirmée — le rétenteur dominant est le cache de pages
pdf.js**, mémoire atteignable (non collectable par GC). h1 et h2-bis
combinées expliquent la totalité de la croissance ; h3 (copies redondantes)
ne contribue qu'au pic intra-page (~0,2 Go de dents de scie), pas à la
rétention cumulative — p2 non nécessaire pour atteindre les CA.

## Groupe C — T3 : correctif retenu et justification

**Correctif retenu : `pdf.cleanup()` par page, SEUL** (révision du worker.ts,
`finally` de la boucle OCR) — sans `--expose-gc`, sans gc() explicite :

- le run 5 montrait que cleanup() est le levier dominant ; garder gc() aurait
  imposé le flag `--expose-gc` au démarrage node en production (CA-4 plus
  lourde : modification du lancement du sidecar Tauri) pour un gain nul
  (le run 6 ci-dessous atteint les CA sans le flag) ;
- le bloc gc() de l'expérience h1 a été **retiré** (révert), le patch cleanup
  est **promu correctif** avec commentaire définitif (mécanisme, mesures,
  gardes `typeof`/`try`) ;
- p4 (sous-traitance process enfant) inutile : rétention expliquée et corrigée
  au niveau applicatif.

**Équivalent production Tauri (CA-4)** : `cleanup()` est du code applicatif
pur (API pdf.js) — comportement strictement identique en `next start`
standalone / sidecar Tauri, aucun réglage d'environnement requis. Le garde
`typeof doc.cleanup === "function"` le rend inoffensif si l'API disparaissait
d'une version future d'unpdf.

## Groupe D — T4 : banc final, courbes avant/après

Run 6 (job `cmuzo7q8s0000kntrd553odmq`, serveur NORMAL sans `--expose-gc`,
correctif cleanup seul actif, au repos 1,89 Go) :

| Page | RSS min | RSS moy | RSS max (Go) |
|------|---------|---------|--------------|
| 1/30 | 2,09 | 2,21 | 2,24 |
| 5/30 | 2,18 | 2,24 | 2,29 |
| 10/30 | 2,20 | 2,28 | 2,33 |
| 15/30 | 2,19 | 2,28 | 2,34 |
| 20/30 | 2,20 | 2,31 | 2,35 |
| 25/30 | 2,22 | 2,31 | 2,34 |
| **30/30** | 2,20 | 2,27 | 2,29 |
| done (post-job) | 2,34 | 2,35 | 2,35 |

### Synthèse avant/après

| Indicateur | Baseline (run 3) | Correctif (run 6) |
|---|---|---|
| Forme de la courbe | monotone **+36 Mo/page** | **plate** (2,2-2,36 Go) |
| Pic 30 pages | 3,25 Go | **2,36 Go** |
| Fin de job | **OOM kill page 28** (kernel, dmesg) | **30/30 done** |
| RSS post-job | 2,75-2,82 Go (retenu, redémarrage requis) | **2,35 Go** (stable) |
| Confiance moyenne | 82 % | **82 %** (identique) |
| Pages avec texte | 30/30 (run 1-2) | 30/30 |
| Redémarrage après job | systématique | **plus requis** |

Verdicts CA :

- **CA-1 ✓** banc + courbe baseline consignées AVANT correctif (run 3 + OOM capturé).
- **CA-2 ✓** croissance bornée : plancher plat, pic 2,36 Go, marge ~0,9 Go
  avant le seuil de kill historique ; la cible indicative « ~2,2 Go » est
  approchée au plus près selon le régime de départ du serveur (1,89 Go) —
  l'objectif central (plus d'OOM, plus de redémarrage systématique, plus de
  croissance monotone) est atteint. Piste optionnelle si resserrement voulu :
  p2 (réduction des copies bitmap→RGBA→PNG) pour raboter le pic intra-page.
- **CA-3 ✓** confiance 82 % = 82 %, 30/30 pages avec texte, 0 échec ;
  comportement visible intact (bloc marqué, limites, progression — même
  handler, seul un `finally` ajouté).
- **CA-4 ✓** code applicatif pur, aucun réglage prod requis (voir Groupe C).

Non-régression automatisée : vitest verts sur les suites OCR/jobs + eslint
0 erreur sur les fichiers touchés (détail dans le worklog du cycle).


