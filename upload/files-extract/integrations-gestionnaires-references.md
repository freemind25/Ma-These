# Intégrations avec les gestionnaires de références (optionnel)

Ce fichier est un appendice d'outillage. Il n'est **pas requis** pour la rigueur scientifique du skill `analyse-documentaire-scientifique` — à consulter uniquement si l'utilisateur travaille déjà avec Mendeley, Zotero, Notion ou Obsidian et souhaite faire transiter le corpus ou les livrables via ces outils.

## Import du corpus vers l'analyse

| Source | Méthode | Usage |
|---|---|---|
| Mendeley | Export BibTeX/RIS, ou API OAuth2 (SDK Python) | Récupérer titre, auteurs, année, résumé, DOI, tags |
| Zotero | Export BibTeX/RIS, ou API (bibliothèque `pyzotero`) | Idem |
| Notion | Export API ou Markdown | Import manuel des métadonnées |
| Obsidian | Fichiers Markdown avec frontmatter YAML | Plugin communautaire de synchronisation |

## Convention de tags par protocole (si utilisé dans un gestionnaire de références)

| Protocole | Tag suggéré |
|---|---|
| #01 Clusters | `Cluster:NOM` |
| #02 Contradictions | `Contradiction:SUJET` |
| #03 Chaîne de citations | `Concept:NOM` |
| #04 Lacunes | `Lacune:SUJET` |
| #05/#05bis Qualité méthodologique | `Methodo:TYPE` / `RisqueBiais:NIVEAU` |
| #06 Synthèse | `Consensus:OUI_NON` |
| #07 Hypothèses | `Hypothese:NOM` |
| #08 Carte de connaissances | `Pilier:NOM` |
| #09bis Certitude | `Certitude:NIVEAU` |
| #09 Et alors ? | `Impact:ELEVE_MOYEN_FAIBLE` |

## Script d'extraction (squelette, à adapter)

Nécessite `pip install mendeley-updated` (ou `pyzotero` pour Zotero). Authentification OAuth2 nécessaire côté utilisateur — ne jamais demander à l'utilisateur de transmettre un client secret en clair dans la conversation ; renvoyer vers la documentation officielle de l'API choisie pour la configuration des identifiants.

Principe général du script :
1. Authentification à la bibliothèque (Mendeley/Zotero).
2. Extraction des métadonnées de chaque document (titre, auteurs, année, résumé, DOI, tags).
3. Export vers un format tabulaire (`corpus_export.json` ou `.csv`) consommable par les protocoles d'analyse.
4. Après analyse, ré-injection optionnelle des livrables comme notes attachées ou tags dans le gestionnaire de référence d'origine.

## Comparatif rapide

| Critère | Mendeley | Zotero | Notion | Obsidian |
|---|---|---|---|---|
| Type | Gestionnaire de références | Gestionnaire de références | Base de connaissances | PKM local |
| Modèle | Freemium (quota stockage) | Gratuit, open source | Freemium | Gratuit |
| API | OAuth2 | Oui (`pyzotero`) | Oui | Via plugins communautaires |
| Export vers analyse | BibTeX, RIS, API | BibTeX, RIS, API | API, Markdown | Markdown |
| Point fort | Réseau social académique | Open source, extensible | Interface intuitive | Données locales, liens internes |

**Rappel** : quel que soit l'outil de transit choisi, les garanties de traçabilité et de non-hallucination du skill principal (Phase 1 et Phase 3) s'appliquent identiquement — l'origine des métadonnées (gestionnaire de références) ne dispense d'aucune vérification.
