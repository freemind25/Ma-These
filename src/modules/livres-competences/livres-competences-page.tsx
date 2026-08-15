"use client";

import { useState, useMemo, useCallback, type ComponentType } from "react";
import {
  BookOpen,
  PenTool,
  FlaskConical,
  BarChart3,
  Mic,
  ScanSearch,
  Scale,
  FolderKanban,
  MonitorSmartphone,
  Star,
  TrendingUp,
  Lightbulb,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Target,
  GraduationCap,
  CalendarDays,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAiConfig } from "@/hooks/use-ai-config";

// Types

type ProficiencyLevel = "Débutant" | "Intermédiaire" | "Avancé" | "Expert";

const PROFICIENCY_VALUES: Record<ProficiencyLevel, number> = {
  Débutant: 25,
  Intermédiaire: 50,
  Avancé: 75,
  Expert: 100,
};

const PROFICIENCY_COLORS: Record<ProficiencyLevel, string> = {
  Débutant: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Intermédiaire: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  Avancé: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  Expert: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

interface Skill {
  id: string;
  label: string;
  description: string;
  resources: Resource[];
}

interface Resource {
  title: string;
  author: string;
  link: string;
}

interface CompetencyCategory {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  skills: Skill[];
}

interface AssessmentRecord {
  date: string;
  skills: Record<string, ProficiencyLevel>;
  overallScore: number;
}

// Data - 8 Doctoral Competency Categories

const COMPETENCY_CATEGORIES: CompetencyCategory[] = [
  {
    id: "redaction-academique",
    label: "Rédaction académique",
    icon: PenTool,
    color: "text-rose-600 dark:text-rose-400",
    skills: [
      {
        id: "structure-texte",
        label: "Structure d\'un texte académique",
        description: "Organiser introduction, développement, conclusion selon les normes",
        resources: [
          { title: "Comment écrire une thèse", author: "Howard S. Becker", link: "https://www.decitre.fr/" },
          { title: "Writing Your Journal Article in 12 Weeks", author: "Wendy Laura Belcher", link: "https://www.sagepub.com/" },
        ],
      },
      {
        id: "style-academique",
        label: "Style académique et registre de langue",
        description: "Maîtriser le ton formel, la voix passive, les tournures impersonnelles",
        resources: [
          { title: "Le savoir et la revendication de l\'identité", author: "Bourdieu", link: "https://www.lespressesdeluniversite.com/" },
          { title: "Academic Writing for Graduate Students", author: "Swales & Feak", link: "https://www.press.umich.edu/" },
        ],
      },
      {
        id: "argumentation",
        label: "Argumentation et cohérence logique",
        description: "Construire des arguments solides et enchaîner les idées logiquement",
        resources: [
          { title: "The Art of Argumentation and Debate", author: "Frans van Eemeren", link: "https://www.cambridge.org/" },
          { title: "La dissertation philosophique", author: "Claudine Tiercelin", link: "https://www.puf.com/" },
        ],
      },
      {
        id: "relecture-revision",
        label: "Révision et réécriture",
        description: "Relire, corriger et améliorer ses textes de manière itérative",
        resources: [
          { title: "Revising Prose", author: "Richard Lanham", link: "https://www.pearson.com/" },
          { title: "The Sense of Style", author: "Steven Pinker", link: "https://www.penguinrandomhouse.com/" },
        ],
      },
      {
        id: "citations-references",
        label: "Intégration de citations et références",
        description: "Citer correctement et intégrer les sources dans le texte",
        resources: [
          { title: "Manuel de rédaction APA", author: "APA (7e édition)", link: "https://apastyle.apa.org/" },
          { title: "The Craft of Research", author: "Wayne C. Booth", link: "https://www.press.uchicago.edu/" },
        ],
      },
    ],
  },
  {
    id: "methodologie-recherche",
    label: "Méthodologie de recherche",
    icon: FlaskConical,
    color: "text-amber-600 dark:text-amber-400",
    skills: [
      {
        id: "conception-projet",
        label: "Conception de projet de recherche",
        description: "Formuler une question de recherche et définir les objectifs",
        resources: [
          { title: "Research Design", author: "John Creswell", link: "https://www.sagepub.com/" },
          { title: "Construire un projet de recherche", author: "Quivy & Van Campenhoudt", link: "https://www.dunod.com/" },
        ],
      },
      {
        id: "choix-methode",
        label: "Choix et justification des méthodes",
        description: "Sélectionner les méthodes qualitatives, quantitatives ou mixtes adaptées",
        resources: [
          { title: "Qualitative Research Practice", author: "Ritchie & Lewis", link: "https://www.sagepub.com/" },
          { title: "Mixed Methods Research", author: "Creswell & Plano Clark", link: "https://www.sagepub.com/" },
        ],
      },
      {
        id: "echantillonnage",
        label: "Échantillonnage et collecte de données",
        description: "Définir la stratégie d\'échantillonnage et les protocoles de collecte",
        resources: [
          { title: "Sampling Design and Analysis", author: "Sharon Lohr", link: "https://www.crcpress.com/" },
          { title: "Enquête et méthodes", author: "Grawitz", link: "https://www.dalloz.fr/" },
        ],
      },
      {
        id: "validite-fiabilite",
        label: "Validité et fiabilité",
        description: "Évaluer la rigueur scientifique et la reproductibilité des résultats",
        resources: [
          { title: "Validity and Validation", author: "Samuel Messick", link: "https://www.springer.com/" },
          { title: "Educational Research", author: "Creswell & Creswell", link: "https://www.pearson.com/" },
        ],
      },
    ],
  },
  {
    id: "analyse-donnees",
    label: "Analyse de données",
    icon: BarChart3,
    color: "text-emerald-600 dark:text-emerald-400",
    skills: [
      {
        id: "statistiques-descriptives",
        label: "Statistiques descriptives",
        description: "Résumer et visualiser les données de manière pertinente",
        resources: [
          { title: "Discovering Statistics Using R", author: "Andy Field", link: "https://www.sagepub.com/" },
          { title: "Statistiques pour les nuls", author: "Déborah Rumsey", link: "https://www.first-interactive.com/" },
        ],
      },
      {
        id: "statistiques-inferentielles",
        label: "Statistiques inférentielles",
        description: "Tests d\'hypothèses, intervalles de confiance et p-values",
        resources: [
          { title: "All of Statistics", author: "Larry Wasserman", link: "https://www.springer.com/" },
          { title: "OpenIntro Statistics", author: "Diez et al.", link: "https://www.openintro.org/" },
        ],
      },
      {
        id: "analyse-qualitative",
        label: "Analyse qualitative",
        description: "Codage, catégorisation et analyse thématique de données textuelles",
        resources: [
          { title: "Qualitative Data Analysis", author: "Matthew Miles", link: "https://www.sagepub.com/" },
          { title: "Doing Thematic Analysis", author: "Braun & Clarke", link: "https://www.sagepub.com/" },
        ],
      },
      {
        id: "visualisation-donnees",
        label: "Visualisation de données",
        description: "Créer des graphiques clairs et impactants pour communiquer les résultats",
        resources: [
          { title: "Storytelling with Data", author: "Cole Nussbaumer Knaflic", link: "https://www.storytellingwithdata.com/" },
          { title: "The Visual Display of Quantitative Information", author: "Edward Tufte", link: "https://www.edwardtufte.com/" },
        ],
      },
      {
        id: "logiciels-analyse",
        label: "Maîtrise des logiciels d\'analyse",
        description: "Utiliser R, Python, SPSS, NVivo ou équivalents pour l\'analyse",
        resources: [
          { title: "R for Data Science", author: "Wickham & Grolemund", link: "https://r4ds.had.co.nz/" },
          { title: "Python for Data Analysis", author: "Wes McKinney", link: "https://www.oreilly.com/" },
        ],
      },
    ],
  },
  {
    id: "communication-scientifique",
    label: "Communication scientifique",
    icon: Mic,
    color: "text-orange-600 dark:text-orange-400",
    skills: [
      {
        id: "presentation-orale",
        label: "Présentation orale",
        description: "Structurer et délivrer une présentation scientifique efficace",
        resources: [
          { title: "Talk Like TED", author: "Carmine Gallo", link: "https://www.stmartins.com/" },
          { title: "Le pouvoir des présentations", author: "Nancy Duarte", link: "https://www.duarte.com/" },
        ],
      },
      {
        id: "poster-scientifique",
        label: "Poster scientifique",
        description: "Concevoir un poster clair et attractif pour les conférences",
        resources: [
          { title: "Designing Conference Posters", author: "Colin Purrington", link: "https://colinpurrington.com/tips/poster-design/" },
          { title: "Scientific Posters", author: "Erren & Bourne", link: "https://www.plos.org/" },
        ],
      },
      {
        id: "publication-article",
        label: "Processus de publication",
        description: "Comprendre le cycle peer-review et répondre aux évaluateurs",
        resources: [
          { title: "Writing for Peer Reviewed Journals", author: "Thomson & Kamler", link: "https://www.routledge.com/" },
          { title: "Getting Published", author: "Jerry Wellington", link: "https://www.routledge.com/" },
        ],
      },
      {
        id: "networking",
        label: "Réseautage académique",
        description: "Construire et entretenir un réseau professionnel de chercheurs",
        resources: [
          { title: "Networking for Nerds", author: "Alaina G. Levine", link: "https://www.wiley.com/" },
          { title: "The PhD Journey", author: "Hoyer & Wenneberg", link: "https://www.springer.com/" },
        ],
      },
    ],
  },
  {
    id: "veille-bibliographique",
    label: "Veille bibliographique",
    icon: ScanSearch,
    color: "text-teal-600 dark:text-teal-400",
    skills: [
      {
        id: "strategie-recherche",
        label: "Stratégie de recherche documentaire",
        description: "Formuler des requêtes efficaces et utiliser les opérateurs booléens",
        resources: [
          { title: "Systematic Approaches to Literature Review", author: "Okoli", link: "https://aisel.aisnet.org/" },
          { title: "Doing a Literature Review", author: "Chris Hart", link: "https://www.sagepub.com/" },
        ],
      },
      {
        id: "bases-donnees",
        label: "Maîtrise des bases de données académiques",
        description: "Utiliser efficacement Google Scholar, Scopus, Web of Science, PubMed",
        resources: [
          { title: "Guide de recherche documentaire", author: "INIST-CNRS", link: "https://www.inist.fr/" },
          { title: "Information Literacy", author: "Sara Baron", link: "https://www.elsevier.com/" },
        ],
      },
      {
        id: "gestion-refs",
        label: "Gestion des références bibliographiques",
        description: "Utiliser Zotero, Mendeley ou EndNote pour organiser sa bibliographie",
        resources: [
          { title: "Zotero Documentation", author: "Zotero Team", link: "https://www.zotero.org/support/" },
          { title: "Using Bibliographic Software", author: "Nolan", link: "https://www.oxfordhandbooks.com/" },
        ],
      },
      {
        id: "synthese-litterature",
        label: "Synthèse et analyse de la littérature",
        description: "Synthétiser les résultats de multiples sources de manière critique",
        resources: [
          { title: "Synthesizing Research", author: "Harris Cooper", link: "https://www.sagepub.com/" },
          { title: "The Literature Review", author: "Lawrence Machi", link: "https://www.corwin.com/" },
        ],
      },
    ],
  },
  {
    id: "ethique-recherche",
    label: "Éthique de la recherche",
    icon: Scale,
    color: "text-slate-600 dark:text-slate-400",
    skills: [
      {
        id: "consentement",
        label: "Consentement éclairé",
        description: "Obtenir et documenter le consentement des participants de manière éthique",
        resources: [
          { title: "Ethics in Research", author: "Oliver, Paul & Walmsley", link: "https://www.bloomsbury.com/" },
          { title: "Comité d\'éthique — Guide du chercheur", author: "CNRS", link: "https://www.cnrs.fr/" },
        ],
      },
      {
        id: "integrite-scientifique",
        label: "Intégrité scientifique",
        description: "Comprendre plagiat, falsification, fabrication et bonnes pratiques",
        resources: [
          { title: "On Being a Scientist", author: "NAS/NAE/IOM", link: "https://www.nap.edu/" },
          { title: "Intégrité scientifique", author: "COMETS-CNRS", link: "https://www.cnrs.fr/" },
        ],
      },
      {
        id: "protection-donnees",
        label: "Protection des données (RGPD)",
        description: "Conformité au RGPD et gestion sécurisée des données de recherche",
        resources: [
          { title: "Le RGPD pour les chercheurs", author: "CNIL", link: "https://www.cnil.fr/" },
          { title: "Data Protection in Research", author: "Büchi et al.", link: "https://www.springer.com/" },
        ],
      },
      {
        id: "declaration-conflits",
        label: "Déclaration de conflits d\'intérêts",
        description: "Identifier et déclarer tout conflit d\'intérêts potentiel",
        resources: [
          { title: "Conflict of Interest in Research", author: "COPE", link: "https://publicationethics.org/" },
          { title: "Responsible Conduct of Research", author: "Macrina", link: "https://www.asmscience.org/" },
        ],
      },
    ],
  },
  {
    id: "gestion-projet",
    label: "Gestion de projet",
    icon: FolderKanban,
    color: "text-violet-600 dark:text-violet-400",
    skills: [
      {
        id: "planification-temporelle",
        label: "Planification et gestion du temps",
        description: "Définir un calendrier réaliste et respecter les échéances",
        resources: [
          { title: "The 7 Habits of Highly Effective People", author: "Stephen Covey", link: "https://www.simonschuster.com/" },
          { title: "GTD — Getting Things Done", author: "David Allen", link: "https://gtd.davidco.com/" },
        ],
      },
      {
        id: "gestion-budget",
        label: "Gestion budgétaire d\'un projet",
        description: "Budgetiser, suivre les dépenses et justifier les financements",
        resources: [
          { title: "Project Management for Research", author: "Adedeji Badiru", link: "https://www.crcpress.com/" },
          { title: "Grant Writing Handbook", author: "Ries & Leukefeld", link: "https://www.springer.com/" },
        ],
      },
      {
        id: "collaboration",
        label: "Travail collaboratif et interdisciplinarité",
        description: "Collaborer efficacement avec des chercheurs d\'autres disciplines",
        resources: [
          { title: "Team Science", author: "National Research Council", link: "https://www.nap.edu/" },
          { title: "Collaborative Research", author: "Bammer", link: "https://www.anu.edu.au/" },
        ],
      },
      {
        id: "risques-contingences",
        label: "Gestion des risques et plans de contingence",
        description: "Anticiper et gérer les obstacles dans un projet doctoral",
        resources: [
          { title: "Risk Management for Research", author: "Kumar", link: "https://www.elsevier.com/" },
          { title: "The Project Management Tool Kit", author: "Tomasz Kowalczyk", link: "https://www.wiley.com/" },
        ],
      },
    ],
  },
  {
    id: "technologies-numeriques",
    label: "Technologies numériques",
    icon: MonitorSmartphone,
    color: "text-cyan-600 dark:text-cyan-400",
    skills: [
      {
        id: "outils-bureautique-avances",
        label: "Outils bureautiques avancés",
        description: "Maîtriser LaTeX, Word avancé, tableur pour la recherche",
        resources: [
          { title: "LaTeX pour tous", author: "Vincent Lozano", link: "https://framabook.org/" },
          { title: "The LaTeX Companion", author: "Mittelbach & Goossens", link: "https://www.pearson.com/" },
        ],
      },
      {
        id: "outils-ia-recherche",
        label: "Outils IA pour la recherche",
        description: "Utiliser l\'IA générative, les LLM et les outils IA de manière éthique",
        resources: [
          { title: "AI for Academics", author: "Mollick & Mollick", link: "https://www.oreilly.com/" },
          { title: "Generative AI for Researchers", author: "RTE France", link: "https://hal.science/" },
        ],
      },
      {
        id: "gestion-version",
        label: "Gestion de versions (Git)",
        description: "Utiliser Git et GitHub pour versionner ses documents et codes",
        resources: [
          { title: "Pro Git", author: "Scott Chacon", link: "https://git-scm.com/book/fr/v2" },
          { title: "Happy Git with R", author: "Bryan et al.", link: "https://happygitwithr.com/" },
        ],
      },
      {
        id: "science-ouverte",
        label: "Science ouverte et accès libre",
        description: "Partager ses données, publications et codes selon les principes FAIR",
        resources: [
          { title: "Open Science", author: "Bartling & Friesike", link: "https://www.springer.com/" },
          { title: "The FAIR Data Principles", author: "GO FAIR", link: "https://www.go-fair.org/" },
        ],
      },
    ],
  },
];

// Helpers

function getCategoryScore(
  category: CompetencyCategory,
  skills: Record<string, ProficiencyLevel>
): number {
  const catSkills = category.skills;
  if (catSkills.length === 0) return 0;
  const total = catSkills.reduce(
    (sum, s) => sum + (PROFICIENCY_VALUES[skills[s.id] || "Débutant"] || 0),
    0
  );
  return Math.round(total / catSkills.length);
}

function getOverallScore(skills: Record<string, ProficiencyLevel>): number {
  const allSkills = COMPETENCY_CATEGORIES.flatMap((c) => c.skills);
  if (allSkills.length === 0) return 0;
  const total = allSkills.reduce(
    (sum, s) => sum + (PROFICIENCY_VALUES[skills[s.id] || "Débutant"] || 0),
    0
  );
  return Math.round(total / allSkills.length);
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Expert";
  if (score >= 70) return "Avancé";
  if (score >= 45) return "Intermédiaire";
  return "Débutant";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-purple-600 dark:text-purple-400";
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 45) return "text-sky-600 dark:text-sky-400";
  return "text-amber-600 dark:text-amber-400";
}

