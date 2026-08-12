// Research Field Analysis Prompts — 9 structured prompts for deep literature analysis
// Each prompt targets a specific analytical dimension of a scientific research field

export interface ResearchFieldPrompt {
  id: string
  number: number
  title: string
  subtitle: string
  icon: string
  prompt: string
  description: string
  outputHint: string
  color: 'violet' | 'amber' | 'emerald' | 'rose' | 'cyan' | 'slate' | 'orange' | 'teal' | 'indigo'
}

export const RESEARCH_FIELD_PROMPTS: ResearchFieldPrompt[] = [
  {
    id: 'protocole-entree',
    number: 1,
    title: 'Protocole d\'entrée',
    subtitle: 'Cartographie globale du champ de recherche',
    icon: '🗺️',
    prompt: `Je vais partager [X] articles sur [Sujet]. Avant de poser toute question, identifie chaque article par son ou ses auteur(s), son année de publication, et une seule phrase qui capture sa thèse principale. Ensuite, regroupe les articles en clusters selon les hypothèses ou perspectives qu\'ils partagent, en mettant en avant les articles qui se contredisent directement. Ne résume pas les articles individuellement. Concentre-toi plutôt sur la cartographie globale du champ de recherche pour que je comprenne clairement comment la littérature est organisée.`,
    description: 'Premier contact avec un corpus. Établit la carte mentale du champ en identifiant les lignes de fracture entre écoles de pensée.',
    outputHint: 'Clusters thématiques + matrice de positionnement des auteurs',
    color: 'violet',
  },
  {
    id: 'detecteur-contradictions',
    number: 2,
    title: 'Détecteur de contradictions',
    subtitle: 'Identifier les désaccords directs entre auteurs',
    icon: '⚔️',
    prompt: `Dans l\'ensemble des articles téléchargés, identifie chaque cas où deux auteurs ou plus se contredisent directement. Pour chaque contradiction, décris clairement les deux positions, identifie les articles concernés, et explique pourquoi ce désaccord existe probablement — que ce soit en raison de différences de méthodologie, de jeux de données, de cadres théoriques, ou de la période à laquelle les études ont été menées. Présente les résultats dans un tableau bien organisé.`,
    description: 'Extrait systématiquement les contradictions pour révéler les zones de tension intellectuelle.',
    outputHint: 'Tableau structuré : Position A vs Position B + cause du désaccord',
    color: 'rose',
  },
  {
    id: 'chaine-citations',
    number: 3,
    title: 'Chaîne de citations',
    subtitle: 'Lignée intellectuelle des concepts clés',
    icon: '🔗',
    prompt: `Identifie les trois concepts les plus influents ou les plus cités à travers l\'ensemble des articles téléchargés. Pour chaque concept, explique qui l\'a introduit en premier, qui l\'a ensuite remis en question, qui l\'a affiné ou développé, et quel est le consensus académique actuel, s\'il en existe un. Présente l\'évolution intellectuelle de chaque concept comme une lignée claire, semblable à un arbre généalogique, montrant comment l\'idée a évolué au fil du temps.`,
    description: 'Trace la généalogie des concepts fondateurs pour comprendre comment le savoir s\'est construit.',
    outputHint: '3 arbres généalogiques de concepts avec branches et consensus actuel',
    color: 'amber',
  },
  {
    id: 'detecteur-lacunes',
    number: 4,
    title: 'Détecteur de lacunes',
    subtitle: 'Questions de recherche non résolues',
    icon: '🔍',
    prompt: `En te basant sur l\'ensemble des articles téléchargés, identifie cinq questions de recherche importantes qui restent sans réponse. Pour chaque lacune de recherche, explique pourquoi elle existe encore — qu\'elle soit due à une difficulté technique, à une trop grande spécialisation, à un manque d\'attention de la part des chercheurs, ou aux limites des méthodes actuelles. Identifie l\'article qui s\'est le plus rapproché de répondre à la question, et recommande la méthodologie la plus appropriée pour y répondre pleinement.`,
    description: 'Identifie les frontières du savoir et propose des voies pour les repousser.',
    outputHint: '5 lacunes avec cause + article le plus proche + méthodologie recommandée',
    color: 'cyan',
  },
  {
    id: 'audit-methodologique',
    number: 5,
    title: 'Audit méthodologique',
    subtitle: 'Comparaison critique des approches de recherche',
    icon: '🧪',
    prompt: `Compare les méthodologies de recherche utilisées à travers l\'ensemble des articles téléchargés en les regroupant en catégories telles que : enquêtes, expériences, simulations, méta-analyses et études de cas. Évalue ensuite quelle méthodologie domine le champ de recherche et pourquoi, identifie quelle méthodologie est sous-utilisée, et détermine quelle approche semble fournir les preuves les plus faibles, en expliquant les raisons de cette évaluation.`,
    description: 'Évalue la solidité épistémologique du champ en comparant les méthodes employées.',
    outputHint: 'Taxonomie des méthodes + dominance / sous-utilisation / preuves faibles',
    color: 'emerald',
  },
  {
    id: 'synthese-maitresse',
    number: 6,
    title: 'Synthèse maîtresse',
    subtitle: 'Vue d\'ensemble condensée du champ',
    icon: '📜',
    prompt: `En utilisant ta compréhension complète de la littérature téléchargée, rédige une synthèse qui ne résume pas les articles individuellement. Explique plutôt ce que le champ de recherche croit collectivement, identifie les questions qui restent activement débattues, distingue les résultats qui sont solidement établis, et conclus avec la question de recherche non résolue la plus importante. Garde la réponse sous 400 mots et évite tout remplissage inutile.`,
    description: 'Produit une synthèse de haut niveau, prête à être intégrée dans l\'état de l\'art.',
    outputHint: 'Synthèse < 400 mots : consensus, débats, résultats établis, question ouverte',
    color: 'slate',
  },
  {
    id: 'destructeur-hypotheses',
    number: 7,
    title: 'Destructeur d\'hypothèses',
    subtitle: 'Révéler les présupposés non justifiés',
    icon: '💥',
    prompt: `Identifie toutes les hypothèses sur lesquelles la majorité de ces articles s\'appuient sans jamais les prouver ou les justifier explicitement. Pour chaque hypothèse, explique-la clairement, identifie un ou deux articles qui en dépendent le plus fortement, et discute de la manière dont les conclusions, théories ou connaissances établies du champ de recherche changeraient si cette hypothèse s\'avérait finalement fausse.`,
    description: 'Déconstruit les fondations implicites pour évaluer la robustesse du champ.',
    outputHint: 'Liste d\'hypothèses non prouvées + articles dépendants + impact si fausse',
    color: 'orange',
  },
  {
    id: 'carte-connaissances',
    number: 8,
    title: 'Carte des connaissances',
    subtitle: 'Structuration visuelle du champ',
    icon: '🧭',
    prompt: `Crée une carte structurée des connaissances issues de la littérature téléchargée en identifiant la thèse centrale autour de laquelle le champ de recherche s\'organise, suivie de trois à cinq piliers de soutien bien établis, deux à trois grandes zones de débat en cours, et une à deux questions de pointe qui restent non résolues. Conclus en recommandant les trois articles que tout nouveau venu devrait lire en premier, en expliquant pourquoi chacun est essentiel. Présente le résultat sous forme de plan structuré clair plutôt qu\'en prose.`,
    description: 'Produit une architecture cognitive du champ, idéale pour structurer une revue de littérature.',
    outputHint: 'Plan structuré : thèse centrale + piliers + débats + pointe + 3 lectures essentielles',
    color: 'teal',
  },
  {
    id: 'test-et-alors',
    number: 9,
    title: 'Test du « Et alors ? »',
    subtitle: 'Vulgarisation en 5 minutes',
    icon: '💡',
    prompt: `Imagine que je n\'ai que cinq minutes pour expliquer l\'ensemble de ce champ de recherche à une personne intelligente sans aucune connaissance préalable du sujet. Commence par une seule phrase décrivant ce que ce champ de recherche a définitivement prouvé. Donne ensuite une déclaration honnête sur ce que les chercheurs ne savent toujours pas. Enfin, explique l\'implication concrète la plus importante de cette recherche. Utilise un langage simple et accessible, en évitant le jargon, la complexité inutile et le style académique.`,
    description: 'Force la clarté en vulgarisant. Idéal pour l\'introduction ou la conclusion de thèse.',
    outputHint: '3 parties : ce qui est prouvé + ce qui est inconnu + implication concrète',
    color: 'indigo',
  },
]

