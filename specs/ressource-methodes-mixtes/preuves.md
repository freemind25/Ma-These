# Preuves — Ressource « méthodes mixtes » (ajout + digestion)

Session du 2026-09-28 · fuseau Etc/GMT-1 · commandes réelles, sorties non reformulées.

## Avant modification (baseline)

```
14:44  bun run test:run src/lib/ai/knowledge-core.budget.test.ts
  Full core: 60370 chars, ~20123 tokens (budget: 22000)
  Largest: methodology (~3665 tok) — Smallest: auto-edition (~224 tok)
  Report: 13 modules, 28 modes
  Test Files  1 passed (1) — Tests  7 passed (7)
```

Capteur avant/après exigé par knowledge-core.budget.test.ts (protocole gouvernance §11-4).

## Groupe A — Assets

```
14:39-14:46  pdftoppm -jpeg -jpegopt quality=92 -r 110 -x 0 -y 34 -W 936 -H 990 upload/res.pdf /tmp/uwa_p1 /tmp/uwa_p2
             (res.pdf = 2 pages = guide UWA ; contrôle visuel Read : chrome Tuta absent, en-tête + logo UWA conservés,
              filigrane « Askpstudyinaustralia » du document reçu conservé — décision tracée dans spec.md)
14:49  chrome-headless-shell --headless --force-device-scale-factor=2 --window-size=920,1190
       --screenshot=/tmp/fiche-p1.png file://…/fiche-sandelowski-p1.html
       → "391085 bytes written" ; idem p2 → "463740 bytes written"
14:51  ffmpeg -i /tmp/fiche-pN.png -q:v 5 /tmp/fiche-pN.jpg ; copies → public/resources/
       ffprobe :
         methodes-methodologie-uwa-1.jpg          935x990   231806 o
         methodes-methodologie-uwa-2.jpg          935x990   294053 o
         methodes-mixtes-sandelowski-fiche-1.jpg  1840x2380 383103 o
         methodes-mixtes-sandelowski-fiche-2.jpg  1840x2380 454973 o
       (contrôles visuels Read des 4 images : contenu complet, crédits visibles)
```

## Groupe B/C — Modifications (diff relu après chaque édition)

- `resources-section.tsx` : typage Resource/ResourcePage, ResourcePager (useState, compteur aria-live, boutons désactivés aux bornes), pastille « N pages » ; 2 nouvelles entrées ; les 2 entrées d'origine inchangées en contenu (1 page chacune → pas de pagination).
- `knowledge-core.ts` : 2 sections ajoutées à METHODOLOGY_MODULE (l.451-463), aucune suppression — les ancres des tests de digestion (Creswell, SI, Yin) restent intactes.
- README.md, AGENTS.md, ARCHITECTURE-CONNAISSANCE.md : diffs relus (compteurs 11→13, sources + Sandelowski/STUDYSmarter, arbre 9 modules, ligne methodology, notes de mesure).

## Groupe D — Vérifications

```
14:55  bun run lint  → ✖ 230 problems (0 errors, 230 warnings)   [warnings préexistants, cf. FICHE_SYNTHESE]
14:55  bun run test:run → Test Files 63 passed (63) — Tests 1452 passed (1452)
15:0x  bun run test:run src/lib/ai/knowledge-core.budget.test.ts (après digestion)
  Full core: 62785 chars, ~20928 tokens (budget: 22000)
  Largest: methodology (~4470 tok) — Smallest: auto-edition (~224 tok)
  Test Files  1 passed (1) — Tests  7 passed (7)
  Δ : +2415 chars / +805 tok core ; méthodologie +805 tok (marge restante 530 tok sous le plafond 5 000)
```

### Recette navigateur (agent-browser)

```
set viewport 1440 900 ; open http://localhost:3000 ; wait --load networkidle
snapshot -i : 4 boutons « Agrandir : … » (e36, e38, e40, e42) ; get count "img[src*='/resources/']" → 4
UWA : click @e40 → wait --text "1 / 2" OK ; find role button --name "Page suivante" click → wait --text "2 / 2" OK ;
      eval document.querySelector('[role=dialog] img')?.src → "/resources/methodes-methodologie-uwa-2.jpg"
Sandelowski : ouverture carte 4 → "1 / 2" ; Page suivante → "2 / 2" ;
      eval src → "/resources/methodes-mixtes-sandelowski-fiche-2.jpg"
errors : aucune ; console : uniquement [Fast Refresh] rebuild (dev) ; Escape ferme le dialogue (vérifié)
mobile : set viewport 390 844 → get count "img[src*='/resources/']" → 4 ; capture
Captures : test-snapshots/ressources-dashboard-desktop.png, ressources-uwa-dialog-p1.png,
           ressources-uwa-dialog-p2.png, ressources-sandelowski-dialog-p2.png, ressources-dashboard-mobile.png
dev.log : aucune erreur/warning runtime après les visites (grep error|warn|fail = vide sur les dernières lignes)
```

### Lignes rouges

```
git diff HEAD --stat -- src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts src/components/layout/app-sidebar.tsx
→ (sortie vide) — avant chaque commit.
```

## Suivi

```
15:59  git fetch origin (sans identifiants) → fatal: could not read Username (attendu)
16:04  push avec askpass éphémère (mode 700, supprimé après usage) :
       origin/main = dd83ae5 | HEAD = b1cdba6 → merge-base --is-ancestor OK (« FAST-FORWARD OK »)
       git push origin main → « dd83ae5..b1cdba6  main -> main »
       git ls-remote origin refs/heads/main → b1cdba626357784cfd1a73e7264c32f884252aaa
       Commits poussés : b358b60 (feat dashboard), 094edd8 (docs ia), b1cdba6 (docs sdd)
16:0x  consignation du push : présent § Suivi + FICHE_SYNTHESE.md (session du 2026-09-28)
```

## Écarts signalés (Article 4) — non corrigés, hors périmètre

1. AGENTS.md l.170+ (tableau « Mode | Modules injectés | Tokens ≈ ») : mesures historiques (directeur « 2 186 ») incompatibles avec le capteur (~15 300 tok pour le mode le plus lourd). Ligne de statut au-dessus du tableau mise à jour avec renvoi au capteur ; tableau non réécrit.
2. docs/ARCHITECTURE-CONNAISSANCE.md §4 : colonne « Tokens » des 12 autres modules = estimations historiques ; note de mesure ajoutée sous le tableau.
3. docs/ARCHITECTURE-CONNAISSANCE.md §2 : « 19 spécialisations » et la liste « …(13 autres) » sont caduques (26-28 modes mesurés par le capteur) — non retouché.
4. Filigrane « Askpstudyinaustralia » présent dans le document transmis (page 1 du guide UWA) : conservé (forme originale reçue), signalé au propriétaire.
