import { create } from "zustand";
import { persist } from "zustand/middleware";

// ═══════════════════════════════════════
// ThesisFrame — Application Store (Zustand)
// ═══════════════════════════════════════

export type ViewId =
  | "dashboard"
  | "editor"
  | "ai-writing"
  | "methodology"
  | "articles"
  | "references"
  | "thesis-plan"
  | "ai-tools"
  | "academic-db"
  | "cadrage"
  | "cadrage-config"
  | "mendeley"
  | "export-pdf"
  | "cloud-drive"
  | "license"
  | "verification"
  | "recherche"
  | "literature-search"
  | "journal-finder"
  | "grammar-checker"
  | "harper-checker"
  | "chapter-balance"
  | "thesis-search"
  | "agile-roadmap"
  | "automation"
  | "writing-unblock"
  | "resources"
  | "book-skills"
  | "research-resources"
  | "field-analysis"
  | "apa-composer"
  | "slr-protocol"
  | "doctoral-toolkit"
  | "box-drive"
  | "routesme"
  | "auth-providers"
  | "usage-guide"
  | "office-export"
  | "ithy-research"
  | "auto-edition"
  | "knowledge-base"
  | "research-memory"
  | "resource-gallery"
  | "scientific-analysis";

export interface NavigationItem {
  id: ViewId;
  label: string;
  icon: string;
  description: string;
  badge?: string;
  category?: string;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // ── PRINCIPAL ──
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: "LayoutDashboard",
    description: "Vue d'ensemble de votre thèse",
    category: "principal",
  },
  {
    id: "editor",
    label: "Éditeur de thèse",
    icon: "FileText",
    description: "Rédigez et structurez vos chapitres",
    category: "principal",
  },
  {
    id: "cadrage",
    label: "Cadrage projet",
    icon: "Compass",
    description: "Cadrage préalable assisté par IA",
    category: "principal",
  },
  {
    id: "ai-writing",
    label: "Assistant IA",
    icon: "Sparkles",
    description: "10 modes d'écriture assistée par IA",
    badge: "IA",
    category: "principal",
  },
  {
    id: "directeur-chat",
    label: "Directeur IA",
    icon: "GraduationCap",
    description: "Dialogue avec un directeur de thèse virtuel",
    badge: "IA",
    category: "principal",
  } as NavigationItem & { id: "directeur-chat" },
  // ── RECHERCHE ──
  {
    id: "references",
    label: "Références",
    icon: "BookOpen",
    description: "Gestion bibliographique et export BibTeX",
    category: "recherche",
  },
  {
    id: "mendeley",
    label: "Mendeley",
    icon: "Library",
    description: "Synchronisation avec Mendeley",
    category: "recherche",
  },
  {
    id: "academic-db",
    label: "Bases de données",
    icon: "Globe",
    description: "Z-Library, Anna's Archive, LibGen...",
    category: "recherche",
  },
  {
    id: "literature-search",
    label: "Recherche littérature",
    icon: "Search",
    description: "Recherche agrégée dans les bases académiques",
    category: "recherche",
  },
  {
    id: "recherche",
    label: "Onglet Recherche",
    icon: "BookMarked",
    description: "Fiches de lecture, corpus, veille",
    category: "recherche",
  },
  // ── RÉDACTION ──
  {
    id: "methodology",
    label: "Méthodologie",
    icon: "FlaskConical",
    description: "Guides et outils méthodologiques",
    category: "redaction",
  },
  {
    id: "articles",
    label: "Articles scientifiques",
    icon: "Newspaper",
    description: "Rédaction et publication d'articles",
    category: "redaction",
  },
  {
    id: "thesis-plan",
    label: "Plan de thèse",
    icon: "ListTree",
    description: "Structure et template LaTeX",
    category: "redaction",
  },
  {
    id: "chapter-balance",
    label: "Équilibre chapitres",
    icon: "Scale",
    description: "Analyse du poids de chaque chapitre",
    category: "redaction",
  },
  {
    id: "grammar-checker",
    label: "Correcteur grammatical",
    icon: "SpellCheck",
    description: "Vérification linguistique et stylistique",
    category: "redaction",
  },
  {
    id: "harper-checker",
    label: "Harper (style)",
    icon: "ShieldCheck",
    description: "Vérification du style académique",
    category: "redaction",
  },
  // ── IA & OUTILS ──
  {
    id: "ai-tools",
    label: "Outils IA",
    icon: "Wrench",
    description: "Notebook, consensus, visualisation",
    badge: "IA",
    category: "ia",
  },
  {
    id: "thesis-search",
    label: "Recherche thèse",
    icon: "PenTool",
    description: "Recherche dans vos documents de thèse",
    category: "ia",
  },
  {
    id: "ithy-research",
    label: "Recherche Agrégée",
    icon: "Brain",
    description: "Recherche multi-sources agrégée par IA",
    badge: "IA",
    category: "ia",
  },
  {
    id: "automation",
    label: "Automatisation IA",
    icon: "Zap",
    description: "Pipelines d'automatisation par agents IA",
    category: "ia",
  },
  {
    id: "writing-unblock",
    label: "Déblocage écriture",
    icon: "PencilRuler",
    description: "Surmonter le syndrome de la page blanche",
    category: "ia",
  },
  // ── EXPORT & SAUVEGARDE ──
  {
    id: "export-pdf",
    label: "Export PDF",
    icon: "Download",
    description: "Génération de PDF de votre thèse",
    category: "export",
  },
  {
    id: "office-export",
    label: "Export Word/PPT",
    icon: "FileSpreadsheet",
    description: "Export vers Word, PowerPoint, Excel",
    category: "export",
  },
  {
    id: "cloud-drive",
    label: "Sauvegarde cloud",
    icon: "Cloud",
    description: "Google Drive, OneDrive, Dropbox",
    category: "export",
  },
  {
    id: "box-drive",
    label: "Box Cloud",
    icon: "Box",
    description: "Intégration Box Drive",
    category: "export",
  },
  // ── ANALYSE ──
  {
    id: "verification",
    label: "Vérif. méthodologique",
    icon: "ClipboardCheck",
    description: "Vérification de la rigueur méthodologique",
    category: "analyse",
  },
  {
    id: "field-analysis",
    label: "Analyse champ rech.",
    icon: "ClipboardList",
    description: "Analyse du champ de recherche",
    category: "analyse",
  },
  {
    id: "apa-composer",
    label: "APA Results Composer",
    icon: "BarChart3",
    description: "Composition de résultats statistiques APA",
    category: "analyse",
  },
  {
    id: "slr-protocol",
    label: "Outils SLR",
    icon: "ListChecks",
    description: "Protocol Systematic Literature Review",
    category: "analyse",
  },
  {
    id: "journal-finder",
    label: "Trouveur de journaux",
    icon: "Newspaper",
    description: "Trouver des journaux en Open Access",
    category: "analyse",
  },
  // ── RESSOURCES ──
  {
    id: "resources",
    label: "Guide rédaction",
    icon: "BookOpen",
    description: "Guides et ressources de rédaction",
    category: "ressources",
  },
  {
    id: "research-resources",
    label: "Ressources recherche",
    icon: "FolderTree",
    description: "Outils et bases de données de recherche",
    category: "ressources",
  },
  {
    id: "book-skills",
    label: "Livres-compétences",
    icon: "BookCheck",
    description: "Base de connaissances extraite de livres",
    category: "ressources",
  },
  {
    id: "doctoral-toolkit",
    label: "Boîte doctorale",
    icon: "BookOpen",
    description: "Boîte à outils du doctorant",
    category: "ressources",
  },
  // ── ADMIN ──
  {
    id: "agile-roadmap",
    label: "Route Agile",
    icon: "Map",
    description: "Planification agile de la thèse",
    category: "admin",
  },
  {
    id: "routesme",
    label: "RoutesMe API",
    icon: "Route",
    description: "API RoutesMe pour la navigation",
    category: "admin",
  },
  {
    id: "license",
    label: "Licences",
    icon: "KeyRound",
    description: "Gestion des licences et activation",
    category: "admin",
  },
  {
    id: "auth-providers",
    label: "Fournisseurs auth",
    icon: "Shield",
    description: "Configuration Auth0, Stytch, Warrant",
    category: "admin",
  },
  {
    id: "usage-guide",
    label: "Notice d'utilisation",
    icon: "CircleHelp",
    description: "Guide complet d'utilisation de ThesisFrame",
    category: "admin",
  },
  {
    id: "auto-edition",
    label: "Auto-édition 8C",
    icon: "PenLine",
    description: "Auto-édition en 8 critères",
    category: "redaction",
  },
  // ── CONNAISSANCES (SurfSense-inspired) ──
  {
    id: "knowledge-base",
    label: "Base de connaissances",
    icon: "Database",
    description: "Documents, recherche sémantique, citations IA",
    badge: "Nouveau",
    category: "ia",
  },
  {
    id: "research-memory",
    label: "Mémoire recherche",
    icon: "Brain",
    description: "Contexte persistant entre les sessions IA",
    badge: "Nouveau",
    category: "ia",
  },
  // ── RESSOURCES VISUELLES ──
  {
    id: "resource-gallery",
    label: "Ressources visuelles",
    icon: "Image",
    description: "Infographies — Méthodologie et Urbanisme",
    badge: "Nouveau",
    category: "ressources",
  },
  // ── ANALYSE DOCUMENTAIRE ──
  {
    id: "scientific-analysis",
    label: "Analyse documentaire",
    icon: "FlaskConical",
    description: "12 protocoles — Synthèse de classe A (PRISMA, GRADE)",
    badge: "Nouveau",
    category: "analyse",
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

  // AI Config
  aiApiKey: string;
  aiBaseUrl: string;
  aiModel: string;
  setAiApiKey: (key: string) => void;
  setAiBaseUrl: (url: string) => void;
  setAiModel: (model: string) => void;
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

      aiApiKey: "",
      aiBaseUrl: "",
      aiModel: "",
      setAiApiKey: (key) => set({ aiApiKey: key }),
      setAiBaseUrl: (url) => set({ aiBaseUrl: url }),
      setAiModel: (model) => set({ aiModel: model }),
    }),
    {
      name: "thesisframe-app-store",
      partialize: (state) => ({
        theme: state.theme,
        aiProvider: state.aiProvider,
        aiApiKey: state.aiApiKey,
        aiBaseUrl: state.aiBaseUrl,
        aiModel: state.aiModel,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
