// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// ThesisFrame \u2014 Corpus \u00ab R\u00e9daction et publication d'articles scientifiques \u00bb
// Synth\u00e9tis\u00e9 \u00e0 partir de Gastel, B. & Day, R.A., How to Write and Publish a Scientific Paper (9e \u00e9d., 2022)
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

export interface CorpusFiche {
  id: string;
  titre: string;
  source: string;
  signaux: string[];
  contenu: string;
  questionsDiagnostics: { critere: string; question: string }[];
  pointsIntegration: string[];
}

export const CORPUS_PUBLICATION: CorpusFiche[] = [
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // FICHE 01 \u2014 \u00c9thique de la publication scientifique
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'ethique-publication',
    titre: '\u00c9thique de la publication scientifique',
    source: 'Gastel & Day, 9e \u00e9d., 2022',
    signaux: [
      'plagiat', 'paraphrase', 'conflit d\'int\u00e9r\u00eat', 'comit\u00e9 d\'\u00e9thique',
      'th\u00e8se par articles', 'salami', 'auto-plagiat', 'fabrication de donn\u00e9es',
      'dry-labbing', 'soumission simultan\u00e9e', 'autorat', 'auteur fant\u00f4me',
      'citation', 'guillemets', 'similarit\u00e9', 'd\u00e9tecteur',
    ],
    contenu: `## Exactitude et fabrication\n- Aucune tol\u00e9rance pour l'invention de donn\u00e9es (dry-labbing) : c'est une faute sans degr\u00e9.\n- Les d\u00e9viations partielles \u00e0 l'exactitude sont plus fr\u00e9quentes : omettre des points aberrants sans le signaler, pr\u00e9senter des figures qui accentuent artificiellement les r\u00e9sultats.\n- Pour toute analyse statistique, la rigueur m\u00e9thodologique doit \u00eatre assur\u00e9e en amont, avant la collecte \u2014 impliquer un statisticien d\u00e8s la conception.\n\n## Originalit\u00e9 et salami science\n- Les r\u00e9sultats pr\u00e9sent\u00e9s doivent \u00eatre nouveaux. Un m\u00eame r\u00e9sultat ne doit pas appara\u00eetre comme neuf dans deux publications.\n- La soumission simultan\u00e9e d'un m\u00eame manuscrit \u00e0 plusieurs revues est non \u00e9thique.\n- Le d\u00e9coupage excessif d'un m\u00eame travail (salami science) nuit \u00e0 l'int\u00e9grit\u00e9 \u2014 les bons comit\u00e9s regardent le contenu, pas le nombre.\n\n## Cr\u00e9dit et paraphrase\n- Toute id\u00e9e ou formulation non sienne doit \u00eatre cit\u00e9e. La paraphrase insuffisante (changements mineurs de mots) n'est pas une paraphrase l\u00e9gitime.\n- M\u00e9thode : r\u00e9diger le paragraphe sans regarder la source, puis v\u00e9rifier l'exactitude apr\u00e8s coup.\n- La citation directe entre guillemets est rare ; la norme est la paraphrase. En cas de doute sur les guillemets, en mettre.\n- Le recours \u00e0 un logiciel de d\u00e9tection de similarit\u00e9 en amont est une pratique recommand\u00e9e.\n- Cas l\u00e9gitime de similarit\u00e9 : m\u00e9thodologie standard identique partag\u00e9e entre publications d'un m\u00eame auteur.\n\n## Traitement \u00e9thique des sujets\n- Toute recherche impliquant des sujets humains ou animaux n\u00e9cessite les autorisations appropri\u00e9es obtenues AVANT le d\u00e9but de l'\u00e9tude.\n- Une d\u00e9claration explicite de cette conformit\u00e9 doit figurer dans le document final.\n\n## D\u00e9claration des conflits d'int\u00e9r\u00eats\n- Tout engagement ext\u00e9rieur pouvant interf\u00e9rer avec l'objectivit\u00e9 doit \u00eatre d\u00e9clar\u00e9 explicitement.`,
    questionsDiagnostics: [
      { critere: 'Exactitude', question: 'Les donn\u00e9es pr\u00e9sent\u00e9es sont-elles toutes r\u00e9elles et v\u00e9rifiables ? Aucune donn\u00e9e n\'a-t-elle \u00e9t\u00e9 omise ou arrang\u00e9e pour accentuer un r\u00e9sultat ?' },
      { critere: 'Originalit\u00e9', question: 'Chaque r\u00e9sultat pr\u00e9sent\u00e9 est-il r\u00e9ellement nouveau, ou a-t-il d\u00e9j\u00e0 \u00e9t\u00e9 publi\u00e9 (m\u00eame partiellement) ailleurs ?' },
      { critere: 'Paraphrase', question: 'Chaque reprise d\'id\u00e9e d\'un autre auteur est-elle suffisamment reformul\u00e9e (structure de pens\u00e9e propre) ou s\'agit-il d\'un simple changement de mots ?' },
      { critere: 'Conformit\u00e9 \u00e9thique', question: 'Si la recherche implique des sujets humains ou animaux, l\'approbation du comit\u00e9 d\'\u00e9thique est-elle d\u00e9clar\u00e9e dans la section m\u00e9thodologie ?' },
      { critere: 'Conflits d\'int\u00e9r\u00eats', question: 'Tous les engagements financiers ou de conseil pouvant interf\u00e9rer avec l\'objectivit\u00e9 sont-ils d\u00e9clar\u00e9s ?' },
    ],
    pointsIntegration: [
      'directeur-chat: crit\u00e8res de d\u00e9tection paraphrase insuffisante + absence d\u00e9claration \u00e9thique',
      'mode correction: consigne actionnable test de paraphrase (r\u00e9diger sans source, v\u00e9rifier apr\u00e8s)',
      'cadrage: vigilance anti-salami science pour th\u00e8ses par articles',
    ],
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // FICHE 02 \u2014 Choisir une revue et \u00e9viter les pr\u00e9datrices
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'choisir-revue',
    titre: 'Choisir une revue et \u00e9viter les revues pr\u00e9datrices',
    source: 'Gastel & Day, 9e \u00e9d., 2022',
    signaux: [
      'o\u00f9 publier', 'quelle revue', 'choix de revue', 'revue cible',
      'pr\u00e9datrice', 'pr\u00e9dateur', 'sollicitation', 'publication', 'soumettre',
      'facteur d\'impact', 'impact factor', 'DORA', 'acc\u00e8s ouvert', 'APC',
      'frais de publication', 'exon\u00e9ration', 'waiver',
    ],
    contenu: `## D\u00e9cider t\u00f4t, d\u00e9cider bien\nLe choix de la revue doit se faire AVANT la r\u00e9daction, pas apr\u00e8s. \u00c9crire d'abord et chercher ensuite oblige presque toujours \u00e0 r\u00e9viser en profondeur.\n\n## \u00c9valuer la l\u00e9gitimit\u00e9\n- Identifier o\u00f9 sont publi\u00e9s les travaux de r\u00e9f\u00e9rence dans son sous-champ.\n- Le facteur d'impact est un indicateur utile mais limit\u00e9 : il indique la moyenne de citations d'une revue, pas la probabilit\u00e9 que CET article soit cit\u00e9. Il ne se compare jamais entre disciplines.\n- DORA (San Francisco Declaration on Research Assessment) : ne jamais r\u00e9duire l'\u00e9valuation \u00e0 un seul chiffre.\n- \u00catre prudent avec les revues tr\u00e8s r\u00e9centes non adoss\u00e9es \u00e0 une soci\u00e9t\u00e9 savante.\n\n## Acc\u00e8s ouvert\n- Les frais de publication (APC) sont \u00e0 anticiper dans la planification budg\u00e9taire.\n- Des r\u00e9ductions ou exon\u00e9rations sont souvent disponibles \u2014 contacter directement la revue.\n\n## Signaux de revue pr\u00e9datrice (5 signaux d'alerte)\n1. Promesses trop belles (garantie de publication en quelques jours, quel que soit le contenu)\n2. Site web truff\u00e9 de fautes typographiques ou d'incoh\u00e9rences visuelles\n3. M\u00e9triques fabriqu\u00e9es (indice d'impact propri\u00e9taire non reconnu)\n4. Absence d'articles de qualit\u00e9 v\u00e9rifiable, voire absence totale d'articles\n5. Sollicitations agressives et non cibl\u00e9es par e-mail\n\n## Signaux de l\u00e9gitimit\u00e9\n- Indexation par les grandes bases bibliographiques reconnues\n- R\u00e9f\u00e9rencement dans les biblioth\u00e8ques universitaires\n- Articles de qualit\u00e9 d\u00e9j\u00e0 connus du chercheur`,
    questionsDiagnostics: [
      { critere: 'Timing', question: 'La revue cible a-t-elle \u00e9t\u00e9 choisie AVANT de commencer la r\u00e9daction, ou seulement apr\u00e8s ?' },
      { critere: 'Pertinence', question: 'Les travaux de r\u00e9f\u00e9rence du sous-champ sont-ils publi\u00e9s dans cette revue ?' },
      { critere: 'Facteur d\'impact', question: 'Le facteur d\'impact est-il utilis\u00e9 comme un indicateur parmi d\'autres (DORA), et non comme seul crit\u00e8re ?' },
      { critere: 'Signaux pr\u00e9dateurs', question: 'La revue pr\u00e9sente-t-elle un des 5 signaux d\'alerte (promesses irr\u00e9alistes, fautes typo, m\u00e9triques fabriqu\u00e9es, absence d\'articles, sollicitations agressives) ?' },
      { critere: 'Signaux de l\u00e9gitimit\u00e9', question: 'La revue est-elle index\u00e9e par des bases reconnues et r\u00e9f\u00e9renc\u00e9e dans les biblioth\u00e8ques universitaires ?' },
      { critere: 'APC', question: 'Les frais de publication (APC) ont-ils \u00e9t\u00e9 anticip\u00e9s dans le budget ? Une exon\u00e9ration a-t-elle \u00e9t\u00e9 demand\u00e9e si n\u00e9cessaire ?' },
    ],
    pointsIntegration: [
      'journaux-oa: checklist de pr\u00e9-soumission avec crit\u00e8res de l\u00e9gitimit\u00e9 et signaux pr\u00e9dateurs',
      'cadrage: pour th\u00e8se par articles, la revue cible et ses contraintes doivent \u00eatre d\u00e9clar\u00e9es d\u00e8s la conception du chapitre',
      'module publication futur: checklist structur\u00e9e de pr\u00e9-soumission',
    ],
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // FICHE 03 \u2014 \u00c9crire les r\u00e9sultats et la discussion
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'ecrire-resultats-discussion',
    titre: '\u00c9crire les r\u00e9sultats et la discussion sans les confondre',
    source: 'Gastel & Day, 9e \u00e9d., 2022',
    signaux: [
      'r\u00e9sultats', 'discussion', 'tableau', 'figure', 'redondance',
      'entonnoir invers\u00e9', 'intro/disc', 'coh\u00e9rence introduction discussion',
      'non-effet', 'pr\u00e9cision statistique', 'significatif', 'camouflage',
    ],
    contenu: `## R\u00e9sultats : s\u00e9lectionner plut\u00f4t qu'accumuler\n- Pr\u00e9senter des donn\u00e9es repr\u00e9sentatives, pas exhaustives. \u00ab Le sot collecte les faits, le sage les choisit. \u00bb\n- Se m\u00e9fier de la fausse pr\u00e9cision : rapporter \u00ab 28,8136 % \u00bb pour 17/59 cas est trompeur.\n- Noter aussi ce qui n'a PAS d'effet \u2014 c'est une information utile.\n\n## \u00c9viter la redondance texte/tableau/figure\n- NE JAMAIS r\u00e9p\u00e9ter dans le texte ce que le tableau ou la figure montre d\u00e9j\u00e0 \u2014 c'est la faute la plus commise.\n- \u00c9viter : \u00ab Le tableau 1 montre que X inhibe Y. \u00bb Pr\u00e9f\u00e9rer : \u00ab X a inhib\u00e9 Y (tableau 1). \u00bb\n- Veiller \u00e0 ce que chaque pronom ait un ant\u00e9c\u00e9dent limpide.\n\n## Discussion : la section la plus difficile\n- \u00c9viter le \u00ab camouflage \u00e0 l'encre de seiche \u00bb : formulations vagues et alambiqu\u00e9es quand on doute.\n- La discussion accepte la premi\u00e8re personne : \u00ab nous concluons que \u00bb est pr\u00e9f\u00e9rable aux tournures impersonnelles.\n\n## Structure en entonnoir invers\u00e9\nL'introduction va du g\u00e9n\u00e9ral au sp\u00e9cifique (entonnoir). La discussion fait l'inverse :\nr\u00e9sultats sp\u00e9cifiques \u2192 mise en relation avec travaux ant\u00e9rieurs \u2192 implications th\u00e9oriques/pratiques \u2192 limites \u2192 questions ouvertes.\n\n## Test de coh\u00e9rence intro/discussion\nL'introduction pose des questions ; la discussion doit y r\u00e9pondre EXPLICITEMENT. Une discussion qui n'adresse pas les questions de l'introduction est incompl\u00e8te.\n\n## Assumer forces et limites\n- Souligner les points forts aide le lecteur \u00e0 juger de la port\u00e9e r\u00e9elle.\n- Cacher une limite est contre-productif : un relecteur la remarquera. Mieux vaut la nommer et en discuter l'impact.`,
    questionsDiagnostics: [
      { critere: 'S\u00e9lection', question: 'Chaque donn\u00e9e pr\u00e9sent\u00e9e est-elle signifiante, ou y a-t-il des donn\u00e9es r\u00e9p\u00e9titives qui pourraient \u00eatre r\u00e9sum\u00e9es ?' },
      { critere: 'Pr\u00e9cision', question: 'Le niveau de pr\u00e9cision statistique est-il adapt\u00e9 \u00e0 la taille r\u00e9elle de l\'\u00e9chantillon ?' },
      { critere: 'Non-effets', question: 'Les variables test\u00e9es sans effet observ\u00e9 sont-elles mentionn\u00e9es, ou seuls les r\u00e9sultats positifs sont-ils rapport\u00e9s ?' },
      { critere: 'Redondance', question: 'Y a-t-il des phrases qui r\u00e9p\u00e8tent en mots ce qu\'un tableau ou une figure montre d\u00e9j\u00e0 ?' },
      { critere: 'Entonnoir invers\u00e9', question: 'La discussion part-elle des r\u00e9sultats sp\u00e9cifiques pour remonter vers la port\u00e9e g\u00e9n\u00e9rale ?' },
      { critere: 'Coh\u00e9rence intro/disc', question: 'Chaque question pos\u00e9e dans l\'introduction trouve-t-elle une r\u00e9ponse explicite dans la discussion ?' },
      { critere: 'Limites', question: 'Les limites de l\'\u00e9tude sont-elles nomm\u00e9es et leur impact sur les conclusions discut\u00e9 ?' },
    ],
    pointsIntegration: [
      'directeur-chat: v\u00e9rification crois\u00e9e intro/discussion (chaque question \u2192 r\u00e9ponse)',
      'mode correction: d\u00e9tection automatis\u00e9e redondance texte/tableau',
      'module r\u00e9daction: rep\u00e8re visuel entonnoir invers\u00e9',
    ],
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // FICHE 04 \u2014 Tableaux et figures
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'tableaux-figures',
    titre: 'Quand (et quand ne pas) utiliser un tableau ou une figure',
    source: 'Gastel & Day, 9e \u00e9d., 2022',
    signaux: [
      'tableau', 'figure', 'graphique', 'colonnes', 'donn\u00e9es num\u00e9riques',
      'z\u00e9ros', 'valeurs identiques', 'non significatif', '+/-',
      'visualisation', 'diagramme',
    ],
    contenu: `## Le r\u00e9flexe \u00e0 corriger\nToute donn\u00e9e num\u00e9rique ne m\u00e9rite pas un tableau. Un tableau mal justifi\u00e9 nuit \u00e0 la lisibilit\u00e9.\n\n## Trois signaux qu'un tableau ne devrait PAS exister\n1. **Colonnes remplies de z\u00e9ros ou de valeurs identiques** \u2192 r\u00e9sumable en une phrase\n2. **Colonnes remplies de symboles binaires (+/\u2212) r\u00e9p\u00e9t\u00e9s** \u2192 une phrase suffit\n3. **Tableaux pour r\u00e9sultats non significatifs** \u2192 d\u00e9cr\u00e9dibilise le document\n\nPrincipe : si un tableau ou une colonne peut \u00eatre reformul\u00e9 en une phrase sans perte d'information, le reformuler en phrase.\n\n## Quand un tableau EST justifi\u00e9\nDonn\u00e9es r\u00e9p\u00e9titives, multivari\u00e9es ou comparatives qu'une phrase ne pourrait pas restituer sans devenir illisible \u2014 typiquement plusieurs variables crois\u00e9es sur plusieurs conditions.\n\n## Principe partag\u00e9 avec la fiche r\u00e9sultats/discussion\nNe jamais reformuler dans le texte ce qu'un tableau ou une figure montre d\u00e9j\u00e0.`,
    questionsDiagnostics: [
      { critere: 'Justification', question: 'Ce tableau pr\u00e9sente-t-il des donn\u00e9es multivari\u00e9es/comparatives qui n\u00e9cessitent une grille, ou pourrait-il \u00eatre r\u00e9sum\u00e9 en une phrase ?' },
      { critere: 'Valeurs identiques', question: 'Ce tableau contient-il des colonnes avec une forte proportion de valeurs identiques ou de z\u00e9ros ?' },
      { critere: 'Symboles binaires', question: 'Ce tableau se r\u00e9duit-t-il \u00e0 des symboles binaires (+/\u2212) qui pourraient \u00eatre d\u00e9crits en texte ?' },
      { critere: 'Significativit\u00e9', question: 'Ce tableau pr\u00e9sente-t-il des r\u00e9sultats non significatifs qui n\'apportent pas d\'information utile ?' },
      { critere: 'Redondance', question: 'Le texte adjacent reformule-t-il en mots ce que ce tableau montre d\u00e9j\u00e0 ?' },
    ],
    pointsIntegration: [
      '\u00e9diteur: d\u00e9tection automatique sur tableaux ins\u00e9r\u00e9s (forte proportion valeurs identiques/symboles binaires)',
      'mode correction: point de contr\u00f4le qualit\u00e9 des tableaux',
    ],
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // FICHE 05 \u2014 Auto-\u00e9dition 8C
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'auto-edition-8c',
    titre: 'Auto-\u00e9dition : le cadre des 8 C',
    source: 'Gastel & Day, 9e \u00e9d., 2022',
    signaux: [
      'correction', 'relecture', 'r\u00e9vision', 'auto-\u00e9dition', '8C',
      '8 crit\u00e8res', 'checklist', 'soumission', 'v\u00e9rifier avant',
      'relire', 'corriger', 'r\u00e9viser',
    ],
    contenu: `## Les 8 C du cadre \u00e9tendu\n\n1. **Conformit\u00e9 (compliance)** \u2014 Le texte respecte-t-il les consignes formelles (gabarit, conventions terminologiques, structurelles) ? Conformit\u00e9 \u00e9thique document\u00e9e ?\n2. **Exhaustivit\u00e9 (completeness)** \u2014 Tous les \u00e9l\u00e9ments attendus sont-ils pr\u00e9sents ? Chaque section contient-elle l'information n\u00e9cessaire (m\u00e9thode r\u00e9pliquable) ?\n3. **Composition** \u2014 La structure d'ensemble est-elle appropri\u00e9e ? Paragraphes avec phrase d'ancrage claire ? Une id\u00e9e m\u00e8ne-t-elle naturellement \u00e0 la suivante ?\n4. **Exactitude (correctness)** \u2014 L'information est-elle correcte (texte, tableaux, figures, r\u00e9f\u00e9rences) ? Raisonnement valide ? Grammaire, orthographe, ponctuation correctes ?\n5. **Clart\u00e9 (clarity)** \u2014 Termes ambigus d\u00e9finis ? Abr\u00e9viations explicit\u00e9es ? Ant\u00e9c\u00e9dents des pronoms identifiables ? Phrases trop longues rep\u00e9r\u00e9es ?\n6. **Coh\u00e9rence (consistency)** \u2014 Chiffres identiques dans le texte et les tableaux ? R\u00e9sum\u00e9 correspond au corps ? Terminologie stable sans synonymes flottants ?\n7. **Concision** \u2014 Mots longs rempla\u00e7ables par des plus courts ? Tournures verbeuses condensables ? Redondances ou contenu tangentiel ? Attention : ne jamais sacrifier la clart\u00e9.\n8. **Courtoisie (courtesy)** \u2014 Ton neutre envers les travaux ant\u00e9rieurs ? Langage inclusif et respectueux envers les groupes de population mentionn\u00e9s ?\n\nLe C final vis\u00e9 : la **Communication** \u2014 un texte qui r\u00e9ussit sur ces 8 dimensions communique efficacement.\n\n## M\u00e9thode de relecture\n- V\u00e9rifier les 8C en passes successives, chacune cibl\u00e9e sur un sous-ensemble.\n- La derni\u00e8re passe : lin\u00e9aire, du d\u00e9but \u00e0 la fin, comme un lecteur r\u00e9el.\n- Changer de perspective : lire \u00e0 voix haute, modifier la police/mise en page.\n\n## Checklist scientifique sp\u00e9cialis\u00e9e\n1. Le titre refl\u00e8te-t-il fid\u00e8lement et de fa\u00e7on concise le contenu ?\n2. Le r\u00e9sum\u00e9 correspond-il exactement au corps du texte, dans une longueur appropri\u00e9e ?\n3. L'introduction fournit-elle un contexte suffisant et indique-t-elle clairement le vide combl\u00e9 ?\n4. La m\u00e9thode fournit-elle assez d'information pour r\u00e9plication ET \u00e9valuation critique ?\n5. Les r\u00e9sultats sont-ils pr\u00e9sent\u00e9s dans un ordre logique, avec un niveau de d\u00e9tail appropri\u00e9 ?\n6. La discussion r\u00e9pond-elle explicitement aux questions pos\u00e9es dans l'introduction ?\n7. Toutes les personnes remplissant les crit\u00e8res d'autorat sont-elles list\u00e9es comme auteurs ?`,
    questionsDiagnostics: [
      { critere: 'Conformit\u00e9', question: 'Le texte respecte-t-il le gabarit et les conventions de la revue/institution ? La conformit\u00e9 \u00e9thique est-elle document\u00e9e si n\u00e9cessaire ?' },
      { critere: 'Exhaustivit\u00e9', question: 'Chaque section contient-elle toute l\'information attendue (d\u00e9tails m\u00e9thodologie suffisants pour r\u00e9plication) ?' },
      { critere: 'Composition', question: 'La structure est-elle logique ? Chaque paragraphe a-t-il une phrase d\'ancrage claire ?' },
      { critere: 'Exactitude', question: 'L\'information est-elle correcte dans le texte, les tableaux, les figures et les r\u00e9f\u00e9rences ?' },
      { critere: 'Clart\u00e9', question: 'Tous les termes ambigus sont-ils d\u00e9finis ? Les pronoms ont-ils des ant\u00e9c\u00e9dents clairs ?' },
      { critere: 'Coh\u00e9rence', question: 'Les chiffres sont-ils identiques entre texte et tableaux ? La terminologie est-elle stable ?' },
      { critere: 'Concision', question: 'Y a-t-il des redondances, des tournures verbeuses ou du contenu tangentiel \u00e0 supprimer ?' },
      { critere: 'Courtoisie', question: 'Le ton envers les travaux ant\u00e9rieurs est-il neutre ? Le langage est-il inclusif ?' },
    ],
    pointsIntegration: [
      'auto-\u00e9dition: checklist interactive 8 cat\u00e9gories avec questions diagnostiques comme sous-items',
      'auto-\u00e9dition: checklist scientifique sp\u00e9cialis\u00e9e (7 items) en onglet s\u00e9par\u00e9',
      'correction: courtoisie mise en \u00e9vidence comme valeur ajout\u00e9e unique (non couverte par les correcteurs classiques)',
      'correction: outil de diagnostic assist\u00e9, jamais r\u00e9\u00e9criture automatique',
    ],
  },

  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // FICHE 06 \u2014 Langue seconde et lectorat international
  // \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  {
    id: 'langue-seconde-international',
    titre: '\u00c9crire la science en langue seconde, pour un lectorat international',
    source: 'Gastel & Day, 9e \u00e9d., 2022',
    signaux: [
      'langue seconde', 'non natif', 'anglais', 'international',
      'publication internationale', 'correcteur', 'relecteur', 'traduction',
      'style acad\u00e9mique', 'niveau de langue', 'bilingue',
    ],
    contenu: `## Le contenu prime sur l'\u00e9l\u00e9gance stylistique\nSi le contenu est informatif, bien organis\u00e9 et clair, les probl\u00e8mes de grammaire restent corrigibles apr\u00e8s coup. Si l'information manque ou le sens reste flou, aucune correction linguistique ne peut compenser. **Fond avant forme, toujours.**\n\n## L'\u00e9diteur/correcteur comme alli\u00e9, pas comme juge\nLes revues s\u00e9rieuses souhaitent publier la meilleure science, ind\u00e9pendamment de l'origine linguistique. Beaucoup consacrent un effort suppl\u00e9mentaire aux auteurs non natifs. La relation avec le relecteur est une collaboration, pas un contr\u00f4le.\n\n## Diff\u00e9rences culturelles \u00e0 conna\u00eetre\n- **Niveau de d\u00e9tail** : observer les textes publi\u00e9s dans le contexte vis\u00e9 avant de r\u00e9diger.\n- **Degr\u00e9 de directivit\u00e9** : les revues internationales attendent une phrase d'ouverture de paragraphe qui \u00e9nonce directement l'id\u00e9e principale, suivie des \u00e9l\u00e9ments qui la d\u00e9veloppent.\n- **Rapport au temps** : r\u00e9activit\u00e9 rapide aux sollicitations de r\u00e9vision attendue.\n- **Citation litt\u00e9rale** : la quasi-totalit\u00e9 du texte doit \u00eatre dans les mots propres de l'auteur ; toute reprise litt\u00e9rale signal\u00e9e par guillemets.\n\n## Strat\u00e9gies concr\u00e8tes\n- Observer syst\u00e9matiquement la structure de paragraphe des textes publi\u00e9s dans le contexte vis\u00e9.\n- R\u00e9pondre rapidement aux demandes de clarification d'un relecteur.\n- Ne jamais supposer qu'un correcteur a n\u00e9cessairement raison : l'auteur reste responsable de l'exactitude finale.`,
    questionsDiagnostics: [
      { critere: 'Fond avant forme', question: 'Les retours sont-ils ordonn\u00e9s ainsi : probl\u00e8mes de structure et de clart\u00e9 du contenu EN PREMIER, puis seulement ensuite les points de langue de surface ?' },
      { critere: 'Phrase d\'ouverture', question: 'Chaque paragraphe commence-t-il par une phrase qui \u00e9nonce directement l\'id\u00e9e principale, ou tourne-t-il autour du point sans l\'atteindre ?' },
      { critere: 'Niveau de d\u00e9tail', question: 'Le niveau de d\u00e9tail est-il calibr\u00e9 sur les conventions du contexte de publication vis\u00e9 (pas trop ni trop peu) ?' },
      { critere: 'Citation', question: 'Toute reprise litt\u00e9rale d\'un autre auteur est-elle signal\u00e9e par des guillemets et une citation ?' },
    ],
    pointsIntegration: [
      'correction: ordre d\'affichage \'fond avant forme\' (structure/clart\u00e9 d\'abord, langue ensuite)',
      'correction: d\u00e9tection de paragraphes sans phrase d\'ouverture directe',
      'directeur-chat: calibration du ton pour r\u00e9dacteurs non natifs (rassurer sur fond/forme)',
    ],
  },
];

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// R\u00e8gles d'orchestration sp\u00e9cifiques
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

