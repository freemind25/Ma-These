// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Knowledge Core v2 (distillé de 21 ouvrages de référence)
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
//   Sułkowski, Kurowska-Pysz & Szczepańska-Woszczyna — Academic Writing, Visualization,
//     Presentation, and Publishing of Research (SLR, visualization, presentation,
//     publication-process, AI-assisted writing)
//   Eco — Comment écrire sa thèse (choix sujet, sources, citations, notes, biblio)
//   Hammersley — What Is Qualitative Research (épistémologie quali, frontières disciplinaires)
//   Pearce — How to Examine a Thesis (perspective examinateur, originalité, cohérence)
//   Murray — How to Write a Thesis (révision, conclusion, Brown 8Q, couches)
//   Brause — Writing Your Doctoral Dissertation (soutenance, interprétation, pipeline)
//   Paltridge & Starfield — Thesis and Dissertation Writing in a Second Language (CARS, types de thèse, stance, reporting)
//   Carter, Kelly & Brailsford — Structuring Your Research Thesis (fonctions thèse, ordres thématiques, proportion)
//   Holtom & Fisher — Enjoy Writing Your Science Thesis (proportions sciences, révision, protocoles)
//   Gaudet & Robert — L'aventure de la Recherche Qualitative (analyse quali 3 strates, erreurs d'analyse, éthique terrain)
//   Wette — Writing Using Sources for Academic Purposes (citations intégrales/non-intégrales, fonctions rhétoriques, verbes de signalisation)
//   Zimmerman (éd.) — Methodological Innovations in Research (Q méthodologie, Giorgi, recherche historique, thèse par articles)
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
  | "publication"
  | "visualization"
  | "presentation";

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

### Métalangage et posture d'auteur (Eco)
- La thèse s'écrit en métalangage (un langage qui PARLE d'autres langages). Un psychiatre ne s'exprime pas comme ses patients. SI le doctorant étudie un objet transgressif et veut écrire dans un style « en rupture » → rappeler que même les avant-gardes (Dante, Eliot) ont écrit en prose claire pour parler de leur poésie
- Pas d'excuses dans le texte : « Nous n'avons pas les compétences… » → supprimer. « Sur votre sujet, même le plus pointu, vous êtes la plus grande autorité vivante. » Humilité dans le choix de sujet et la méthode ; fierté dans l'écriture
- SI terme technique employé sans être défini → le signaler. SI c'est un terme central et qu'on ne sait pas le définir → « laissez tomber la thèse, vous vous êtes trompé de sujet »
- Figures de rhétorique : ne jamais les expliquer ni s'excuser d'elles (pas de « plaisanterie à part »). Le lecteur visé doit les saisir seul
- Cohérence des présupposés culturels : SI un auteur célèbre (Spinoza) est présenté comme allant de soi mais un auteur moins connu (Guzzo) est nommé sans présentation → corriger. « N'expliquez pas où est Rome sans expliquer où est Tombouctou. »

### Système stance/engagement (Paltridge & Starfield)
- Stance = hedges (might, perhaps) + boosters (in fact, definitely) + attitude markers (unfortunately, surprisingly) + self-mentions (I, we)
- Engagement = reader pronouns (we inclusif) + appeals to shared knowledge (of course, as is well known) + directives (note that, consider) + questions
- SI aucune hedge en Discussion → sur-claiming détecté. SI aucun engagement marker → le texte est un monologue, pas un dialogue avec le lecteur
- Écriture académique anglaise = « writer-responsible » : le lecteur n'infère pas. SI un passage suppose une connaissance du lecteur sans l'expliciter → ajouter du tissu connectif

### Langage des limites en conclusion (Murray)
- Substituer : « limitation » → « focus » ou « sélection » ; « flaw » → supprimer ; « incomplete » → « continuing » ; « inconclusive » → supprimer ; « solves »/« proves » → « contributes to a resolution of »
- Toute étude a des limites par conception : les cadrer comme des décisions de périmètre, pas des échecs

### Patchwriting vs paraphrase (Wette)
- Distinguer paraphrase légitime (transformation grammaticale + lexicale + structurelle, sens préservé) de patchwriting (copie de chaînes de 5-9 mots + substitution synonyme 1 pour 1 + réarrangement). Le patchwriting est un stade développemental fréquent chez les novices mais détectable par les logiciels
- Protocole paraphrase en 7 étapes : (1) lire à fond, (2) notes sans copier, (3) carte mentale ou résumé oral, (4) rédiger SANS consulter l'original, (5) vérifier l'exactitude, (6) si résumé → réduire à 1/3 max, (7) vérifier l'intégration stylistique
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
- L'IA est un outil d'apprentissage, pas une béquille : expliquer POURQUOI chaque suggestion est faite (ex. « cette phrase est passive, ce qui réduit la clarté »), pas corriger silencieusement (Sułkowski et al.)
- Mode simulation d'audience : l'IA peut relire une section sous 3 perspectives — (a) non-spécialiste curieux, (b) relecteur sceptique, (c) praticien — pour anticiper les questions de chaque (Sułkowski et al.)

### Usage du terme « positivisme » (Hammersley)
- SI un auteur ou le doctorant qualifie un travail de « positiviste » comme critique → exiger une définition dans ce contexte précis. Le mot est devenu presque exclusivement péjoratif et contextuellement variable : chaque nouvelle approche a qualifié ses prédécesseurs de positivistes. SI aucune définition → la critique est vide

