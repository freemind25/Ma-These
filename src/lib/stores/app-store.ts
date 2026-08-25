import { create } from "zustand";
import { persist } from "zustand/middleware";

// ═══════════════════════════════════════
// ThesisFrame — Application Store (Zustand)
// ═══════════════════════════════════════

export type ViewId =
  | "dashboard"
  | "editor"
  | "cadrage"
  | "ai-writing"
  | "methodology"
  | "articles"
  | "references"
  | "thesis-plan"
  | "ai-tools"
  | "academic-db"
  | "journaux-oa"
  | "recherche-plein-texte"
  | "auto-edition"
  | "feuille-route-agile"
  | "deblocage-ecriture"
  | "outils-slr"
  | "analyse-champ-recherche"
  | "apa-composer"
  | "verification-methodo"
  | "boite-doctorale"
  | "routesme"
  | "livres-competences"
  | "onglet-recherche"
  | "grammaire"
  | "export-pdf"
  | "equilibre-chapitres"
  | "diagrammes"
  | "harper"
  | "thesis-rag"
  | "verification-carto"
  | "paper2code"
  | "export-docx"
  | "alignement-preuves"
  | "phrasebook"
  | "theses-en-ligne";

export interface NavigationItem {
  id: ViewId;
  label: string;
  icon: string;
  description: string;
  badge?: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: "LayoutDashboard",
    description: "Vue d'ensemble de votre thèse",
  },
  {
    id: "editor",
    label: "Éditeur de thèse",
    icon: "FileText",
    description: "Rédigez et structurez vos chapitres",
  },
  {
    id: "cadrage",
    label: "Cadrage de thèse",
    icon: "ClipboardList",
    description: "Cadrage préalable du projet de recherche",
  },
  {
    id: "ai-writing",
    label: "Assistant IA",
    icon: "Sparkles",
    description: "Modes d'écriture assistée par IA",
    badge: "IA",
  },
  {
    id: "thesis-rag",
    label: "Mon IA de thèse",
    icon: "Brain",
    description: "Interrogez votre thèse avec l'IA contextuelle",
    badge: "RAG",
  },
  {
    id: "methodology",
    label: "Méthodologie",
    icon: "FlaskConical",
    description: "Guides et outils méthodologiques",
  },
  {
    id: "articles",
    label: "Articles scientifiques",
    icon: "Newspaper",
    description: "Rédaction et publication d'articles",
  },
  {
    id: "references",
    label: "Références",
    icon: "BookOpen",
    description: "Gestion bibliographique et export BibTeX",
  },
  {
    id: "thesis-plan",
    label: "Plan de thèse",
    icon: "ListTree",
    description: "Structure et template LaTeX",
  },
  {
    id: "ai-tools",
    label: "Outils IA",
    icon: "Wrench",
    description: "Notebook, consensus, visualisation",
    badge: "IA",
  },
  {
    id: "academic-db",
    label: "Bases de données",
    icon: "Globe",
    description: "Ressources académiques en ligne",
  },
  {
    id: "journaux-oa",
    label: "Journaux OA",
    icon: "Library",
    description: "Recherche OpenAlex + DOAJ, export CSV",
    badge: "OA",
  },
  {
    id: "recherche-plein-texte",
    label: "Recherche plein texte",
    icon: "Search",
    description: "Recherche full-texte dans vos chapitres",
  },
  {
    id: "auto-edition",
    label: "Auto-édition 8C",
    icon: "ClipboardCheck",
    description: "Auto-évaluation : 8 critères de qualité",
    badge: "IA",
  },
  {
    id: "feuille-route-agile",
    label: "Feuille de Route Agile",
    icon: "Route",
    description: "Kanban, sprints et suivi de progression",
  },
  {
    id: "deblocage-ecriture",
    label: "Déblocage écriture",
    icon: "Unlock",
    description: "Exercices, Pomodoro et stratégies anti-blocage",
  },
  {
    id: "outils-slr",
    label: "Outils SLR",
    icon: "GitBranch",
    description: "Revue systématique : PRISMA, criblage, extraction",
  },
  {
    id: "analyse-champ-recherche",
    label: "Analyse du champ",
    icon: "Compass",
    description: "Cartographie IA du champ de recherche et positionnement",
    badge: "IA",
  },
  {
    id: "apa-composer",
    label: "APA Composer",
    icon: "FileCheck",
    description: "Mise en forme APA 7e édition",
  },
  {
    id: "verification-methodo",
    label: "Vérification méthodologique",
    icon: "ShieldCheck",
    description: "Audit et cohérence méthodologique",
    badge: "IA",
  },
  {
    id: "boite-doctorale",
    label: "Boîte doctorale",
    icon: "Briefcase",
    description: "Checklist, calendrier, documents et suivi doctoral",
  },
  {
    id: "routesme",
    label: "RoutesMe",
    icon: "GitCompareArrows",
    description: "Comparaison multi-modèles IA",
    badge: "IA",
  },
  {
    id: "livres-competences",
    label: "Livres-compétences",
    icon: "BookOpen",
    description: "Suivi et développement des compétences doctorales",
  },
  {
    id: "onglet-recherche",
    label: "Onglet Recherche",
    icon: "PanelLeftOpen",
    description: "Navigation par onglets pour organiser vos recherches",
  },
  {
    id: "grammaire",
    label: "Grammaire",
    icon: "SpellCheck",
    description: "Correcteur grammatical IA pour l'écriture académique",
    badge: "IA",
  },
  {
    id: "export-pdf",
    label: "Export PDF",
    icon: "FileDown",
    description: "Exportez votre thèse en PDF avec mise en forme",
  },
  {
    id: "equilibre-chapitres",
    label: "Équilibre chapitres",
    icon: "Scale",
    description: "Analysez la répartition de vos chapitres et équilibrez votre thèse",
    badge: "IA",
  },
  {
    id: "diagrammes",
    label: "Diagrammes",
    icon: "GitFork",
    description: "Diagrammes visuels : organigramme, chronologie, flux",
  },
  {
    id: "harper",
    label: "Harper",
    icon: "Type",
    description: "Résumeur, paraphraseur et extracteur IA",
    badge: "IA",
  },
  {
    id: "verification-carto",
    label: "Vérification cartographique",
    icon: "MapPin",
    description: "Complétude cartographique et questionneur socratique IA",
    badge: "IA",
  },
  {
    id: "paper2code",
    label: "Article → Code",
    icon: "FileCode2",
    description: "Transformez un article scientifique en code Python reproductible",
    badge: "IA",
  },
  {
    id: "export-docx",
    label: "Export DOCX",
    icon: "FileDown",
    description: "Document Word formaté avec styles APA et table des matières",
  },
  {
    id: "alignement-preuves",
    label: "Alignement Preuves",
    icon: "GitCompareArrows",
    description: "Vérifiez la cohérence citations/références par chapitre",
    badge: "IA",
  },
  {
    id: "phrasebook",
    label: "Phrasier Académique",
    icon: "BookOpenText",
    description: "Phrases prêtes à l'emploi pour chaque section de votre thèse",
  },
  {
    id: "theses-en-ligne",
    label: "Thèses en ligne",
    icon: "GraduationCap",
    description: "Explorez les thèses de doctorat via HAL et d'autres sources",
  },
];

interface AppState {
  // Navigation
  currentView: ViewId;
  sidebarOpen: boolean;
  setCurrentView: (view: ViewId) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  theme: "light" | "dark" | "system";

  // Editor state (lightweight, full state in DB)
  activeThesisId: string | null;
  activeChapterId: string | null;
  setActiveThesisId: (id: string | null) => void;
  setActiveChapterId: (id: string | null) => void;

  // AI Provider
  aiProvider: string;
  setAiProvider: (provider: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: "dashboard",
      sidebarOpen: true,
      setCurrentView: (view) => set({ currentView: view }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      theme: "system",

      activeThesisId: null,
      activeChapterId: null,
      setActiveThesisId: (id) => set({ activeThesisId: id }),
      setActiveChapterId: (id) => set({ activeChapterId: id }),

      aiProvider: "zai",
      setAiProvider: (provider) => set({ aiProvider: provider }),
    }),
    {
      name: "thesisframe-app-store",
      partialize: (state) => ({
        theme: state.theme,
        aiProvider: state.aiProvider,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
