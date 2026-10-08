# Cycle « import-rar-ressources » — ajout au corpus des 2 archives RAR (IM propriétaire, 2026-10-08)

## Origine
Message propriétaire : « expliquez moi votre réponse: (reste ouverts: inchangés) puis ajoutez ces ressources ».
Deux archives déposées dans `upload/` à 17:45 (après le cycle précédent close à 17:33) :
- `doc.rar` (40,9 Mo) → 2 PDF
- `Doc-3.rar` (40,9 Mo enregistré, 48,4 Mo décompressés) → 7 PDF

## Périmètre
Opérationnel (zéro code) — même protocole que le cycle `import-corpus-ressources` (5b75ee8) :
extraction fidèle, import API, OCR des documents scannés, limites consignées, hygiène db locale, preuves + push.

## Inventaire des 9 PDF (unrar l, avant extraction)
| # | Document | Taille | Archive |
|---|----------|--------|---------|
| 1 | Canadian Architect – Vol 71 No 07 October 2026 | 25 772 980 | doc.rar |
| 2 | Cities of Tomorrow – Peter Hall | 14 661 416 | doc.rar |
| 3 | Green Wedge Urbanism – Fabiano Lemes de Oliveira | 7 138 323 | Doc-3.rar |
| 4 | Landscape as Urbanism – Charles Waldheim | 11 447 734 | Doc-3.rar |
| 5 | L'urbanisme face aux villes anciennes – Gustavo Giovanoni | 8 440 909 | Doc-3.rar |
| 6 | Post-pandemic Urbanism – Doris Kleilein | 5 613 685 | Doc-3.rar |
| 7 | Smart Cities – Germaine Halegoua | 2 072 956 | Doc-3.rar |
| 8 | Thinking Planning and Urbanism – Beth Moore Milroy | 6 775 155 | Doc-3.rar |
| 9 | Urban Theory: A Critical Introduction – Alan Harding | 6 879 572 | Doc-3.rar |

## Faits préalables
- État de la base (Prisma, 2026-10-08 18:0x) : 7 imports — les 3 du cycle précédent (Myers, Cullen, New Yorker) + 4 vieux tests docx. **Aucun des 9 PDF n'est déjà importé.**
- Doublon apparent résolu : « Urban Theory » (Harding) existe en vrac dans `upload/` (Oct 7) MAIS n'a jamais été importé en base — taille identique (6 879 572) avec l'exemplaire de l'archive → 1 seul import, doublon disque consigné.
- Tous les fichiers ≤ 25,8 Mo < plafond 50 Mo (cycle `import-size-limit`) — aucun 413 attendu.
- Serveur sain : HTTP 200 sur `/`, RSS 2,04 Go avant travaux.

## Critères d'acceptation
- **CA-1 Extraction fidèle** : 9/9 PDF extraits via unrar vers /tmp/staging-import-rar, tailles octet-octet identiques à l'inventaire de l'archive.
- **CA-2 Imports corpus** : 9/9 POST `/api/article-imports` → 201 ; détection scanned/native honnête par document ; ids consignés dans preuves.md.
- **CA-3 OCR au besoin** : chaque document `scanned: true` reçoit un job OCR asynchrone (langue adaptée : fra/eng, plafond 200 pages), confiance moyenne + limites consignées ; documents natifs : couche texte suffisante, OCR inutile (l'endpoint refuse 422 — comportement attendu).
- **CA-4 Non-régression & hygiène** : 0 diff code + red lines 0 diff ; db corpus = état LOCAL jamais commité ni poussé (décision import-corpus-ressources) ; push specs+worklog uniquement (re-valide la rotation PAT en conditions réelles).

## Tâches
- T1 : état des lieux (serveur, RSS, base) + extraction (CA-1)
- T2 : imports réels ×9 (CA-2)
- T3 : OCR des scannés + limites (CA-3)
- T4 : hygiène + non-régression (CA-4)
- T5 : preuves.md + cochage tasks.md + worklog + commit + push
