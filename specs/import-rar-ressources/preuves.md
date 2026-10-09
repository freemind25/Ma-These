# preuves.md — import-rar-ressources

> Cycle opérationnel (zéro code). Toutes les valeurs ci-dessous sont des mesures réelles du 2026-10-08, serveur local port 3000.

## § 1 — Origine et inventaire (CA-1)

- IM propriétaire : « expliquez moi votre réponse: (reste ouverts: inchangés) puis ajoutez ces ressources ».
- 2 archives déposées dans `upload/` à 17:45 : `doc.rar` (40,9 Mo), `Doc-3.rar` (36,3 Mo).
- `unrar l` : 9 PDF listés (2 + 7), tailles lues dans les entêtes d'archive (spec.md § inventaire).
- Extraction `unrar x` vers `/tmp/staging-import-rar` : **9/9 OK**, tailles extraites = tailles d'inventaire octet-octet (25 772 980 / 14 661 416 / 7 138 323 / 11 447 734 / 8 440 909 / 5 613 685 / 2 072 956 / 6 775 155 / 6 879 572).
- État de la base avant travaux (Prisma) : 7 imports (3 corpus cycle précédent + 4 tests docx) — **aucun des 9 PDF déjà présent**.
- Doublon apparent Harding résolu : exemplaire vrac dans `upload/` (6 879 572 octets, Oct 7) jamais importé en base → 1 seul import (celui de l'archive), doublon disque consigné ici.

## § 2 — T1 état des lieux

- Serveur : HTTP 200 sur `/` ; RSS avant travaux **2,04 Go**.
- SQLite : aucun des 9 noms en base (requête Prisma `importedDoc.findMany`, total 7).

## § 3 — T2 imports réels ×9 (CA-2)

Séquentiels, `POST /api/article-imports` (multipart `file`), ~1 s d'intervalle :

| # | Document | Code | Taille | id ImportedDoc | Détection |
|---|----------|------|--------|----------------|-----------|
| 1 | Canadian Architect Vol 71 No 07 (2026) | 201 | 25 772 980 | cmuzu8kql0000knzhcsldrlfx | scanned 36/36 pages sans texte |
| 2 | Cities of Tomorrow – P. Hall | 201 | 14 661 416 | cmuzu8plx0001knzhaaih3cqj | 6 pages sans texte |
| 3 | Green Wedge Urbanism – F. Lemes de Oliveira | 201 | 7 138 323 | cmuzu8s2x0002knzhztwl64p8 | 13 pages sans texte |
| 4 | Landscape as Urbanism – C. Waldheim | 201 | 11 447 734 | cmuzu8u0b0003knzhhlepe96y | 25 pages sans texte |
| 5 | L'urbanisme face aux villes anciennes – G. Giovanoni | 201 | 8 440 909 | cmuzu8ws90004knzhjk732boq | 10 pages sans texte |
| 6 | Post-pandemic Urbanism – D. Kleilein | 201 | 5 613 685 | cmuzu8yrs0005knzhzjkzta45 | 31 pages sans texte |
| 7 | Smart Cities – G. Halegoua | 201 | 2 072 956 | cmuzu90fq0006knzhxxkwvdkf | 4 pages sans texte |
| 8 | Thinking Planning and Urbanism – B. M. Milroy | 201 | 6 775 155 | cmuzu92ol0007knzh26sd62bg | 1 page sans texte |
| 9 | Urban Theory – A. Harding | 201 | 6 879 572 | cmuzu953s0008knzhytnqfce1 | 1 page sans texte |

- **9/9 → 201**, aucun 413 (plafond 50 Mo conforté, max 25,8 Mo).
- Détection honnête : `scanned: true` partout (au moins une page sans texte), MAIS 8/9 ont une couche texte native complète (300 k–1,68 M caractères) — seuls les Canadian Architect est 100 % image (70 caractères pour 36 pages).
- Réponses JSON archivées : `preuves/import-*.json`.

## § 4 — T3 OCR des pages sans texte (CA-3)

Jobs asynchrones `POST /api/article-imports/ocr`, séquentiels (garde anti-empilement globale), langue adaptée, `maxPages` = nombre de pages sans texte. Le job cible exactement les pages sans texte (`planOcrPages`, src/lib/articles/ocr.ts:126) et fusionne au natif sans l'écraser (CA-1.2 article-ocr-async).

| # | Document | Langue | Résultat | Confiance | Texte avant → après |
|---|----------|--------|----------|-----------|---------------------|
| 1 | Canadian Architect | eng | **done 36/36** | 66 % | 70 → **109 334** |
| 2 | Cities of Tomorrow | eng | done 6/6 | 43 % | 1 675 988 → 1 678 672 |
| 3 | Green Wedge Urbanism | eng | done 13/13 | 34 % | 600 493 → 601 626 |
| 4 | Landscape as Urbanism | eng | done 25/25 | 26 % | 477 830 → 485 524 |
| 5 | L'urbanisme face aux villes anciennes | fra | **failed 10/10** | — | 624 295 (inchangé) |
| 6 | Post-pandemic Urbanism | eng | done 31/31 | 32 % | 300 438 → 304 622 |
| 7 | Smart Cities | eng | done 4/4 | 81 % | 312 110 → 312 716 |
| 8 | Thinking Planning and Urbanism | eng | done 1/1 | 36 % | 831 410 → 831 932 |
| 9 | Urban Theory – Harding | eng | done 1/1 | 34 % | 823 361 → 824 241 |

- **8/9 done** ; **1 failed honnête** : L'urbanisme face aux villes anciennes — « OCR échoué sur toutes les pages (10) — premier motif : aucune image exploitable sur cette page » (job cmuzupuyc000dknzhe9v13n9d). Même diagnostic que Myers (cycle import-corpus-ressources) : les 10 pages « sans texte » (84, 172, 190, 216, 264, 282, 314, 330, 342, 348 sur 352) sont des intercalaires/versos réellement vides — aucun contenu manquant, le texte natif du livre est complet (624 295 caractères).
- Confiances faibles attendues sur planches/couverture (26–43 %) : complément de couverture/crédits, relecture humaine exigée — le cœur des livres est en texte natif fiable.
- **Total corpus 9 nouveaux documents : 5 772 962 caractères exploitables** (mesure Prisma post-OCR).
- Preuves jobs : `preuves/ocr-*.json` (statut, progressNote, result complets) ; suivi live consigné dans les logs de session (progression Page i/N).
- Re-validation passive ocr-rss-purge : 9 jobs enchaînés (127 pages OCR), **RSS après = 2,66 Go**, aucun OOM, aucun redémarrage requis entre les jobs.

## § 5 — T4 hygiène / non-régression (CA-4)

- **Red lines 0 diff** : `git diff --stat HEAD -- <3 fichiers>` vide.
- Aucune modification code : `git status --porcelain` = `M db/custom.db` (état LOCAL attendu, décision import-corpus-ressources — la db corpus avec les 9 PDF ne quitte pas la machine) + `?? specs/import-rar-ressources/`.
- Serveur post-jobs : HTTP 200, RSS 2,66 Go — pas de redémarrage nécessaire.
- Staging d'extraction `/tmp/staging-import-rar` : temporaire, hors dépôt.
- Incident outillage (sans impact) : le script séquentiel lancé via `setsid` est tué par le bac à sable à la fin de l'appel ; les jobs serveur survivent → boucle reprise en synchrone idempotente (les jobs déjà done sont capturés, pas relancés — aucun double job).

## § 6 — Limites consignées dans les documents (champ `limits`)

- Chaque document porte déjà ses limites d'import honnêtes (pages sans texte listées, structure de titres non garantie, bibliographie absente pour Canadian Architect / Smart Cities / Post-pandemic / L'urbanisme face aux villes anciennes).
- Canadian Architect : magazine 100 % image — contenu issu d'OCR à 66 % de confiance, relecture humaine recommandée avant citation.
- L'urbanisme face aux villes anciennes : 10 pages vides non OCR-ables (aucune image exploitable) — diagnostic consigné par le motif du job.

