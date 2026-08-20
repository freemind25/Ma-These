import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock next-themes since it's browser-only and not needed for store tests
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Reset zustand store between tests
beforeEach(() => {
  // Re-import the store module to get a fresh state
  vi.resetModules();
});

async function getStore() {
  const { useAppStore } = await import("./app-store");
  // Get initial state
  const state = useAppStore.getState();
  return state;
}

describe("app-store initial state", () => {
  it("defaults currentView to 'dashboard'", async () => {
    const state = await getStore();
    expect(state.currentView).toBe("dashboard");
  });

  it("defaults sidebarOpen to true", async () => {
    const state = await getStore();
    expect(state.sidebarOpen).toBe(true);
  });

  it("defaults theme to 'system'", async () => {
    const state = await getStore();
    expect(state.theme).toBe("system");
  });

  it("defaults activeThesisId to null", async () => {
    const state = await getStore();
    expect(state.activeThesisId).toBeNull();
  });

  it("defaults activeChapterId to null", async () => {
    const state = await getStore();
    expect(state.activeChapterId).toBeNull();
  });

  it("defaults aiProvider to 'zai'", async () => {
    const state = await getStore();
    expect(state.aiProvider).toBe("zai");
  });
});

describe("setCurrentView", () => {
  it("changes currentView to the given view", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setCurrentView("editor");
    expect(useAppStore.getState().currentView).toBe("editor");
  });

  it("can switch to any valid ViewId", async () => {
    const { useAppStore } = await import("./app-store");
    const views = [
      "dashboard",
      "editor",
      "cadrage",
      "ai-writing",
      "methodology",
      "articles",
      "references",
      "thesis-plan",
      "ai-tools",
      "academic-db",
      "journaux-oa",
      "recherche-plein-texte",
      "auto-edition",
      "feuille-route-agile",
      "deblocage-ecriture",
      "outils-slr",
      "analyse-champ-recherche",
      "apa-composer",
      "verification-methodo",
      "boite-doctorale",
      "box-cloud",
      "routesme",
      "livres-competences",
      "onglet-recherche",
      "grammaire",
      "export-pdf",
      "equilibre-chapitres",
      "diagrammes",
      "harper",
      "thesis-rag",
      "verification-carto",
    ] as const;

    for (const view of views) {
      useAppStore.getState().setCurrentView(view);
      expect(useAppStore.getState().currentView).toBe(view);
    }
  });
});

describe("toggleSidebar", () => {
  it("toggles sidebarOpen from true to false", async () => {
    const { useAppStore } = await import("./app-store");
    expect(useAppStore.getState().sidebarOpen).toBe(true);
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(false);
  });

  it("toggles sidebarOpen back from false to true", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().toggleSidebar();
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(true);
  });

  it("multiple toggles alternate correctly", async () => {
    const { useAppStore } = await import("./app-store");
    const results: boolean[] = [];
    for (let i = 0; i < 4; i++) {
      useAppStore.getState().toggleSidebar();
      results.push(useAppStore.getState().sidebarOpen);
    }
    expect(results).toEqual([false, true, false, true]);
  });
});

describe("setSidebarOpen", () => {
  it("sets sidebarOpen to false", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setSidebarOpen(false);
    expect(useAppStore.getState().sidebarOpen).toBe(false);
  });

  it("sets sidebarOpen to true", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setSidebarOpen(false);
    useAppStore.getState().setSidebarOpen(true);
    expect(useAppStore.getState().sidebarOpen).toBe(true);
  });
});

describe("setActiveThesisId", () => {
  it("sets activeThesisId to a string", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setActiveThesisId("thesis-123");
    expect(useAppStore.getState().activeThesisId).toBe("thesis-123");
  });

  it("can set activeThesisId back to null", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setActiveThesisId("thesis-123");
    useAppStore.getState().setActiveThesisId(null);
    expect(useAppStore.getState().activeThesisId).toBeNull();
  });

  it("does not affect other state fields", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setCurrentView("editor");
    useAppStore.getState().setActiveThesisId("thesis-abc");
    const state = useAppStore.getState();
    expect(state.currentView).toBe("editor");
    expect(state.sidebarOpen).toBe(true);
    expect(state.activeThesisId).toBe("thesis-abc");
  });
});

