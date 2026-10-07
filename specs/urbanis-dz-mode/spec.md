# Spec — Mode « Expertise urbaine (URBANIS-DZ) »

## Problème
Le propriétaire a développé le pack URBANIS-DZ (v1.1, `upload/URBANIS-DZ_Pack_construction_agent.pdf`) : une instruction système spécialisée (12 règles dures, modes M1-M7, protocole risques, format de sortie avec bloc de traçabilité) pour l'expertise urbaine en Algérie. Ce savoir-faire n'est aujourd'hui utilisé nulle part dans ThesisFrame : aucun mode d'écriture ne porte la doctrine urbaine (non-complaisance, trois registres, échelle, droit vérifié au JORADP), alors que la thèse en cours porte précisément sur l'urbanisme.

Décision du propriétaire : intégration **Option A** de l'analyse préliminaire (`specs/urbanis-dz-integration/analyse-preliminaire.md`) — mode spécialisé dans le mécanisme existant des 27 spécialisations. Zéro migration, zéro ligne rouge, zéro noyau de connaissance.

## Utilisateur concerné
Doctorant (thèse urbanisme/TIC/IA) · chercheur en urbanisme.

## Comportement attendu

US-1 — En tant que doctorant, je veux un mode « Expertise urbaine (URBANIS-DZ) » dans l'assistant d'écriture, afin de produire des livrables urbains (lecture, diagnostic, conformité, prospective) conformes aux règles dures du pack.
- CA-1.1 Étant donné la liste des modes d'écriture, quand je la parcours, alors le mode « Expertise urbaine (URBANIS-DZ) » apparaît avec libellé, description mentionnant l'« avis technique non opposable », icône dédiée et catégorie.
- CA-1.2 Étant donné le mode sélectionné, quand je génère un livrable structurant, alors la réponse suit le format de sortie du pack (demande comprise/cadrage, analyse, constats hiérarchisés, enjeux, options, vérifications, bloc de traçabilité) et mentionne l'« avis technique non opposable ».
- CA-1.3 Étant donné une question de type banc d'essai du pack (ex. « Peut-on construire ici ? » sans plan ni étude), quand je la soumets au mode, alors l'agent refuse de conclure : il propose un cadrage par défaut explicite et marque les hypothèses (recette live).
- CA-1.4 Étant donné le mode actif, quand je regarde l'interface, alors une note visible rappelle la non-opposabilité des sorties et la vérification au JORADP.

US-2 — En tant que propriétaire, je veux que l'instruction système soit fidèle au pack (§2) et protégée contre la dérive.
- CA-2.1 Étant donné le prompt de spécialisation, quand je le vérifie, alors les 12 règles dures (VÉRITÉ…LIMITES), les modes M1-M7, le protocole RISQUES et le FORMAT DE SORTIE y sont présents verbatim (tests automatisés).
- CA-2.2 Étant donné le prompt du mode, quand je mesure sa taille, alors il n'embarque pas le noyau de connaissance (autoporteur — prompt nettement plus court que le module « methodology » seul).
- CA-2.3 Étant donné une génération en mode URBANIS-DZ, quand le résultat s'affiche, alors le bloc « Provenance des savoirs » du cycle 12 continue de s'afficher (non-régression).

## Hors périmètre
- Registre juridique structuré (`LegalRef`, 11 champs §7 du pack) — Option B, cycle séparé.
- Connecteur/veille JORADP — Option C, déconseillée (pas d'API publique stable).
- Injection du référentiel juridique §3 et sous-référentiel risques §4 dans les prompts.
- Extension du pack aux autres flux (brouillon de chapitre, soutenance, deep-research, chat directeur).
- Truthmark, lignes rouges, schéma Prisma, budget du noyau de connaissance (21 794/22 000 tok — intouché).

## Zones floues
Aucune — le propriétaire a validé l'Option A telle que décrite. Choix conservateurs consignés au plan : 1 seul mode (l'agent route lui-même M1-M7, conformément au design du pack), texte §2 verbatim + passerelle d'intégration minimale (3 lignes, signalée comme ajout), prompt autoporteur sans noyau, température 0,4, icône « Building2 ».
