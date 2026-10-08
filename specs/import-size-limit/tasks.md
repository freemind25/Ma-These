# Tasks — cycle « import-size-limit »

- [ ] T1 — Config transport : `experimental.proxyClientMaxBodySize: 64 * 1024 * 1024` + commentaire · `next.config.ts` · preuve : diff + recette live > 10 Mo sans « Request body exceeded ».
- [ ] T2 — Plafond applicatif 50 Mo + test épinglé mis à jour · `src/lib/articles/extraction.ts`, `src/lib/articles/prompts.test.ts` · preuve : vitest verts.
- [ ] T3 — Annonces mises à jour (UI + docs) · `article-redaction-page.tsx`, `docs/ARCHITECTURE-CONNAISSANCE.md` · preuve : rg « 20 Mo » = plus d'occurrence active (hors docs historiques).
- [ ] T4 — Recette live 12/46 Mo = 201, 59 Mo = refus lisible, octets exclus, RSS avant/après, dev.log propre · preuves.md.
- [ ] T5 — Convergence : verdict CA-1..4, worklog, commit/push.

*Les cases sont cochées après recette propriétaire (protocole SDD).*
