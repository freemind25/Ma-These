# Guideline logo — Ma Thèse (affinage v2, 2026-11-08)

Master vectoriel unique : `public/brand/symbol-color.svg` (viewBox 0 0 256 256, un seul
`<path fill-rule="evenodd">` — détails en vrais trous, reproductible une couleur/broderie).

## Variantes

| Fichier | Usage |
|---|---|
| `symbol-color.svg` | Défaut (dégradé marine→violet→corail→orange, userSpace) |
| `symbol-mono.svg` | Une couleur (marine #1C2267) : impression, gravure, favicon mono |
| `symbol-reversed.svg` | Fond sombre (blanc, trous réels) |
| `symbol-color-small.svg` | < 48 px : œillet/fente/lignes agrandis, 2 lignes de doc |
| `lockup.svg` | Horizontal : symbole + wordmark « Ma**Thèse** » + tagline 2 lignes |
| `tile.svg` | Icône app : tuile blanche r=58/256 + symbole 74 % |

## Palette (équité conservée)

| Rôle | HEX |
|---|---|
| Marine (encre, wordmark « Ma », mono) | #1C2267 |
| Violet | #6D3FC4 |
| Corail | #F0526E |
| Orange | #F99B4E |
| Tagline | #5B5B72 |

Dégradé symbole : x1=28,y1=80 → x2=228,y2=230 (userSpaceOnUse), stops 0 / 0.55 / 0.80 / 1.

## Espace de protection & tailles minimales

- Clairage = largeur d'un fût (48/256 ≈ 19 % de la hauteur du symbole) sur les 4 côtés.
- Symbole : ≥ 16 px. Lockup : ≥ 120 px de large. Sous 48 px → utiliser `symbol-color-small`.
- La pointe de plume déborde volontairement la ligne de base (signature) : ne pas recadrer.

## Interdits

- Ne pas étirer/rotater ; pas d'ombre portée ; pas de contour ajouté.
- Ne pas recolorer hors palette ; pas de dégradé radial.
- Ne pas reconstruire le wordmark avec une police live : les contours sont vectorisés
  (DejaVu Sans Bold, licence Bitstream Vera — usage logo autorisé).
- Pas de fond coloré derrière `symbol-color` sans contraste vérifié (préférer `reversed`).
