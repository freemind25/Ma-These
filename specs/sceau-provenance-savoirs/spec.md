# Provenance des savoirs — traçabilité des influences IA par génération

## Problème

L'IA de rédaction mobilise aujourd'hui deux canaux de savoirs : le noyau de connaissance intégré (socle méthodologique) et les compétences livres activées par le propriétaire (canal opt-in, cycle 11). Or **rien ne trace ce qui a influencé une génération donnée** : une fois le texte inséré dans un chapitre, le doctorant ne peut plus dire quelle connaissance a nourri ce texte, ni quand, ni sous quelle forme (contenu intégral ou simple index).

Pour un outil dont la promesse est l'intégrité académique, l'influence IA sur le manuscrit est **invisible et non justifiable a posteriori**. C'est le chantier que la spécification du cycle 11 a explicitement reporté (« stamp de version des savoirs dans les métadonnées de génération »).

## Utilisateur concerné

Doctorant (auteur du manuscrit, seul à manipuler les générations). Le directeur de thèse et l'administrateur bénéficient indirectement de la transparence.

## Comportement attendu

**US-1 — Voir les influences au moment de la génération (brouillon de chapitre).**
En tant que doctorant, quand je lance une génération, je veux voir quels savoirs participent, afin de garder la maîtrise de l'influence IA avant d'insérer.

- CA-1.1 Étant donné une génération terminée, quand l'aperçu du brouillon s'affiche, alors il indique la provenance : « Noyau de connaissance » accompagné de sa version, puis la liste des compétences livres actives (par titre, dans l'ordre d'injection), chacune distinguée « injectée en intégral » ou « index seulement (budget) ».
- CA-1.2 Étant donné 0 compétence active, quand je génère, alors la trace se limite au noyau avec la mention « aucune compétence livre active » — aucun bloc vide parasite.
- CA-1.3 Étant donné le prompt envoyé à l'IA, quand la trace est affichée, alors le contenu du prompt est strictement identique à l'actuel (la trace est un affichage pour le doctorant, jamais un élément du prompt — non-régression byte-identique).

**US-2 — La trace voyage avec le texte à l'insertion.**
En tant que doctorant, je veux que chaque état du texte de chapitre conserve la provenance des savoirs qui ont produit **cet** état, afin de justifier a posteriori de l'influence des outils IA.

- CA-2.1 Étant donné un brouillon inséré après confirmation, quand je consulte le chapitre ou son historique, alors l'état courant porte la trace des savoirs (noyau + compétences, même format que l'aperçu).
- CA-2.2 Étant donné l'historique des versions, quand un état antérieur a été remplacé, alors il conserve la trace qui était la sienne au moment où il était courant (aucune réécriture d'historique).
- CA-2.3 Étant donné une sauvegarde manuelle sans génération IA, quand elle remplace un contenu tracé, alors l'état courant devient « saisie manuelle » et l'état antérieur garde sa trace d'origine.

**US-3 — Même transparence dans l'assistant d'écriture.**

- CA-3.1 Étant donné une génération de l'assistant d'écriture, quand le résultat s'affiche, alors la même trace est visible (noyau version + compétences actives, même format).
- CA-3.2 Étant donné que l'assistant d'écriture livre son texte par copie manuelle (aucun lien automatique au chapitre), quand je copie le résultat, alors la trace n'est pas persistée pour ce flux — elle n'existe qu'à l'écran, au moment de la génération.

**US-4 — Le noyau de connaissance est identifiable et documenté.**

- CA-4.1 Étant donné le noyau de connaissance, quand sa composition change (module ajouté, contenu édité), alors sa version affichée change aussi ; tant qu'il ne change pas, elle reste stable.
- CA-4.2 Étant donné la documentation d'architecture, quand la version du noyau évolue, alors elle y est consignée avec la date et le périmètre du changement.

## Hors périmètre

- Modifier le Truthmark (Sceau de cohérence) : indicateur de cohérence distinct, inchangé — la provenance vit dans les aperçus et l'historique du chapitre.
- Trace pour les autres flux IA : soutenance, recherche profonde, vérifications (cohérence, méthodologique…), chat directeur, hypothèses.
- Persistance de la trace pour l'assistant d'écriture (copie manuelle, pas de lien au chapitre).
- Mention de provenance incluse dans le texte copié ou exporté (DOCX/PDF) — pollution du manuscrit refusée.
- Hash cryptographique du socle à l'exécution — une version déclarée et tenue à la main suffit.
- Traçabilité des références bibliographiques autorisées (déjà visibles par chapitre).

## Zones floues — tranchées et validées par le propriétaire (2026-10-03)

Le propriétaire a validé la spec, le plan et les trois propositions conservatrices (« ok », IM 2026-10-03) :

1. **Affichage dans l'historique** : résumé court en ligne, détail dépliable au clic.
2. **Sauvegardes sans IA** : mention explicite « saisie manuelle ».
3. **Nommage visible** : « Provenance des savoirs — quels savoirs ont nourri ce texte ».
