# Preuves — cycle « import-size-limit » (2026-10-08)

## Implémentation (Groupes A + B)

- `next.config.ts` : `experimental.proxyClientMaxBodySize: 64 * 1024 * 1024` (nombre, commenté) — la clé dépréciée `middlewareClientMaxBodySize` n'est PAS utilisée (config.js la signale « deprecated »).
- `src/lib/articles/extraction.ts` : `MAX_IMPORT_BYTES = 50 Mo` (couvre le scan réel 44,2 Mo) ; `prompts.test.ts` épinglé 50 Mo ; label UI « 50 Mo max » ; `docs/ARCHITECTURE-CONNAISSANCE.md` § 7 bis mis à jour (50 Mo + cause transport).
- `src/app/api/article-imports/route.ts` : **pré-contrôle `content-length`** → 413 lisible AVANT parsing (marge 1 Mo multipart) — ajouté en cours de recette : le 1er passage du cas 75 Mo renvoyait un 500 générique, non conforme à CA-2.
- Tests : 2 nouveaux (413 lisible sans jamais appeler `formData` ; 201 sous la marge) → **78 fichiers / 1 658 verts** ; lint **0 erreur** (236 warnings — dérive PRÉEXISTANTE des 53 commits intermédiaires ; les 5 fichiers du cycle : 0 warning, eslint direct) ; red lines 0 diff.

## Recette live (Groupe C) — fixtures `make-big-pdfs.mjs` (PDF bruité incompressible)

```
serveur relancé avec la nouvelle config → HTTP 200 ; RSS avant : 2 091 796 Ko
① /tmp/big-21.pdf (21,37 Mo ; >10, ≤50) → 201 — pages:2, scanned:true, limites honnêtes (scanned + no-headings)
② /tmp/big-53.pdf (53,43 Mo ; >50, <64) → 413 « Fichier trop volumineux : 53.4 Mo (maximum 50 Mo). »
③ /tmp/big-75.pdf (74,80 Mo ; >64)      → 500 générique (1er passage) → pré-contrôle ajouté
                                          → 413 « Fichier trop volumineux : 74.8 Mo reçus (maximum 50 Mo). »
GET ?id=… → 200 ; réponse = 789 octets (les 22 Mo d'octets seraient ~30 Mo) — octets exclus ✓
dev.log : AUCUN « Request body exceeded 10MB » ; « exceeded 64MB » ×2 UNIQUEMENT sur les uploads 75 Mo
  (cas pathologique documenté — le plafond configuré est actif, le pré-contrôle rend le refus lisible)
RSS après recette : 2 515 928 Ko (corps 75 Mo tamponnés) → redémarrage post-recette → HTTP 200
nettoyage : db/custom.db restaurée HEAD (baseline 4 imports) ; PDFs de recette dans /tmp (non commités)
```

## Verdict — CONVERGÉ (révisable, recette propriétaire attendue)

- **CA-1 ✓** : 21,4 Mo importé (201), aucune troncature ≤ 64 Mo, plus aucun « exceeded 10MB ».
- **CA-2 ✓** : 413 lisible avant parsing à 53,4 Mo ET 74,8 Mo ; plafond 50 Mo annoncé partout.
- **CA-3 ✓** : config 64 Mo commentée, clé dépréciée écartée, dev et prod (server.runtime.prod.js) partagent le chemin.
- **CA-4 ✓** : 1 658 verts, lint 0 erreur, red lines 0 diff, octets exclus, RSS consigné.
- Écart consigné : durcissement 500→413 du cas > 64 Mo décidé et livré EN recette (défaut de recette trouvé puis corrigé — même logique que le correctif de progression du cycle OCR).
