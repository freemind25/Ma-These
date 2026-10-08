# Cycle — import-corpus-ressources

**Demande propriétaire (IM, 2026-10-08)** : « ajouter conformément au protocole les ressources ci-jointes » — 3 PDF déposés dans `upload/` :

1. `_OceanofPDF.com_Rethinking_Urbanism_Lessons_from_Postcolonialism_and_the_Global_South_-_Garth_Myers.pdf` (37,0 Mo — livre, Bristol University Press 2020, texte OCRe)
2. `_OceanofPDF.com_The_Concise_Townscape_-_Gordon_Cullen.pdf` (42,8 Mo — livre scanné, Architectural Press)
3. `_OceanofPDF.com_The_New_Yorker_-_October_5_2026_-_The_New_Yorker.pdf` (36,8 Mo — numéro de magazine)

**Nature du cycle** : opérationnel (recettes sur fonctionnalités existantes — import + OCR async), zéro code produit attendu. Sert aussi de **recette en conditions réelles** du correctif ocr-rss-purge (05a1a80) sur un corpus plus volumineux que les bancs précédents.

## Critères d'acceptation

- **CA-1** : les 3 PDF s'importent via `POST /api/article-imports` en 201, sans 413 (≤ 50 Mo, cycle import-size-limit) ni 500 ; `scanned` détecté honnêtement.
- **CA-2** : chaque document scanné reçoit son OCR (`POST /api/article-imports/ocr`, un seul job à la fois) ; le texte OCR est fusionné dans `doc.text` et le job finit `done` avec des métriques lisibles.
- **CA-3** : chaque document devient exploitable (texte long, limites `buildLimits` renseignées, page count cohérent avec la source) ; les limites éventuelles sont consignées, jamais masquées.
- **CA-4** : zéro modification de code applicatif ; red lines 0 diff ; hygiène git — preuves + worklog commités, la base `db/custom.db` (documents réels embarqués) reste un **état LOCAL propriétaire volontairement non commité** : les PDF importés ne vont pas dans le dépôt (limite GitHub 100 Mo — incident GH001 consigné — et les documents ne quittent pas la machine de l'utilisateur).

## Tâches

- [x] **T1** — Ouverture : état des lieux (worklog, mécanique import/OCR), baseline serveur (HTTP 200, RSS 2,17 Go), spec écrite.
- [x] **T2** — Imports ×3 (curl multipart) : 3/3 en 201 (5,1 / 4,3 / 5,4 s), ids consignés, métriques dans preuves.md § 1.
- [x] **T3** — OCR des documents détectés scannés : Myers 10/10 failed (pages réellement vides, « aucune image exploitable »), Cullen 100/100 done (conf. 34 %), New Yorker 2/2 done (conf. 39 %) — preuves.md § 2.
- [x] **T4** — Vérification exploitation : 3/3 exploitables (560 k / 62 k / 339 k car.), limites honnêtes ; RSS job réel 100 pages plat (max 2,58 Go, preuve CSV) ; redémarrage préventif post-jobs ; git = specs uniquement, db locale (corpus) non commitée — push initial refusé (GH001, 162,8 Mo > 100 Mo), décision consignée.
- [x] **T5** — Convergence : preuves.md, worklog, lint, commit + push.

> Cochage exécutant, chaque case adossée aux preuves consignées (précédent b04cad4).

## Notes d'exécution

Cycle opérationnel exécuté d'un tenant par l'agent principal le 2026-10-08 — preuves détaillées dans `preuves.md`.