### Pratiques de citation et paraphrase (Eco)
- Toute citation sans encadrement critique (avant ET après) = le lecteur présume que le doctorant partage l'opinion citée
- Citer une évidence sous l'autorité de quelqu'un (ex. « Les médias sont, comme le dit McLuhan, importants ») → supprimer la citation : naïveté, pas érudition
- Test de la paraphrase légitime : « Pouvez-vous reformuler le texte SANS l'avoir sous les yeux ? » SI non → citer entre guillemets. Le plagiat de thèse vient souvent des fiches de lecture où les guillemets ont été oubliés
- Citer les classiques d'après l'édition critique (Pléiade) ou la plus reconnue. Pour les contemporains : première édition OU dernière revue par l'auteur — justifier si les deux divergent
- SI citation de Smith à travers Sedanelli → distinguer : (a) c'est l'opinion de Sedanelli qui intéresse → citer Sedanelli « citant Smith, p. X » ; (b) c'est l'idée de Smith → citer Smith « cité par Sedanelli, p. Y ». Ne jamais masquer qu'on utilise une source de seconde main

### CER et recherche qualitative itérative (Gaudet & Robert)
- Le processus de recherche qualitative est par nature imprévisible : le terrain peut amener sur des avenues différentes du protocole déposé. Justifier les formulaires CER (conçus pour la recherche clinique) dans un cadre itératif inductif
- SI épistémologie constructionniste/constructiviste/critique → la divulgation partielle est rarement légitime car la coconstruction chercheur-participant exige que le participant comprenne les objectifs

### Pièges relationnels sur le terrain (Gaudet & Robert)
- SI terrain qualitatif avec participants vulnérables → surveiller : (1) la relation de pouvoir n'est pas toujours unidirectionnelle (participants peuvent utiliser le chercheur) ; (2) la valeur thérapeutique perçue du lien peut créer des attentes irréalistes → fournir liste de ressources d'urgence ; (3) la relation de séduction (frontière floue entre argumentaire convaincant et séduction) → clarifier les limites
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

### Incohérences épistémologiques (Hammersley)
- SI le doctorant déclare une posture non-causale MAIS utilise « influencer », « façonner », « mener à », « résulter de » → incohérence entre posture déclarée et langage analytique. La plupart des qualitatifs font de la causalité faible en pratique
- SI le doctorant montre qu'un discours est « construit » ET en déduit qu'il est faux → sophisme. La nature construite n'implique ni vérité ni fausseté. Un compte-rendu construit peut être accurate
- SI la thèse qualitative combine « explorer l'expérience subjective » ET « les récits sont des constructions discursives » sans justifier la tension épistémologique → incohérence interne non signalée

### Cohérence structurelle
- Un chapitre commence sans lien avec le précédent = transition absente
- Le plan annoncé dans l'intro ne correspond pas au plan réel = annonces non tenues
- Un même contenu repris quasi à l'identique dans deux chapitres = redondance inter-chapitres
- La conclusion ne reprend pas les questions de recherche et n'y répond pas = conclusion non bouclée

### Prévisibilité pour l'examinateur (Murray)
- Trois techniques distinctes : Forecasting = menu de ce qui suit (mini-TdM par chapitre) ; Signalling = plan logique rendu explicite (connexions, shifts entre points) ; Signposting = repères rassurant le lecteur qu'il est sur le bon chemin
- Les trois doivent être présentes dans la version finale — les examinateurs les recherchent (Johnston 1997)

### Conclusion de thèse (Murray)
- Mettre le propre travail AVANT, puis contextualiser avec la littérature — jamais structurer une conclusion comme une revue de littérature
- Temps verbal : passé dans toute la conclusion (le travail est terminé). Détecter le « présent sur-généralisant » → ajouter « This suggests that… » ou « One interpretation of this is… »
- Énoncer explicitement ce que l'on N'ARGUE PAS : « This is not to say that… » ; définir la frontière de sa claim = aussi important que la claim elle-même
- Le mot « contribution » doit apparaître — dans les MÊMES TERMES — dans le résumé, les introductions ET les conclusions

### Sections finales distinctes (Brause)
- Summary = récapitulatif total (problème, design, résultats, conclusions)
- Conclusions = assertions fondées sur les résultats, répondant à la question théorique
- Implications = transfert des résultats vers d'autres contextes et la pratique
- Recommendations = études suivantes ciblées (restreintes à quelques priorités)
- Chaque section a sa propre logique et ne doit pas se mélanger avec les autres

### Vérification intro ↔ conclusion (Pearce)
- Test de l'examinateur : « Pouvez-vous résumer votre thèse en deux phrases ? » SI impossible → l'intro et/ou la conclusion sont floues. Vérifier que l'énoncé de thèse est reformulable en 1-2 phrases sans perte

### Chapitre Résultats — structure 3 moves (Paltridge & Starfield)
- Move 1 : métatexte (localiser le chapitre dans la thèse, rappeler les questions de recherche)
- Move 2 : présenter les résultats (données — quasi toujours présent)
- Move 3 : commenter les résultats (interpréter, hedger, comparer — parfois dans un chapitre Discussion séparé)
- SI chapitre Résultats sans Move 3 → signaler l'absence

### Chapitre Discussion = miroir inversé de l'Introduction (Paltridge & Starfield)
- Dans l'Intro : littérature = primaire, étude du doctorant = secondaire
- Dans la Discussion : étude du doctorant = primaire, littérature = secondaire (confirmation, comparaison, contradistinction)
- Structure typique : (1) vue d'ensemble des résultats significatifs, (2) comparaison avec la littérature, (3) explication des résultats inattendus, (4) implications théoriques, (5) limites, (6) recommandations

