---
name: sdd-thesisframe
description: Méthode de développement piloté par la spécification (Spec-Driven Development) pour ThesisFrame. À utiliser dès qu'une demande implique d'ajouter une fonctionnalité, de corriger un bug, de refactoriser ou de modifier le comportement de l'application. Impose la production d'une spécification validée, d'un plan technique et d'une liste de tâches AVANT toute écriture de code, puis une boucle implémentation → convergence. Se déclenche sur "ajoute", "corrige", "implémente", "refactorise", "fais évoluer", ou toute demande de modification du dépôt ThesisFrame.
---

# SDD — ThesisFrame

## Principe

Le code n'est pas le point de départ. La spécification l'est.
Chaque intervention produit d'abord des **artefacts écrits et validés**, ensuite du code.
Aucune ligne de code n'est écrite tant que `spec.md` et `plan.md` ne sont pas approuvés explicitement par le propriétaire du projet.

Contrainte d'exécution :

- **L'implémentation est strictement séquentielle** — un groupe à la fois, dans une seule session, avec des points d'arrêt explicites. Ne jamais simuler un parallélisme qui n'existe pas.
- **L'exploration peut être parallélisée** quand l'environnement le permet (lecture de code en vue du plan, audit factuel), à une condition : chaque affirmation qui en revient cite un **chemin de fichier et des numéros de ligne réels**. Une affirmation non sourcée vaut une affirmation fausse.

## Arborescence des artefacts

```
specs/
  <slug>/
    spec.md      # le QUOI et le POURQUOI — aucun choix technique
    plan.md      # le COMMENT — stack, fichiers touchés, risques
    tasks.md     # découpage exécutable, une case à cocher par tâche
    preuves.md   # sorties de commandes, captures, logs de vérification
```

`<slug>` est court et descriptif : `hal-search-encoding`, `chapter-diff`, `overpass-retry`.

Moyens de preuve disponibles dans ce dépôt, à consigner tels quels dans `preuves.md` : `bun run test:run` (vitest), `bun run lint`, `curl` sur les routes API, `dev.log` du serveur de développement, captures d'écran navigateur (desktop et mobile ≥ 390 px, répertoire `test-snapshots/`).

## Le cycle

### Étape 0 — Constitution (une seule fois par dépôt)

Vérifier l'existence de `CONSTITUTION.md` à la racine. S'il est absent, le créer et le faire valider. Il contient les principes non négociables du projet :

- **Preuve avant affirmation.** Aucune affirmation sur l'état du code sans l'avoir lu ou exécuté. Citer le chemin du fichier et les lignes. Ne jamais se fier au nom supposé d'un fichier : la documentation du projet contient des dérives de nommage connues (`directeurThese.js` n'existe pas ; le prompt du directeur est dans `src/lib/ai/specializations/directeur.ts`).
- **Autorisation avant modification.** Annoncer les fichiers à modifier, attendre le feu vert, puis modifier.
- **Une tâche = un commit.** Message conventionnel, périmètre fermé.
- **Pas de reconstruction silencieuse.** Si le code réel contredit la spec ou la documentation, on arrête et on signale. On ne « corrige » pas la réalité pour la faire coller au document.
- **Rien n'est terminé sans preuve d'exécution** (commande lancée, sortie collée dans `preuves.md`).

### Étape 1 — Spécifier

Rédiger `specs/<slug>/spec.md`. Interdits à ce stade : noms de bibliothèques, de fichiers, de composants, de tables.

```markdown
# <Titre>

## Problème
Ce qui ne marche pas / ce qui manque, observé, pas supposé.

## Utilisateur concerné
Doctorant · directeur de thèse · administrateur.

## Comportement attendu
US-1 — En tant que <rôle>, je veux <action>, afin de <bénéfice>.
  CA-1.1 Étant donné <contexte>, quand <action>, alors <résultat observable>.
  CA-1.2 ...

## Hors périmètre
Ce que cette itération ne traite pas, explicitement.

## Zones floues
[À CLARIFIER] une question par ligne, adressée au propriétaire.
```

Règle : tout critère d'acceptation doit être **vérifiable sans ouvrir le code**.

### Étape 2 — Clarifier

Si `spec.md` contient des marqueurs `[À CLARIFIER]`, poser les questions groupées, en une fois, et attendre les réponses. Ne pas inventer de réponse par défaut. Mettre à jour `spec.md`, retirer les marqueurs.

**Point d'arrêt : validation de la spec.**

### Étape 3 — Planifier

Rédiger `specs/<slug>/plan.md` après avoir **lu le code concerné**.

