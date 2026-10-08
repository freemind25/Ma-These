# Spec — cycle « ocr-rss-purge »

Portée : borner la croissance mémoire du job OCR (purge/optimisation mémoire), sans toucher au comportement visible (bloc marqué, limites, progression, confiance). Hors périmètre : parallélisation, nouveaux plafonds de pages.

## Critères d'acceptation

- **CA-1 (mesure)** : banc avec échantillonnage RSS par page pendant un job de ≥ 30 pages — courbe consignée AVANT correctif (baseline honnête).
- **CA-2 (bornage)** : après correctif, même banc → croissance RSS bornée (pas de +1 Go monotone ; cible : rester ≤ ~2,2 Go sur la box 4 Go) — plus de redémarrage systématique obligatoire après un job de 30 pages.
- **CA-3 (non-régression)** : précision/confiance inchangées (tests fixture verts ; confiances du banc comparables) ; comportement visible intact (bloc marqué, anti-injection, limites, progression).
- **CA-4 (prod Tauri)** : le mécanisme retenu a un équivalent en build de production (pas un contournement dev-only) — documenté.