// Component

export function LivresCompetencesPage() {
  const { withAiConfig } = useAiConfig();
  const [currentSkills, setCurrentSkills] = useState<Record<string, ProficiencyLevel>>(
    () => {
      const allSkillIds = COMPETENCY_CATEGORIES.flatMap((c) => c.skills.map((s) => s.id));
      const initial: Record<string, ProficiencyLevel> = {};
      allSkillIds.forEach((id) => {
        initial[id] = "Débutant";
      });
      return initial;
    }
  );
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentRecord[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("evaluation");

  const overallScore = useMemo(() => getOverallScore(currentSkills), [currentSkills]);

  const categoryScores = useMemo(() => {
    return COMPETENCY_CATEGORIES.map((cat) => ({
      ...cat,
      score: getCategoryScore(cat, currentSkills),
    }));
  }, [currentSkills]);

  const weakestCategories = useMemo(
    () => [...categoryScores].sort((a, b) => a.score - b.score).slice(0, 3),
    [categoryScores]
  );

  const strongestCategories = useMemo(
    () => [...categoryScores].sort((a, b) => b.score - a.score).slice(0, 3),
    [categoryScores]
  );

  const handleSkillChange = useCallback((skillId: string, level: ProficiencyLevel) => {
    setCurrentSkills((prev) => ({ ...prev, [skillId]: level }));
  }, []);

  const handleSaveAssessment = useCallback(() => {
    const record: AssessmentRecord = {
      date: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      skills: { ...currentSkills },
      overallScore,
    };
    setAssessmentHistory((prev) => [record, ...prev].slice(0, 20));
  }, [currentSkills, overallScore]);

  const handleResetAll = useCallback(() => {
    const allSkillIds = COMPETENCY_CATEGORIES.flatMap((c) => c.skills.map((s) => s.id));
    const reset: Record<string, ProficiencyLevel> = {};
    allSkillIds.forEach((id) => {
      reset[id] = "Débutant";
    });
    setCurrentSkills(reset);
    setAiRecommendation("");
  }, []);

  const handleAiRecommendation = useCallback(async () => {
    setAiLoading(true);
    setAiRecommendation("");
    try {
      const skillsSummary = COMPETENCY_CATEGORIES.map((cat) => {
        const catScore = getCategoryScore(cat, currentSkills);
        const weakSkills = cat.skills
          .filter((s) => (PROFICIENCY_VALUES[currentSkills[s.id]] || 0) <= 25)
          .map((s) => s.label);
        return `Catégorie: ${cat.label} — Score: ${catScore}/100${weakSkills.length > 0 ? ` — Compétences faibles: ${weakSkills.join(", ")}` : ""}`;
      }).join("\n");

      const prompt = `Je suis doctorant et voici mon auto-évaluation de compétences doctorales (score global: ${overallScore}/100) :

${skillsSummary}

En te basant sur ces résultats, propose-moi un plan d\'apprentissage personnalisé et priorisé. Pour chaque compétence faible identifiée, suggère 2-3 ressources concrètes (livres, cours en ligne, exercices pratiques) avec une justification. Structure ta réponse avec des titres clairs et des priorités (P1, P2, P3). Réponds en français.`;

      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "improvement",
          prompt,
          context: "Auto-évaluation des compétences doctorales — Livres-compétences ThesisFrame",
        })),
      });

      const data = await res.json();
      if (data.data?.content) {
        setAiRecommendation(data.data.content);
      } else {
        setAiRecommendation("Impossible de générer les recommandations. Vérifiez la connexion au service IA.");
      }
    } catch {
      setAiRecommendation("Erreur lors de la communication avec le service IA. Veuillez réessayer.");
    } finally {
      setAiLoading(false);
    }
  }, [currentSkills, overallScore, withAiConfig]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
            <BookOpen className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Livres-compétences</h1>
            <p className="text-sm text-muted-foreground">
              Suivi et développement de vos compétences doctorales
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Score global de compétence</CardTitle>
                <CardDescription>
                  Basé sur votre auto-évaluation de {COMPETENCY_CATEGORIES.flatMap((c) => c.skills).length} compétences
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</p>
              <p className="text-sm text-muted-foreground">/ 100 — {getScoreLabel(overallScore)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={overallScore} className="h-3" />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categoryScores.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.id} className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 shrink-0 ${cat.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{cat.label}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={cat.score} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium tabular-nums w-8 text-right">{cat.score}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="evaluation" className="text-xs sm:text-sm">
            <Star className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Auto-evaluation
          </TabsTrigger>
          <TabsTrigger value="ressources" className="text-xs sm:text-sm">
            <GraduationCap className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Ressources
          </TabsTrigger>
          <TabsTrigger value="progression" className="text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Progression
          </TabsTrigger>
          <TabsTrigger value="ia" className="text-xs sm:text-sm">
            <Sparkles className="h-4 w-4 mr-1.5 hidden sm:inline" />
            IA
          </TabsTrigger>
        </TabsList>

        {/* TAB: Auto-evaluation */}
        <TabsContent value="evaluation" className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                Évaluez votre niveau pour chaque compétence doctorale
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleResetAll}>
                  <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                  Réinitialiser
                </Button>
                <Button size="sm" onClick={handleSaveAssessment}>
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                  Sauvegarder l\'évaluation
                </Button>
              </div>
            </div>

            <Accordion type="multiple" className="w-full">
              {COMPETENCY_CATEGORIES.map((category) => {
                const catScore = getCategoryScore(category, currentSkills);
                const Icon = category.icon;
                return (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <Icon className={`h-5 w-5 shrink-0 ${category.color}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold">{category.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {catScore}/100
                            </Badge>
                            <Badge className={`text-xs ${PROFICIENCY_COLORS[getScoreLabel(catScore) as ProficiencyLevel]}`}>
                              {getScoreLabel(catScore)}
                            </Badge>
                          </div>
                          <Progress value={catScore} className="h-1.5 mt-2 max-w-xs" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3 pt-2">
                        {category.skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{skill.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {skill.description}
                              </p>
                            </div>
                            <div className="sm:w-44 shrink-0">
                              <Select
                                value={currentSkills[skill.id] || "Débutant"}
                                onValueChange={(val) =>
                                  handleSkillChange(skill.id, val as ProficiencyLevel)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Débutant">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                                      Débutant
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="Intermédiaire">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                                      Intermédiaire
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="Avancé">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                      Avancé
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="Expert">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                                      Expert
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </TabsContent>

        {/* TAB: Ressources */}
        <TabsContent value="ressources" className="mt-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Livres et cours recommandés pour chaque compétence doctorale
            </p>

            <Accordion type="multiple" className="w-full">
              {COMPETENCY_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <AccordionItem key={category.id} value={category.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 shrink-0 ${category.color}`} />
                        <span className="font-semibold">{category.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {category.skills.length} compétences
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 pt-2">
                        {category.skills.map((skill) => (
                          <div key={skill.id} className="rounded-lg border p-4">
                            <p className="font-medium text-sm mb-1">{skill.label}</p>
                            <p className="text-xs text-muted-foreground mb-3">{skill.description}</p>
                            <div className="grid gap-2">
                              {skill.resources.map((res, i) => (
                                <a
                                  key={i}
                                  href={res.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors group"
                                >
                                  <BookOpen className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium group-hover:underline truncate">
                                      {res.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {res.author}
                                    </p>
                                  </div>
                                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-1" />
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </TabsContent>

        {/* TAB: Progression */}
        <TabsContent value="progression" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Strongest categories */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <CardTitle className="text-base">Domaines de force</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {strongestCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${cat.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cat.label}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={cat.score} className="h-2 flex-1" />
                            <span className="text-xs font-medium tabular-nums w-8 text-right">
                              {cat.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Weakest categories */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <CardTitle className="text-base">Axes d\'amélioration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {weakestCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${cat.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cat.label}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={cat.score} className="h-2 flex-1" />
                            <span className="text-xs font-medium tabular-nums w-8 text-right">
                              {cat.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detailed per-category breakdown */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Répartition détaillée</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryScores.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-4 w-4 ${cat.color}`} />
                          <span className="text-sm font-medium">{cat.label}</span>
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {cat.score}%
                          </Badge>
                        </div>
                        <div className="ml-6 space-y-1.5">
                          {cat.skills.map((skill) => {
                            const level = currentSkills[skill.id] || "Débutant";
                            const value = PROFICIENCY_VALUES[level];
                            return (
                              <div key={skill.id} className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground w-44 sm:w-64 truncate">
                                  {skill.label}
                                </p>
                                <Progress value={value} className="h-1.5 flex-1" />
                                <Badge
                                  variant="outline"
                                  className={`text-xs shrink-0 ${PROFICIENCY_COLORS[level]}`}
                                >
                                  {level}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Assessment History */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">Historique des évaluations</CardTitle>
                </div>
                <CardDescription>
                  {assessmentHistory.length === 0
                    ? "Sauvegardez votre première évaluation pour commencer le suivi"
                    : `${assessmentHistory.length} évaluation${assessmentHistory.length > 1 ? "s" : ""} enregistrée${assessmentHistory.length > 1 ? "s" : ""}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessmentHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucune évaluation sauvegardée</p>
                    <p className="text-xs mt-1">
                      Allez dans l\'onglet Auto-évaluation et cliquez sur "Sauvegarder l\'évaluation"
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {assessmentHistory.map((record, idx) => {
                      const prevScore =
                        idx < assessmentHistory.length - 1
                          ? assessmentHistory[idx + 1].overallScore
                          : null;
                      const diff = prevScore !== null ? record.overallScore - prevScore : null;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{record.date}</p>
                            <Progress value={record.overallScore} className="h-1.5 mt-1" />
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-lg font-bold ${getScoreColor(record.overallScore)}`}>
                              {record.overallScore}
                            </p>
                            {diff !== null && (
                              <p
                                className={`text-xs font-medium ${
                                  diff > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : diff < 0
                                      ? "text-rose-600 dark:text-rose-400"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {diff > 0 ? `+${diff}` : diff === 0 ? "=" : `${diff}`}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: IA */}
        <TabsContent value="ia" className="mt-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-base">Recommandations personnalisées par IA</CardTitle>
                </div>
                <CardDescription>
                  L\'IA analyse vos compétences actuelles et propose un plan d\'apprentissage
                  priorisé avec des ressources ciblées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50">
                  <Target className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Votre score actuel :{" "}
                    <span className={`font-semibold ${getScoreColor(overallScore)}`}>
                      {overallScore}/100
                    </span>{" "}
                    — {getScoreLabel(overallScore)}
                  </p>
                </div>

                {weakestCategories.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Lightbulb className="h-3.5 w-3.5" />
                      Catégories à renforcer détectées :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {weakestCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Badge key={cat.id} variant="outline" className="text-xs gap-1.5">
                            <Icon className={`h-3 w-3 ${cat.color}`} />
                            {cat.label} ({cat.score}%)
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAiRecommendation}
                  disabled={aiLoading}
                  className="w-full sm:w-auto"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer mes recommandations IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {aiRecommendation && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <CardTitle className="text-base">Votre plan d\'apprentissage personnalisé</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {aiRecommendation.split("\n").map((line, i) => {
                      if (!line.trim()) return <br key={i} />;
                      if (line.startsWith("# ")) {
                        return (
                          <h3 key={i} className="text-lg font-bold mt-4 mb-2">
                            {line.replace("# ", "")}
                          </h3>
                        );
                      }
                      if (line.startsWith("## ")) {
                        return (
                          <h4 key={i} className="text-base font-semibold mt-3 mb-1.5">
                            {line.replace("## ", "")}
                          </h4>
                        );
                      }
                      if (line.startsWith("### ")) {
                        return (
                          <h5 key={i} className="text-sm font-semibold mt-2 mb-1">
                            {line.replace("### ", "")}
                          </h5>
                        );
                      }
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        return (
                          <div key={i} className="flex items-start gap-2 ml-2 mb-1">
                            <ChevronRight className="h-3.5 w-3.5 mt-1 shrink-0 text-amber-500" />
                            <span className="text-sm">{line.replace(/^[-*]\s+/, "")}</span>
                          </div>
                        );
                      }
                      if (line.match(/^\d+\.\s/)) {
                        return (
                          <div key={i} className="flex items-start gap-2 ml-2 mb-1">
                            <span className="text-sm font-semibold mt-0.5 shrink-0">
                              {line.match(/^(\d+)\./)?.[1]}.
                            </span>
                            <span className="text-sm">{line.replace(/^\d+\.\s+/, "")}</span>
                          </div>
                        );
                      }
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <p key={i} className="font-semibold text-sm mt-2">
                            {line.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      return (
                        <p key={i} className="text-sm mb-1">
                          {line.replace(/\*\*(.+?)\*\*/g, "$1")}
                        </p>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