```markdown
# Plan — <Titre>

## État réel constaté
Fichiers lus, ce qu'ils font aujourd'hui. Chemins exacts.
Écarts entre la documentation du projet et le code observé.

## Approche retenue
Une approche, en quelques lignes.

## Alternatives écartées
Option / raison du rejet.

## Fichiers touchés
| Fichier | Nature | Risque |
|---|---|---|
| prisma/schema.prisma | modification | db:push — diff avant/après + preuve de survie des données requis |

## Impacts transverses
Schéma Prisma · routes API · build Tauri · variables d'environnement · quotas d'API externes.

## Stratégie de vérification
Comment on prouvera que ça marche : commande, route appelée, jeu de données.

## Risques
Ce qui peut casser ailleurs.
```

Repères de la stack à respecter : Next.js 16 (App Router), TypeScript, Prisma (SQLite), Tiptap ; desktop via Tauri v2 avec build Windows en GitHub Actions ; couche géographique par service MCP (Nominatim, Overpass) — **pas** PostGIS ni MapLibre ; les modèles `Chapter` et `Cadrage` possèdent chacun un historique versionné (`ChapterVersion` — défini à `prisma/schema.prisma` l.69 — et `CadrageVersion`). Tout repère de stack cité ici peut vieillir : le vérifier dans le schéma et le code avant de planifier, et signaler tout écart dans « État réel constaté ».

Fragilités connues à prendre en compte dans tout plan qui les touche : encodage `URLSearchParams` sur la route HAL (`src/app/api/theses-en-ligne/search`, voir commentaires l.111-118 sur le `%2B` rejeté par Solr), quotas OpenAlex en pool anonyme, timeouts Overpass, troncature de contexte et `maxTokens` dans `src/lib/research/deep-research-pipeline.ts` (slicing l.128-190) appelé par `/api/deep-research`, appels longs (~320 s) sur `/api/directeur-chat`, et `db:push --accept-data-loss` qui écrase silencieusement — tout plan touchant le schéma prouve la survie des données.

**Point d'arrêt : validation du plan.**

### Étape 4 — Découper

Rédiger `specs/<slug>/tasks.md`. Chaque tâche : indépendamment vérifiable, un seul périmètre, formulée à l'impératif, avec sa preuve attendue.

Les tâches sont ensuite **regroupées par similarité**, pas par ordre d'apparition ni par lots de taille fixe. La similarité se juge sur la nature du changement, pas sur le sujet fonctionnel : un correctif de route API et une migration Prisma ne vont jamais dans le même groupe même s'ils servent la même fonctionnalité, parce qu'ils exposent des risques différents et se recettent différemment.

Catégories usuelles dans ce dépôt (à adapter, ne pas forcer une tâche dans une catégorie qui ne lui correspond pas) :

- **Schéma** — `prisma/schema.prisma`, db:push / migrations
- **Backend / routes API** — handlers `src/app/api/**`
- **IA / prompts** — spécialisations dans `src/lib/ai/**`
- **GIS** — service MCP, Overpass, Nominatim, cadrage spatial
- **Frontend / UI** — composants, Tiptap
- **Desktop / build** — Tauri, GitHub Actions
- **Tests / non-régression**

```markdown
## Groupe A — Schéma
- [ ] T1 — <action> · fichier(s) · preuve : <commande ou observation>
- [ ] T2 — ...

## Groupe B — Backend / routes API
- [ ] T3 — ...
```

À l'intérieur d'un groupe, ordonner par dépendance réelle. Entre groupes, respecter les dépendances : un groupe qui consomme le résultat d'un autre (ex. Backend dépendant de Schéma) est placé après lui et marqué `[DÉPEND DE Groupe A]`. Marquer `[BLOQUANT]` un groupe qui conditionne tout le reste. Pour une correction de bug, le groupe Tests précède le groupe qui porte le correctif.

### Étape 5 — Implémenter

Un groupe à la fois, avec **validation bloquante à chaque groupe**. À l'intérieur du groupe, les tâches s'enchaînent sans arrêt intermédiaire — c'est la cohérence de nature qui justifie de les recetter ensemble. Pour chaque groupe :

