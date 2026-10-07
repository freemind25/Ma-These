# Preuves — voie rapide journaux-oa (2026-10-07, 15:15-15:25 TZ 'Etc/GMT-1')

## Cause prouvée en direct (avant correctif)
```
select=publisher        → HTTP 400  ("publisher is not a valid select field…")
select=oa_status        → HTTP 400  ("oa_status is not a valid select field…")
sélection complète route → HTTP 400  (reproduction exacte des params de la route)
sans select, avec clé   → HTTP 200  (count 8)
sans clé (anonyme)      → HTTP 429  (quota — c'est ce que la clé corrige)
```

## Après correctif
```
bun run lint → 0 errors / 231 warnings (baseline)
bunx vitest run src/app/api/journaux-oa/route.test.ts → 21 passed (21)
GET /api/journaux-oa?q=urbanisme → total: 8 | warnings: ["DOAJ: fetch failed" — environmental DNS, hors périmètre]
  — QRU Quaderns de Recerca en Urbanisme | Grupo de Investigación en Urbanismo | Or   (host_organization_name alimenté)
  — Quaderns d'arquitectura i urbanisme | Éditeur inconnu | Non spécifié              (OpenAlex: host_org_name null, is_oa false — vérifié en direct)
Valeurs brutes OpenAlex vérifiées : null/nnull/"Grupo de Investigación en Urbanismo" → mapping honnête
vitest complet : 74 fichiers / 1 611 verts (re-run final)
```
