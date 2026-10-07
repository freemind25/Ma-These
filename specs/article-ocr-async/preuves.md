# Preuves — OCR des pages scannées + exécution asynchrone

Toutes les sorties ci-dessous sont des extraits réels de commandes exécutées (TZ Etc/GMT-1).

## Ouverture (zéro code)

```
$ date -u +"%Y-%m-%dT%H:%M:%SZ" && TZ='Etc/GMT-1' date
2026-10-07… (consigné au commit d'ouverture)
$ git log --oneline -1
8c44e13 docs: FICHE suite 4 — rotation clés installée, correctif journaux-oa, exploitation serveur
$ git status --short
(extrait) specs/article-ocr-async/{spec,plan,tasks}.md nouveaux — zéro code modifié
```

Baseline (session précédente, reprise) : vitest 74 fichiers / 1 611 verts, lint 0 erreur / 231 warnings, red lines 0 diff. Baseline ré-exécutée au début du Groupe A ci-dessous.
