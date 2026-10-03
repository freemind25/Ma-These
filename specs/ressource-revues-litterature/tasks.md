# Tasks — Ressource « revues de littérature » (ajout + digestion)

## Groupe A — Assets statiques [BLOQUANT pour Groupe B]
- [x] T1 — Composer la fiche de lecture Snyder (2 pages HTML 920×1190 → capture chromium headless 2× → ffmpeg JPG) → `public/resources/revue-litterature-snyder-fiche-{1,2}.jpg` + sources HTML versionnées `docs/pdf-sources/ressources/fiche-snyder-p{1,2}.html` · preuve : ffprobe dimensions, contrôle visuel Read

## Groupe B — Frontend / UI
- [x] T2 — 5e entrée typée dans `src/components/dashboard/resources-section.tsx` (titre, description, crédit Snyder JBR 104, 2 pages, pastille « 2 pages », pagination existante) · preuve : lint 0 erreur + recette navigateur CA-1.1/1.2/1.3
- [x] T3 — README : vignette + crédit Snyder dans la section Ressources pédagogiques · preuve : diff relu

## Groupe C — IA / digestion (processus §7 ARCHITECTURE-CONNAISSANCE)
- [x] T4 — `knowledge-core.ts` : section « Typologie et conduite des revues (Snyder 2019) » dans `LITERATURE_REVIEW_MODULE` + ligne source en tête de fichier · preuve : capteur budget avant/après (20 941 → ≤ 21 700 tok ; literature-review ≤ ~2 900 tok ; méthodologie toujours max)
- [x] T5 — Source brute : `modules/revue-litterature-snyder.md` (détail + provenance, style house) · preuve : fichier créé
- [x] T6 — Sync factuelle docs : AGENTS.md (ligne budget = capteur) + ARCHITECTURE-CONNAISSANCE.md (date, arbre modules +1 fichier) · preuve : diffs relus

## Groupe D — Vérification & convergence
- [x] T7 — `bun run lint` (0 erreur) + `bun run test:run` complet (1531+ tests verts) · preuve : sorties réelles preuves.md
- [x] T8 — Recette navigateur agent-browser (desktop + mobile 390 px : 5 cartes, dialogue Snyder, pagination 1/2→2/2, erreurs console/page) · preuve : captures test-snapshots/ + sorties
- [x] T9 — Lignes rouges 0 diff avant chaque commit · preuve : git diff HEAD --stat = vide
- [x] T10 — Commits conventionnels + push + ls-remote · preuve : preuves.md § Suivi

## Groupe E — Clôture
- [x] T11 — worklog.md (append) + FICHE_SYNTHESE.md · preuve : git log