### Types de conclusion (Paltridge & Starfield)
- Thesis-oriented (plus courant) : réénonce le but, résume les résultats, puis recommandations/limites
- Field-oriented : focus sur le champ, résultats en contexte du champ entier, pattern problème/solution/évaluation
- SI conclusion se contente de résumer sans expliciter la signification → incomplète (résumé ≠ conclusion)

### Positions emphatiques (Carter, Kelly & Brailsford)
- Aux premier et dernier positions de chaque niveau (phrase, paragraphe, chapitre, thèse) = positions les plus emphatiques. Un point important ne doit pas être enfoui au milieu
- L'intro et la conclusion de chaque chapitre sont les « bookends » les plus soignés — premières sections lues (et parfois les seules) par l'examinateur

### Structure non conventionnelle (Carter, Kelly & Brailsford)
- SI structure de thèse non-IMRAD → justifier explicitement dans l'introduction. Les examinateurs acceptent les structures innovantes quand la logique de l'écart est ouvertement expliquée
- Sans cette justification, une structure non conventionnelle = signal de manque de maîtrise du genre thèse

### Structure phénoménologique (Zimmerman, d'après Giorgi)
- La structure finale doit articuler des « constituants » (définis par leur relation fonctionnelle au tout) et non des « éléments » (indépendants du tout). SI les données sont trop disparates pour produire une seule structure → écrire une structure par sous-groupe ou par participant individuel
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

### Choix du sujet (Eco)
- SI sujet vaste (ex. « la littérature italienne 1945-1960 ») → orienter vers monographique (un auteur, une œuvre, un problème précis). Une thèse panoramique exige une maîtrise encyclopédique qu'un doctorant ne peut revendiquer
- SI sujet purement théorique sur un grand problème abstrait → ramener à thèse historique : la théorie devient le chapitre conclusif. Une thèse historique permet à tous de contrôler ; une théorique d'un doctorant laisse soupçonner un manque de clarté
- Test de faisabilité AVANT engagement : (1) OÙ sont les sources ? (2) Sont-elles matériellement accessibles ? (3) Sont-elles culturellement utilisables (langue, paléographie) ? SI une réponse négative → changer de sujet
- Critères de scientificité (4 conditions) : (1) objet publiquement reconnaissable, (2) résultat nouveau ou révisé, (3) utile aux travaux ultérieurs, (4) moyens de confirmer/infirmer fournis. SI (4) absent → non scientifique
- SI thèse de compilation/bilan → vérifier qu'aucun ouvrage comparable n'existe déjà. Sinon = perte de temps ou plagiat

### Gestion des sources (Eco)
- Traduction = prothèse (lunettes), pas source de première main. SI langue accessible → consulter l'original. SI langue inaccessible → justifier le recours à la traduction et délimiter l'objet en conséquence
- Anthologie = ce que quelqu'un d'autre a déjà vu dans les textes. Faire une thèse = chercher ce que les autres n'ont pas vu → privilégier les sources primaires
- Définir l'objet AVANT de repérer les sources. Confusion objet/instruments = passer le temps sur des études critiques au lieu des textes originaux
- Règle des photocopies : dès qu'une est faite, la lire et annoter aussitôt. Ne pas en photocopier une nouvelle avant d'avoir « possédé » la précédente
- Détecter l'exploitation par le directeur : SI il dirige plusieurs thèses sur des secteurs adjacents → vérifier que les résultats seront publiés sous le nom du doctorant

### Frontière recherche vs journalisme (Hammersley)
- SI compte-rendu narratif de terrain sans cadre théorique, sans procédures transparentes, sans interprétations alternatives → frôle la frontière journalisme/recherche. Critères minimum : (a) procédures publiques, (b) incertitudes explicitées, (c) contre-preuves présentées, (d) hypothèses rivales considérées, (e) effets de l'investigateur pris en compte

### Trois fonctions des données d'entretien (Hammersley)
- SI entretiens qualitatifs → exiger que le doctorant explicite quelle fonction est visée (ou combinaison) :
  1. Témoignage (événements, biographies) → exiger triangulation
  2. Auto-analyse par le participant → le discours est soumis à évaluation critique, pas adopté tel quel
  3. Preuve indirecte d'attitudes → justifier que ce qui est détecté dépasse le contexte de l'entretien
- Reporting des extraits d'entretien : inclure les questions de l'intervieweur, capturer les traits interactionnels pertinents, numéroter les lignes pour référence

### Risques épistémologiques en méthodes mixtes (Hammersley)
- SI design mixte → vérifier que le volet qualitatif n'est pas subordonné aux présupposés hypothético-déductifs du volet quantitatif. Justification épistémologique de chaque volet obligatoire
- SI approche « critique » (féministe, post-coloniale, etc.) → exiger un cadre théorique macrosocial explicite : (a) phénomène localisé dans un système plus large, (b) forces structurelles identifiées, (c) catégories de sens commun justifiées si utilisées

### Taxonomie de l'originalité (Pearce, d'après Phillips & Pugh)
- L'originalité ne se réduit pas à la « grande O » : 15 formes acceptables dont synthèse inédite, nouvelle interprétation de matériel connu, application d'une technique à un nouveau domaine, apport de preuves nouvelles sur une question ancienne, approche interdisciplinaire
- SI le doctorant craint de ne pas être assez « original » → l'aider à identifier quelle(s) forme(s) d'originalité son travail accomplit

