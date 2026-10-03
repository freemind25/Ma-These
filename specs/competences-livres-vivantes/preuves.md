# Preuves — Compétences livres vivantes

Toutes les heures sont en `TZ='Etc/GMT-1'`.

## 0. Cadre du cycle

- **Délégation propriétaire** (IM, session du jour) : « vous êtes le spécialiste, faites pour le mieux et comme j'ai un problème de connexion, veuillez terminez toutes les actions avant de revenir pour moi pour avis ». Conséquence : les points d'arrêt Étapes 2/3/5 (validation spec, plan, recettes de groupe) sont traités sous délégation, choix conservateurs consignés dans `spec.md` § « Zones floues », révisables au retour du propriétaire.
- **Précédents appliqués** : `veille-academique` (choix conservateurs dérivés du texte de spec), `recette-3-cycles` (recette déléguée consignée).
- 17:27 — Analyse skills.sh/find-skills livrée au propriétaire ; comparaison architecturale (CustomBookSkill jamais injecté dans l'IA — preuve : grep `customBookSkill|CustomBookSkill` sur `src` = 2 routes API + page UI uniquement).
- 17:57 — Cycle ouvert. `git log --oneline -6` : tête `bc33dc3`, arbre propre (`git status --short` vide).
- 17:59 — Comptes avant modification : `CustomBookSkill: 58` lignes (prisma count). Lignes rouges : `git diff HEAD --stat -- src/app/api/theses-en-ligne/search/route.ts src/app/api/arxiv/search/route.ts src/components/layout/app-sidebar.tsx` → **0 diff**.
- Artefacts spec/plan/tasks + preuves initiales committés avant toute modification de code (une tâche = un commit).

## Groupe A — Schéma

(en attente d'exécution)
