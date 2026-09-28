# Spec — Ressource « méthodes mixtes » (ajout + digestion)

Date : 2026-09-28 · Origine : ordre propriétaire « ajouter cette ressource en respectant le protocole d'ajout, de digestion, etc. » (PDF `ressources.pdf`, 12 pages, transmis par Tuta le 28/09/2026).

## Problème

Le propriétaire a transmis une nouvelle ressource pédagogique (PDF 12 pages) contenant deux documents :
1. **Article** — M. Sandelowski, « Combining Qualitative and Quantitative Sampling, Data Collection, and Analysis Techniques in Mixed-Method Studies », *Research in Nursing & Health*, 23(3), 246-255, 2000 (pages 1-9).
2. **Guide** — STUDYSmarter (UWA), « Methods and Methodology Survival Guide » (pages 10-11), identique aux 2 pages de `upload/res.pdf` (reçu le 14/09, jamais intégré).

Aucune des deux n'est disponible dans l'application, et leur savoir méthodologique n'est pas dans le socle IA.

## Utilisateur concerné

Doctorant (lecture des ressources, rédaction méthodo mixte) · directeur de thèse (modes IA injectés par le module `methodology`).

## Comportement attendu

US-1 — En tant que doctorant, je veux consulter le guide UWA dans les Ressources pédagogiques, afin de distinguer méthodes et méthodologie avant de collecter mes données.
  CA-1.1 Étant donné le tableau de bord, quand je fais défiler jusqu'à « Ressources pédagogiques », alors une 3e carte « Méthodes & méthodologie — guide de survie (UWA) » est visible (vignette = page 1).
  CA-1.2 Étant donné la carte ouverte, quand je clique « Suivante », alors la page 2 du guide s'affiche avec le compteur « 2 / 2 » et l'image `/resources/methodes-methodologie-uwa-2.jpg`.

US-2 — En tant que doctorant, je veux une fiche de lecture des méthodes mixtes (Sandelowski 2000), afin d'appliquer la combinatoire technique (gabarits, échantillonnage, analyse) à mon design.
  CA-2.1 Une 4e carte « Les méthodes mixtes : combiner quali et quanti » est visible, vignette = page 1 de la fiche, crédit citant Sandelowski, RNH 23(3), 246-255, 2000.
  CA-2.2 Le visionneur navigue entre les 2 pages de la fiche (compteur « 1 / 2 » → « 2 / 2 »).
  CA-2.3 Les 2 infographies d'origine restent inchangées (1 page, aucun bouton de pagination).

US-3 — En tant que mode IA (directeur, hypothesis, methodology, revue-litterature), je veux le savoir de Sandelowski 2000 et du guide UWA dans le module `methodology`, afin de conseiller sans extrapolation divergente.
  CA-3.1 Le socle contient « combinatoire technique (Sandelowski 2000) » et « Vocabulaire et préparation (STUDYSmarter, UWA) ».
  CA-3.2 Le capteur de budget passe : full core ≤ 22 000 tokens, méthodologie ≤ 5 000 tokens et toujours le plus grand module.
  CA-3.3 Les tests de digestion existants (Creswell/SI/Yin) restent verts.

## Hors périmètre

- L'affichage verbatim des 9 pages de l'article (texte dense, filigrane « Askpstudyinaustralia » du document reçu) — remplacé par la fiche de lecture + digestion ; l'original reste dans `upload/` (non versionné, non modifié).
- La correction du tableau historique des tokens dans AGENTS.md/ARCHITECTURE (drift signalé dans les preuves, ligne de statut mise à jour seulement).
- Toute nouvelle spécialisation ou mode IA.

## Zones floues

Aucune — choix documenté : guide UWA en verbatim recadré (chrome Tuta supprimé, filigrane conservé, en-tête + logo UWA conservés conformément à la politique de réutilisation STUDYSmarter) ; article en fiche de lecture (2 pages, français) + digestion intégrale dans le socle.