1. annoncer le groupe, ses tâches, et la liste exacte des fichiers à toucher ;
2. **attendre le feu vert** — ne rien modifier avant ;
3. exécuter les tâches du groupe dans l'ordre, et rien d'autre que ce qui a été annoncé ;
4. exécuter la vérification prévue pour chaque tâche du groupe ;
5. coller les sorties réelles dans `preuves.md`, puis présenter le compte rendu de groupe ci-dessous ;
6. **attendre la recette** — les cases ne sont pas cochées par l'agent, elles le sont après acceptation ;
7. commit (un commit par tâche à l'intérieur du groupe reste la règle), puis passer au groupe suivant.

Compte rendu de groupe (obligatoire, format fixe) :

```markdown
### Groupe <lettre> — <nature>
Tâches : T<n>, T<n+1>, ...
Fichiers modifiés : <chemins réels, avec nombre de lignes ajoutées/supprimées>
Vérifications exécutées : <une ligne par tâche>
Sorties : <extraits réels, non reformulés>
Critères d'acceptation couverts : CA-x.y, CA-x.z
Écart au plan : aucun | <description>
Statut proposé : à recetter
```

Règles associées :

- Un groupe n'est entamé que si le précédent dont il dépend est recetté. Deux groupes sans dépendance entre eux peuvent être proposés à la recette l'un après l'autre sans attendre le reste.
- Une tâche qui ne rentre proprement dans aucune catégorie existante devient son propre groupe d'une tâche — mieux vaut un petit groupe homogène qu'un groupe hétérogène pour remplir une case.
- Un fichier non annoncé à l'étape 1 et modifié quand même invalide le groupe entier : revenir à l'état précédent et re-annoncer.
- Si la recette est refusée, la correction se fait dans le même groupe, avec un nouveau compte rendu. On ne crée pas de groupe de rattrapage pour masquer un échec.
- Si une tâche révèle que le plan était faux : **s'arrêter**, revenir à l'étape 3, ne pas improviser une rustine.

### Étape 6 — Converger

Relire `spec.md`, `plan.md`, `tasks.md` contre le code effectivement produit, et produire un verdict :

```markdown
## Convergence — <date>
Critères d'acceptation satisfaits : n/N (lister les manquants)
Écarts au plan : ...
Dette introduite : ...
Verdict : CONVERGÉ | NON CONVERGÉ
```

Si NON CONVERGÉ, ajouter les tâches restantes à `tasks.md` et reprendre à l'étape 5. Répéter jusqu'à convergence.

## Bugs : variante courte

Pour une correction de bug, `spec.md` est remplacé par `assess.md` :

```markdown
# Bug — <slug>

## Symptôme
Ce qui est observé, avec la trace ou la requête exacte.

## Reproduction
Étapes minimales, reproduites réellement. Si non reproductible : le dire, s'arrêter.

## Cause racine
Fichier, lignes, mécanisme. Pas d'hypothèse présentée comme un fait.

## Preuve de la cause
Sortie qui démontre le mécanisme.

## Correctif proposé
Périmètre minimal.

## Test de non-régression
Le test qui échoue avant et passe après.
```

Puis étapes 4 → 6 normalement.

## Voie rapide — micro-changements

Éligible si et seulement si les **trois** conditions sont réunies :

1. **≤ 20 lignes** modifiées au total ;
2. **1 seul fichier** touché ;
3. **aucun impact transverse** : pas de schéma Prisma, pas de route consommée par un autre module, pas de build Tauri, pas de variable d'environnement.

Dans ce cas, un `assess.md` condensé suffit (demande ou symptôme, cause ou intention, correctif, preuve attendue) — pas de `plan.md`, pas de `tasks.md`. La preuve dans `preuves.md` et la recette du propriétaire restent obligatoires.

**En cas de doute sur l'éligibilité, cycle complet — l'agent ne tranche pas seul.**

## Anti-patterns — refus explicite

| Comportement | Conduite attendue |
|---|---|
| Coder directement sur une demande orale | Écrire la spec d'abord |
| Affirmer qu'un fichier fait X sans l'avoir lu | Lire, citer le chemin et les lignes |
| Élargir le périmètre en cours d'implémentation | Nouvelle tâche, ou nouvelle spec |
| Déclarer « terminé » sans exécution | Preuve dans `preuves.md` |
| Enchaîner plusieurs groupes sans recette | Un groupe, un compte rendu, une acceptation |
| Regrouper des tâches par ordre d'écriture plutôt que par nature | Regrouper par similarité de risque et de vérification |
| Cocher soi-même une case dans `tasks.md` | La case est cochée après recette |
| Toucher un fichier non annoncé | Annuler, re-annoncer, attendre le feu vert |
| Inventer une réponse à un `[À CLARIFIER]` | Demander |
| Refactoriser « au passage » | Hors périmètre |
| Paralléliser l'implémentation ou simuler des sous-agents | Implémentation séquentielle ; exploration parallèle admise, avec chemin + lignes cités |
| Modifier `prisma/schema.prisma` sans vérification d'intégrité | `db:push` avec diff avant/après prouvé, ou `prisma migrate dev` si perte de données anticipée |
| Utiliser la voie rapide hors des trois critères | Cycle complet ; le doute se tranche par le cycle, pas par l'agent |

## Rendu de fin de session

À la fin de toute session, mettre à jour `FICHE_SYNTHESE.md` : slug traité, état de convergence, décisions prises, points ouverts pour la session suivante.