### Justification méthodologique (Pearce)
- Les examinateurs évaluent la méthode comme le lieu « où le sens se construit ». Question systématique : pourquoi cette méthode et pas une autre ?
- SI la section Méthode ne contient aucune comparaison avec des alternatives → signal d'alerte majeur

### Déclaration d'originalité (Murray)
- La thèse doit définir et défendre EXPLICITEMENT un type d'originalité (nouvelles données, nouvelle synthèse, nouvelle interprétation, interdisciplinarité, nouvelle application, etc.)
- Le type d'originalité revendiqué doit correspondre au travail réellement accompli. L'écrire tôt, le réviser au fil du travail

### Protocoles scientifiques : traçabilité (Holtom & Fisher)
- SI protocole avec matériel biologique ou chimique : inclure fabricant + siège social (reproductibilité internationale). Pour les kits : résumer le principe, citer la publication de référence, indiquer « selon les instructions du fabricant » pour les étapes standard, décrire en détail toute modification

### Objectifs de la recherche qualitative (Gaudet & Robert)
- SI recherche qualitative itérative → distinguer objectif théorique (définir/interpréter un phénomène) et objectif empirique (décrire/observer). Les deux sont nécessaires : trop théorique = césure théorie-empirie ; trop empirique = journalisme. Hiérarchiser et expliciter ses objectifs est un devoir de réflexivité

### Question de recherche qualitative (Gaudet & Robert)
- Formuler en « comment » (processus, compréhension ancrée dans le contexte) plutôt qu'en « quel/le » ou « pourquoi » causaux. Les questions « comment » favorisent un processus itératif inductif ; les questions « quel » orientent vers un hypothético-déductif incompatible avec la quali

### Échantillonnage qualitatif intentionnel (Gaudet & Robert)
- Justifier selon deux critères : (1) comparabilité (sources semblables pour saturation théorique) et (2) diversification (sources contrastées pour complexité). Quatre techniques : stratifié (catégories préétablies), cellulaire (catégories chevauchantes, Miles & Huberman), par quotas (minimum par catégorie), théorique (critères émergents, Strauss & Corbin)

