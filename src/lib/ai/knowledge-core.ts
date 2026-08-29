// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Knowledge Core v2 (distillé de 9 ouvrages de référence)
// SOURCE UNIQUE DE VÉRITÉ — savoir métier digéré
// ═══════════════════════════════════════════════════════════════
//
// RÈGLE ANTI-DUPLICATION :
// Ce fichier est la SEULE source de savoir métier pour tous les prompts IA.
// Les fichiers de spécialisation ne doivent JAMAIS dupliquer ces contenus.
// Toute modification de savoir métier se fait ICI uniquement.
//
// Sources distillées :
//   Kumar — Research Methodology (methodology-design, ethics)
//   Salkind — 100 Questions About Research Methods (methodology-basics, ethics, stats)
//   White — Mapping Your Thesis (writing-process, style, revision)
//   Ollhoff — How to Write a Literature Review (literature-review)
//   Rae & Wong — Applied Data Analysis (data-analysis)
//   Smith & Works — Complete Book of Grant Writing (grant-writing)
//   Gastel & Day — How to Write and Publish a Scientific Paper (publication)
//   David — AI for Nonfiction Authors (AI ethics : copyright, disclosure, hallucination)
//   Green — Claude AI Unleashed (AI ethics : hallucination taxonomy)
//
// ═══════════════════════════════════════════════════════════════

/**
 * Module identifiers that can be selectively injected.
 * Specializations declare which modules they need.
 */
export type KnowledgeModule =
  | "style"
  | "ethics"
  | "coherence"
  | "auto-edition"
  | "peer-review"
  | "methodology"
  | "writing-process"
  | "literature-review"
  | "data-analysis"
  | "grant-writing"
  | "publication";

// ───────────────────────────────────────
// Module: STYLE — règles rédactionnelles (White + existant)
// ───────────────────────────────────────

const STYLE_MODULE = `
## STYLE RÉDACTIONNEL
- Français académique soigné, vouvoiement
- Phrases de 25-30 mots en moyenne
- Connecteurs logiques explicites (cependant, en revanche, ainsi, par conséquent)
- Citations entre parenthèses : (Auteur, Année)
- Jargon non défini interdit — chaque terme technique défini à première occurrence
- Affirmations non étayées interdites
- Fond avant forme : prioriser la clarté des idées sur la perfection linguistique

### Paragraphe académique (White)
- Un paragraphe = une idée directrice (controlling idea)
- Longueur : ½ à ¾ page A4 (interligne 1.5) ; chapitre de 20 pages ≈ 30 paragraphes
- Phrase thématique (topic sentence) le plus près possible du début — jamais de citation en ouverture
- Variante efficace : question rhétorique ouvrante
- Regrouper les sous-parties d'une même idée dans un même paragraphe

### Pièges de style (White)
- Voix passive abusive : masque l'agent, crée fausse objectivité. Exceptions légitimes : section Méthodes, agent évident/inconnu.
- Mots-persuadeurs (weasel words) : « sûrement », « évidemment », « indéniablement » — perçus comme tentatives illicites de pousser le lecteur.
- Hedging (modulation) : échelle *suggère* < *appuie* < *confirme*. Moduler sans éluder.
- Sur-écriture et quiltage : collage de segments de texte. Chaque révision doit « serrer » le texte.
- Évitement de la responsabilité : « Il est pensé que… » → « Les preuves indiquent que… »
- Règle des 10 % : un texte final peut presque toujours être réduit de 10 % et s'améliorer.
`;

// ───────────────────────────────────────
// Module: ETHICS — éthique (existant + Kumar + Salkind)
// ───────────────────────────────────────

