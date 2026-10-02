# Notes de bas de page dans les exports PDF et DOCX

Mandat du propriétaire : « ok pour vos propositions » (2026-09-19) — la proposition « notes de bas de page dans les exports PDF/DOCX — évolution d'export purement technique » est approuvée. Décisions conservatrices tranchées ci-dessous, modifiables à la recette.

## Problème

Les exports PDF et DOCX ne proposent aucune note de bas de page : la configuration PDF ne connaît que couverture, table des matières et numéros de page (options observées l.71-78 et cases l.968-1014 du module d'export PDF), et l'export DOCX structure page de garde, TDM et références sans footnotes (aucune occurrence de notes dans la route d'export). Or le format académique français attend fréquemment des notes de bas de page donnant la référence complète sous la citation. Le comparatif TrustMémoireAI (2026-09-19) montre qu'un acteur du marché livre des « notes de bas de page » automatiques dans son document final.

## Utilisateur concerné

Doctorant (rôle principal — c'est son document final).

## Comportement attendu

US-1 — En tant que doctorant, je veux **activer les notes de bas de page dans mon export DOCX**, afin que chaque citation de mon texte renvoie à la référence complète en bas de page.
  CA-1.1 Une option « Notes de bas de page » (désactivée par défaut) figure dans la configuration de l'export DOCX, à côté des options existantes.
  CA-1.2 Option activée : chaque citation repérée dans le texte au format académique « (Auteur, année) » (ou narrative « Auteur (année) ») et correspondant à une référence de la bibliothèque devient un renvoi en exposant numéroté, avec la référence complète formatée APA en bas de la page (vraies notes Word).
  CA-1.3 Les citations sans correspondance dans la bibliothèque restent inchangées dans le texte (aucune note vide).
  CA-1.4 Option désactivée : le document produit est strictement identique à celui produit aujourd'hui (comportement par défaut préservé).
  CA-1.5 Chaque référence ne génère qu'une note unique partagée par toutes ses citations (première occurrence numérotée, renvois suivants sur la même note).

US-2 — En tant que doctorant, je veux **activer les notes dans mon export PDF**, afin d'obtenir le même appareil de références dans le document PDF.
  CA-2.1 Une option « Notes de bas de page » (désactivée par défaut) figure dans la configuration de l'export PDF.
  CA-2.2 Option activée : les citations reconnues reçoivent un exposant numéroté dans le texte, et les références complètes correspondantes sont listées dans une section « Notes » en fin de document, dans l'ordre de première apparition.
  CA-2.3 Les deux voies d'export PDF existantes (impression et téléchargement) produisent les exposants et la section « Notes ».
  CA-2.4 Les citations sans correspondance restent inchangées ; option désactivée, sortie identique à l'actuelle.

## Hors périmètre (cette itération)

- Vraies notes en pied de page dans le chemin PDF téléchargé (rastérisation image — techniquement non portable) : le PDF retient la forme « section Notes en fin de document », annoncée comme telle dans l'interface.
- Notes de bas de page manuelles/éditées par l'utilisateur (hors système de citations).
- Correction du mapping des titres Word vers les styles « Titre 1/2/3 » (écart préexistant observé dans la route DOCX — signalé, hors périmètre).
- Notes dans l'export HTML brut du module PDF.
- Unicité/renvois croisés entre notes.

## Décisions de clarification (conservatrices, modifiables à la recette)

1. **Détection de citations réutilisée** de la logique existante du module Alignement Preuves (citations parenthétiques, narratives ; « et al. », « & ») — extraite dans une bibliothèque partagée dédiée, le module existant n'étant pas retouché (aucun refactor hors périmètre).
2. **Formatage APA des notes** : le formateur APA existant de la route d'export DOCX est extrait tel quel dans une bibliothèque partagée (la route l'importe) ; l'export PDF réutilise la même bibliothèque côté client.
3. **Une note par référence** (première occurrence) plutôt qu'une note par citation : document plus lisible, conforme à l'usage des notes de références.
4. **Bibliothèque globale** : la correspondance citations ↔ références opère sur la bibliothèque existante (globale, non filtrée par thèse — contrainte du schéma actuel, inchangée).
5. **Option par défaut désactivée** : aucune sortie existante ne change tant que le doctorant n'active pas l'option.