### Analyse qualitative en 3 strates — palimpseste (Gaudet & Robert)
- Strate 1 — analyse verticale : condensation contextualisante puis sémantique de chaque source. Documenter le contexte de production AVANT la condensation (lieu, personnes présentes, influence de l'intervieweur). SI codage logiciel trop rapide → perte de la perspective contextuelle
- Strate 2 — analyse horizontale : comparaison transversale des sources, identification de fils conducteurs et cas contrastants. Ne JAMAIS éliminer un document divergent — un seul cas divergent peut invalider l'interprétation. Ne PAS généraliser statistiquement (« 2/10 disent que… ») sur un échantillon non aléatoire
- Strate 3 — analyse théorisante : généralisation analytique par va-et-vient constant avec la littérature. Le retour aux strates précédentes est nécessaire

### Cinq erreurs d'analyse qualitative (Gaudet & Robert)
- (1) Résumer au lieu d'analyser (arrêter à la réduction thématique sans interpréter) ; (2) citer au lieu d'analyser (déléguer l'analyse aux participants) ; (3) prendre parti au lieu d'analyser (évaluer plutôt qu'interpréter) ; (4) compter les fréquences de codes comme en quanti (pas de validité sur échantillon non aléatoire) ; (5) présenter des caractéristiques formelles sans interpréter (ex. noter des métaphores sans interpréter leur rôle)

### Réflexivité qualitative concrète (Gaudet & Robert)
- Trois éléments à rendre explicites : (1) transparence du processus analytique (étapes, dilemmes, choix) ; (2) utilisation et discussion des contre-exemples (les chercher activement, les transformer en outils d'interprétation plus inclusive, les mentionner même non résolus) ; (3) limites internes (influence du chercheur, thèmes écartés, relations de pouvoir)

### Théorisation qualitative — classification (Gaudet & Robert)
- Classer les rapports sociaux abstraits (pas les caractéristiques sociodémographiques). Quatre formes : typologie descriptive (unités-noyaux par ressemblance/différence), typologie abstraite (rapports théoriques entre catégories), cartographie (cas dans un espace typologique), idéal-type wébérien (construction idéale pour interpréter). Créer une catégorie « inclassables »

### Q méthodologie (Zimmerman, d'après Damar & Sali)
- SI étude de la subjectivité (opinions, attitudes, perspectives internes) → la Q méthodologie (Stephenson) : concourse → Q-set (30-70 énoncés) → tri forcé (Q-sort) → analyse factorielle par personne (et non par item) → interprétation narrative par facteur. Les participants (max ~40) sont les variables, sélectionnés pour hétérogénéité maximale
- Ce n'est PAS un design mixte séquentiel (quali→quanti→quali) mais une approche « qualiquantologique » où quali et quanti interagissent en continu

### Phénoménologie descriptive de Giorgi (Zimmerman, d'après Nguyen & Curzer)
- Ne PAS mélanger en cours de route avec d'autres méthodologies phénoménologiques (Moustakas, van Manen). Les étapes procédurales ne sont pas transposables si la logique sous-jacente diffère
- Minimum 3 expériencers. Analyse en 4 étapes : (1) lecture globale, (2) découpage en unités de sens, (3) transformation en langage psychologiquement sensible (variation imaginative pour généraliser), (4) écriture de la structure générale
- Distinguer « orienter » le participant (question ouverte de suivi) de « mener » vers une réponse préétablie (question suggestive). Seule l'orientation est légitime

### Recherche historique (Zimmerman, d'après Silva)
- Cadre en 5 étapes : (1) structurer (expériences perceptuelles + littérature → questions), (2) sources (primaires : mots/images/artéfacts/souvenirs oraux + triangulation obligatoire), (3) analyse (cliométrie, comparaison spatio-temporelle, analyse contrefactuelle), (4) structure narrative (périodisation contextuelle préférée à chronologique), (5) explication théorique
- L'analyse contrefactuelle (« et si… ? ») est l'équivalent le plus proche d'une expérimentation pour tester la causalité en histoire
- La triangulation de sources est un prérequis de publication dans les revues de premier rang. Évaluer ce qui MANQUE dans les archives autant que ce qui y figure
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

### Plan et méthode de travail (Eco)
- La table des matières se rédige en TOUT DÉBUT, comme hypothèse de travail (métaphore de l'itinéraire de voyage). Utiliser des subdivisions à disjonctions binaires pour garantir la complétude
- Commencer par le chapitre le plus prêt, pas par le premier. La table hypothèse sert de point d'ancrage
- Ne mépriser aucune source : « les meilleures idées ne viennent pas toujours des auteurs les plus importants »

### Quatre fonctions de la thèse (Carter, Kelly & Brailsford, d'après Phillips & Pugh)
- (1) Théorie de fond : cadre disciplinaire et littérature
- (2) Théorie focale : ce que l'on cherche précisément et pourquoi
- (3) Théorie des données : fiabilité et pertinence des sources
- (4) Contribution : connaissance ou compréhension nouvelle
- Vérifier que ces quatre fonctions sont remplies même dans une structure non conventionnelle

### Types de thèse (Paltridge & Starfield)
- Traditionnelle simple : Intro → LR → Méthodes → Résultats → Discussion → Conclusion
- Traditionnelle complexe : intro + LR + méthodes générales, puis sous-thèses Study 1/2/3 (chacune avec intro/méthodes/résultats/discussion), puis discussion générale
- Thématique : Intro → Thème 1 → Thème 2 → … → Conclusion (courant en SHS, pas de chapitre Méthodes séparé)
- Compilation d'articles : intro + contexte, puis chapitres-articles autonomes, puis discussion générale

### Structure en sablier (Paltridge & Starfield)
- La thèse a une forme en sablier : Intro (large, champ disciplinaire) → LR → Méthodo → Résultats (étroit, étude spécifique) → Discussion → Conclusion (large, champ disciplinaire à nouveau)

### CARS — Introduction de thèse (Paltridge & Starfield, d'après Swales)
- Move 1 : établir le territoire (1a: claim centrality, 1b: background, 1c: review clé [obligatoire], 1d: définir termes)
- Move 2 : établir la niche/gap [obligatoire]
- Move 3 : occuper la niche (3a: objectifs [obligatoire], 3b: résultats principaux [optionnel], 3c: prévisualiser structure avec mini-synopses par chapitre [obligatoire, distinctif des articles], 3d: position théorique [optionnel])

### Métadiscours de thèse (Paltridge & Starfield)
- Le métadiscours (discours sur la structure propre du texte) est distinctif et attendu : « Le chapitre 2 examine… », « cette thèse argumente que… »
- Plus étendu dans les thèses que dans les articles. SI absent (ni renvois avant/arrière, ni previews de chapitres) → le signaler

### Comparaison sujet par sujet vs point par point (Carter, Kelly & Brailsford)
- SI thèse compare plusieurs objets sous plusieurs thèmes : « sujet par sujet » (chaque objet = un chapitre) met les objets au premier plan ; « point par point » (chaque thème = un chapitre) met l'argument au premier plan
- Choisir selon ce qui est le cœur de la contribution

### Ordres thématiques possibles (Carter, Kelly & Brailsford)
- Chronologique, du moins au plus important, de l'externe vers l'interne, de la théorie vers la pratique, du motif ancien vers le matériel nouveau, du général vers le spécifique, en sablier, ou de l'international vers le local
- La forme de l'organisation doit incarner la valeur de la recherche

### Emphase proportionnelle (Carter, Kelly & Brailsford)
- L'espace accordé à chaque partie signale son importance. Si un élément « central » reçoit beaucoup moins d'espace qu'un élément « secondaire » → le lecteur ne le percevra pas comme central
- Si un chapitre diffère significativement en taille des autres → expliquer pourquoi dans l'introduction du chapitre

### Trois placements de la revue de littérature (Carter, Kelly & Brailsford, d'après Dunleavy)
- (a) Chapitre autonome : facilite le repérage par l'examinateur mais risque de détachement du travail original
- (b) Enchâssée dans les chapitres thématiques : montre la pertinence immédiate mais rend la revue invisible comme entité
- (c) Modèle « ouverture » : brève revue en ouverture, travail original au centre, analyse littéraire en conclusion

### Brown — 8 questions de cohérence en milieu de parcours (Murray)
À mi-parcours, répondre en 50 mots chacun : (1) Lecteurs visés ? (2) Qu'avez-vous fait ? (3) Pourquoi ? (4) Qu'est-il arrivé ? (5) Signification théorique ? (6) Signification pratique ? (7) Bénéfice pour le lecteur ? (8) Ce qui reste non résolu ? Répéter aux stades ultérieurs

### Rédaction en couches successives (Murray)
- Construire la thèse en 6 passes progressives : (1) titres de chapitres, (2) 1-2 phrases par chapitre, (3) sous-sections, (4) notes sous chaque en-tête, (5) paragraphe introducteur par chapitre, (6) prose complète
- Utiliser des verbes actifs (définit, évalue) pas vagues (traite de) dans les plans

### Pipeline d'écriture (Brause)
- Pendant que le comité relit les chapitres 1-3, travailler au chapitre 4. Quand ils retournent les chapitres, soumettre le suivant
- Ne jamais laisser un brouillon inactif en attendant — toujours avoir des chapitres en mouvement à différents stades

### Proportions indicatives — thèse scientifique (Holtom & Fisher)
- Introduction 20-30 %, Matériel et Méthodes 10-20 %, Résultats 35-45 %, Discussion 20-25 %. Les Résultats = cœur de la contribution

### Ordre de révision recommandé — thèse scientifique (Holtom & Fisher)
- (1) Matériel et Méthodes, (2) Références, (3) Résultats, (4) Introduction, (5) Discussion, (6) Résumé
- Rédiger dans cet ordre : confronter d'abord ce qui a été fait à ce qui a été trouvé, puis reconsidérer le but initial à la lumière des résultats

### Méthodes parallèles aux Résultats (Holtom & Fisher)
- Le chapitre Matériel et Méthodes doit suivre le même ordre que le chapitre Résultats. Le lecteur qui passe d'un résultat à la méthode correspondante doit retrouver la même séquence logique

### Résumé (abstract) — ordre de planification (Holtom & Fisher)
- Ordre de planification : (1) Méthodes, (2) Résultats, (3) Introduction, (4) Discussion
- Ordre de présentation : question → système expérimental → résultats → réponse. Rédiger d'abord les bribes dans l'ordre de planification, puis réordonner

### Mini-proposal dans la conclusion (Murray)
- La conclusion doit inclure un mini-proposal pour les travaux futurs : pas une liste de souhaits mais un plan structuré : (1) priorité sélectionnée, (2) comment faire, (3) ressources nécessaires, (4) faisabilité, (5) réfutations anticipées, (6) bénéfices attendus

### Thèse par articles — prévention auto-plagiat (Zimmerman, d'après Matteson & DeLozier)
- SI thèse par articles (trois articles) → risque d'auto-plagiat entre chapitres si cadres théoriques, revues de littérature ou méthodologies se recoupent. Prévention : changer le format de présentation (narratif → tableau/visuel) d'un chapitre à l'autre pour les éléments partagés
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

### Revue systématique de littérature (SLR) — Sułkowski et al.
- Question SLR = population + intervention/comparateur + résultat/contexte (PICO/PCC). Trop large → scoping review à la place
- Pré-enregistrer le protocole (OSF ou PROSPERO) AVANT la recherche pour horodater et garantir transparence
- Criblage titre/résumé : inclure par défaut en cas de doute — exclure uniquement si manifestement hors périmètre
- Exclusion plein texte : documenter le motif pour CHAQUE article exclu (ex. « pas de données primaires ») → alimenter le diagramme PRISMA
- Cadre TCCM pour structurer la synthèse : Théories utilisées (T) × Contextes (C) × Caractéristiques/VI (C) × Méthodologies (M). Combinaisons absentes = lacunes identifiées
- Modèle des 3 tableaux d'Ehsan : (1) thèmes/résultats, (2) théories/cadres, (3) méthodologies/données. Croiser les 3 = surfacer les gaps
- En sciences sociales : inclure les designs qualitatifs et mixtes, ne pas exclure sur la qualité seule (SyReMa). Documenter les problématiques de qualité et leur impact potentiel sur les conclusions
- Revue narrative (non-SLR) : mentionner quand même bases de données consultées, période couverte et nombre approximatif d'articles analysés
- Note réflexive : après synthèse, vérifier la concentration géographique, la monoculture théorique et l'homogénéité méthodologique des études incluses
- Énoncé de lacune = [LACUNE identifiée] + [JUSTIFICATION de son importance]. Jamais seulement « X n'a pas été étudié »
- Outils bibliométriques (VOSviewer, Gephi) : identifier les sous-champs silotés (peu de co-citations) = opportunités de revue passerelle
- SI l'IA assiste le criblage/extraction → marquer avec niveau de confiance et signaler les décisions incertaines pour vérification humaine

### Bibliographie = TOUS les textes consultés (Pearce)
- La bibliographie finale doit inclure TOUS les textes consultés, pas uniquement ceux cités dans le corps. Omettre des textes consultés mais non cités prive le lecteur d'une preuve de l'étendue du travail bibliographique
- Deux conceptions opposées coexistent chez les examinateurs : (a) revue longue et exhaustive = preuve de sérieux ; (b) revue longue et ramifiée = signal de question floue. Pour éviter (b) : toute revue doit évaluer (pas seulement citer) ET relier chaque travail au projet du doctorant

### Styles de reporting (Paltridge & Starfield)
- Central reporting : auteur en position sujet (« Burke (1986) a découvert que… ») = fort focus auteur
- Non-central reporting : auteur entre parenthèses à la fin (« Il a été montré que… (Ballard 1991) ») = faible focus auteur
- Non-reporting : pas de verbe de reporting, résultats présentés directement (« Au lieu que la motivation produise la réussite, c'est peut-être l'inverse (Spolsky 1989) ») = pas de focus auteur
- Varier les styles ; surutilisation d'un seul = monotonie

### Temps verbaux dans la revue (Paltridge & Starfield)
- Présent simple = généralisation ou fait accepté (« Brown montre que… »)
- Passé simple = référence à une étude spécifique et ses résultats (« Brown a montré que… »)
- Present perfect = référence à un domaine d'investigation général (« La recherche a montré que… »)
- SI present perfect pour une seule étude spécifique → incorrect

### Citation intégrale vs non-intégrale (Wette)
- Intégrale : auteur nommé, verbe de signalisation, partage de responsabilité. Non-intégrale : auteur entre parenthèses, voix de l'écrivain dominante. Les non-intégrales prédominent dans presque toutes les disciplines (sauf histoire/philosophie)
- SI l'écrivain est confiant dans l'affirmation → non-intégrale. SI il partage ou cède la responsabilité → intégrale
- Sept rôles de l'auteur en citation intégrale : (a) sujet actif (entière responsabilité à l'auteur), (b) agent (ex. « a proposé que »), (c) adjoint (égalité écrivain-auteur), (d) passif (distanciation), (e) « selon X » (neutre), (f) syntagme possessif (ex. « la théorie de X »), (g) comparaison entre auteurs. Options (a)-(c) sont les plus réussies

### 11 fonctions rhétoriques des citations (Wette)
- Les experts utilisent 11 fonctions, pas seulement l'attribution (qui représente 80-90 % des citations chez les novices vs 18 % chez les experts) : attribution, identification de l'origine, agent passif + évaluation positive, soutien à l'argument, exemplification, comparaison multiple de sources, renvoi vers une source (see…), dialogue critique, auto-citation, plans de recherche futurs, display de connaissance, preuve d'actualité

### Typologie des verbes de signalisation (Wette)
- Description : recherche (investigate, find, show), cognition (believe, assume, view), discours (discuss, state, point out)
- Interprétation : accepter (establish, confirm, demonstrate), soutenir (argue, claim, propose), tentative (suggest, hypothesise, indicate), désaccord (neglect, fail, disregard, refute)
- SI novice → éviter la surutilisation de claim, state, say, according to. Le verbe « mention » = item d'importance mineure
- Temps : présent pour faits généraux et résultats supportant l'argument ; passé perfect pour un domaine d'enquête général ; passé pour une étude unique ou pour prendre de la distance
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

### Critères d'une interprétation convaincante (Brause)
- (1) Exhauré : couvre toutes les dimensions majeures, inclut les données qui contredisent les inférences
- (2) Clair : symboles expliqués, cohérence tableau-récit, références exactes aux lignes de transcription
- (3) Logique : organisation systématique et prévisible, avec une « carte mentale » esquissée à l'avance
- (4) Pertinent : restreint aux trois composantes : question de recherche + théorie, données collectées, analyse conduite
- (5) Prudent : pas de sur-généralisation à partir de données limitées, mais pas de timidité excessive
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

### Processus de soumission et révision — Sułkowski et al.
- Liste de revues cibles : 2 aspirations + 3-4 milieu de gamme. Pour chaque : IF, adéquation scope, délai type, statut OA
- Analyser la liste de références du manuscrit : les revues les plus citées = cibles à forte probabilité d'adéquation
- Citer (avec discernement) des articles de la revue cible = signaler l'ancrage dans ses débats. Jamais forcer des citations
- Après rejet : TOUJOURS réviser avant de resoumettre. Soumettre inchangé → mêmes critiques. SI rejet → « Avant de choisir une nouvelle revue, traitons d'abord les concerns des relecteurs »
- Cascade vers revue inférieure : supprimer TOUTE trace de soumission précédente (ancien format, lettre d'accompagnement, réponse aux relecteurs, en-tête/pied de page)
- « Major revision » = opportunité, pas rejet. Répondre point par point à CHAQUE commentaire. Tableau : [Commentaire] → [Action] → [Localisation manuscrit]
- Réponse au relecteur qui a mal compris : reformuler comme problème de clarté de l'auteur, jamais comme erreur du relecteur. « Il semble que nous n'ayons pas communiqué clairement ce point. Nous avons réécrit… »
- Désaccord poli : (1) reconnaître le point, (2) expliquer la contrainte, (3) proposer un accommodement alternatif

### Lettre de réponse type (Sułkowski et al.)
- Si le relecteur demande une analyse hors scope : « Nous avons considéré cette approche ; cependant, elle nécessiterait un jeu de données au-delà du périmètre de cette étude. À la place, nous avons fourni une justification supplémentaire dans la section [X]. »
- Si le relecteur a mal compris : « Il semble que ce point n'ait pas été communiqué avec suffisamment de clarté. Nous avons réécrit le paragraphe concerné pour lever toute ambiguïté. »

### Notes de bas de page (Eco)
- Huit fonctions : (a) source des citations, (b) références supplémentaires, (c) renvois internes/externes, (d) citer une autorité sans interrompre le fil, (e) développer une affirmation secondaire, (f) nuancer/corriger son propre propos, (g) traduction bilingue, (h) « payer ses dettes » intellectuelles
- SI une note dépasse la longueur raisonnable → transformer en appendice
- Choisir UN système (toutes en bas de page OU toutes en fin de chapitre) et s'y tenir
- Note = identification (abréviations acceptables). Bibliographie = documentation (complète, obligatoire). L'une ne dispense pas de l'autre
- Méthode citation-note vs auteur-date : SI domaine spécialisé + biblio moderne (< 2 siècles) → auteur-date. SI domaine large ou biblio ancienne → citation-note

### Bibliographie et table des matières finales (Eco)
- SI thèse porte sur un auteur/corpus précis → structurer la biblio : « Œuvres de [Auteur] » / « Documents inédits » / « Ouvrages sur [Auteur] » / « Ouvrages généraux »
- La biblio est obligatoire même si tout est référencé en notes : « Ce serait manquer de politesse envers le lecteur que de l'obliger à feuilleter toute la thèse pour trouver une référence »
- Table des matières finale : TOUS chapitres, sous-chapitres, sections avec numéros, pages et titres EXACTS correspondant au texte. Un seul écart = erreur impérative
- Placer la TdM juste après le frontispice, pas après la préface
`;

// ───────────────────────────────────────
// Module: VISUALIZATION — principes et bonnes pratiques (Sułkowski et al.)
// ───────────────────────────────────────

const VISUALIZATION_MODULE = `
## VISUALISATION DE DONNÉES DE RECHERCHE (Sułkowski et al.)

### Intégrité visuelle
- Maximiser le ratio données-encre : chaque pixel doit représenter des données, pas de la décoration. Éviter fonds chargés, effets 3D, ombres
- SI axe y tronqué (ne commence pas à 0) dans un diagramme en barres → justifier explicitement. Sinon, inclure la plage complète
- SI bulles ou pictogrammes → dimensionner par SURFACE, pas par diamètre (biais visuel si par diamètre)
- Montrer l'incertitude : ligne de régression en couleur atténuée + points de données bruts superposés. Jamais une seule ligne en gras sans variabilité
- SI l'IA génère un graphique → vérifier : (a) plages d'axes honnêtes, (2) légende complète, (3) cohérence entre visuel et récit textuel
- Palettes daltoniennes obligatoires (viridis, Okabe-Ito). SI > 2 séries de données → ajouter un encodage secondaire (motif, forme)

### Narration visuelle
- Storyboard des figures : séquencer comme un récit — contexte (diagramme conceptuel) → preuves (données) → synthèse (implications)
- Adapter la complexité au public : même données, versions différentes. Article = scatterplot complet avec bandes de confiance. Blog = graphique annoté avec 3 points clés
- SI méthodes mixtes → « joint display » : tableau mêlant résultats quantitatifs et citations qualitatives représentatives dans une même matrice

### Figure auto-suffisante (Holtom & Fisher)
- Une figure doit être compréhensible sans recourir au texte. Trois composants distincts : le titre (court, descriptif, pour la table des figures), la légende (description détaillée du contenu, provenance des données, annotations), le texte (qui ne reformule pas la légende mais discute les points saillants)
- Titre et légende remplissent des fonctions différentes et ne doivent pas se dupliquer

### Structure interne du chapitre Résultats — sciences (Holtom & Fisher)
- Chaque section de résultats peut suivre : (a) brève « Stratégie » (but et approche globale), (b) résultats présentés, (c) résumé en puces des principales constatations
- Cette structure aide l'examinateur à saisir immédiatement la signification de chaque bloc de résultats
`;

// ───────────────────────────────────────
// Module: PRESENTATION — conférences et soutenances (Sułkowski et al.)
// ───────────────────────────────────────

const PRESENTATION_MODULE = `
## PRÉSENTATION DE RECHERCHE (Sułkowski et al.)

### Timing et structure
- Durée cible = 85-90 % du temps alloué (ex. 13 min pour un slot de 15 min) — marge de sécurité
- Répartition indicative : 20 % intro, 20 % méthodes, 40 % résultats, 20 % discussion. SI méthodes > 25 % → signaler déséquilibre
- Livrer l'information en couches : énoncé accessible d'abord, puis détail technique pour les experts. Chaque point clé = [cadre accessible] + [approfondissement optionnel]

### Soutenance de thèse
- Préparer des slides de secours pour les questions du jury : vérifications de robustesse, analyses alternatives, réponses aux défis méthodologiques prévisibles
- Structure Q&R : anticiper les 5 questions les plus probables et préparer une diapositive de réponse pour chacune

### Présentation virtuelle
- SI format virtuel/hybride → contraintes renforcées : max 5 lignes par slide, police ≥ 24pt. Ce qui est lisible en salle devient illisible sur écran de laptop
- Envoyer les slides au responsable de session AVANT la présentation (plan B technique)

### Réponse aux relecteurs (Sułkowski et al.)
- SI un relecteur a mal compris → la responsabilité est à l'auteur : reformuler. « Il semble que ce point n'ait pas été communiqué avec suffisamment de clarté. Nous avons réécrit… »
- Désaccord poli en 3 étapes : (1) reconnaître le point, (2) expliquer la contrainte, (3) proposer un accommodement

### Fonctions de la soutenance (Brause)
- La soutenance sert 4 fonctions simultanées : (1) contrôle qualité — vérification collective que la thèse atteint les standards institutionnels, (2) conversation académique entre pairs — première discussion au niveau pair, (3) dissémination — premier partage formel des résultats, (4) clôture — marquant la fin de l'apprentissage de chercheur
- Comprendre les 4 empêche de lire l'événement comme purement adversarial

### La soutenance selon la qualité de la thèse (Pearce)
- Pour une bonne thèse = authentication + clarification. Pour une thèse limite = test de compréhension et capacité à corriger
- Les examinateurs arrivent à une recommandation provisoire AVANT la soutenance ; la soutenance sert à confirmer ou infirmer cette impression
- SI corrections mineures prévues → l'objectif est de vérifier que le candidat comprend les critiques et peut les corriger

### Examinateurs externes (Brause)
- Les examinateurs externes n'ont généralement pas d'historique avec le candidat — ils utilisent la thèse écrite EXCLUSIVEMENT pour préparer leurs questions
- Stratégie : rechercher leurs publications et prédispositions avant la soutenance
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
  visualization: VISUALIZATION_MODULE,
  presentation: PRESENTATION_MODULE,
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