const ETHICS_MODULE = `
## ÉTHIQUE DE LA RECHERCHE ET PUBLICATION

### Plagiat et intégrité
- Paraphrase suffisante obligatoire : le simple remplacement de mots ne suffit pas
- Détection de l'auto-plagiat entre articles d'une même thèse
- Salami science : découpage artificiel d'un même travail en plusieurs articles
- Déclarations de conformité éthique exigées

### Consentement et participants (Kumar + Salkind)
- SI participants humains ALORS consentement éclairé obligatoire (compétence, information, volontarité)
- SI participants incompétents (enfants, personnes en crise) ALORS consentement par tiers + formulaire d'assentiment adapté (> 6 ans)
- SI informations sensibles ALORS anonymiser, donner temps de décision
- Incitatif APRÈS collecte = acceptable ; AVANT = non éthique (Kumar)
- SI risque de préjudice ALORS risque doit être ≤ risque quotidien (minimum risk)

### Biais vs. subjectivité (Kumar)
- Biais = non éthique (dissimulation ou surévaluation délibérée)
- Subjectivité ≠ biais (façon de penser, pas altération)
- SI méthodologie inappropriée utilisée délibérément ALORS non éthique
- SI commanditaire impose restrictions sur publication ALORS les déclarer

### IRB (Salkind)
- Pas une formalité : groupe diversifié approbant AVANT la recherche
- Dossier minimal : lieu, financement, résumé, population, méthodes, risques, conflits d'intérêts
- Déception → débriefing obligatoire de tous les participants

### Revues et DORA
- Signaux prédateurs : publication < 2 sem., APC opaques, comité fantôme, non-indexation Scopus/WoS/DOAJ
- DORA : évaluer sur le contenu, pas sur le facteur d'impact
- Seuil .05 : convention de Fisher, aucune base mathématique formelle (Salkind)

### Usage de l'IA dans la recherche
- SI texte généré intégralement par IA sans modification humaine substantielle → non protégeable par le droit d'auteur (US 2025)
- SI IA utilisée pour structurer, réviser, formuler → mention dans les remerciements ou la méthode recommandée
- SI IA a façonné le contenu ou les idées de manière significative → mention dans l'avant-propos ou la section Méthodes
- Ne jamais copier-coller la sortie IA directement : réécrire dans sa propre voix académique
- Types de données les plus souvent hallucinées par les LLM : citations précises (auteur, année, page), statistiques de sources obscures, événements post-cutoff, détails biographiques de personnes non publiques, règles juridictionnelles spécifiques → vérification systématique obligatoire
- L'IA est un assistant de recherche, pas un auteur : authorship ICMJE exige contribution intellectuelle humaine
- Toujours vérifier les faits, statistiques et références produits par l'IA (risque d'hallucination)
- SI l'IA est utilisée pour l'analyse de données → documenter le modèle, la version, et les prompts dans la section Méthodes (reproductibilité)
`;

// ───────────────────────────────────────
// Module: COHERENCE — cohérence du manuscrit (existant, stable)
// ───────────────────────────────────────

const COHERENCE_MODULE = `
## COHÉRENCE DU MANUSCRIT

### Introduction ↔ Discussion
- Chaque question de recherche de l'intro doit recevoir une réponse EXPLICITE dans la discussion
- Chaque hypothèse doit être testée empiriquement et discutée
- Résultats orphelins (discutés sans lien vers une question de l'intro) = à signaler
- Discussion en entonnoir inversé : du spécifique vers le général

### Texte ↔ Tableaux / Figures
- Renvoi au tableau (« comme le montre le Tableau 1 ») n'est PAS redondant
- Citer dans le texte CHAQUE valeur numérique déjà dans le tableau EST redondant
- Reformuler les tendances générales est acceptable si cela apporte une interprétation

### Cohérence numérique
- Mêmes chiffres entre sections ; pourcentages correspondant aux nombres absolus
- Somme des pourcentages = 100% (sauf non-réponses expliquées)
- Dates et périodes compatibles

### Cohérence terminologique
- Un même concept = un même terme dans toute la thèse
- Synonymies explicitées ; abréviations définies à première occurrence
- Un terme ne doit pas glisser subtilement de sens sans justification
- Un même terme ne doit pas être défini différemment selon les chapitres

### Cohérence référentielle
- Un même auteur pas cité avec interprétations opposées sans justification
- Chaque citation dans le texte → dans la bibliographie (sinon = citation fantôme)
- Référence utilisée dans un contexte correspondant à son contenu réel

### Cohérence argumentative
- Deux passages affirment des choses opposées sans concilier la nuance = contradiction interne
- Toute assertion importante sans référence ni preuve = affirmation non étayée
- Corrélation observée présentée comme relation causale = confusion à corriger
- Conclusion étendue au-delà de ce que les données permettent = sur-généralisation

### Cohérence structurelle
- Un chapitre commence sans lien avec le précédent = transition absente
- Le plan annoncé dans l'intro ne correspond pas au plan réel = annonces non tenues
- Un même contenu repris quasi à l'identique dans deux chapitres = redondance inter-chapitres
- La conclusion ne reprend pas les questions de recherche et n'y répond pas = conclusion non bouclée
`;

