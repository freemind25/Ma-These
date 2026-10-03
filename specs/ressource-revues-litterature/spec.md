# Spec — Ressource « revues de littérature » (ajout + digestion)

Date : 2026-10-03 · Origine : ordre propriétaire « dans le respect du protocole de rajout des ressources et connaissances établis précédemment, veuillez rajouter les éléments ci-joints » — deux PDF déposés dans `upload/` le 03/10 (transmission du matin).

## Problème

Le propriétaire a transmis deux articles méthodologiques :

1. **Snyder 2019** — H. Snyder, « Literature review as a research methodology: An overview and guidelines », *Journal of Business Research*, 104, 333–339, 2019 (6 pages, CC BY-NC-ND). **Jamais intégré** : ni dans les Ressources pédagogiques, ni dans le socle IA. Or l'article comble un trou réel du noyau : le module revue de littérature couvre la méthode Ollhoff (revue narrative, 6 étapes) et la SLR (Sułkowski et al. : PRISMA, TCCM, SyReMa), mais **pas le choix raisonné du TYPE de revue** (systématique vs semi-systématique vs intégrative), ni le processus en 4 phases, ni les critères d'évaluation de la qualité d'une revue, ni les erreurs qui bloquent sa publication.

2. **Sandelowski 2000** — « Combining Qualitative and Quantitative Sampling… », *Research in Nursing & Health*, 23(3), 246–255 (9 pages). **Déjà intégré intégralement le 28/09/2026** (cycle `ressource-methodes-mixtes`) : fiche de lecture 2 pages dans les Ressources pédagogiques + section « Méthodes mixtes — combinatoire technique » dans le module méthodologie du socle + source brute `methods-mixtes-sandelowski.md`. Vérification d'identité exigée avant toute action (voir plan).

## Utilisateur concerné

Doctorant (lecture des ressources, choix et conduite de sa revue de littérature) · directeur de thèse (modes IA injectés par le module revue de littérature).

## Comportement attendu

US-1 — En tant que doctorant, je veux une fiche de lecture de la méthodologie « revue de littérature » (Snyder 2019), afin de choisir le bon type de revue et de conduire les 4 phases sans les pièges classiques.
  CA-1.1 Étant donné le tableau de bord, quand je fais défiler jusqu'à « Ressources pédagogiques », alors une 5e carte « La revue de littérature comme méthodologie (Snyder 2019) » est visible (vignette = page 1, pastille « 2 pages » au survol).
  CA-1.2 Étant donné la carte ouverte, quand je clique « Suivante », alors la page 2 s'affiche avec le compteur « 2 / 2 » et le retour « Précédente » fonctionne.
  CA-1.3 Les 4 cartes existantes restent inchangées (contenus, ordre, pagination).

US-2 — En tant que mode IA (revue de littérature, revue SLR), je veux le savoir de Snyder 2019 dans le module revue de littérature du socle, afin de conseiller le type de revue adapté à la question et d'évaluer la qualité d'une revue sans extrapolation divergente.
  CA-2.1 Le socle contient : la typologie des 3 types de revue (systématique / semi-systématique / intégrative) avec critères de choix, analyse et contributions ; le processus en 4 phases (design → conduite → analyse → rédaction) ; la stratégie de recherche à écrire AVANT de conduire ; les critères qualité (profondeur, rigueur, réplicabilité, utilité) ; les erreurs qui bloquent la publication.
  CA-2.2 Le capteur de budget passe : full core ≤ 22 000 tokens, aucun module ne dépasse 5 000 tokens, méthodologie reste le plus grand module.
  CA-2.3 Les tests de digestion existants restent verts.

US-3 — En tant que propriétaire, je veux la traçabilité de l'élément déjà intégré (Sandelowski), afin de savoir qu'aucun doublon n'a été créé.
  CA-3.1 La preuve d'identité du PDF retransmis (marqueurs textuels extraits) figure dans les preuves du cycle, avec la conclusion « déjà intégré — aucune action de duplication ».

## Hors périmètre

- Toute re-création de fiche, carte ou section pour Sandelowski 2000 (déjà intégré, preuve exigée au lieu d'une duplication).
- L'affichage verbatim des 6 pages de l'article Snyder (texte dense deux-colonnes) — remplacé par la fiche de lecture + digestion ; l'original reste dans `upload/` (non versionné, non modifié).
- Toute nouvelle spécialisation ou mode IA ; toute modification des points d'injection existants.
- La correction du drift documentaire préexistant (compteurs « 21 modes » / « 7 ouvrages » dans les docs, tableau historique AGENTS) — déjà signalé au cycle précédent.

## Zones floues

Aucune — le protocole d'ajout + digestion a été établi et validé au cycle `ressource-methodes-mixtes` (28/09) ; le présent cycle lui est conforme point par point.
