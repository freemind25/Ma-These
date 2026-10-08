# Spec — cycle « import-size-limit »

Portée : lever la limite de transport ~10 Mo (Next 16) et aligner le plafond applicatif sur les documents réels. Hors périmètre : OCR, sources de recherche, upload chunked.

## Critères d'acceptation

- **CA-1 (transport)** : un PDF de plus de 10 Mo et ≤ plafond applicatif s'importe avec succès (201) via la voie applicative ; aucun « Request body exceeded » dans dev.log pendant la recette.
- **CA-2 (plafond applicatif)** : `MAX_IMPORT_BYTES` = 50 Mo, annoncé partout (label UI, docs § 7) ; un fichier > 50 Mo est refusé avec message lisible AVANT parsing.
- **CA-3 (config)** : `experimental.proxyClientMaxBodySize` (64 Mo, nombre) défini dans `next.config.ts` avec commentaire justificatif ; la clé dépréciée `middlewareClientMaxBodySize` n'est pas utilisée ; dev et prod passent par la même config.
- **CA-4 (non-régression)** : vitest verts (test épinglant 50 Mo mis à jour), lint 0 erreur, red lines 0 diff, RSS mesuré avant/après recette, octets toujours exclus du GET.