// ───────────────────────────────────────
// Module: AUTO-ÉDITION — 8 critères (existant, stable)
// ───────────────────────────────────────

const AUTO_EDITION_MODULE = `
## AUTO-ÉDITION — Méthode 8C

Évaluer un texte selon les 8 critères :
1. CONFORMITÉ : respect des consignes formelles (gabarit, conventions)
2. EXHAUSTIVITÉ : tous les éléments attendus présents
3. COMPOSITION : structure d'ensemble appropriée
4. EXACTITUDE : information correcte (texte, tableaux, figures, références)
5. CLARTÉ : termes ambigus définis, abréviations explicitées
6. COHÉRENCE : chiffres identiques texte/tableaux, terminologie stable
7. CONCISION : pas de redondances ni contenu tangentiel
8. COURTOISIE : ton neutre envers travaux antérieurs, langage inclusif

Barème : 90-100 exemplaire | 75-89 bon | 50-74 passable | 25-49 insuffisant | 0-24 critique
`;

// ───────────────────────────────────────
// Module: PEER REVIEW — grille Review Commons (existant, stable)
// ───────────────────────────────────────

const PEER_REVIEW_MODULE = `
## GRILLE DE RELECTURE (Review Commons adaptée)

### Section 1 — Preuve, Reproductibilité, Clarté
1.1 RÉSUMÉ : conclusions principales + méthodologie. Portée → Section 2.
1.2 COMMENTAIRES MAJEURS : affirmations étayées par les données ? Expériences supplémentaires nécessaires et réalistes ? Reproductibilité ? Statistique adéquate ? Suggestions « OPTIONNELLES » si nouvelles pistes.
1.3 COMMENTAIRES MINEURS : problèmes facilement adressables (forme, présentation), références correctes, clarté figures.

### Section 2 — Portée et Signification
2.1 BILAN : forces et limites. Aspects les plus solides vs. à améliorer.
2.2 AVANCÉE vs ÉTAT DE L'ART : comparaison avec résultats proches, nature de l'avancée (conceptuelle, technique, méthodologique, empirique).
2.3 PUBLIC CONCERNÉ : qui sera influencé ? Utilisation au-delà du champ spécifique ?

### Recommandation finale
Choisir : ACCEPTER TEL QUEL | RÉVISIONS MINEURES | RÉVISIONS MAJEURES | REJETER — justifier en 2-3 phrases.
`;

// ───────────────────────────────────────
// Module: METHODOLOGY — arbre de décision (Kumar + Salkind + Rae & Wong)
// ───────────────────────────────────────

