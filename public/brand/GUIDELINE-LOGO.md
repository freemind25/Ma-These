# Guideline logo — Ma Thèse (v3 « Orange & Bleu », adoptée 2026-11-08)

Master vectoriel unique : `public/brand/symbol-color.svg` (viewBox 0 0 256 256, un seul
`<path fill-rule="evenodd">` — détails en vrais trous, reproductible une couleur/broderie).

Palette « Orange & Bleu » choisie et validée par M. SADI (essai v3 → adoption).
Géométries inchangées depuis v2 ; seuls remplissages/dégradés et tuile diffèrent.
Le lockup porte le crédit de conception **« Designed by M.SADI »** (vectorisé,
DejaVu Sans — licence Bitstream Vera, usage logo autorisé).

## Variantes

| Fichier | Usage |
|---|---|
| `symbol-color.svg` | Défaut (dégradé bleu nuit→bleu→orange→pêche, userSpace) |
| `symbol-mono.svg` | Une couleur (bleu nuit #014378) : impression, gravure, favicon mono |
| `symbol-reversed.svg` | Fond sombre (crème #F0EFD2, trous réels) |
| `symbol-color-small.svg` | < 48 px : œillet/fente/lignes agrandis, 2 lignes de doc |
| `lockup.svg` | Horizontal : symbole + wordmark « Ma**Thèse** » + tagline 2 lignes + crédit |
| `lockup-on-dark.svg` | Lockup fond sombre : tuile crème + wordmark crème/pêche + crédit |
| `tile.svg` | Icône app : tuile crème r=58/256 + symbole 74 % |

## Palette (v3 — équité de forme conservée)

| Rôle | HEX |
|---|---|
| Bleu nuit (encre, wordmark « Ma », mono, crédit sur clair) | #014378 |
| Bleu (corps du dégradé, tagline) | #1A659D |
| Orange (signature chaude) | #FF6B35 |
| Pêche (transition douce, crédit sur sombre) | #F7C59F |
| Crème (tuile, reversed) | #F0EFD2 |

Dégradé symbole : x1=28,y1=80 → x2=228,y2=230 (userSpaceOnUse),
stops 0 #014378 / 0.55 #1A659D / 0.80 #FF6B35 / 1 #F7C59F.
Dégradé wordmark « Thèse » : x1=422 → x2=712, stops 0 #1A659D / 0.62 #FF6B35 / 1 #FF6B35.
Dégradé wordmark sombre : 0 #F7C59F / 0.62 #FF6B35 / 1 #FF6B35.

## Crédit « Designed by M.SADI »

- Contours vectorisés (DejaVu Sans Regular ≈ 11 px), jamais de `<text>` live.
- Position : sous la tagline, aligné sur son bord gauche (lockup clair : baseline y=276/320 ;
  lockup sombre : y=212/320, sous le wordmark).
- Couleur : #014378 sur clair · #F7C59F sur sombre.
- Le crédit fait partie du lockup officiel — ne pas le recadrer ni le recolorer.

## Icônes applicatives (régénérées depuis `tile.svg` v3)

`src-tauri/icons/` : `icon.png` 512, `128x128.png`, `128x128@2x.png` 256,
`32x32.png`, `icon.ico` (frames 16/24/32/48/64/128/256) ·
web : `public/app-icon.png` 1024 (favicon), `public/logo.png` 1774×751 (lockup),
`public/logo.svg` = symbole.

## Espace de protection & tailles minimales

- Clairage = largeur d'un fût (48/256 ≈ 19 % de la hauteur du symbole) sur les 4 côtés.
- Symbole : ≥ 16 px. Lockup : ≥ 120 px de large. Sous 48 px → utiliser `symbol-color-small`.
- La pointe de plume déborde volontairement la ligne de base (signature) : ne pas recadrer.

## Interdits

- Ne pas étirer/rotater ; pas d'ombre portée ; pas de contour ajouté.
- Ne pas recolorer hors palette ; pas de dégradé radial.
- Ne pas reconstruire le wordmark ni le crédit avec une police live (contours vectorisés).
- Pas de fond coloré derrière `symbol-color` sans contraste vérifié (préférer `reversed`).
