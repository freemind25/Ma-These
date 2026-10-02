# Générateur de brouillon de chapitre — rédaction assistée d'un chapitre entier

Mandat du propriétaire : « ok pour vos propositions » (2026-09-19) — la proposition « générateur de brouillon par chapitre : rédaction assistée d'une partie entière, alimentée par nos sources vérifiées » est approuvée. Décisions conservatrices tranchées ci-dessous, modifiables à la recette.

## Problème

Les 26 modes d'écriture IA assistent à l'échelle d'un passage (résumer, reformuler, développer…) mais **aucune fonctionnalité ne produit un brouillon structuré d'un chapitre entier** : introduction, développement en sections, conclusion de chapitre. Observé : les modes n'envoient aucun contexte de thèse (le corps de requête ne contient que `{ mode, prompt }` — ai-writing-page l.165) et n'insèrent pas le résultat dans l'éditeur (copie presse-papiers uniquement). Le comparatif TrustMémoireAI (2026-09-19) montre qu'un acteur du marché propose la génération intégrale d'un document ; notre éthique (« assister, pas écrire à la place ») retient l'**échelle du chapitre**, avec sources choisies par le doctorant dans SA bibliothèque vérifiée, et validation humaine avant insertion.

## Utilisateur concerné

Doctorant (rôle principal).

## Comportement attendu

US-1 — En tant que doctorant, je veux **générer un brouillon structuré pour un chapitre choisi** de ma thèse active, afin de disposer d'une première version à retravailler.
  CA-1.1 Je choisis le chapitre cible parmi ceux de la thèse active ; sans thèse active ou sans chapitre, un état vide clair s'affiche (aucun appel IA).
  CA-1.2 Le brouillon est structuré : introduction du chapitre, sections de développement avec sous-titres, conclusion du chapitre — ancré dans le titre du chapitre, le cadrage actif et les titres des autres chapitres.
  CA-1.3 Une longueur cible est proposée (objectif du chapitre s'il est défini et ≥ 500 mots, sinon 2 000 mots par défaut, modifiable).
  CA-1.4 La génération est visible en direct (texte qui s'écrit) et peut être interrompue.

US-2 — En tant que doctorant, je veux **ancrer le brouillon dans les références de ma bibliothèque**, afin que les citations soient réelles et vérifiables.
  CA-2.1 Je sélectionne une ou plusieurs références de ma bibliothèque (multi-sélection avec recherche) ; je peux générer sans aucune référence.
  CA-2.2 Quand des références sont sélectionnées, le brouillon les cite dans le texte au format académique « (Auteur, année) » et uniquement celles-là ; aucune référence inventée n'est tolérée (instruction de génération stricte).
  CA-2.3 Les références sélectionnées et citées sont rappelées sous le brouillon.

US-3 — En tant que doctorant, je veux **prévisualiser puis insérer le brouillon dans le chapitre**, afin de garder le contrôle du contenu de ma thèse.
  CA-3.1 Le brouillon s'affiche en aperçu avec son compteur de mots comparé à la longueur cible.
  CA-3.2 L'insertion remplace le contenu du chapitre **après confirmation explicite** mentionnant que le contenu actuel sera remplacé et qu'une version est automatiquement sauvegardée par l'historique natif du chapitre.
  CA-3.3 Après insertion, le chapitre reflète le nouveau contenu (compteur de mots mis à jour) et l'historique de versions du chapitre contient l'état antérieur.
  CA-3.4 Je peux copier le brouillon en texte sans l'insérer.

## Hors périmètre (cette itération)

- Génération de la thèse entière en un clic (multi-chapitres orchestrés) — l'échelle reste le chapitre.
- Recherche automatique de sources pendant la génération (HAL/arXiv/OpenAlex) — les sources viennent de la bibliothèque du doctorant ; l'auto-chasse aux sources est une itération ultérieure.
- Insertion en appendice ou à une position précise (remplacement complet uniquement).
- Édition du brouillon avant insertion dans l'aperçu (copier/modifier dans l'éditeur de thèse).
- Anti-détection IA, « humanisation » — explicitement rejetés (éthique).

## Décisions de clarification (conservatrices, modifiables à la recette)

1. **Remplacement total du contenu du chapitre** à l'insertion, garde-fou natif : la mise à jour d'un chapitre crée automatiquement une version (mécanisme existant « un instantané par sauvegarde modifiant le contenu ») — aucune nouvelle mécanique de versionnement.
2. **Sources = bibliothèque du doctorant uniquement** (bibliothèque globale de l'application) ; pas de recherche web pendant la génération.
3. **Brouillon non persisté** en base (mémoire de session, à l'image des autres modules IA) — l'artefact utile est le chapitre inséré ; copier avant de quitter.
4. **Aucune modification des 26 modes existants** ni de leurs compteurs : route dédiée, limites de tokens explicites, pas d'impact sur les modules d'écriture existants.
5. **Icône de navigation existante** (`PenTool`, barre latérale ligne rouge non modifiable) ; enregistrement au guide intégré inclus.