const METHODOLOGY_MODULE = `
## MÉTHODOLOGIE DE RECHERCHE

### Arbre de décision (Kumar)
- SI exploratoire (peu connu) → qualitatif (entretiens, observation, focus groups)
- SI descriptive (prévalence, profil) → quantitatif transversal
- SI descriptive + changement → avant-après (attention : maturation, effet réactif)
- SI corrélationnelle (association sans causalité) → transversal ou longitudinal
- SI causale → expérimental ou quasi-expérimental
- SI causalité + comparaison → comparatif expérimental (randomisation, baseline + post)
- SI causalité + éthique (pas de groupe contrôle) → cross-over (ABAB) ou placebo
- SI tendance temporelle → longitudinal, cohorte ou panel
- SI compréhension profonde d'un cas → étude de cas qualitative (méthodes multiples). Préciser l'unité d'analyse plutôt qu'élargir : le critère n'est pas la généralité de la question mais la correspondance question ↔ unité d'analyse. SI le doctorant craint de perdre la richesse de son terrain en précisant → l'étude de cas qualitative est légitime.
- SI les deux (diversité + quantification) → mixte : quali → quanti → quali
- SI valeurs, croyances, significations → qualitatif

### Échantillonnage (Kumar)
- Population finie identifiable → SRS ou systématique
- Population hétérogène sur critère corrélé → stratifié
- Population vaste, dispersée → cluster multi-étapes
- Base inexistante + critère visible → quota ; sans critère → accidentel
- Réseau caché → snowball (piège : biais faction initiale)
- Causalité/hypothèse → taille par confiance, précision, écart-type
- Qualitatif → point de saturation (pas de taille prédéterminée)

### Validité et fiabilité (Kumar)
- Quantitatif : face/content, concurrent/predictive, construct
- Fiabilité : test/retest, formes parallèles, split-half
- Qualitatif (Guba-Lincoln) : crédibilité, transférabilité, dépendabilité, confirmabilité

### Stats : quel test ? (Salkind)
| Question | Test | Condition |
|---|---|---|
| 2 groupes diffèrent ? | t-test | VD quantitative, n > 30 |
| 3+ groupes, 1 facteur ? | ANOVA unifacteur | VD quantitative |
| 3+ groupes, 2+ facteurs ? | ANOVA multifactorielle | VD quantitative |
| Relation 2 variables ? | Corrélation Pearson | Quantitatives, linéaire |
| Prédire Y depuis X ? | Régression | Une ou plusieurs VI |
| 1 groupe vs norme ? | Test Z | Distribution normale connue |
| Nominales/ordinales, petit n ? | Non paramétrique | Chi-carré, Mann-Whitney |
- Toujours reporter taille de l'effet avec p (Salkind) ; corrélation ≠ causalité

### Données spatiales/urbaines (Rae & Wong)
- SI dépendance spatiale entre zones → autorégression spatiale (SAR)
- SI relations varient selon localisation → régression pondérée géographiquement (GWR)
- SI individus imbriqués dans unités administratives → modèle à effets mixtes (multilevel)
- SI big data passif → biais de couverture ; volume ne compense pas
- MAUP : résultats changent selon découpage spatial — amplifié avec big data
- Approche hybride : données traditionnelles (attributs) + big data (fréquence, couverture)

### Erreurs doctorales courantes (Kumar, détectables)
- Instrument mesure autre chose que l'objectif
- Causale sans groupe contrôle ni randomisation
- Avant-après sans contrôle des variables extranes
- Questionnaire non prétesté
- Échelle de Likert sans items positifs ET négatifs
- Transversal présenté comme mesurant le changement
- Questions à double sens, libellé ambigu
`;

// ───────────────────────────────────────
// Module: WRITING PROCESS — argumentation et révision (White)
// ───────────────────────────────────────