describe("setActiveChapterId", () => {
  it("sets activeChapterId to a string", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setActiveChapterId("chapter-456");
    expect(useAppStore.getState().activeChapterId).toBe("chapter-456");
  });

  it("can set activeChapterId back to null", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setActiveChapterId("chapter-456");
    useAppStore.getState().setActiveChapterId(null);
    expect(useAppStore.getState().activeChapterId).toBeNull();
  });
});

describe("setAiProvider", () => {
  it("sets aiProvider to a known provider", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setAiProvider("openai");
    expect(useAppStore.getState().aiProvider).toBe("openai");
  });

  it("can switch between providers", async () => {
    const { useAppStore } = await import("./app-store");
    const providers = ["zai", "openai", "anthropic", "mistral", "routesme", "custom"];
    for (const p of providers) {
      useAppStore.getState().setAiProvider(p);
      expect(useAppStore.getState().aiProvider).toBe(p);
    }
  });

  it("does not affect other state when changing provider", async () => {
    const { useAppStore } = await import("./app-store");
    useAppStore.getState().setActiveThesisId("t-1");
    useAppStore.getState().setActiveChapterId("c-1");
    useAppStore.getState().setCurrentView("editor");
    useAppStore.getState().setAiProvider("anthropic");

    const state = useAppStore.getState();
    expect(state.activeThesisId).toBe("t-1");
    expect(state.activeChapterId).toBe("c-1");
    expect(state.currentView).toBe("editor");
    expect(state.aiProvider).toBe("anthropic");
  });
});

describe("NAVIGATION_ITEMS", () => {
  it("is exported and non-empty", async () => {
    const { NAVIGATION_ITEMS } = await import("./app-store");
    expect(NAVIGATION_ITEMS.length).toBeGreaterThan(0);
  });

  it("each item has required fields", async () => {
    const { NAVIGATION_ITEMS } = await import("./app-store");
    for (const item of NAVIGATION_ITEMS) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("icon");
      expect(item).toHaveProperty("description");
      expect(typeof item.id).toBe("string");
      expect(typeof item.label).toBe("string");
      expect(typeof item.icon).toBe("string");
      expect(typeof item.description).toBe("string");
    }
  });

  it("first item is the dashboard", async () => {
    const { NAVIGATION_ITEMS } = await import("./app-store");
    expect(NAVIGATION_ITEMS[0].id).toBe("dashboard");
  });

  it("has unique ids", async () => {
    const { NAVIGATION_ITEMS } = await import("./app-store");
    const ids = NAVIGATION_ITEMS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("badge field is optional and only present on some items", async () => {
    const { NAVIGATION_ITEMS } = await import("./app-store");
    const withBadge = NAVIGATION_ITEMS.filter((item) => item.badge);
    const withoutBadge = NAVIGATION_ITEMS.filter((item) => !item.badge);
    expect(withBadge.length).toBeGreaterThan(0);
    expect(withoutBadge.length).toBeGreaterThan(0);
  });
});

describe("store independence between actions", () => {
  it("setting one field does not reset others", async () => {
    const { useAppStore } = await import("./app-store");

    // Set multiple fields
    useAppStore.getState().setCurrentView("references");
    useAppStore.getState().setSidebarOpen(false);
    useAppStore.getState().setActiveThesisId("t-99");
    useAppStore.getState().setActiveChapterId("c-99");
    useAppStore.getState().setAiProvider("mistral");

    // Toggle sidebar
    useAppStore.getState().toggleSidebar();

    const state = useAppStore.getState();
    expect(state.currentView).toBe("references");
    expect(state.sidebarOpen).toBe(true); // toggled back
    expect(state.activeThesisId).toBe("t-99");
    expect(state.activeChapterId).toBe("c-99");
    expect(state.aiProvider).toBe("mistral");
    expect(state.theme).toBe("system"); // unchanged
  });
});