export const CORPUS_ORCHESTRATION_RULES = {
  priorityCorrection: 'auto-edition-8c' as const,
  complementaryPair: {
    if: 'ecrire-resultats-discussion',
    alsoConsider: 'tableaux-figures',
    reason: "Les fiches r\u00e9sultats/discussion et tableaux/figures partagent le principe 'ne jamais reformuler en texte ce qu'un tableau montre'. V\u00e9rifier si l'autre apporterait une valeur compl\u00e9mentaire.",
  },
  maxFichesPerInteraction: 2,
  doctrine: 'Lecture seule et en critique, jamais en g\u00e9n\u00e9ration de contenu de substitution.',
} as const;

// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
// D\u00e9tection de signaux
// \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

/**
 * D\u00e9tecte les fiches pertinentes \u00e0 partir d'un message utilisateur.
 * Retourne au maximum `maxFiches` IDs, class\u00e9s par pertinence (nombre de signaux match\u00e9s).
 */
export function detectRelevantFiches(
  userMessage: string,
  maxFiches: number = CORPUS_ORCHESTRATION_RULES.maxFichesPerInteraction,
): string[] {
  const normalized = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const scored = CORPUS_PUBLICATION.map((fiche) => {
    const matchCount = fiche.signaux.filter((signal) => {
      const normalizedSignal = signal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalized.includes(normalizedSignal);
    }).length;
    return { id: fiche.id, score: matchCount };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiches)
    .map((s) => s.id);
}

/**
 * Retourne le contenu des fiches d\u00e9tect\u00e9es, format\u00e9 pour injection dans un prompt syst\u00e8me.
 */
export function getFichesContentForPrompt(ficheIds: string[]): string {
  if (ficheIds.length === 0) return '';

  const fiches = ficheIds
    .map((id) => CORPUS_PUBLICATION.find((f) => f.id === id))
    .filter(Boolean) as CorpusFiche[];

  if (fiches.length === 0) return '';

  let prompt = '\n\n---\nCONTEXTE ADDITIONNEL (corpus publication scientifique \u2014 \u00e0 utiliser en CRITIQUE, jamais en g\u00e9n\u00e9ration de substitution) :\n\n';

  for (const fiche of fiches) {
    prompt += `### ${fiche.titre} (${fiche.source})\n${fiche.contenu}\n\n`;
  }

  if (ficheIds.includes('ecrire-resultats-discussion') && !ficheIds.includes('tableaux-figures')) {
    prompt += `\nNOTE : la fiche \u00ab Quand utiliser un tableau ou une figure \u00bb est compl\u00e9mentaire \u00e0 la pr\u00e9sente (principe commun : ne jamais reformuler en texte ce qu'un tableau montre). Consid\u00e9rer si cette fiche apporterait une valeur suppl\u00e9mentaire.\n`;
  }

  return prompt;
}

/**
 * Retourne toutes les fiches (pour consultation compl\u00e8te).
 */
export function getAllFiches(): CorpusFiche[] {
  return CORPUS_PUBLICATION;
}

/**
 * Retourne une fiche par ID.
 */
export function getFicheById(id: string): CorpusFiche | undefined {
  return CORPUS_PUBLICATION.find((f) => f.id === id);
}