const WRITING_PROCESS_MODULE = `
## PROCESSUS DE RÉDACTION (White, Mapping Your Thesis)

### Argumentation : modèle Toulmin
1. Claim (position) — sans preuve = assertion
2. Evidence (preuves empiriques ou textuelles)
3. Warrant (garant) — lien preuve → position
4. Backing (soutien) — renforce le warrant contesté
5. Rebuttal (réfutation) — invalide le warrant adverse

3 stratégies face aux contre-arguments :
- Concession stratégique : qualifier (« généralement », « partiellement »)
- Réfutation : identifier faiblesse fondamentale dans le warrant adverse
- Irrrecevabilité : arguments adverses ne répondent pas aux critères de l'enjeu

Règle : « Les examinateurs ne cherchent pas à être convaincus — ils cherchent un argument qu'ils peuvent prendre au sérieux. »

### Transitions (White)
| Opération | Connecteurs FR |
|---|---|
| Concession | cependant, néanmoins, toutefois |
| Opposition | au contraire, en revanche, à l'inverse |
| Addition | en outre, de plus, par ailleurs, de même |
| Causalité | par conséquent, c'est pourquoi, de ce fait |
| Illustration | par exemple, en effet |
- Piège : rappels en début de chapitre (« Dans le chapitre précédent… ») amputent l'autonomie

### Processus : brouillon → révision → édition
1. Brouillon : centré-auteur, libéré de l'éditeur interne. Thèse exégétique : rédiger chaque chapitre sans retravailler immédiatement.
2. Révision (critère : titre + résumé définitifs) : transformer en texte centré-lecteur. Enlever l'échafaudage (titres redondants, énoncés vides). Réduire de ~10 %.
3. Édition (critère : accent sur mot-à-mot) : élargir le lectorat au-delà du directeur. Relire à voix haute, éditer sur papier.
4. Relecture : grammaire, syntaxe, orthographe uniquement.

### Structure de thèse (White)
Empirique : Intro → Revue littérature → Méthodes → Résultats → Discussion → Conclusion
Exégétique/qualitative : Intro (avec revue enchâssée) → Chapitres thématiques → Conclusion
- Énoncé de thèse (thesis statement) le plus près possible de l'ouverture
- Chapitres de longueur approximativement égale
`;

// ───────────────────────────────────────
// Module: LITERATURE REVIEW — méthode Ollhoff
// ───────────────────────────────────────

const LITERATURE_REVIEW_MODULE = `
## REVUE DE LITTÉRATURE — Méthode Ollhoff (6 étapes)

### Étape 1 — Question de recherche
- Viser 3-5 articles sur un scan de 30-60 min
- Question (pas sujet) : étroite, spécifique, non binaire

### Étape 2 — Sources
- ≥ 75 % de sources évaluées par les pairs
- Drapeaux rouges cumulatifs (pas un seul disqualifiant) :
  · Absence auteur/date/lieu · Auteur sans credentials · Idéologie visible
  · Jamais cité par d'autres · Ton hyperbolique · Confirmation uniquement · Certitude rigide
- 3 strates : recherche (50-100 %, taux déformation 0 %) → professionnelle (25 %) → populaire (50 %, exclure)

### Étape 3 — Immersion
- Critère d'arrêt : point de saturation (lectures ne produisent plus de nouveaux insights)
- Matrice d'analyse : Titre | Auteurs | Question | Méthodologie | Résultats | Drapeaux rouges

### Étape 4 — Plan
- Structure thématique (pas chronologique)
- ~1 page de plan pour 5-10 pages de narration
- Plan détaillé par paragraphe attendu

### Étape 5 — Rédaction
- SI chaque paragraphe résume un seul article → erreur (bibliographie annotée)
- Regrouper par thème, comparer, contraster, identifier tendances
- Couvrir les écoles opposées ; chaque assertion citée ; pas d'opinion

### Étape 6 — Édition
- Checklist : stacking éliminé ? neutralité ? assertions citées ? pas de vagues (« beaucoup de ») ? conformité APA ?

### Erreurs fréquentes
- Confondre sujet et question · Question binaire · Stacking · Plaidoyer déguisé
- Assertions non citées · Vagueness · Côté unique · Lecture perpétuelle (jamais saturer)
`;

// ───────────────────────────────────────
// Module: DATA ANALYSIS — spécificités spatiales (Rae & Wong)
// ───────────────────────────────────────

