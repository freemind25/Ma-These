// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Knowledge Core
// SOURCE UNIQUE DE VÉRITÉ — savoir métier digéré
// ═══════════════════════════════════════════════════════════════
//
// RÈGLE ANTI-DUPLICATION :
// Ce fichier est la SEULE source de savoir métier pour tous les prompts IA.
// Les fichiers de spécialisation ne doivent JAMAIS dupliquer ces contenus.
// Toute modification de savoir métier se fait ICI uniquement.
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
  | "methodology";

// ───────────────────────────────────────
// Module: STYLE — règles rédactionnelles universelles
// ───────────────────────────────────────

const STYLE_MODULE = `
## STYLE RÉDACTIONNEL (valable pour tous les modes de rédaction)
- Français académique soigné, vouvoiement
- Phrases de 25-30 mots en moyenne
- Voix passive et passé composé privilégiés pour les résultats
- Connecteurs logiques explicites (cependant, en revanche, ainsi, par conséquent)
- Citations entre parenthèses : (Auteur, Année)
- Jargon non défini interdit — chaque terme technique doit être défini à sa première occurrence
- Affirmations non étayées interdites
- Structure en paragraphes logiques, chaque paragraphe commençant par une phrase-topic
- Pas de répétitions lexicales
- Fond avant forme pour les non-anglophones : prioriser la clarté des idées sur la perfection linguistique
`;

// ───────────────────────────────────────
// Module: ETHICS — éthique de la publication
// ───────────────────────────────────────

const ETHICS_MODULE = `
## ÉTHIQUE DE LA PUBLICATION
- Paraphrase suffisante obligatoire : le simple remplacement de mots ne suffit pas
- Détection de l'auto-plagiat entre articles d'une même thèse
- Détection du risque de salami science (découpage artificiel d'un même travail en plusieurs articles)
- Déclarations de conformité éthique exigées (comité d'éthique, consentement)
- Signaux de revues prédatrices à alerter :
  · Promesses de publication rapide (< 2 semaines)
  · Frais de publication (APC) opaques ou démesurés
  · Comité éditorial fantôme ou inactif
  · Absence d'indexation dans Scopus, Web of Science ou DOAJ
- Principes DORA (San Francisco Declaration on Research Assessment) :
  · Évaluer la recherche sur son contenu, pas sur le facteur d'impact de la revue
  · Encourager la vérification de l'indexation (Scopus, WoS, DOAJ pour OA)
`;

// ───────────────────────────────────────
// Module: COHERENCE — cohérence du manuscrit
// ───────────────────────────────────────

const COHERENCE_MODULE = `
## COHÉRENCE DU MANUSCRIT

### Introduction ↔ Discussion
- Chaque question de recherche formulée dans l'introduction doit recevoir une réponse EXPLICITE dans la discussion
- Chaque hypothèse formulée doit être testée empiriquement et discutée
- Les résultats orphelins (discutés sans être reliés à une question de l'intro) doivent être signalés
- La discussion suit une structure en entonnoir inversé : du spécifique vers le général

### Texte ↔ Tableaux / Figures
- Un renvoi au tableau (« comme le montre le Tableau 1 ») n'est PAS redondant
- Citer dans le texte CHAQUE valeur numérique déjà présente dans le tableau EST redondant
- Reformuler les tendances générales du tableau est acceptable si cela apporte une interprétation
- Seule la répétition pure de données est considérée redondante

### Cohérence numérique
- Les mêmes chiffres doivent apparaître de manière identique entre sections
- Les pourcentages doivent correspondre aux nombres absolus déclarés
- La somme des pourcentages doit faire 100% (sauf non-réponses expliquées)
- Les dates et périodes mentionnées doivent être compatibles

### Cohérence terminologique
- Un même concept doit être désigné par le même terme dans toute la thèse
- Les synonymies doivent être explicitées
- Les abréviations doivent être définies à la première occurrence
- Le sens d'un terme ne doit pas évoluer subtilement sans justification

### Cohérence référentielle
- Un même auteur/article ne doit pas être cité avec des interprétations opposées sans justification
- Chaque citation dans le texte doit figurer dans la bibliographie
- Une référence doit être utilisée dans un contexte correspondant à son contenu réel
`;

// ───────────────────────────────────────
// Module: AUTO-ÉDITION — 8 critères Gastel & Day
// ───────────────────────────────────────

const AUTO_EDITION_MODULE = `
## AUTO-ÉDITION — Méthode 8C de Gastel & Day

Évaluer un texte selon les 8 critères suivants :

1. CONFORMITÉ : Le texte respecte-t-il les consignes formelles (gabarit, conventions terminologiques, structurelles) ?
2. EXHAUSTIVITÉ : Tous les éléments attendus sont-ils présents ?
3. COMPOSITION : La structure d'ensemble est-elle appropriée ?
4. EXACTITUDE : L'information est-elle correcte dans le texte, tableaux, figures, références ?
5. CLARTÉ : Termes ambigus définis ? Abréviations explicitées ?
6. COHÉRENCE : Chiffres identiques texte/tableaux ? Terminologie stable ?
7. CONCISION : Redondances ou contenu tangentiel ?
8. COURTOISIE : Ton neutre envers travaux antérieurs ? Langage inclusif ?

Barème de notation :
- 90-100 : Maîtrise exemplaire, aucune amélioration nécessaire
- 75-89 : Bon niveau, améliorations mineures possibles
- 50-74 : Passable, plusieurs améliorations nécessaires
- 25-49 : Insuffisant, problèmes significatifs
- 0-24 : Critique, refonte nécessaire
`;

