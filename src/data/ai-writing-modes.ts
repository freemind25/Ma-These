// ═══════════════════════════════════════
// ThesisFrame — AI Writing Modes
// Métadonnées des modes (labels, icônes, températures)
// Les systemPrompts sont désormais centralisés dans
// src/lib/ai/specializations/index.ts (SPECIALIZATION_PROMPTS)
// ═══════════════════════════════════════

export type WritingCategory = "writing" | "analysis" | "review" | "generation" | "research";

export interface WritingMode {
  id: string;
  label: string;
  description: string;
  icon: string;
  /** @deprecated Use SPECIALIZATION_PROMPTS[mode.id] instead */
  systemPrompt: string;
  placeholder: string;
  temperature: number;
  category: WritingCategory;
  /** If set, this mode uses a dedicated API endpoint instead of /api/ai-writing */
  customEndpoint?: string;
}

/**
 * Writing mode metadata — labels, descriptions, icons, temperatures.
 * System prompts are centralized in src/lib/ai/specializations/index.ts
 */
export const WRITING_MODES: WritingMode[] = [
  {
    id: "scientific-writing",
    label: "Rédaction scientifique",
    description: "Rédigez un texte académique selon les normes scientifiques",
    icon: "PenTool",
    category: "writing",
    temperature: 0.6,
    placeholder: "Décrivez le sujet ou le paragraphe que vous souhaitez rédiger...",
    systemPrompt: "",
  },
  {
    id: "literature-review",
    label: "Revue de littérature",
    description: "Synthétisez et analysez la littérature existante",
    icon: "BookOpen",
    category: "analysis",
    temperature: 0.5,
    placeholder: "Décrivez le thème ou les travaux à synthétiser...",
    systemPrompt: "",
  },
  {
    id: "peer-review",
    label: "Relecture critique",
    description: "Analysez et critiquez un texte académique (grille Review Commons)",
    icon: "SearchCheck",
    category: "review",
    temperature: 0.4,
    placeholder: "Collez le texte à relire et critiquer...",
    systemPrompt: "",
  },
  {
    id: "paraphrase",
    label: "Paraphrase académique",
    description: "Reformulez un texte en conservant le sens académique",
    icon: "Repeat",
    category: "writing",
    temperature: 0.5,
    placeholder: "Collez le texte à paraphraser...",
    systemPrompt: "",
  },
  {
    id: "abstract",
    label: "Rédaction de résumé",
    description: "Rédigez un résumé structuré (abstract) de votre travail",
    icon: "AlignLeft",
    category: "generation",
    temperature: 0.4,
    placeholder: "Décrivez votre travail (contexte, méthode, résultats, conclusion)...",
    systemPrompt: "",
  },
  {
    id: "hypothesis",
    label: "Génération d'hypothèses",
    description: "Formulez des hypothèses de recherche testables",
    icon: "Lightbulb",
    category: "generation",
    temperature: 0.7,
    placeholder: "Décrivez votre cadre théorique, vos variables et votre question de recherche...",
    systemPrompt: "",
  },
  {
    id: "methodology",
    label: "Aide méthodologique",
    description: "Concevez ou validez votre méthodologie de recherche",
    icon: "FlaskConical",
    category: "analysis",
    temperature: 0.5,
    placeholder: "Décrivez votre objet de recherche et vos contraintes méthodologiques...",
    systemPrompt: "",
  },
  {
    id: "theory",
    label: "Construction théorique",
    description: "Développez et articulez votre cadre théorique",
    icon: "Network",
    category: "analysis",
    temperature: 0.6,
    placeholder: "Décrivez vos concepts clés et les théories que vous mobilisez...",
    systemPrompt: "",
  },
  {
    id: "supervision",
    label: "Documents de supervision",
    description: "Rédigez des documents pour votre directeur de thèse",
    icon: "FileCheck",
    category: "generation",
    temperature: 0.5,
    placeholder: "Quel type de document souhaitez-vous rédiger pour votre directeur ?",
    systemPrompt: "",
  },
  {
    id: "grammaire",
    label: "Correcteur grammatical",
    description: "Vérifiez l'orthographe, la grammaire, le style et la ponctuation",
    icon: "SpellCheck",
    category: "review",
    temperature: 0.2,
    placeholder: "Collez le texte à vérifier...",
    systemPrompt: "",
  },
  {
    id: "defense",
    label: "Préparation soutenance",
    description: "Préparez votre présentation et vos réponses pour la soutenance",
    icon: "Presentation",
    category: "generation",
    temperature: 0.5,
    placeholder: "Décrivez votre travail de thèse et vos points clés...",
    systemPrompt: "",
  },
  {
    id: "harper",
    label: "Harper — Traitement de texte",
    description: "Résumer, paraphraser, extraire les points clés et générer des abstracts",
    icon: "Sparkles",
    category: "generation",
    temperature: 0.5,
    placeholder: "Collez le texte académique à traiter...",
    systemPrompt: "",
  },
  {
    id: "academic-reformulation",
    label: "Reformulation académique",
    description: "Reformulez un texte ou une référence en style académique",
    icon: "RefreshCcw",
    category: "writing",
    temperature: 0.5,
    placeholder: "Collez le texte ou la référence à reformuler...",
    systemPrompt: "",
  },
  {
    id: "deblocage",
    label: "Déblocage de l'écriture",
    description: "Surmontez le blocage d'écriture avec des stratégies concrètes",
    icon: "AlertTriangle",
    category: "writing",
    temperature: 0.8,
    placeholder: "Décrivez votre blocage d'écriture...",
    systemPrompt: "",
  },
  {
    id: "revision-plan",
    label: "Plan de révision",
    description: "Analysez les commentaires reçus et produisez un plan de révision structuré",
    icon: "ListChecks",
    category: "review",
    temperature: 0.4,
    placeholder: "Collez les commentaires des relecteurs et le texte concerné...",
    systemPrompt: "",
  },
  {
    id: "freeform",
    label: "Génération libre IA",
    description: "Générez du contenu librement selon vos besoins",
    icon: "Sparkles",
    category: "generation",
    temperature: 0.6,
    placeholder: "Décrivez ce que vous souhaitez générer...",
    systemPrompt: "",
  },
  {
    id: "improvement",
    label: "Amélioration et recommandations",
    description: "Obtenez des recommandations personnalisées pour progresser",
    icon: "TrendingUp",
    category: "generation",
    temperature: 0.6,
    placeholder: "Décrivez votre situation et vos besoins d'amélioration...",
    systemPrompt: "",
  },
  {
    id: "revue-litterature",
    label: "Revue de littérature (SLR)",
    description: "Assistance à la revue systématique de la littérature",
    icon: "BookOpen",
    category: "analysis",
    temperature: 0.5,
    placeholder: "Décrivez votre question de recherche ou vos besoins d'analyse...",
    systemPrompt: "",
  },
  {
    id: "auto-edition-8c",
    label: "Auto-édition 8C",
    description: "Évalue un texte selon les 8 critères Gastel & Day (Conformité, Exhaustivité, Composition, Exactitude, Clarté, Cohérence, Concision, Courtoisie)",
    icon: "ClipboardCheck",
    category: "review",
    temperature: 0.3,
    placeholder: "Collez le texte académique à évaluer selon les 8 critères…",
    systemPrompt: "",
  },
  {
    id: "expliquer-concept",
    label: "Expliquer un concept",
    description: "Expliquez un concept complexe avec analogie, exemple concret et version technique",
    icon: "GraduationCap",
    category: "generation",
    temperature: 0.5,
    placeholder: "Quel concept souhaitez-vous comprendre ? (ex. : échantillonnage par quotas, analyse factorielle, validité externe…)",
    systemPrompt: "",
  },
  {
    id: "verification-sources",
    label: "Vérification de sources",
    description: "Évaluez la qualité et la fiabilité de vos sources (expertise, méthodologie, conflits d'intérêts)",
    icon: "ShieldCheck",
    category: "review",
    temperature: 0.3,
    placeholder: "Collez les sources (auteurs, titres, extraits) à évaluer, avec les affirmations qu'elles sont censées soutenir…",
    systemPrompt: "",
  },
  {
    id: "argumentation-bilaterale",
    label: "Argumentation bilatérale",
    description: "Analysez une affirmation en construisant le meilleur argument contre, puis comparez les deux côtés",
    icon: "Scale",
    category: "analysis",
    temperature: 0.4,
    placeholder: "Collez l'affirmation à analyser et, si possible, le contexte ou les sources…",
    systemPrompt: "",
  },
  {
    id: "deep-research",
    label: "Recherche approfondie",
    description: "Recherche web multi-sources avec rapport structuré et citations (inspiré de Open Deep Research)",
    icon: "Globe",
    category: "research",
    temperature: 0.5,
    placeholder: "Formulez votre question de recherche (ex. : impact de l'IA sur l'enseignement supérieur en France)…",
    systemPrompt: "",
    customEndpoint: "/api/deep-research",
  },
];
