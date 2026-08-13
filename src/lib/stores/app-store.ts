import { create } from "zustand";
import { persist } from "zustand/middleware";

// ═══════════════════════════════════════
// ThesisFrame — Application Store (Zustand)
// ═══════════════════════════════════════

export type ViewId =
  // Principal
  | "dashboard"
  | "editor"
  // Recherche
  | "methodology"
  | "references"
  | "academic-db"
  | "mendeley"
  // Rédaction
  | "articles"
  | "thesis-plan"
  | "cadrage"
  // IA & Outils
  | "ai-writing"
  | "ai-tools"
  | "ia-assistants"
  | "ai-config"
  // Stockage & Export
  | "cloud-drive"
  | "box-drive";

export interface NavigationItem {
  id: ViewId;
  label: string;
  icon: string;
  description: string;
  badge?: string;
  category: string;
}

export const NAVIGATION_CATEGORIES = [
  { id: "principal", label: "Principal", icon: "LayoutDashboard" },
  { id: "recherche", label: "Recherche", icon: "Search" },
  { id: "redaction", label: "Rédaction", icon: "PenTool" },
  { id: "ia", label: "IA & Outils", icon: "Sparkles" },
  { id: "stockage", label: "Stockage", icon: "Cloud" },
] as const;

export const NAVIGATION_ITEMS: NavigationItem[] = [
  // ═══ Principal ═══
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

  // ═══ Recherche ═══
  {
    id: "methodology",
    label: "Méthodologie",
    icon: "FlaskConical",
    description: "Guides et outils méthodologiques",
    category: "recherche",
  },
  {
    id: "references",
    label: "Références",
    icon: "BookOpen",
    description: "Gestion bibliographique et export BibTeX",
    category: "recherche",
  },
  {
    id: "academic-db",
    label: "Bases de données",
    icon: "Globe",
    description: "Ressources académiques en ligne",
    category: "recherche",
  },
  {
    id: "mendeley",
    label: "Mendeley",
    icon: "BookMarked",
    description: "Gestion et import depuis Mendeley",
    category: "recherche",
  },

  // ═══ Rédaction ═══
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
    id: "cadrage",
    label: "Cadrage",
    icon: "Crosshair",
    description: "Cadrage préliminaire et champs de recherche",
    category: "redaction",
  },

  // ═══ IA & Outils ═══
  {
    id: "ai-writing",
    label: "Écriture IA",
    icon: "Sparkles",
    description: "10 modes d'écriture assistée par IA",
    badge: "IA",
    category: "ia",
  },
  {
    id: "ai-tools",
    label: "Outils IA",
    icon: "Wrench",
    description: "Notebook, consensus, visualisation",
    badge: "IA",
    category: "ia",
  },
  {
    id: "ia-assistants",
    label: "Assistants IA",
    icon: "Bot",
    description: "Directeur, vérification, humanisation",
    badge: "IA",
    category: "ia",
  },
  {
    id: "ai-config",
    label: "Configuration IA",
    icon: "Settings",
    description: "Fournisseurs, clés API, modèles",
    category: "ia",
  },

  // ═══ Stockage ═══
  {
    id: "cloud-drive",
    label: "Cloud Drive",
    icon: "Cloud",
    description: "Sauvegarde Google Drive",
    category: "stockage",
  },
  {
    id: "box-drive",
    label: "Box Drive",
    icon: "Package",
    description: "Stockage et partage Box",
    category: "stockage",
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
  setTheme: (theme: "light" | "dark" | "system") => void;

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
      setTheme: (theme) => set({ theme }),

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
