# Tasks — Ressource « méthodes mixtes » (ajout + digestion)

## Groupe A — Assets statiques [BLOQUANT pour Groupe B]
- [x] T1 — Recadrer les 2 pages du guide UWA depuis `upload/res.pdf` (pdftoppm 110 dpi, chrome Tuta supprimé) → `public/resources/methodes-methodologie-uwa-{1,2}.jpg` · preuve : ffprobe 935×990, contrôle visuel Read
- [x] T2 — Composer la fiche de lecture Sandelowski (2 pages HTML → capture chromium headless 2× → ffmpeg JPG) → `public/resources/methodes-mixtes-sandelowski-fiche-{1,2}.jpg` + sources HTML versionnées `docs/pdf-sources/ressources/` · preuve : ffprobe 1840×2380, contrôle visuel Read

## Groupe B — Frontend / UI
- [x] T3 — Typage `Resource`/`ResourcePage` + pagination multi-pages (`ResourcePager`, compteur, pastille « N pages », aria-labels) dans `src/components/dashboard/resources-section.tsx`, 2 nouvelles entrées · preuve : lint 0 erreur + agent-browser CA-1.1/1.2/2.1/2.2/2.3
- [x] T4 — README : section Ressources pédagogiques (4 vignettes, crédits étendus UWA + Sandelowski, renvoi au socle) · preuve : rendu GitHub différé, diff relu

## Groupe C — IA / digestion (processus §7 ARCHITECTURE-CONNAISSANCE)
- [x] T5 — `knowledge-core.ts` : sections « Méthodes mixtes — combinatoire technique (Sandelowski 2000) » et « Vocabulaire et préparation (STUDYSmarter, UWA) » dans `METHODOLOGY_MODULE` · preuve : capteur budget avant/après (20 123 → 20 928 tok ; méthodologie 3 665 → 4 470 < 5 000, toujours max)
- [x] T6 — Sources brutes : `modules/methods-mixtes-sandelowski.md` + `modules/methodes-methodologie-uwa.md` (détail + provenance) · preuve : fichiers créés, style house methodology-design.md
- [x] T7 — Sync factuelle docs : AGENTS.md (13 modules, sources, ligne budget = capteur) + ARCHITECTURE-CONNAISSANCE.md (date, arbre 9 modules, ligne methodology, note de mesure) · preuve : diffs relus

## Groupe D — Vérification & convergence
- [x] T8 — `bun run lint` (0 erreur) + `bun run test:run` complet (1452/1452) · preuve : sorties réelles preuves.md
- [x] T9 — Recette navigateur agent-browser (desktop + mobile 390 px, dialogues, pagination, erreurs console/page) · preuve : 5 captures test-snapshots/ + sorties
- [x] T10 — Lignes rouges 0 diff avant chaque commit · preuve : git diff HEAD --stat = vide
- [x] T11 — Commits conventionnels + push + ls-remote · preuve : preuves.md § Suivi

## Groupe E — Clôture
- [x] T12 — worklog.md (append) + FICHE_SYNTHESE.md · preuve : git log
