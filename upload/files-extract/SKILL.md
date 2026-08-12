---
name: analyse-documentaire-scientifique
description: Use when analyzing a corpus of scientific articles to produce a literature review, systematic review, scoping review, or evidence synthesis intended for submission to a high-ranking (Class A / Q1) journal. Triggers include revue de littérature, état de l'art, synthèse bibliographique, méta-synthèse, corpus d'articles, audit méthodologique, PRISMA, carte de connaissances, recherche académique en architecture/urbanisme/sciences sociales.
---

# Analyse Documentaire Scientifique — Niveau Publication Classe A

## Overview

Produit une synthèse de corpus scientifique **traçable, falsifiable et pondérée par la qualité des preuves** — pas seulement un résumé structuré. Différence clé avec une revue de littérature ordinaire : chaque affirmation de synthèse est reliée (a) à un protocole de sélection documenté, (b) à une évaluation de la qualité méthodologique des sources, (c) à un niveau de certitude explicite. C'est ce triptyque (traçabilité + appréciation critique + certitude graduée) qu'exigent les comités de lecture de revues indexées (Web of Science Q1/Q2, Scopus classe A, CNRS/HCERES rang A).

**Principe fondateur — violer la lettre du protocole revient à violer son esprit.** Sauter une étape "parce que le corpus est petit" ou "parce que c'est évident" produit un livrable non publiable, pas un raccourci légitime.

## When to Use

- L'utilisateur fournit un corpus de N articles (PDF, texte, DOI, export bibliographique) et demande une synthèse, un état de l'art, une revue systématique/scoping, ou une "analyse avec protocoles".
- Le livrable est destiné à un mémoire, une thèse, un article, une réponse à appel à projets, ou tout document soumis à évaluation par les pairs.

