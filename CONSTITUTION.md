# CONSTITUTION — ThesisFrame

Principes non négociables du projet. Toute intervention sur ce dépôt — agent ou humain — s'y soumet.
Le workflow d'application (spécification → plan → tâches → implémentation par groupes recettés → convergence) est défini dans [`skills/sdd-thesisframe/SKILL.md`](skills/sdd-thesisframe/SKILL.md).

Statut : **en attente de validation par le propriétaire** (point d'arrêt de l'Étape 0 — la constitution prend effet à l'acceptation).

---

## Article 1 — Preuve avant affirmation

Aucune affirmation sur l'état du code sans l'avoir lu ou exécuté. Toute citation indique le **chemin du fichier et les numéros de ligne**. On ne se fie jamais au nom supposé d'un fichier.

Dérives connues dans ce dépôt, conservées comme leçons :

- `directeurThese.js` n'a jamais existé ; le prompt du directeur est dans `src/lib/ai/specializations/directeur.ts`.
- La documentation a longtemps affirmé que `Chapter` n'avait pas d'historique natif ; `prisma/schema.prisma` définit pourtant `ChapterVersion` (l.69). Toute assertion sur le schéma se vérifie dans le fichier avant de planifier.

L'exploration peut être déléguée ou parallélisée quand l'environnement le permet, à une condition : chaque affirmation qui en revient porte sa source (chemin + lignes). Une affirmation non sourcée vaut une affirmation fausse.

## Article 2 — Autorisation avant modification

Annoncer les fichiers à modifier, attendre le feu vert, puis modifier. Un fichier non annoncé et modifié quand même invalide le groupe entier : retour à l'état précédent, re-annonce, nouveau feu vert.

## Article 3 — Une tâche = un commit

Un commit par tâche, périmètre fermé, message conventionnel : `<type>: <description courte>` — types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`.

Les commits historiques du dépôt portent des identifiants générés par la plateforme ; ils ne servent pas de modèle.

## Article 4 — Pas de reconstruction silencieuse

Si le code réel contredit la spec, la documentation ou un artefact du cycle SDD, on **s'arrête et on signale l'écart**. On ne « corrige » pas la réalité pour la faire coller au document, et on ne réécrit pas la spec pour la faire coller au code sans le dire.

## Article 5 — Rien n'est terminé sans preuve d'exécution

Une tâche n'est close qu'avec sa preuve consignée dans `specs/<slug>/preuves.md` : commande lancée, sortie réelle, capture, ou log. Moyens disponibles dans ce dépôt :

- `bun run test:run` (vitest) et `bun run lint` ;
- `curl` sur les routes API ;
- `dev.log` du serveur de développement ;
- captures d'écran navigateur (desktop et mobile ≥ 390 px, répertoire `test-snapshots/`).

## Article 6 — Intégrité des données (schéma Prisma)

Le flux courant du dépôt est `bun run db:push` (`--accept-data-loss`). Tout plan qui modifie `prisma/schema.prisma` doit :

1. produire un diff du schéma avant/après ;
2. prouver la survie des données existantes après `db:push` ;
3. basculer sur `prisma migrate dev` si une perte de données est anticipée.

## Article 7 — Décisions de cadrage enregistrées

- **Voie rapide (micro-changements)** : éligible si ≤ 20 lignes modifiées, 1 seul fichier, aucun impact transverse (schéma Prisma, route consommée par un autre module, build Tauri, variables d'environnement). En cas de doute sur l'éligibilité, **cycle complet — l'agent ne tranche pas seul**.
- **Sous-agents** : l'implémentation reste strictement séquentielle, un groupe à la fois, jamais de parallélisme simulé. L'exploration (lecture de code, audit factuel) peut être parallélisée si l'environnement le permet, à condition que chaque affirmation cite un chemin de fichier et des numéros de ligne réels.
- **Emplacement du protocole** : `skills/sdd-thesisframe/SKILL.md`, versionné dans le dépôt.
- **Fin de session** : `FICHE_SYNTHESE.md` est mis à jour (slug traité, convergence, décisions, points ouverts).
