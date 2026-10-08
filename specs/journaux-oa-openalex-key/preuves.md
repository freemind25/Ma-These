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

## Restauration post-rollback (2026-10-08 — clé OpenAlex re-fournie par le propriétaire)

```
clé validée en direct : GET api.openalex.org/works?search=urbanisme&per-page=1&api_key=… → 200
.env.local recréé (600, gitognoré .env* l.34, non suivi) : OPENALEX_API_KEY=qs…WLr (tronqué ici — jamais en clair dans le dépôt)
serveur redémarré (kill complet next dev/next-server, relance start-stop-daemon) → HTTP 200
GET /api/journaux-oa?q=urbanisme → 200, résultats (Quaderns d'arquitectura i urbanisme…),
  éditeur alimenté ou fallback « Éditeur inconnu » honnête, AUCUN warning (le 429 quota sans clé est corrigé)
```

Reste : clé APINex non re-fournie (solde inaccessible jusqu'à restitution). Rotation conseillée (clé passée en clair dans l'IM).
