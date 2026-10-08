# Plan — cycle « import-size-limit »

## Groupe A — Config transport (CA-1, CA-3)

- `next.config.ts` : `experimental.proxyClientMaxBodySize: 64 * 1024 * 1024` + commentaire (cause : DEFAULT_BODY_CLONE_SIZE_LIMIT 10 Mo dans next/server/body-streams.js ; 64 Mo = 50 Mo applicatif + en-têtes multipart + marge).

## Groupe B — Plafond applicatif 50 Mo (CA-2)

- `src/lib/articles/extraction.ts` : `MAX_IMPORT_BYTES = 50 * 1024 * 1024`.
- `src/lib/articles/prompts.test.ts` : test épinglé 20 Mo → 50 Mo.
- `src/modules/article-redaction/article-redaction-page.tsx` l.971 : label « 20 Mo max » → « 50 Mo max ».
- `docs/ARCHITECTURE-CONNAISSANCE.md` (≤ 20 Mo → ≤ 50 Mo ; « taille max configurable (20 Mo) » → 50 Mo).

## Groupe C — Recette + convergence (CA-1, CA-4)

- Génération de PDFs de taille contrôlée (pdf-lib + PNG bruité pngjs) : ~12 Mo, ~46 Mo, ~59 Mo.
- Recette live : RSS avant → imports 12/46 Mo = 201 → 59 Mo = refus lisible → GET sans octets → RSS après → dev.log sans « Request body exceeded ».
- preuves.md + worklog + docs + commit/push (red lines 0 diff).
