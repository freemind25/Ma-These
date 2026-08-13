// Corpus scientifique - ThesisFrame
// Regles IMRaD, criteres qualite, anti-patterns (Gastel & Day, Turabian)

export type CritereQualite = string;

export type AntiPattern = {
  erreur: string;
  correction: string;
};

export type SectionCriteres = {
  titre: CritereQualite[];
  resume: CritereQualite[];
  introduction: CritereQualite[];
  methodes: CritereQualite[];
  resultats: CritereQualite[];
  discussion: CritereQualite[];
};

export type AntipatternsParSection = {
  titre: AntiPattern[];
  resume: AntiPattern[];
  introduction: AntiPattern[];
  methodes: AntiPattern[];
  resultats: AntiPattern[];
  discussion: AntiPattern[];
};

export type ItemChecklist = {
  categorie: string;
  items: string[];
};

export const CORPUS_ECRIRE_ARTICLE_SCIENTIFIQUE = {
  reglesIMRaD: `STRUCTURE IMRAD D'UN ARTICLE SCIENTIFIQUE :

Logique fondamentale (4 questions) :
  - Quelle question a ete etudiee ? -> Introduction
  - Comment a-t-elle ete etudiee ? -> Methodes
  - Quels sont les resultats ? -> Resultats
  - Que signifient ces resultats ? -> Discussion

**TITRE** :
- Definir comme le moins de mots possibles decrivant le contenu du papier.
- Pas de mots de remplissage en debut ("Etudes sur", "Observations preliminaires sur", "A/An/Le").
- Specific plutot que general : nommer les especes, les methodes, les variables si possible.
- Syntaxe correcte : attention aux participes suspendus ("bacteries causant la mammite par chromatographie" -> "par chromatographie, bacteries causant la mammite").
- Pas d'abreviations, de noms commerciaux, de jargon.
- Le titre est une etiquette, pas une phrase (eviter les titres affirmatifs/declaratifs).
- Pas de titres-serie ni de titres-a-deux-points sauf convention de la revue.

**RESUME (ABSTRACT)** :
- Version miniature du papier (les 4 elements IMRaD).
- Maximum 250 mots, un seul paragraphe (sauf format structure avec sous-titres).
- Tems : principalement le passe (travail deja realise).
- Auto-suffisant : compréhensible sans le reste de l'article.
- Pas de citations, pas de renvoi a des tableaux/figures.
- Pas d'information absente du corps du texte.
- Mots-cles a la fin (3-5 termes, differents de ceux du titre).

**INTRODUCTION (entonnoir : du general au specifique)** :
  1. Presenter la nature et la portee du probleme avec toute la clarte possible. Pourquoi ce domaine est-il important ?
  2. Revue selective de la litterature pertinente pour orienter le lecteur et identifier le gap.
  3. Formuler clairement l'objectif de la recherche (ou l'hypothese).
  4. Indiquer la methode choisie et, si necessaire, justifier ce choix.
  5. (Recommande) Annoncer les principaux resultats et conclusions des la fin.
- Tems : principalement le present (connaissances etablies).
- Ne PAS cacher les resultats importants jusqu'a la fin (pas d'effet de suspense).
- Definir tout terme specialise ou abreviation.

**METHODES (reproductibilite)** :
  - But : decrire le design experimental et fournir assez de details pour qu'un collegue competent puisse reproduire l'experience.
  - Temps : principalement le passe (actions deja realisees). Pas de copier-coller de la proposition sans changer le temps.
  - Ordre : chronologique quand possible, mais regrouper les methodes apparentees (ex. tous les dosages ensemble, meme si faits a des moments differents).
  - Commencer par un apercu general du design experimental.
  - Sous-titres paralleles a ceux de la section Resultats.
  - Materials : specifications techniques exactes, quantites, sources. Noms generiques de preference aux noms commerciaux.
  - Sujets humains/animaux : criteres de selection, consentement eclaire, approbation ethique (IRB/IACUC).
  - Statistiques : decrire brievement les methodes statistiques; citer si avancees ou inhabituelles.
  - Pas de resultats dans cette section.
  - Precision grammaticale cruciale (une virgule manquante peut changer le sens).
  - La voix passive est acceptable ici (l'agent de l'action est souvent irrelevent).

**RESULTATS (clarte cristalline)** :
  - C'est le coeur du papier - les nouvelles connaissances.
  - Commencer par un apercu general (pas repeter les details de la section Methodes).
  - Presenter les donnees : ordre chronologique, thematique, ou du plus au moins important.
  - Donnees representatives plutot que repetitives ("Le sage selectionne les faits; le fou les accumule").
  - Si peu de determinations : dans le texte. Si repetitives : dans des tableaux/graphiques.
  - Tems : passe.
  - Eviter la redondance : ne pas repeter en mots ce qui est deja lisible dans les tableaux/figures.
  - Citer en renvoi : "X a inhibe la croissance de Y (Tableau 1)" et NON "Il est clairement montre dans le Tableau 1 que X a inhibe..."
  - Signaler les resultats negatifs pertinents (ce qui n'a pas fonctionne est aussi important).
  - Nombre de decimales raisonnable (29% et non 28,8136% pour 17/59).
  - Ne pas laisser l'antecedent d'un pronom ambigu.

**DISCUSSION (entonnoir inverse : du specifique au general)** :
  - Interpréter les resultats, NE PAS les repeter.
  1. Presenter les principes, relations et generalisations montres par les resultats.
  2. Pointer les exceptions et correlations manquantes. Ne jamais masquer ou truquer les donnees.
  3. Comparer avec les travaux anterieurs (convergences et divergences, raisons possibles).
  4. Discuter les implications theoriques et les applications pratiques.
  5. Indiquer clairement l'apport original par rapport aux travaux anterieurs.
  6. Poser de nouvelles questions de recherche et suggérer des pistes pour les travaux futurs.
  7. Formuler une conclusion claire, nette et memorable.
  - Forme en entonnoir inverse : partir des resultats specifiques pour aboutir aux implications generales.
  - Repondre a la question posee dans l'introduction : l'intro et la discussion forment une paire logique.
  - RAPPEL : la discussion interprete les resultats, elle ne les repete pas.

  Erreur frequente (la technique du calamar) : masquer des faiblesses dans les donnees par un texte verbeux et flou. La concision et l'honnetete intellectuelle sont preferable.

  Autres variantes structurelles :
  - IRDAM : Methodes en fin de papier (certaines revues medicales).
  - IMRDRDRD : Alternance methodes/resultats (experiences sequentielles).
  - ILMRAD : Revue de litterature integree apres l'introduction.
  - IMRADC : Section Conclusions separee a la fin.

  Toujours verifier les conventions de la revue cible avant de choisir la structure.

  Forme globale du papier : Sablier (large -> etroit -> large). Orientation large (intro), focus etroit (methodes/resultats), contexte large (discussion).
`,

  criteresQualiteParSection: {
    titre: [
      "Le titre contient-il les mots-cles les plus pertinents pour l'indexation ?",
      "Chaque mot est-il necessaire ?",
      "La syntaxe est-elle correcte (pas de participe suspendu) ?",
      "Le titre serait-il comprehensible hors de son contexte ?",
      "Y a-t-il des abreviations, du jargon ou des noms commerciaux ? (a eviter)",
      "Le titre est-il specifique plutot que vague ou general ?",
    ],
    resume: [
      "Le resume decrit-il les 4 elements (objectif, methode, resultats, conclusion) ?",
      "Le resume respecte-t-il la limite de mots (typiquement 250 mots) ?",
      "Le resume est-il auto-suffisant (sans renvoi a des figures, tableaux ou references) ?",
      "Les abreviations sont-elles evitees sauf si elles apparaissent plusieurs fois ?",
      "Le resume contient-il des informations absentes du corps du texte ? (a eviter)",
      "Le temps verbal est-il principalement le passe ?",
    ],
    introduction: [
      "Le probleme est-il clairement defini des les premieres phrases ?",
      "La revue de litterature est-elle ciblee et selective (pas exhaustive) ?",
      "Le gap dans la litterature est-il explicitement identifie ?",
      "L'objectif de l'etude est-il formule de maniere claire et specifique ?",
      "La structure en entonnoir (du general au specifique) est-elle respectee ?",
      "Les termes specialises sont-ils definis ?",
    ],
    methodes: [
      "Un collegue competent pourrait-il reproduire l'experience a partir de cette description ?",
      "Les materiaux sont-ils decrits avec precision (specifications, sources, quantites) ?",
      "Le design experimental est-il decrit de maniere generale avant les details ?",
      "Les methodes statistiques sont-elles mentionnees (sans description excessive) ?",
      "Les approbations ethiques sont-elles notees (sujets humains, animaux) ?",
      "Y a-t-il des resultats melanges dans cette section ? (a eviter)",
    ],
    resultats: [
      "Les resultats sont-ils presentes avec clarte cristalline ?",
      "Les donnees representatives sont-elles privilegiees sur les donnees repetitives ?",
      "L'organisation est-elle logique (chronologique, par theme, ou par importance) ?",
      "Les chiffres sont-ils cites en renvoi au tableau/figure, pas en repetition verbale ?",
      "Les valeurs negatives (ce qui n'a pas fonctionne) sont-elles mentionnees quand pertinent ?",
      "Le nombre de decimales est-il raisonnable par rapport a la precision des mesures ?",
    ],
    discussion: [
      "La discussion interprete-t-elle les resultats au lieu de les repeter ?",
      "Les resultats sont-ils compares aux travaux anterieurs (convergences et divergences) ?",
      "Les implications theoriques et pratiques sont-elles discutees ?",
      "Les forces et limites de l'etude sont-elles identifiees honnetement ?",
      "La discussion repond-elle a la question posee dans l'introduction ?",
      "La conclusion est-elle claire, nette et memorable ?",
    ],
  },

  reglesTableauxFigures: `TABLEAUX :
- Utiliser un tableau quand les donnees sont trop nombreuses ou complexes pour le texte.
- Ne jamais dupliquer dans le texte ce qui est deja clairement lisible dans le tableau.
- Structure : en-tetes clairs, unites dans les en-tetes de colonnes, donnees alignees.
- Chaque tableau doit etre autonome : comprehensible sans lire le texte.
- Titre descriptif au-dessus du tableau.
- Notes de bas de tableau pour les abreviations, les niveaux de signification (p), et les notes methodologiques.
- Pas de lignes verticales dans les tableaux scientifiques (convention standard).

FIGURES :
- Utiliser des graphiques pour montrer des tendances, des comparaisons, des relations.
- Eviter les graphiques 3D decoratifs : la clarte prime sur l'esthetique.
- Legende descriptive sous la figure.
- Les axes doivent avoir des etiquettes claires avec unites.
- Resolution suffisante pour la publication (minimum 300 dpi).
- Chaque figure doit etre referencee dans le texte.
- Ne pas utiliser de figure quand un tableau serait plus precis (donnees exactes).
- Schema experimentaux et diagrammes de flux pour les methodes complexes.

REFERENCEMENT DANS LE TEXTE :
- Ecrire "X a inhibe la croissance de Y (Tableau 1)" et NON "Il est clairement montre dans le Tableau 1 que X a inhibe la croissance de Y".
- Attirer l'attention sur les resultats, pas sur les tableaux/figures.
`,

  reglesCitationReferences: `TROIS SYSTEMES DE CITATION PRINCIPAUX :

1. Nom-Annee (systeme Harvard) : "Dupont (2020)" ou "(Dupont et Martin, 2020)".
   - Avantage : facile a ajouter/supprimer des references.
   - Regle "et al." : 1-2 auteurs = tous cites ; 3 auteurs = tous la premiere fois puis "et al." ; 4+ auteurs = "et al." des la premiere citation.

2. Numerotation alphabetique : references classees par ordre alphabetique, citees par numero.
   - Permet d'integrer le nom dans la phrase : "Cette methode a ete decouverte par Dupont (13)."

3. Numerotation par ordre d'apparition : numeros dans l'ordre de citation.
   - Simple, lecteur suit l'ordre 1-2-3. Difficile a modifier (renumerotation).

BONNES PRATIQUES :
- Toujours conserver les informations bibliographiques completes (titre, pages incluses, DOI si disponible).
- Verifier chaque reference contre l'original.
- Les titres de journaux en un seul mot (Science, Biochemistry) ne sont JAMAIS abreges.
- Les abreviations de titres de journaux suivent la norme ANSI.

STYLE CHICAGO/TURABIAN :
Deux styles selon la discipline :
- Notes-Bibliographie : notes de bas de page, bibliographie finale (sciences humaines, certaines sciences sociales).
- Auteur-Date : citations entre parentheses dans le texte (Auteur, Annee, p. X), liste de references finale (sciences naturelles, physiques, la plupart des sciences sociales).

QUAND CITER (Turabian) :
- Resumer quand on n'a besoin que du point general.
- Paraphraser quand on peut representer l'idee plus clairement que l'original (utiliser ses propres mots ET sa propre structure de phrases).
- Citer textuellement quand : les mots constituent une preuve, proviennent d'une autorite, sont originaux/frappants, encadrent la discussion, ou presentent une vue qu'on conteste.
- Verifier TOUJOURS les citations textuelles contre l'original.
`,

  processusSoumissionEvaluation: `PREPARATION A LA SOUMISSION :
- Verifier la conformite aux instructions aux auteurs de la revue cible.
- Relire l'ensemble du manuscrit : coherence, exactitude, logique, concision.
- Faire relire par : (1) un expert de la specialite, (2) un collegue du domaine general, (3) un lecteur intelligent non-specialiste.
- Preparer une lettre d'accompagnement : indiquer la nouveaute, l'importance, l'absence de soumission parallele.
- Finaliser le titre et le resume en dernier.

PROCESSUS D'EVALUATION (PEER REVIEW) :
- L'editeur evalue d'abord le manuscrit (pertinence, qualite generale).
- Si retenu, l'editeur l'envoie a 2-3 rapporteurs experts.
- Les rapporteurs evaluent : importance de la question, originalite, validite des methodes, solidite des conclusions, clarte de la redaction.
- L'editeur prend la decision : accepter, reviser (mineurement ou majoritairement), ou rejeter.

REPONDRE AUX COMMENTAIRES :
- Repondre a CHAQUE commentaire, point par point.
- Adopter un ton respectueux et constructif.
- Si on ne suit pas une suggestion, expliquer pourquoi avec courtoisie.
- Reviser le manuscrit en consequence et indiquer les modifications.
`,

  considerationsEthiques: [
    "Authenticite : les donnees rapportees doivent provenir de recherches reellement effectuees. La fabrication de donnees est une faute grave.",
    "Precision : pas d'omission de points aberrants sans justification, pas de manipulation d'images pour accentuer les resultats.",
    "Originalite : les resultats doivent etre inedits (sauf republication avec citation claire de l'original). Pas de double soumission.",
    "Credit : l'auteur doit avoir contribue substantiellement a la conception, l'acquisition de donnees, ou l'analyse. Contribuer uniquement a l'obtention de financement ne suffit pas.",
    "Ordre des auteurs : refleter l'importance de la contribution. L'auteur correspondant soumet, recoit les decisions et repond aux lecteurs.",
    "Conflits d'interets : declarer tout lien financier, personnel ou professionnel pouvant influencer l'interpretation des resultats.",
    "Sujets humains/animaux : obtenir le consentement eclaire et l'approbation du comite d'ethique (IRB/IACUC).",
    "Plagiat : paraphraser en utilisant ses propres mots et sa propre structure de phrases. Toujours citer la source.",
  ],

  antipatterns: {
    titre: [
      { erreur: "Titres vagues ou trop generaux", exemple: "Etudes sur les bacteries", correction: "Inhibition de la croissance de Staphylococcus aureus par la streptomycine" },
      { erreur: "Mots de remplissage en debut de titre", exemple: "Observations preliminaires sur l'effet de certains antibiotiques...", correction: "Supprimer 'Observations preliminaires sur' et 'de certains'" },
      { erreur: "Syntaxe defectueuse (participe suspendu)", exemple: "Caracterisation des bacteries causant la mammite par chromatographie", correction: "Caracterisation par chromatographie des bacteries causant la mammite" },
      { erreur: "Titres-slogans ou jeux de mots", exemple: "Mourir pour faire pipi", correction: "Association entre l'utilisation de diuretiques et la mortalite cardiovasculaire" },
    ],
    resume: [
      { erreur: "Resume qui omet des elements cles (objectif, methode, resultats ou conclusion)", correction: "Verifier la presence des 4 composantes IMRaD dans le resume." },
      { erreur: "Informations ou conclusions absentes du corps du texte", correction: "Le resume ne doit contenir que ce qui est dans le papier." },
      { erreur: "Citations bibliographiques dans le resume", correction: "Supprimer les citations (sauf exception pour une methode modifiee)." },
      { erreur: "Resume trop long ou verbeux", correction: "Condenser : 'Les individus dans les sciences doivent faire une quantite considerable d'ecriture' -> 'Les scientifiques doivent ecrire pour reussir'." },
    ],
    introduction: [
      { erreur: "Cacher les resultats importants jusqu'a la fin (effet de suspense)", correction: "Annoncer les principaux resultats et conclusions a la fin de l'introduction. Le lecteur doit savoir qui a fait ca des le debut." },
      { erreur: "Revue de litterature excessive ou non selective", correction: "La revue dans l'intro doit etre breve et ciblee. Une revue approfondie necessite une section separee." },
      { erreur: "Probleme non defini ou incomprehensible", correction: "La premiere regle est de definir le probleme clairement. Sans probleme clair, le lecteur n'a aucun interet pour la solution." },
      { erreur: "Terms non definis pour les lecteurs hors-specialite", correction: "Definir tout terme specialise ou abreviation dans l'introduction." },
    ],
    methodes: [
      { erreur: "Melanges de resultats dans la section methodes", correction: "Les resultats n'ont pas leur place ici. Seule la description de la procedure." },
      { erreur: "Details insuffisants pour la reproductibilite", correction: "Test : un collegue competent peut-il reproduire l'experience ? Si non, ajouter des details." },
      { erreur: "Changement de temps non effectue (present au lieu du passe)", correction: "Revoir le temps verbal : les actions deja accomplies se rapportent au passe." },
      { erreur: "Noms commerciaux sans equivalent generique", correction: "Utiliser le nom generique en premier, le nom commercial entre parentheses si necessaire." },
    ],
    resultats: [
      { erreur: "Repetition verbale de toutes les donnees des tableaux/figures", correction: "Citer en renvoi : 'X a inhibe la croissance de Y (Tableau 1)' plutot que de tout reformuler." },
      { erreur: "Donnees repetitives plutot que representatives", correction: "Le sage selectionne les faits ; le fou les accumule. Presenter les donnees pertinentes, pas tout le carnet de laboratoire." },
      { erreur: "Trop de decimales non significatives", correction: "Si 17 sur 59 ecureuils ont repondu, ecrire 29% et non 28,8136%." },
      { erreur: "Antecedents de pronoms manquants", correction: "Toujours verifier que chaque pronom a un antecedent clair et non ambigu." },
    ],
    discussion: [
      { erreur: "Repetition/recapitulation des resultats", correction: "La discussion INTERPRETE les resultats, elle ne les repete pas." },
      { erreur: "Discussion trop verbeuse ou evasive (technique du calamar)", correction: "Etre direct et concis. L'obscurete masque souvent des faiblesses dans les donnees." },
      { erreur: "Omission des limites de l'etude", correction: "Identifier honnetement les limites. Les evaluateurs les remarqueront de toute facon -- mieux vaut les anticiper." },
      { erreur: "Pas de reponse a la question de l'introduction", correction: "L'intro et la discussion forment une paire. La discussion doit repondre a ce que l'intro a pose." },
      { erreur: "Fin en marecage (pas de conclusion claire)", correction: "Terminer par une conclusion nette et memorable. Comme une bonne musique, un bon article a un climax adapte." },
    ],
  } as Record<string, AntiPattern[]>,

  jargonAEviter: {
    "en raison du fait que": "parce que",
    "en ce qui concerne": "sur, concernant",
    "au moyen de": "par, avec",
    "a l'issue de": "apres",
    "a l'heure actuelle": "maintenant",
    "a ce stade": "maintenant",
    "dans le but de": "pour",
    "pour la raison que": "parce que",
    "en vue de": "pour",
    "compte tenu du fait que": "parce que",
    "il convient de noter que": "noter que (ou supprimer)",
    "il est a noter que": "noter que (ou supprimer)",
    "il est suggere que": "je pense",
    "il est generalement admis que": "beaucoup pensent",
    "il est interessant de noter que": "(supprimer)",
    "il a ete rapporte par X que": "X a rapporte que",
    "il est apparu que": "(supprimer)",
    "il est evident que": "clairement",
    "il est clair que": "clairement",
    "en termes de": "concernant, au sujet de",
    "en l'absence de": "sans",
    "dans l'eventualite ou": "si",
    "a la majorite des": "la plupart des",
    "un nombre considerable de": "beaucoup de",
    "un certain nombre de": "quelques, certains",
    "un petit nombre de": "quelques",
    "essentiellement unique": "unique",
    "tres unique": "unique",
    "resultats finaux": "resultats",
    "la grande majorite des": "la plupart des",
    "faciliter": "aider",
    "effectuer": "faire",
    "mettre en oeuvre": "commencer, appliquer",
    "proceder a": "faire",
    "prendre en consideration": "considere",
    "avoir la capacite de": "pouvoir",
    "quantifier": "mesurer",
    "elucider": "expliquer",
    "modifier": "changer",
    "ultime": "dernier",
    "rassembler ensemble": "rassembler",
    "suffisamment suffisant": "suffisant",
    "resumer brievement": "resumer",
    "raison fondamentale": "cause",
    "resultat final": "resultat",
    "consensus d'opinion": "consensus",
    "rouge en couleur": "rouge",
    "grand en taille": "grand",
    "a un rythme rapide": "rapidement",
    "a une date anterieure": "precedemment",
    "avoir un impact sur": "affecter",
    "faire reference a": "mentionner",
    "cette decouverte particuliere": "cette decouverte",
    "ce resultat semblerait indiquer que": "ce resultat indique que",
    "que ce soit ou non": "si",
    "a un rythme rapide": "rapidement",
    "a une date anterieure": "precedemment",
    "dans le domaine de la chimie": "en chimie",
  } as Record<string, string>,

  reglesRevueLitterature: `REDIGER UNE REVUE DE LITTERATURE :

1. Planification :
   - Preparer un plan detaille AVANT d'ecrire.
   - Consulter l'editeur de la revue cible pour verifier l'interet du sujet.

2. Types de revues :
   - Revue critique : evaluation et synthese avec jugement (prefere par les vieilles revues de synthese).
   - Revue bibliographique : compilation annotee mais non evaluative.
   - Revue systematique : methodologie explicite (bases interrogees, termes, criteres d'inclusion/exclusion). Suivre PRISMA.

3. Style d'ecriture :
   - Moins technique que pour un article original (audience plus large).
   - Eliminer le jargon ou l'expliquer soigneusement.
   - Style expansif plutot que telegraphique.
   - Utiliser des sous-titres correspondant au plan.

4. Contenu essentiel :
   - Premier paragraphe de chaque section : crucial pour les lecteurs qui decident de lire ou de survoler.
   - INTEGRER plutot que cataloguer : combiner les resultats de differentes etudes dans des paragraphes thematiques.
   - Ne PAS faire une succession d'abstracts (un paragraphe par etude citee).
   - Inclure des figures et tableaux quand approprie.
   - Identifier les lacunes dans les connaissances.
   - Ecrire une conclusion/synthese.

5. Erreurs frequentes :
   - Citer tout ce qui existe sur le sujet (citer ce qui est pertinent).
   - Ne pas citer un article important : le mentionner avec ses limites si necessaire.
   - Organiser chronologiquement sans reflexion thematique.
`,

  conseilsThese: `REDACTION DE LA THESE :

- La these est la preuve que le candidat maitrise un domaine et sait faire de la recherche originale.
- Commencer a ecrire TOT pendant la recherche (pas a la fin).
- On peut commencer par n'importe quelle section (souvent les Methodes sont les plus faciles).
- Laisser le titre et le resume pour la fin.
- Reviser au moins 10 fois.

RECHERCHE D'EFFICACITE :
- Bloquer des creneaux d'ecriture dans l'agenda.
- Fixer des echeances internes.
- Ne pas interrompre l'elan pour chercher des details mineurs.
- S'arreter en plein elan pour faciliter la reprise.
- Si blocage : diviser en sous-taches, lire un bon exemple, enregistrer ses idees.

VERIFICATION AVANT SOUMISSION :
- Montrer le manuscrit a : un expert de la specialite, un collegue du domaine, un lecteur non-specialiste.
- Poser la question cle : un collegue peut-il reproduire les experiences ?
- Verifier coherence, exactitude, logique, concision, grammaire, orthographe.
`,

  checklistSoumission: [
    { categorie: "Contenu", items: [
      "Toutes les informations necessaires sont-elles incluses ?",
      "Du contenu superflu doit-il etre supprime ?",
      "Toutes les informations sont-elles exactes ?",
      "Le raisonnement est-il logiquement solide ?",
      "Le contenu est-il coherent tout au long du manuscrit ?",
      "La discussion repond-elle a la question de l'introduction ?",
    ]},
    { categorie: "Organisation", items: [
      "La structure IMRaD est-elle respectee (ou variante appropriee) ?",
      "Les sous-titres sont-ils paralleles entre methodes et resultats ?",
      "Le plan en entonnoir est-il respecte dans l'introduction ?",
      "Le plan en entonnoir inverse est-il respecte dans la discussion ?",
    ]},
    { categorie: "Redaction", items: [
      "Chaque phrase est-elle clairement formulee ?",
      "Les points sont-ils brievement, simplement et directement enonces ?",
      "Le jargon et les expressions verbeuses sont-ils elimines ?",
      "La grammaire, l'orthographe et la ponctuation sont-elles correctes ?",
      "Le temps verbal est-il approprie (present pour la litterature, passe pour les methodes/resultats) ?",
      "Les abreviations sont-elles definies a la premiere utilisation ?",
    ]},
    { categorie: "Elements visuels", items: [
      "Chaque tableau/figure est-il bien concu et necessaire ?",
      "Les tableaux/figures sont-ils references dans le texte ?",
      "Les legendes sont-elles descriptives et autonomes ?",
      "Il n'y a pas de redondance texte/tableau ?",
    ]},
    { categorie: "References", items: [
      "Toutes les references citees sont-elles dans la bibliographie (et vice versa) ?",
      "Chaque reference est-elle verifiee contre l'original ?",
      "Le style de citation est-il conforme aux instructions aux auteurs ?",
      "Les titres de journaux sont-ils correctement abreges ?",
      "Les DOI sont-ils inclus quand disponibles ?",
    ]},
    { categorie: "Ethique et forme", items: [
      "Les approbations ethiques sont-elles mentionnees ?",
      "Les conflits d'interets sont-ils declares ?",
      "La contribution de chaque auteur est-elle claire ?",
      "Le manuscrit est-il conforme aux instructions aux auteurs de la revue ?",
      "La lettre d'accompagnement est-elle preparee ?",
    ]},
  ],
} as const;