const DATA_ANALYSIS_MODULE = `
## ANALYSE DE DONNÉES — Spécificités urbaines et spatiales (Rae & Wong)

### Choix de modèle
- SI dépendance spatiale entre zones → SAR (autorégression spatiale). L'OLS ignore cette dépendance et produit des estimateurs biaisés.
- SI relations varient selon localisation → GWR (régression géographiquement pondérée). Révèle hétérogénéités régionales masquées par modèle global.
- SI données non-linéaires, nombreuses variables, big data → ML (clustering, classification). Attention : ML = patterns, pas causalité. Compléter par modèle statistique interprétable.
- SI individus imbriqués dans unités administratives → effets mixtes (multilevel). L'OLS sous-estime les erreurs standard. Vérifier par likelihood ratio test.

### Pièges du big data urbain
- Volume ≠ couverture : données passives excluent non-connectés, orientées par le marché
- R² acceptable : 0.60-0.77 dans pays en développement sans données fiables ; insuffisant sinon
- Court-termisme analytique : exiger cadrage théorique explicite
- MAUP amplifié : résultats changent selon découpage spatial
- Flow data (mobilité) sans attributs socio-économiques → compléter par enquêtes/recensement

### Qualité données participatives
- Norme ISO 19157:2013 : complétude, exactitude thématique, cohérence, qualité temporelle
- Plateformes internationales (OSM) : erreur positionnelle < 10 %
- Contributeurs variés → qualité dégrade ; administrateurs doivent avoir formation géodésie/cartographie

### Gouvernance analytique
- Planning-lag : la technologie précède la capacité d'utilisation → analyses hors-sujet
- Instruments de données = chargés de politique et idéologie
- Approche hybride systématique : traditionnelles (attributs/profondeur) + big data (fréquence/couverture)
`;

// ───────────────────────────────────────
// Module: GRANT WRITING — subventions (Smith & Works)
// ───────────────────────────────────────

const GRANT_WRITING_MODULE = `
## RÉDACTION DE SUBVENTIONS (Smith & Works)

### Structure : 5 composants obligatoires
1. Résumé exécutif (rédiger EN DERNIER) : problème + approche + évaluation + coût + montant
2. Énoncé du besoin : données sourcées (dures + qualitatives), focus COMMUNAUTÉ pas organisation
3. Description du projet : buts + objectifs + résultats + étapes + calendrier
4. Plan d'évaluation : indicateurs + méthode (interne/externe, somnative/formative)
5. Budget + narration : correspondance biunivoque budget ↔ récit, calculs expliqués

### Buts vs. Objectifs vs. Résultats
- But : large, pas mesurable (pas = mission de l'organisation)
- Objectif : mesurable, décrit COMMENT atteindre le but (combien ?)
- Résultat : ce qui changera concrètement (« et alors ? »)
- Étapes d'action : délai + responsable pour chaque objectif

### Plan d'évaluation
- SI aucune méthode de mesure identifiable → revoir l'objectif
- Évaluateur externe : associer dès la CONCEPTION, pas après le début
- Vocabulaire : base de référence, indicateur, modèle logique (intrants → activités → résultats → impacts)

### Motifs de rejet
1. Instructions non suivies (format, ordre, limites) → élimination AVANT lecture
2. Hors périmètre du financeur
3. Lettres de soutien manquantes → rejet immédiat (la subvention = contrat)
4. Pas de mention d'autres organisations du secteur → red flag
5. Budget décorrélé du récit

### LOI (Letter of Inquiry)
- 4 composants (pas de résumé) : besoin + projet + évaluation + budget
- ¶1 = projet, ¶2 = besoin, ¶3 = plan, ¶4 = coût + demande d'invitation
- 2-4 pages max ; signaler que d'autres financeurs seront sollicités
`;

// ───────────────────────────────────────
// Module: PUBLICATION — cycle, revue, éthique pub., vérification (Gastel & Day)
// ───────────────────────────────────────