export const PROMPT_COLORS: Record<ResearchFieldPrompt['color'], {
  bg: string
  border: string
  light: string
  dot: string
  text: string
}> = {
  violet: {
    bg: 'bg-violet-600',
    border: 'border-violet-300',
    light: 'bg-violet-50',
    dot: 'bg-violet-500',
    text: 'text-violet-700',
  },
  amber: {
    bg: 'bg-amber-600',
    border: 'border-amber-300',
    light: 'bg-amber-50',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
  },
  emerald: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-300',
    light: 'bg-emerald-50',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
  },
  rose: {
    bg: 'bg-rose-600',
    border: 'border-rose-300',
    light: 'bg-rose-50',
    dot: 'bg-rose-500',
    text: 'text-rose-700',
  },
  cyan: {
    bg: 'bg-cyan-600',
    border: 'border-cyan-300',
    light: 'bg-cyan-50',
    dot: 'bg-cyan-500',
    text: 'text-cyan-700',
  },
  slate: {
    bg: 'bg-slate-600',
    border: 'border-slate-300',
    light: 'bg-slate-50',
    dot: 'bg-slate-500',
    text: 'text-slate-700',
  },
  orange: {
    bg: 'bg-orange-600',
    border: 'border-orange-300',
    light: 'bg-orange-50',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
  },
  teal: {
    bg: 'bg-teal-600',
    border: 'border-teal-300',
    light: 'bg-teal-50',
    dot: 'bg-teal-500',
    text: 'text-teal-700',
  },
  indigo: {
    bg: 'bg-indigo-600',
    border: 'border-indigo-300',
    light: 'bg-indigo-50',
    dot: 'bg-indigo-500',
    text: 'text-indigo-700',
  },
}