## § 7 — Addendum récupération (2026-10-08, soir) — rollback d'environnement et reconstruction

- **Incident** : l'environnement de travail a été restauré à un point antérieur (base locale revenue à `cba3e42`, du 2026-10-04) entre deux tours de session — effets : askpass purgé, /tmp purgé (backups db perdus), db corpus revenue à son état antérieur (16 docs → 4 tests), `vendor/tessdata` absent du disque local.
- **Récupération git** : tout le travail poussé était sain sur origin (bde1485) → `git reset --hard origin/main` : specs, preuves, worklog, tessdata restaurés.
- **Reconstruction corpus** : les PDF sources ont survécu dans `upload/` (non suivi git) → ré-extraction des 2 RAR (9/9) + ré-import des 12 documents (3 vrac + 9 RAR) : **12/12 → 201** (nouveaux ids `cmv0u9fz4…` à `cmv0uak6z…` — les ids `cmuzu8…` du premier passage sont caducs).
- **Reproductibilité prouvée** : OCR relancé sur les 229 pages — **confiances et longueurs de texte identiques à l'octet près** au premier passage (Canadian Architect 66 % / 109 334 car. ; Cities 43 % ; Cullen 34 % / 62 598 ; Green Wedge 34 % ; Landscape 26 % ; New Yorker 39 % ; Post-pandemic 32 % ; Smart Cities 81 % ; Thinking 36 % ; Urban Theory 34 %) ; les 2 échecs honnêtes se reproduisent au même endroit (Myers p. 251, L'urbanisme p. 348 — intercalaires vides). Le pipeline import+OCR est déterministe.
- **État final** : 16 documents en base, 6 737 798 caractères exploitables, thèse propriétaire intacte (1 thèse), verrou `skip-worktree` reposé sur db/custom.db.
- **Correctifs d'infrastructure au passage** : verrou `.next/dev/lock` retenu par un next-server zombie → kill + suppression du verrou + redémarrage (HTTP 200) ; client Prisma régénéré (`bunx prisma generate`) après rollback (le client généré du point de restauration ignorait ImportedDoc).