const PUBLICATION_MODULE = `
## PUBLICATION SCIENTIFIQUE

### Cycle de publication
- SI année 1-2 → prioriser rédaction thèse, pas soumission hâtive
- SI chapitre = résultat original autonome et solide → candidat article
- SI thèse par articles → chaque chapitre = article soumis/accepté + chapitre synthèse
- SI thèse traditionnelle → extraire 1-2 articles post-soutenance
- SI plusieurs chapitres = même jeu de données → un seul article (anti-salami)
- SI article soumis avant soutenance → chapitre correspondant doit être compatible

### Choix de revue
- SI revue choisie AVANT rédaction → manuscrit calibré, moins de révisions
- SI travaux de référence du sous-champ publiés dans cette revue → bon indicateur de scope
- SI indexée Scopus/WoS/DOAJ → signal de légitimité
- SI APC > budget → demander waiver AVANT soumission
- SI revue < 2 ans sans société savante → vérifier légitimité
- DORA : évaluer sur contenu, pas sur facteur d'impact comme critère principal
- Signaux prédateurs : garantie rapide | site mal écrit | métrique propriétaire | pas d'articles vérifiables | sollicitations agressives

### Éthique de publication
- Paraphrase : SI structure identique + mots remplacés → insuffisante. SI rédigé sans consulter puis vérifié → valide.
- Citation littérale entre guillemets + source complète (auteur, année, page) → PERMIS mais exceptionnel (réservé aux définitions, formulations canoniques). Norme = paraphrase. SI reprise sans guillemets, même avec source → plagiat de paraphrase insuffisante.
- Salami : SI articles partagent méthode + données + ne diffèrent que par sous-ensemble résultats → salami probable
- Soumission simultanée 2+ revues → non éthique. Dry-labbing → faute sans degré.
- Authorship ICMJE : contribution substantielle + rédaction/révision + approbation finale + responsabilité → 4 critères obligatoires. Auteur sans contribution = fantôme (non éthique).
- Déclarations : SI sujets humains/animaux → approbation éthique dans méthode. SI conflit d'intérêts → déclarer.

### Vérification avant soumission
IMRAD — erreurs fréquentes :
- SI intro sans vide comblé → sans orientation
- SI méthode non répliquable → incomplète
- SI résultats présentés mais non discutés → orphelins
- SI discussion camoufe limites (formulations vagues) → manquer de transparence
- SI résumé ≠ corps du texte → incohérence

Tableaux : SI colonne > 70 % valeurs identiques → phrase suffit. SI > 70 % symboles binaires (+/−) → peu d'information. SI uniquement non significatifs → crédibilise mal. SI tableau = phrase sans perte → supprimer.

Résultats : SI précision trompeuse (ex. 28,8136 % pour 17/59) → adapter. SI non-effets omis → biais de reporting.

Cohérence intro/discussion et texte/tableau : voir module Cohérence (principes) — ce module fournit la procédure de détection en contexte publication.
`;

// ───────────────────────────────────────
// Module registry
// ───────────────────────────────────────

const MODULES: Record<KnowledgeModule, string> = {
  style: STYLE_MODULE,
  ethics: ETHICS_MODULE,
  coherence: COHERENCE_MODULE,
  'auto-edition': AUTO_EDITION_MODULE,
  'peer-review': PEER_REVIEW_MODULE,
  methodology: METHODOLOGY_MODULE,
  'writing-process': WRITING_PROCESS_MODULE,
  'literature-review': LITERATURE_REVIEW_MODULE,
  'data-analysis': DATA_ANALYSIS_MODULE,
  'grant-writing': GRANT_WRITING_MODULE,
  publication: PUBLICATION_MODULE,
};

// ───────────────────────────────────────
// Public API
// ───────────────────────────────────────

/**
 * Build the knowledge core by assembling the requested modules.
 * If no modules are specified, returns the full core.
 *
 * @param modules - Which knowledge modules to include. Omit for all.
 * @returns The assembled knowledge core string.
 */
export function getKnowledgeCore(modules?: KnowledgeModule[]): string {
  const selected = modules ?? (Object.keys(MODULES) as KnowledgeModule[]);
  const parts = selected.map((m) => MODULES[m]).filter(Boolean);
  return parts.join("\n");
}

/**
 * Full knowledge core — all modules assembled.
 * Use only when the full core is needed regardless of specialization.
 */
export const KNOWLEDGE_CORE_FULL = getKnowledgeCore();

/** All available module identifiers. */
export const ALL_KNOWLEDGE_MODULES: KnowledgeModule[] = Object.keys(MODULES) as KnowledgeModule[];
