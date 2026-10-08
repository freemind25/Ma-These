# Tasks — OCR des pages scannées + exécution asynchrone

Groupes par nature (Schéma → Backend → Frontend → Tests/Recette). Les cases sont cochées **après recette propriétaire**, pas par l'agent.

*Note : cochage délégué par le propriétaire (IM 2026-10-08 « prenez la décision concernant le point 4 et 5 ») — chaque case adossée aux preuves consignées du cycle (commits Groupes A-D, recettes réelles n° 1-3 dont VRAI SCAN, verdict CONVERGÉ, docs § 7 bis).*

## Groupe A — Schéma [BLOQUANT]

- [x] T1 — Ajouter `data Bytes?` à `ImportedDoc` (octets du PDF d'origine, null pour DOCX/TXT) · `prisma/schema.prisma` · preuve : `git diff` (colonne nullable seule) + `bun run db:push` + comptages de survie avant/après toutes tables + serveur relancé HTTP 200.
- [x] T2 — Ajouter `progress Int?` et `progressNote String?` à `Job` (progression par page, handlers existants intacts) · `prisma/schema.prisma` · preuve : même protocole que T1 (un seul push pour T1+T2).

## Groupe B — Backend / routes API [DÉPEND DE Groupe A]

- [x] T3 — Installer `tesseract.js` + `pngjs` (+ `@types/pngjs` dev), marquer `tesseract.js` dans `serverExternalPackages`, télécharger et committer `vendor/tessdata/{fra,eng,ara}.traineddata.gz` (modèle 4.0.0) · `package.json`, `next.config.ts`, `vendor/tessdata/` · preuve : `bun pm ls` + tailles réelles des 3 fichiers + script de chargement hors ligne réussi (zéro réseau).
- [x] T4 — Import : accepter un PDF entièrement scanné (201 au lieu de 422 quand `scanned=true`), stocker les octets (`data`) pour les PDFs, exclure les octets de la réponse `GET ?id`, texte de la limite « scanned » mis à jour (OCR désormais disponible, plafond annoncé) + fixture PDF scanné auto-vérifiée dans `specs/article-ocr-async/fixtures/` · `src/app/api/article-imports/route.ts`, `src/lib/articles/extraction.ts`, `specs/article-ocr-async/fixtures/` · preuve : tests vitest (dont non-régression DOCX/TXT/PDF vectoriel) + curl import fixture 201 + octets présents en base.
- [x] T5 — Chaîne OCR : module pure `ocr.ts` (bitmap→PNG, sélection image principale, réduction entière, construction du bloc OCR marqué, fusion texte idempotente, fusion limites kind "ocr", plan de pages plafonné) + `ocr-engine.ts` (worker tesseract par page, langPath local, terminate systématique) + handler `article-import-ocr` dans le registre (progression par page, échecs par page honnêtes) · `src/lib/articles/ocr.ts`, `src/lib/articles/ocr-engine.ts`, `src/lib/jobs/worker.ts` · preuve : `bun run test:run` verts (nouveaux tests unitaires) + lint 0 erreur.
- [x] T6 — Routes OCR : `POST /api/article-imports/ocr` (validations zod : importedDocId + lang fra/eng/ara ; garde anti-empilement GLOBAL 409 ; erreurs 404/415/422 lisibles) et `GET ?importedDocId=` (dernier job + progression) · `src/app/api/article-imports/ocr/route.ts` · preuve : tests route (201/409/400/404/415) + curl réel 201.

## Groupe C — Frontend / UI [DÉPEND DE Groupe B]

- [x] T7 — Contrôle OCR sur les cartes de sources importées : sélecteur de langue (fr/en/ar), bouton « Lancer l'OCR » avec plafond annoncé, progression par page (polling), rafraîchissement du document au done (texte/bloc OCR visible dans l'aperçu), badge OCR via limites, messages d'erreur honnêtes (409 un seul OCR à la fois, échec lisible) + mention OCR dans la traçabilité (label source) · `src/modules/article-redaction/article-redaction-page.tsx`, `src/lib/articles/sources-server.ts` · preuve : lint 0 erreur + recette navigateur (desktop + 390 px, captures) + 0 erreur console.

## Groupe D — Tests / recette / convergence [DÉPEND DE Groupe C]

- [x] T8 — Banc d'essai live de bout en bout : fixture scannée → import → OCR eng → done → texte attendu + limites + confiance ; PDF vectoriel → réponse honnête ; RSS next-server avant/pendant/après (critère explicite) ; reprise après redémarrage (job anti-daté > 10 min requalifié) ; échec lisible doc sans octets · preuves : sorties curl réelles + mesure RSS dans `preuves.md` · CA-1.1/1.2/1.3/1.5/1.6/1.7.
- [x] T9 — Documentation et convergence : `docs/ARCHITECTURE-CONNAISSANCE.md` § 7 bis (OCR asynchrone livré), verdict de convergence dans `specs/article-ocr-async/`, FICHE_SYNTHESE, worklog, push (red lines 0 diff) · preuve : diff docs + verdict N/N CA.