**Ne pas utiliser pour :**
- Résumer un seul article (utiliser une lecture analytique simple).
- Une synthèse de vulgarisation sans ambition de publication (sauter directement au Protocole #09).

## Cadrage protocolaire obligatoire (Phase 0)

Avant tout protocole, **fixer et faire valider par l'utilisateur** :

1. **Type de revue visé** — Systématique (PRISMA 2020) / Scoping (PRISMA-ScR) / Narrative structurée (SANRA) / Intégrative. Le type change le niveau d'exigence appliqué ci-dessous.
2. **Question de recherche cadrée** — format PICO/PICOS (Population, Intervention/phénomène, Comparateur, Outcome, Setting) ou son équivalent en sciences sociales/urbanisme (Objet, Contexte, Échelle, Période, Résultat attendu).
3. **Critères d'inclusion / exclusion explicites** — période, langue, type de document (peer-reviewed only ?), méthodologie minimale acceptée.
4. **Stratégie de recherche documentée** — bases de données, équations de recherche, date de la recherche (même si le corpus est déjà fourni par l'utilisateur : consigner que la stratégie de recherche amont n'a pas été auditée par Claude — limite à déclarer en Protocole #11).

**Règle anti-rationalisation** : si l'utilisateur dit "passe directement aux protocoles, j'ai déjà mon corpus" → exécuter quand même Phase 0 sous forme allégée (3 questions fermées, pas un questionnaire complet) et **consigner les réponses dans `00_Protocole_cadrage.md`**. Ne jamais l'omettre silencieusement : un corpus sans critères d'inclusion documentés est le premier point de rejet en relecture de classe A.

## Phase 1 — Ingestion et traçabilité (PRISMA-compatible)

1. Vérifier le format de chaque source, extraire métadonnées (auteurs, année, titre, DOI, revue, facteur d'impact si disponible).
2. **Flux de sélection** (même rétrospectif) : identifié → doublons retirés → écrans (titre/résumé) → texte intégral évalué → inclus. Consigner les exclusions **avec motif** dans `Annexes/Journal_exclusions.md` (ex. : hors période, langue, méthodologie non pertinente, accès impossible).
3. **Garde anti-hallucination** : n'utiliser que des articles réellement fournis par l'utilisateur. Ne jamais inventer un article, un DOI, une citation, ou un résultat non présent dans le texte source. Si une métadonnée est absente (année, DOI manquant), l'indiquer comme `non renseigné` — ne jamais la déduire ou l'inventer.
4. Confirmer avec l'utilisateur : nombre d'articles, sujet, type de revue retenu en Phase 0.

## Phase 2 — Les 12 protocoles

Les 9 protocoles originaux sont conservés (ils couvrent la structuration, les contradictions, l'historiographie des concepts, les lacunes, l'audit méthodologique de surface, la synthèse, les hypothèses tacites, la carte de connaissances et la vulgarisation). **Trois protocoles sont ajoutés** parce que leur absence est la principale faiblesse du document source face aux exigences de classe A : sans eux, la synthèse traite des preuves faibles et fortes à égalité, ce qu'aucun comité de lecture rigoureux n'accepte.

| # | Protocole | Statut | Pourquoi |
|---|-----------|--------|----------|
| 01 | Tableau structurant + clusters | Conservé | Base de structuration, inchangé |
| 02 | Détecteur de contradictions | Conservé | — |
| 03 | Chaîne de citations (historiographie de concepts) | Conservé | — |
| 04 | Scanner de lacunes | Conservé | — |
| 05 | Audit méthodologique (typologie, échantillon, limite) | Conservé + renforcé | Voir 05bis ci-dessous, indissociable |
| **05bis** | **Grille d'appréciation critique de la qualité** | **Ajouté** | Sans grille standardisée (type CASP, MMAT, Cochrane RoB2, Newcastle-Ottawa selon le design), "limite principale" en une ligne ne suffit pas : un comité de lecture exige un score ou un niveau de risque de biais par étude, pas une impression qualitative |
| 06 | Synthèse maîtresse (400 mots) | Conservé + pondéré | La synthèse doit désormais **pondérer chaque affirmation par la qualité des études qui la soutiennent** (cf. 05bis), pas par simple comptage d'articles |
| 07 | Tueur d'hypothèses tacites | Conservé | — |
| 08 | Carte de connaissances | Conservé + pondéré | Idem 06 : les "piliers de soutien" doivent indiquer le niveau de qualité des preuves qui les portent |
| **09bis** | **Certitude des preuves (échelle graduée)** | **Ajouté** | Inspiré de l'approche GRADE : pour chaque affirmation clé de la synthèse maîtresse et de la carte de connaissances, attribuer Élevée / Modérée / Faible / Très faible, en fonction de la cohérence inter-études, du nombre d'études, et de leur qualité méthodologique. C'est l'élément le plus souvent absent des synthèses non publiables |
| 09 | Test "Et alors ?" | Conservé | — |
| **10** | **Limites et réflexivité** | **Ajouté** | Toute revue de classe A exige une section limites explicite : limites du corpus (couverture, biais de langue/date/accès), limites de la méthode (revue narrative vs systématique, absence de double codage indépendant), et **déclaration explicite que l'analyse a été réalisée par IA générative**, avec recommandation de vérification humaine experte avant soumission |

### Protocole #05bis — Grille d'appréciation critique

**Objectif** : transformer l'audit méthodologique de surface en évaluation de la qualité des preuves.

**Étape** :
1. Identifier le design de chaque étude (essai contrôlé, étude observationnelle, étude de cas, simulation, revue, ethnographie, etc.).
2. Appliquer une grille adaptée au design — paraphraser, ne jamais reproduire verbatim une grille protégée :
   - Études quantitatives/expérimentales : adéquation de la taille d'échantillon, présence de groupe de comparaison, contrôle des biais de sélection, transparence des méthodes statistiques.
   - Études qualitatives : clarté du cadre conceptuel, cohérence entre question de recherche et méthode de collecte, transparence du processus d'analyse, réflexivité des auteurs.
   - Revues/méta-analyses citées dans le corpus : exhaustivité de la stratégie de recherche déclarée, gestion du biais de publication.
3. Attribuer un niveau de risque de biais : **Faible / Modéré / Sérieux / Critique**, avec justification en une phrase.
4. Produire le tableau : `Article | Design | Niveau de risque de biais | Justification`.

**Règle** : ne jamais attribuer un niveau "Faible" par défaut faute d'information — en l'absence d'éléments suffisants, indiquer "Non évaluable" et le signaler comme limite.

### Protocole #09bis — Certitude des preuves

Pour chaque affirmation centrale de la Synthèse Maîtresse (#06) et chaque Pilier de Soutien de la Carte de Connaissances (#08) :

`Affirmation | Nombre d'études convergentes | Niveau de risque de biais dominant (issu de 05bis) | Cohérence inter-études | Certitude : Élevée/Modérée/Faible/Très faible | Justification (1 phrase)`

**Règle de dégradation** : la certitude descend d'un niveau si risque de biais sérieux dominant, si forte hétérogénéité non expliquée entre études, ou si une seule étude porte l'affirmation.

### Protocole #10 — Limites et réflexivité

Livrable en 4 points (max 200 mots) :
1. **Limites du corpus** — couverture (langues, période, bases de données non auditées si le corpus a été pré-constitué par l'utilisateur), biais d'accès.
2. **Limites méthodologiques de l'analyse** — absence de double codage indépendant (un seul "évaluateur" : Claude), absence de méta-analyse quantitative si elle aurait été appropriée.
3. **Limites de l'IA générative** — risque résiduel d'erreur d'extraction malgré les gardes anti-hallucination ; recommandation explicite de vérification humaine experte avant publication.
4. **Conflits d'intérêts** — signaler si le corpus comporte des études dont les financements/auteurs créent un risque de biais de publication identifiable à partir des métadonnées disponibles.

## Phase 3 — Assemblage final (révisé)

1. Compiler les 12 livrables.
2. Vérifier la cohérence transversale : toute affirmation de la Synthèse Maîtresse (#06) ou de la Carte de Connaissances (#08) doit être traçable jusqu'à un article du corpus ET porter un niveau de certitude (#09bis).
3. **Passe de vérification finale obligatoire** : relire chaque citation (Auteur, Année) insérée dans les livrables et confirmer qu'elle correspond bien à un article du corpus fourni, avant livraison. Ne jamais sauter cette passe pour gagner du temps.
4. Ajouter un résumé exécutif (1 page) mentionnant le type de revue (Phase 0) et le niveau de certitude global du corpus.
5. Proposer des visualisations : diagramme de flux PRISMA (si revue systématique/scoping), carte conceptuelle, et — si suffisamment d'études quantitatives comparables existent — signaler l'opportunité d'une méta-analyse quantitative (forest plot) en complément, sans la réaliser soi-même si les données ne sont pas extractibles de façon fiable.
6. Livrer avec table des matières.

## Conditions d'exécution

**Contraintes (inchangées + renforcées)** :
- Utiliser UNIQUEMENT les documents fournis.
- Signaler explicitement toute information absente — jamais de comblement par déduction.
- Ne jamais inventer un consensus, une contradiction, un article, ou une citation.
- Distinguer systématiquement "affirmation de l'article" vs "interprétation de l'analyste".
- **Pondérer toute synthèse par la qualité méthodologique (05bis), jamais par simple comptage d'articles.**
- **Documenter chaque exclusion d'article avec motif** (traçabilité PRISMA).

**Qualité** :
- Clarté maximale, citations précises (Auteur, Année, et DOI si disponible).
- Markdown structuré pour tous les livrables.
- Aucun jargon inutile dans le Protocole #09.
- Aucune citation verbatim de plus de quelques mots issue des articles sources — paraphraser systématiquement, même en citant la position d'un auteur.

## Format de sortie (révisé)

```
ANALYSE_COMPLETE_CORPUS_[SUJET]_[DATE]/
├── 00_Protocole_cadrage.md          (NOUVEAU — Phase 0 : type de revue, PICO(S), critères)
├── 00_Resume_executif.md
├── 01_Protocole_analyse.md
├── 02_Detecteur_contradictions.md
├── 03_Chaine_citations.md
├── 04_Scanner_lacunes.md
├── 05_Audit_methodologique.md
├── 05bis_Grille_qualite.md          (NOUVEAU)
├── 06_Synthese_maitresse.md         (pondérée par qualité)
├── 07_Tueur_hypotheses.md
├── 08_Carte_connaissances.md        (pondérée par qualité)
├── 09_Test_et_alors.md
├── 09bis_Certitude_preuves.md       (NOUVEAU)
├── 10_Limites_reflexivite.md        (NOUVEAU)
├── Annexes/
│   ├── Journal_exclusions.md        (NOUVEAU — traçabilité PRISMA)
│   ├── Tableaux_corpus.csv
│   └── Visualisations_suggerees.md
└── README.md
```

## Personnalisation

| Paramètre | Options |
|---|---|
| Type de revue | Systématique (PRISMA) / Scoping (PRISMA-ScR) / Narrative structurée (SANRA) / Intégrative |
| Nombre d'articles | 5 à 50+ (au-delà de ~40, signaler l'intérêt d'une méta-analyse quantitative séparée) |
| Référentiel de qualité (05bis) | Adapté au design dominant du corpus : quantitatif expérimental / observationnel / qualitatif / mixte |
| Profondeur | Rapide (sans 05bis/09bis) / Standard / Approfondi (classe A, 12 protocoles complets) |
| Domaine | Architecture, urbanisme, sciences sociales, biologie, IA, etc. |
| Langue des livrables | Français / Anglais |

**Avertissement obligatoire au niveau "Rapide"** : si l'utilisateur choisit "Rapide" (sans grille de qualité ni certitude des preuves), le livrable final doit porter la mention "Synthèse exploratoire — niveau de rigueur insuffisant pour soumission à une revue de classe A" en en-tête du résumé exécutif.

## Quick Reference — Différences vs version initiale

| Lacune identifiée dans le document source | Exigence classe A correspondante | Correction apportée |
|---|---|---|
| Aucun frontmatter Claude Skills | Format `name`/`description` requis pour activation/découverte | Ajouté en tête de ce fichier |
| Pas de critères d'inclusion/exclusion documentés | PRISMA item 5-6, traçabilité de la sélection | Phase 0 + Annexes/Journal_exclusions.md |
| Audit méthodologique = "limite principale" en 1 ligne | Grille d'appréciation critique standardisée (CASP/MMAT/RoB2) | Protocole #05bis |
| Synthèse par comptage d'articles, équipondération implicite | Pondération par qualité des preuves | #06/#08 pondérés via #05bis |
| Aucune échelle de certitude des affirmations | Approche type GRADE | Protocole #09bis |
| Aucune section limites/réflexivité/IA | Exigée par tout comité de lecture (transparence méthodologique) | Protocole #10 |
| Pas de passe de vérification anti-hallucination explicite | Intégrité scientifique, zéro citation fabriquée | Étape 3, Phase 3 |
| Bloc Mendeley/Notion/Zotero/scripts Python noyé dans le skill | Un skill doit rester une technique réutilisable, pas un manuel d'outils tiers | Déplacé en fichier de référence séparé (voir `reference/`) |
| Grilles de qualité (CASP/MMAT) absentes du corpus de connaissances | Nécessaires en 05bis | Résumées (paraphrasées) dans `reference/grilles-qualite-appraisal.md` |

## Common Mistakes

- **Équipondérer le consensus** : traiter une étude de cas et un essai contrôlé à poids égal dans la Synthèse Maîtresse → toujours pondérer par 05bis.
- **Citer un article jamais fourni** : zéro tolérance, vérifier systématiquement (Phase 3, étape 3).
- **Confondre revue narrative et revue systématique** : le niveau d'exigence (et donc les livrables attendus) diffère ; toujours clarifier en Phase 0.
- **Oublier le journal des exclusions** : un comité de lecture demandera "pourquoi ces articles et pas d'autres ?" — la réponse doit déjà exister.
- **Déclarer une certitude "Élevée" sur la base d'une seule étude** : interdit par la règle de dégradation du Protocole #09bis.

## Fichiers de référence (optionnels, hors cœur du skill)

- `reference/grilles-qualite-appraisal.md` — repères paraphrasés pour l'appréciation critique par type de design (Protocole #05bis).
- `reference/integrations-gestionnaires-references.md` — intégrations optionnelles avec Mendeley/Zotero/Notion/Obsidian (non requis pour la rigueur scientifique, fourni à titre d'outillage).
