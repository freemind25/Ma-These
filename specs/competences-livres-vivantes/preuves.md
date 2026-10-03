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

**Fichiers modifiés : `prisma/schema.prisma` (+3 lignes). Tâche : T1.**

- 18:00 — Diff avant/après : `git diff --stat prisma/schema.prisma` → « 1 file changed, 3 insertions(+) » (champs `description`, `source`, `enabled @default(false)` — additifs purs, aucune colonne retirée).
- 18:00 — `bun run db:push` → « ✔ Generated Prisma Client (v6.19.2) » (sync réussie, aucune perte signalée).
- 18:00 — Survie des données (Article 6) :
  - avant : `CustomBookSkill: 58` ;
  - après : `APRÈS total: 58 | enabled=false: 58` ; échantillon : `{"title":"The Complete Book of Grant Writing","description":null,"source":null,"enabled":false}` — les lignes existantes passent toutes à `enabled=false` (opt-in strict, CA-2.1 fondamental).
- Lignes rouges avant commit : 0 diff (vérifié 17:59, inchangé — fichier non concerné).

**Compte rendu de groupe :**

```
### Groupe A — Schéma
Tâches : T1
Fichiers modifiés : prisma/schema.prisma (+3)
Vérifications exécutées : diff schema ; db:push ; comptes avant/après 58=58 ; champs nouveaux null/false sur lignes existantes
Sorties : voir ci-dessus (réelles)
Critères d'acceptation couverts : fondations CA-2.1, CA-3.4
Écart au plan : aucun
Statut proposé : à recetter (délégation)
```
