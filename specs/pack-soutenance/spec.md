# Pack Soutenance — module de préparation de la soutenance orale

Mandat du propriétaire : « ok pour vos propositions » (2026-09-19) — la proposition « pack soutenance (le plus légitime) : générateur de slides + discours + simulation de questions du jury » est approuvée. Cycle lancé sur ce mandat ; décisions conservatrices tranchées ci-dessous, modifiables à la recette (précédent `veille-check-auto`, « go pour les deux propositions »).

## Problème

L'application couvre 44 modules du parcours doctoral (README.md l.31) mais **aucun ne prépare la soutenance orale** — la dernière étape du doctorat. Observé : le terrain est balisé mais fragmenté — un mode d'écriture IA « defense » (« Préparation soutenance », `src/data/ai-writing-modes.ts` l.130-138) produit un bloc de texte unique, la Boîte doctorale contient une checklist de soutenance, et le socle IA contient un module `PRESENTATION_MODULE` (knowledge-core l.855-889). Aucune vue, aucune route, aucune persistance ne réunissent slides, discours et questions du jury en un espace de travail. Le comparatif TrustMémoireAI (2026-09-19) montre qu'un acteur du marché propose « Slides • Discours • Questions - Réponses du jury • Prompteur » — fonctionnalité absente de notre catalogue.

## Utilisateur concerné

Doctorant (rôle principal, en année de soutenance).

## Comportement attendu

US-1 — En tant que doctorant, je veux **générer le plan de mes slides de soutenance** à partir de ma thèse (cadrage, chapitres), afin de structurer ma présentation sans partir d'une page blanche.
  CA-1.1 Le module propose la génération des slides pour la thèse active ; si aucune thèse n'est active, un état vide invite à en choisir une (aucun appel IA).
  CA-1.2 La génération produit une liste ordonnée de slides, chaque slide ayant un titre et des points de contenu (5 lignes maximum par slide, dans l'esprit du socle `PRESENTATION_MODULE`).
  CA-1.3 La génération peut être relancée (le résultat précédent est remplacé après confirmation).
  CA-1.4 Le plan de slides est copiable en une action (presse-papiers, format texte lisible).

US-2 — En tant que doctorant, je veux **générer un discours de soutenance** d'une durée cible choisie, afin de disposer d'un texte oral calibré.
  CA-2.1 Une durée cible est proposée (10, 15, 20 minutes ; 15 par défaut).
  CA-2.2 Le discours généré s'appuie sur le contenu réel de la thèse (titre, discipline, cadrage actif, chapitres) et respecte la progression d'une soutenance (salutations, problématique, méthodologie, résultats, limites, conclusion, remerciements).
  CA-2.3 Le texte est affiché intégralement, copiable en une action, et sa génération peut être relancée.

US-3 — En tant que doctorant, je veux **simuler les questions du jury** avec des angles de réponse suggérés, afin de préparer mes réponses.
  CA-3.1 La génération produit une liste de questions regroupées par famille (fond théorique, méthodologie, résultats, limites et perspectives, ouverture) — dans l'esprit des « QUESTIONS ANTICIPÉES DU JURY » du prompt `defense` existant.
  CA-3.2 Chaque question est accompagnée d'un angle de réponse suggéré, ancré dans la thèse.
  CA-3.3 Le nombre de questions est fixé par l'itération (10), affiché avant génération.

US-4 — En tant que doctorant, je veux **retrouver mes trois artefacts (slides, discours, questions) à la réouverture**, afin que la préparation soit un travail continu.
  CA-4.1 Chaque artefact généré est enregistré pour la thèse active et restauré à l'ouverture du module.
  CA-4.2 L'enregistrement survit à la fermeture complète de l'application.
  CA-4.3 Une artefact jamais généré s'affiche en état vide clair (aucune erreur).

## Hors périmètre (cette itération)

- Export de fichier réel (.pptx / .pdf des slides) — copie presse-papiers et texte suffisent ; un export pourrait venir en itération ultérieure.
- Mode prompteur (défilement temporisé du discours).
- Chronométrage par slide, notes de répétition, enregistrement audio.
- Choix du modèle/température par artefact (config fournisseur globale de l'application, comme les autres modules IA).
- Compte client multi-utilisateurs (l'application reste mono-utilisateur local).

## Décisions de clarification (conservatrices, modifiables à la recette)

1. **Un modèle 1:1 par thèse** (pattern `DoctoralToolbox` — JSON dans colonnes String) plutôt que N lignes par artefact : une seule route, pas de migration lourde, suppression en cascade native.
2. **Génération non streaming** pour les trois artefacts (spinner + états d'attente), à l'image des modules IA existants non streamés ; le discours long reste sous la limite explicite de tokens passée à la génération.
3. **Contexte thèse borné** : cadrage actif + titres et textes de chapitres tronqués par chapitre, total maîtrisé sous les limites de contexte ; preuve de limite consignée dans le plan.
4. **Icône de navigation existante** : la barre latérale est une ligne rouge non modifiable — l'icône est choisie dans le registre d'icônes déjà présent (`ClipboardCheck`).
5. **Guide intégré** : le module s'enregistre aussi dans le guide d'aide intégré (4ᵉ point d'enregistrement documenté).
