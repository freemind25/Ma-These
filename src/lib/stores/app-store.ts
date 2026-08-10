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
  | "academic-db";

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
    id: "ai-writing",
    label: "Assistant IA",
    icon: "Sparkles",
    description: "10 modes d'écriture assistée par IA",
    badge: "IA",
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
