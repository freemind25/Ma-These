# Registre juridique structuré URBANIS-DZ (Option B)

## Problème
Le mode « Expertise urbaine (URBANIS-DZ) » (cycle n°13) raisonne sans support documentaire : le référentiel juridique algérien du pack (§3 ~20 textes, §4 ~16 textes) n'existe nulle part dans l'application sous forme structurée. Les réponses citent donc des textes de mémoire (risque de dérive, aucune vérification JORADP possible, aucune traçabilité de ce qui a nourri une réponse). Le §7 du pack définit un format de registre à 11 champs qui n'a aucun équivalent en base (`CustomBookSkill.source` est une chaîne libre).

## Utilisateur concerné
Doctorant (thèse urbanisme/TIC/IA, utilisateur du mode URBANIS-DZ) · administrateur.

## Comportement attendu

US-1 — En tant que doctorant, je veux un registre juridique gérable (créer, modifier, activer/désactiver, supprimer) afin d'entretenir la couche documentaire du pack.
- CA-1.1 Étant donné l'onglet dédié, quand j'ouvre la liste, alors chaque entrée affiche référence, domaine, statut, JORADP (si renseigné), niveau de confiance et date de dernière vérification (si renseignée).
- CA-1.2 Étant donné une entrée créée via le formulaire, quand je l'enregistre, alors elle apparaît dans la liste avec ses 11 champs persistés et reste disponible après rechargement.
- CA-1.3 Étant donné une entrée, quand je bascule son interrupteur « Utilisée par l'IA », alors l'état persiste (désactivée par défaut à la création).

US-2 — En tant que doctorant, je veux que le référentiel juridique actif nourrisse le mode URBANIS-DZ, afin que les réponses s'appuient sur des textes identifiés et traçables.
- CA-2.1 Étant donné le mode « Expertise urbaine (URBANIS-DZ) » actif et ≥ 1 entrée activée, quand je génère, alors la réponse s'appuie sur le registre et le bloc « Provenance des savoirs » liste les entrées injectées avec leur mode (intégral / index seulement).
- CA-2.2 Étant donné 0 entrée activée (ou un autre mode, ou un autre flux), quand je génère, alors le prompt est inchangé à l'octet près (aucune section, aucune entrée au stamp) — non-régression prouvée par test.
- CA-2.3 Étant donné le budget de contenu dépassé, quand plusieurs entrées sont actives, alors les entrées au-delà du plafond restent en index avec mention explicite et jamais tronquées au milieu d'un bloc.

US-3 — En tant que doctorant, je veux un registre pré-alimenté avec les textes du pack, afin de ne pas saisir 36 références à la main.
- CA-3.1 Étant donné une base vide, quand l'alimentation initiale s'exécute, alors les entrées des §3 et §4 du pack URBANIS-DZ v1.1 existent avec leurs champs fidèles (référence, portée/usage, statut/vigilance tels que formulés dans le pack).
- CA-3.2 Étant donné une entrée issue du pack portant une vigilance (« À vérifier au JORADP », « Modifié et complété ; vérifier »…), quand je la consulte, alors cette vigilance est visible telle quelle — jamais convertie en affirmation de statut.

## Règles transverses (obligatoires)
- Le registre est un appui documentaire : aucune règle du prompt ne transforme une entrée en autorisation ou en citation bibliographique ; la mention « avis non opposable — vérifier au JORADP » reste applicable (cycle n°13).
- Le stamp de provenance est étendu additivement : les stamps existants (JSON sans champ legalRefs) restent valides et affichés.

## Hors périmètre
Veille JORADP / connecteur (option C, cycle dédié si demandé) ; OCR ; injection du registre dans les chapitres de thèse ou d'autres modes ; extraction automatique de textes depuis le JORADP.

## Zones floues — arbitrées sous délégation (choix conservateurs, révisables à la recette)
1. Périmètre d'injection → **mode `expertise-urbaine-dz` uniquement** (c'est la couche documentaire de CE mode ; les chapitres de thèse ne consomment pas le droit algérien) — révisable.
2. État initial des 36 entrées seedées → **activées** (le registre existe pour être utilisé par le mode ; interrupteur individuel permet de retirer une entrée) — révisable.
3. Emplacement UI → **nouvel onglet « Registre juridique »** dans le module « Livres & compétences » (hôte existant des savoirs injectables, sans toucher la navigation latérale) — révisable.
