# Tasks — Paper2Code import PDF

## Groupe A — Backend / routes API
- [ ] T1 — Créer `POST /api/paper2code/extract-pdf` (FormData `file`, PDF seul) réutilisant
      `extraction.ts` : pré-contrôle content-length, 415 format, 413 taille, 415 magic
      bytes, extraction unpdf par pages, détection scanné, réponse
      `{ text, pages, chars, warnings }` · preuve : curl 200 avec `docs/NOTE-PRESENTATION.pdf`,
      curl 413 avec fichier > 50 Mo, curl 415 avec TXT renommé .pdf, curl 400 sans fichier

## Groupe B — Frontend / UI [DÉPEND DE Groupe A]
- [ ] T2 — Ajouter la zone d'import PDF (drag & drop + clic, input hidden `.pdf`) dans la
      carte « Article source » de `paper2code-page.tsx` : états importingPdf / importedFile /
      dragOver, POST FormData, pré-remplissage `paperText`, badge fichier + pages +
      caractères, avertissements (scanné / texte non extractible), toasts succès/erreur,
      CardDescription mise à jour (« Importez un PDF ou collez le texte… ») · preuve :
      `bun run lint` 0 erreur + recette navigateur (dev 3001, agent-browser) import réel

## Convergence — 2026-11-13

Critères d'acceptation satisfaits : 7/7 (CA-1.1 à CA-1.7 — preuves curl + recette
navigateur réelle avec captures).
Écart au plan : 1 — règle rate-limit dédiée ajoutée (`src/lib/rate-limit.ts`,
12 req/1 min pour extract-pdf avant le pattern générique paper2code 5 req/5 min),
annoncée et documentée dans plan.md §Impacts transverses.
Dette introduite : aucune. Hors périmètre conservé : pas de persistance, pas d'OCR,
pas de DOCX/TXT.
Verdict : CONVERGÉ (recette propriétaire en attente — les cases ne sont pas cochées
avant acceptation).
