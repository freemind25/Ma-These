# Tasks — hal-search-encoding (test de non-régression)

Contexte : commande du propriétaire suite à `assess.md` (verdict : bug déjà corrigé par l'annexe A.1 ; option « figer le comportement par un test vitest » retenue — décision consignée le 2026-09-17). Cycle n°1 clos sur la partie reproduction ; le présent fichier couvre la phase test, même slug.

Périmètre fermé (commande du propriétaire) : **ce test uniquement, aucune modification de `route.ts`**.

Feu vert préalable : le fichier `src/app/api/theses-en-ligne/search/route.test.ts` a été nommé explicitement par le propriétaire dans la commande (annonce = commande ; article 2 satisfait).

## Groupe A — Tests / non-régression

- [ ] T1 — Écrire `src/app/api/theses-en-ligne/search/route.test.ts` (fichier nouveau) épinglant les trois mécanismes prouvés par l'assess : **M1** paramètres `fq` répétés natifs (jamais de `&` interne encodé `%26`), **M2** normalisation du tri `%2B`/`+` → espace, **M3** encodage final `%20` (aucun `+` littéral vers HAL) · mock `global.fetch` avec capture d'URL, zéro réseau réel, zéro modification de `route.ts` · preuve attendue : `bun run test:run src/app/api/theses-en-ligne/search/route.test.ts` → tous les tests verts, sortie collée dans `preuves.md`

Dépendances : aucune. Ce groupe n'est pas [BLOQUANT].