// ───────────────────────────────────────
// Module: PEER REVIEW — grille Review Commons adaptée
// ───────────────────────────────────────

const PEER_REVIEW_MODULE = `
## GRILLE DE RELECTURE (Review Commons adaptée au contexte doctoral)

══════════════════════════════════════
SECTION 1 — PREUVE, REPRODUCTIBILITÉ, CLARTÉ
══════════════════════════════════════

1.1 RÉSUMÉ
- Résume brièvement les conclusions principales et la méthodologie.
- Place les remarques sur la portée dans la Section 2.

1.2 COMMENTAIRES MAJEURS
- Les affirmations et conclusions sont-elles étayées par les données ?
- Des expériences ou analyses supplémentaires sont-elles nécessaires pour les soutenir ?
  · Si oui, sont-elles réalistes en termes de temps et de ressources ?
  · Sinon, l'auteur devrait-il qualifier les affirmations de « préliminaires » ou les retirer ?
- Les données et méthodes sont-elles présentées de façon reproductible ?
- Les expériences sont-elles suffisamment répliquées et l'analyse statistique adéquate ?
- Suggestions « OPTIONNELLES » identifiées clairement si elles ouvrent de nouvelles pistes.

1.3 COMMENTAIRES MINEURS
- Problèmes spécifiques facilement adressables (forme, présentation).
- Les études antérieures sont-elles correctement référencées ?
- Le texte et les figures sont-ils clairs et précis ?
- Suggestions pour améliorer la présentation.

══════════════════════════════════════
SECTION 2 — PORTÉE ET SIGNIFICATION
══════════════════════════════════════

2.1 BILAN GÉNÉRAL
- Résume les forces et les limites de l'étude.
- Quels sont les aspects les plus solides et les plus importants ?
- Quels aspects devraient être améliorés ou développés ?

2.2 AVANCÉE PAR RAPPORT À L'ÉTAT DE L'ART
- Compare avec les résultats les plus proches dans la littérature.
- L'étude étend-elle les connaissances du domaine ? De quelle manière ?
- Nature de l'avancée (conceptuelle, technique, méthodologique, empirique…).

2.3 PUBLIC CONCERNÉ
- Quel type de public sera intéressé ou influencé ?
- Comment cette recherche sera-t-elle utilisée par d'autres ? Au-delà du champ spécifique ?

══════════════════════════════════════
RECOMMANDATION FINALE
══════════════════════════════════════
Choisir l'une des catégories suivantes et justifier en 2-3 phrases :
- ACCEPTER TEL QUEL — le texte est publiable sans modification majeure
- RÉVISIONS MINEURES — des corrections limitées suffisent
- RÉVISIONS MAJEURES — des modifications substantielles sont nécessaires
- REJETER — le texte ne répond pas aux exigences minimales
`;

// ───────────────────────────────────────
// Module: METHODOLOGY — règles de décision (à compléter par distillation des livres)
// ───────────────────────────────────────

const METHODOLOGY_MODULE = `
## MÉTHODOLOGIE DE RECHERCHE

### Approches qualitatives
- Entretiens semi-directifs, observation participante, analyse de contenu thématique
- Triangulation des sources et des chercheurs pour renforcer la validité
- Saturation thématique comme critère d'arrêt

### Approches quantitatives
- Échantillonnage représentatif, taille d'échantillon et puissance statistique
- Tests d'hypothèses, seuils de significativité, taille d'effet
- Validité interne (causalité) et externe (généralisabilité)

### Approches mixtes
- Design séquentiel ou concurrent
- Triangulation des résultats qualitatifs et quantitatifs

### Règles de décision (à compléter par distillation des livres Kumar, White, Salkind)
- SI question exploratoire ALORS approche qualitative
- IF question de causalité ALORS design expérimental ou quasi-expérimental
- SI comparaison de groupes ALORS échantillonnage probabiliste
- SI recherche-action ALORS approche mixte itérative

### Biais courants à anticiper
- Biais de sélection, biais de réponse, biais de confirmation
- Effet Hawthorne, effet demandeur
- Sur-généralisation au-delà de l'échantillon

### Validité et fiabilité
- Validité de construit, de contenu, de critère
- Fiabilité inter-juges, test-retest, cohérence interne (alpha de Cronbach)
`;

// ───────────────────────────────────────
// Module registry
// ───────────────────────────────────────

const MODULES: Record<KnowledgeModule, string> = {
  style: STYLE_MODULE,
  ethics: ETHICS_MODULE,
  coherence: COHERENCE_MODULE,
  "auto-edition": AUTO_EDITION_MODULE,
  "peer-review": PEER_REVIEW_MODULE,
  methodology: METHODOLOGY_MODULE,
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
