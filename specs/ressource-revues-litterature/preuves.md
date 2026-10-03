# Preuves — Ressource « revues de littérature » (ajout + digestion)

Horodatage : TZ='Etc/GMT-1' · Session du 2026-10-03.

## P0 — Reconstitution de l'état (avant toute modification)

- `git log --oneline -12` → HEAD = ed495a0 (docs(sdd): verdicts de convergence des 3 cycles).
- `git status --short` après `git config core.fileMode false` → **propre** (le bruit initial était exclusivement des changements de mode 100644→100755, 0 insertion/0 suppression : `git diff HEAD --stat` = « 39 files changed, 0 insertions(+), 0 deletions(-) »).
- 10:00 — `bun run test:run src/lib/ai/knowledge-core.budget.test.ts` → 7 passed (baseline).

## P1 — Identité du PDF Sandelowski retransmis (CA-3.1)

Commandes (exécutées avant tout travail) :

```
pdftotext "upload/Combining Qualitative.pdf" /tmp/sandelowski-check.txt
rg -c "Askpstudyinaustralia" /tmp/sandelowski-check.txt   → 1
rg -n "Res Nurs & Health 23:246-255, 2000" → l.24 : « ® 2000 John Wiley & Sons, Inc. Res Nurs & Health 23:246-255, 2000 »
pdfinfo → Pages: 9
rg "stratified purposeful|quantitizing" → hits (l.512, 529, 532, 608, 806)
```

Conclusion : même article que celui digéré le 28/09 (cycle `ressource-methodes-mixtes` — fiche 2 pages + section noyau `methodology` + `modules/methods-mixtes-sandelowski.md`). **Déjà intégré — aucune duplication créée.** La fiche et la carte existantes restent inchangées.

## P2 — Budget noyau AVANT digestion

```
bun run test:run src/lib/ai/knowledge-core.budget.test.ts
Full core: 62785 chars, ~20928 tokens (budget: 22000)
Largest: methodology (~4470 tok) / Smallest: auto-edition (~224 tok)
Report: 13 modules, 28 modes
7 passed
```

Mesure directe modules (bun, getKnowledgeCore) : full 62 823 chars ; literature-review 6 684 chars ≈ 2 228 tok ; methodology 13 412 chars ≈ 4 471 tok.

## P3 — Budget APRÈS digestion

```
bun run test:run src/lib/ai/knowledge-core.budget.test.ts
Full core: 65382 chars, ~21794 tokens (budget: 22000)
Largest: methodology (~4470 tok) / Smallest: auto-edition (~224 tok)
Report: 13 modules, 28 modes
Test Files 1 passed (1) / Tests 7 passed (7)
```

Mesure directe : literature-review 9 281 chars ≈ 3 094 tok (< méthodologie 4 471 — toujours max ✓). Croissance : +2 559 chars ≈ +853 tok (estimation plan : ~650 — écart documenté, contrainte respectée).
Mode le plus lourd (calcul miroir du capteur) : `directeur` ~16 302 tok (budget 17 000, n'injecte pas literature-review) ; `revue-litterature-slr` ~9 358 tok.

## P4 — lint + suite complète (10:12)

```
bun run lint   → ✖ 231 problems (0 errors, 231 warnings)   [baseline 231 warnings inchangée]
bun run test:run → Test Files 68 passed (68) / Tests 1531 passed (1531)
```

## P5 — Recette navigateur (agent-browser, localhost:3000, serveur dev existant pid 1114)

- Ouverture `/` : les **5 cartes** présentes dans le snapshot (refs e36, e38, e40, e42, e44 — « Agrandir : La revue de littérature comme méthodologie » = e42).
- Note d'environnement : un panneau préexistant « Livrable du test de production » recouvrait le tableau ; fermé via son bouton « Masquer la carte de téléchargement » avant interactions (données de test préexistantes, non liées au cycle).
- Dialogue Snyder ouvert : « Page précédente » **disabled** (page 1) ; clic « Page suivante » → `src=/resources/revue-litterature-snyder-fiche-2.jpg`, compteur « 2 / 2 », « Précédente » activée, « Suivante » disabled ; clic « Précédente » → retour `src=...-fiche-1.jpg`, « Suivante » réactivée (CA-1.1, CA-1.2).
- CA-1.3 : carte Sandelowski ouverte → `src=/resources/methodes-mixtes-sandelowski-fiche-1.jpg`, compteur « 1 / 2 » — contenus existants inchangés ; 4 cartes d'origine intactes dans le snapshot.
- Erreurs console/page : **0 error** (`agent-browser errors` → 0). 2 warnings : logo.png aspect-ratio (préexistant) + hint LCP `loading="eager"` sur la vignette (conseil perf, non bloquant, même classe que l'existant).
- Mobile 390×844 : carte visible, dialogue ouvert (`src=...-fiche-1.jpg`, compteur « 1 / 2 »), fiche lisible, pager accessible.
- Captures : `test-snapshots/ressources-snyder-01-carte.png` (avec panneau préexistant, preuve du rendu de la carte), `-02-dialogue-p1.png`, `-03-dialogue-p2.png`, `-04-mobile-carte.png`, `-05-mobile-dialogue.png`.

## P6 — Lignes rouges + commits + push

- Avant chaque commit : `git diff HEAD --stat -- src/components/layout/app-sidebar.tsx src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts` → **vide** (vérifié à 10:14, avant commit n°1 ; re-vérifié avant chaque commit suivant).
- Commits :
  1. `feat(ressources): fiche de lecture « revue de littérature comme méthodologie » (Snyder 2019) — 2 pages, carte tableau de bord + README`
  2. `docs(ia): digestion Snyder 2019 dans le module literature-review — typologie, 4 phases, qualité, erreurs`
  3. `docs(sdd): cycle ressource-revues-litterature — spec, plan, tasks, preuves + captures`
  4. `docs(sdd): clôture cycle ressource-revues-litterature — worklog + fiche de synthèse`
- Push : voir § Suivi (à compléter après push).
