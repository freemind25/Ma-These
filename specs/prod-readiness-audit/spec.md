# Spec — prod-readiness-audit

Date : 2026-09-18 · Statut : Étape 1 — en attente de validation du propriétaire.
Mandat : « Nouveau cycle SDD — slug : prod-readiness-audit. Objectif : consolider ThesisFrame pour une mise en production, avec preuve à chaque point, pas une déclaration de confiance. »

## 1. Problème

Ni un bug, ni une fonctionnalité : l'absence de **preuve consolidée** que l'état actuel du dépôt est prêt pour la mise en production. Des éléments de preuve existent (rapport annexes A.1-A.13, specs convergées, suite de tests verte) mais sont dispersés entre documents, et plusieurs points n'ont jamais été prouvés par exécution réelle : build web de ce HEAD, pipeline Tauri Windows, secrets dans l'historique git, drift schéma/base, statut consolidé des fragilités connues.

## 2. Critères d'acceptation

- **CA-0 (global)** — chaque point du périmètre (plan.md § 2) a une **preuve d'exécution réelle** dans `preuves.md` : commande lancée, sortie collée, horodatée — pas une lecture de code déclarative. Quand une preuve est impossible dans cet environnement, la réserve est **nommée explicitement** avec la preuve manquante exacte et l'acteur qui peut la produire. Jamais de simulation ni de « OK » non prouvé.
- **CA-1** — le rapport final émet un verdict global sans ambiguïté : **PRÊT / PRÊT AVEC RÉSERVES (lister) / NON PRÊT (lister les bloquants)**.

## 3. Périmètre — 6 axes (détail des points dans plan.md § 2)

1. **Build & CI** : build web du HEAD ; build Tauri Windows / pipeline CI ; propreté git (arbre, modes 755, commit de normalisation des modes).
2. **Tests & qualité** : suite complète ; lint dépôt entier ; inventaire de couverture des routes API (inventaire seul).
3. **Schéma & données** : drift schéma Prisma / bases ; usages de `db:push --accept-data-loss` (manuel vs automatique).
4. **Secrets & configuration** : clés et secrets en clair (HEAD, historique git inclus, artefacts de build) ; `.env.example` vs variables réellement lues ; correctif « Mendeley OAuth + plateformes de piratage » tient-il toujours.
5. **Fragilités connues** — statut de chacune (corrigé / contourné / ouvert, avec preuve) : quota OpenAlex pool anonyme (A.2) ; troncature maxTokens deep-research (A.3) ; timeout Overpass sans retry (A.7) ; nohup non persistant (A.8/A.10, impact prod à évaluer) ; timeout ~320 s directeur-chat (A.9, limite proxy/hébergeur cible).
6. **Desktop** : capabilities Tauri — permissions minimales, rien d'excessif pour un installeur distribué.

## 4. Hors périmètre (règle du mandat)

- Ne corrige **rien** d'autre sans nouvelle annonce : l'objectif du cycle est l'état des lieux prouvé, pas une refonte.
- Les corrections nécessaires découlant directement des points listés deviennent des tâches **dans les groupes correspondants**, recettées une à une. Candidates identifiées à l'Étape 3 : créer `.env.example` (absent, point 4 du mandat l'exige « à jour ») ; traiter la clé API en dur dans `src-tauri/src/lib.rs` l.221 (décision du propriétaire entre 3 options).
- Tout autre constat (CI absente, 37 routes sans test, bases versionnées, CSP null, RAR versionné…) = réserve/recommandation documentée, sans modification.
- Lignes rouges intangibles : `src/app/api/theses-en-ligne/search/route.ts`, `src/app/api/arxiv/search/route.ts`, `src/components/layout/app-sidebar.tsx`.

## 5. Micro-décisions (choix conservateurs dérivés du mandat)

- **MD-1 — Preuves impossibles en sandbox** : `cargo`/`rustc` absents (build Rust natif impossible), aucun `.github/` ni remote git (pipeline CI inexistant dans ce dépôt), pas de Windows (`.exe` non exécutable ici). Ces points = réserves nommées avec la preuve manquante exacte — jamais simulés.
- **MD-2 — Rapport « Mendeley OAuth + plateformes de piratage »** : référencé par le mandat mais **introuvable** dans le dépôt et `upload/` (les matches initiaux « pirat » sont des faux positifs : « expir**at**ion », « ins**pirat**ion »). Le cycle refait un scan frais (secrets + liens piratage, HEAD + historique + artefacts locaux). Si le propriétaire fournit le rapport, vérification croisée ajoutée à la recette du groupe D.
- **MD-3 — « zéro warning bloquant »** : tous les warnings du build web sont consignés ; « bloquant » = échec du build ou erreur ESLint. Les warnings non bloquants figurent dans preuves.md.
- **MD-4 — Cible de déploiement** : le dépôt ne documente pas l'hébergeur/proxy cible (limite de timeout HTTP pour A.9 ; gestion des processus pour A.8/A.10). Questions posées au propriétaire à la recette du groupe E ; sans réponse → réserve.
- **MD-5 — Inventaire ≠ correction** : la couverture des routes API est un inventaire (« ne corrige rien ici, inventorie »). Idem pour les constats Desktop : recommandations documentées, aucune implémentation sans feu vert.
- **MD-6 — Chiffre du mandat « chmod 410 fichiers »** : le dépôt réel montre **419 fichiers** au commit de normalisation `0348dcb` — l'audit consigne le chiffre réel prouvé, sans « corriger » le mandat.

## 6. Livrable final

Rapport de convergence (Étape 6) : verdict global + réserves + bloquants éventuels, consigné dans `tasks.md`, `preuves.md`, `FICHE_SYNTHESE.md` et `worklog.md`.
