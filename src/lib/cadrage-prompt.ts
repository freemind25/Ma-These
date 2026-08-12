// ─── Prompt système pour le module de cadrage préalable ────────

export const CADRAGE_SYSTEM_PROMPT = `Tu es l'assistant de cadrage initial de ThesisFrame, un outil d'aide à la rédaction de thèses.

Ton rôle est STRICTEMENT DIFFÉRENT de celui du module directeur de thèse : tu génères des PROPOSITIONS DE BROUILLON pour un cadrage de recherche provisoire, jamais du contenu de chapitre final. Chaque suggestion que tu produis doit être formulée comme une hypothèse de travail modifiable, jamais comme une affirmation définitive.

Règles impératives :
1. Ne jamais inventer de noms d'auteurs, de titres d'ouvrages, de théories nommées précises, ou de références bibliographiques. Tu peux évoquer des catégories ou familles d'approches (ex. « une approche par la morphologie urbaine »), jamais des sources précises non vérifiées.
2. Si les informations fournies par le rédacteur sont insuffisantes pour proposer un champ avec un minimum de fiabilité, laisse le champ vide et formule une question de relance précise plutôt qu'une suggestion générique ou creuse.
3. Adapte le vocabulaire méthodologique au champ disciplinaire déclaré (architecture, urbanisme, patrimoine, mobilités, etc.).
4. Distingue toujours clairement, dans ta sortie structurée, la problématique (le manque ou la tension qui justifie la recherche) de la question de recherche (sa formulation opérationnelle) — ne fusionne jamais ces deux champs.
5. Signale toute incohérence entre les champs (type de recherche déclaré vs. vocabulaire méthodologique utilisé, objectifs non rattachés à une question) sous forme de remarque distincte dans le champ "coherence_remarks", jamais en corrigeant silencieusement le champ concerné.
6. Pour les hypothèses : ne les propose que si le type de recherche le justifie. En recherche qualitative exploratoire, signale qu'elles sont optionnelles.
7. Formule toutes tes suggestions au conditionnel ou avec des marqueurs d'hypothèse : « Il pourrait s'agir de… », « Une problématique possible serait… ».`

export const CADRAGE_JSON_SCHEMA = `{
  "fields": {
    "thematique": "(string) — le champ disciplinaire et le sujet général, en une phrase.",
    "problematique": "(string) — la tension ou le manque qui justifie la recherche. Pas le contexte général.",
    "questions_recherche": {
      "principale": "(string) — la question principale, opérationnalisable.",
      "secondaires": "(string[]) — 2-3 sous-questions, une par objectif spécifique."
    },
    "objectifs": {
      "general": "(string) — reformulation actionnable de la question principale.",
      "specifiques": "(string[]) — un par sous-question ou étape empirique."
    },
    "hypotheses": "(string[]) — propositions à tester. Laisser vide [] si type_recherche est qualitatif exploratoire.",
    "type_recherche": {
      "type": "(quantitative | qualitative | mixte | recherche_projet)",
      "justification": "(string) — pourquoi ce type est adapté à la question posée."
    },
    "methodologie": {
      "methodes_collecte": "(string[]) — entretiens, corpus, relevés, etc.",
      "unite_analyse": "(string) — le cas, corpus ou site choisi.",
      "justification_unite_analyse": "(string) — pourquoi cette unité d'analyse.",
      "terrain_corpus": "(string) — description du terrain ou corpus.",
      "limites_anticipees": "(string) — limites méthodologiques prévisibles."
    },
    "type_revue_litterature": {
      "type": "(narrative | systematique | scoping | thematique | meta_synthese)",
      "justification": "(string) — pourquoi ce type de revue."
    },
    "cadre_theorique": "(string) — catégories ou familles d'approches pertinentes. JAMAIS de noms d'auteurs précis non vérifiés.",
    "mots_cles": {
      "disciplinaires": "(string[]) — 3-5 termes disciplinaires larges.",
      "specifiques_projet": "(string[]) — 2-3 termes spécifiques au projet."
    },
    "contribution_attendue": "(string) — ce que la thèse apportera de nouveau.",
    "type_these": "(classique | par_articles | par_theme | format_specifique)"
  },
  "questions_relay": {
    "<fieldKey>": "(string | null) — question de relance si le pitch est insuffisant pour ce champ, sinon null."
  },
  "coherence_remarks": [
    {
      "field": "(string) — clé du champ concerné",
      "severity": "(info | warning | error)",
      "message": "(string) — explication de la tension détectée."
    }
  ]
}`

export function buildGeneratePrompt(pitch: string): string {
  return `À partir du pitch suivant, propose un premier jet de cadrage pour chaque champ. Remplis les champs que tu peux inférer avec un minimum de fiabilité. Pour les champs où le pitch est insuffisant, laisse la valeur vide/null et mets une question de relance dans "questions_relay".

Pitch du doctorant :
"""
${pitch}
"""

Réponds UNIQUEMENT au format JSON suivant, sans préambule ni texte hors structure :
${CADRAGE_JSON_SCHEMA}`
}

export function buildReformulatePrompt(
  fieldKey: string,
  fieldLabel: string,
  currentFieldValue: string,
  otherFields: Record<string, string>,
): string {
  const otherFieldsSummary = Object.entries(otherFields)
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `- ${k}: ${v.slice(0, 200)}`)
    .join('\n')

  return `Le doctorant souhaite reformuler le champ suivant avec l'aide de l'IA.

Champ à reformuler : ${fieldLabel} (${fieldKey})
Valeur actuelle du champ : "${currentFieldValue}"

Autres champs déjà renseignés (à prendre en compte pour la cohérence) :
${otherFieldsSummary || '(aucun autre champ renseigné)'}

Propose une reformulation améliorée de ce champ unique. Formule au conditionnel. Réponds UNIQUEMENT en JSON : { "value": "...", "meta": null | {...} }`
}

export function buildCoherencePrompt(fields: Record<string, string>): string {
  const fieldsSummary = Object.entries(fields)
    .filter(([, v]) => v && v.trim().length > 0)
    .map(([k, v]) => `- ${k}: ${v.slice(0, 300)}`)
    .join('\n')

  return `Voici les champs d'un cadrage de thèse. Vérifie la cohérence interne entre les champs suivants :

${fieldsSummary}

Vérifications à effectuer :
1. Le type de recherche déclaré correspond-il au vocabulaire de la méthodologie décrite ? (ex. : « échantillon représentatif », « mesurer », « corréler » signalent un vocabulaire quantitatif — à confronter à un type « qualitatif » déclaré.)
2. Chaque objectif spécifique se rattache-t-il à au moins une sous-question ?
3. Le type de revue de littérature choisi est-il cohérent avec l'ampleur du champ décrit ? (une revue systématique sur un sujet extrêmement large est un risque de calendrier)
4. Le champ hypothèses est-il rempli alors que le type de recherche est qualitatif exploratoire ? → signaler la tension, ne pas l'interdire.

Réponds UNIQUEMENT en JSON : { "coherence_remarks": [{ "field": "...", "severity": "info|warning|error", "message": "..." }] }

Si tout est cohérent, renvoie un tableau vide. Ne corrige jamais automatiquement un champ.`
}
