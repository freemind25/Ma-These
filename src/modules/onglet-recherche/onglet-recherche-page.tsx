"use client";

import { useState, useRef, useCallback, useEffect, useMemo, startTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/lib/stores/app-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  X,
  Pin,
  PinOff,
  Copy,
  Trash2,
  Link2,
  Quote,
  ListTodo,
  FileText,
  Globe,
  RotateCcw,
  LayoutDashboard,
  ExternalLink,
  Pencil,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";

// ── Types ───────────────────────────────────────────────

interface QuickLink {
  id: string;
  title: string;
  url: string;
}

interface KeyQuote {
  id: string;
  text: string;
  author: string;
}

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface ResearchTab {
  id: string;
  title: string;
  pinned: boolean;
  notes: string;
  links: QuickLink[];
  quotes: KeyQuote[];
  todos: TodoItem[];
}

/** Shape returned by the API (JSON fields are raw strings). */
interface DbResearchTab {
  id: string;
  thesisId: string;
  title: string;
  pinned: boolean;
  notes: string;
  links: string;
  quotes: string;
  todos: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ─────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID().slice(0, 8);
}

function parseJsonField<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseTab(db: DbResearchTab): ResearchTab {
  return {
    id: db.id,
    title: db.title,
    pinned: db.pinned,
    notes: db.notes ?? "",
    links: parseJsonField<QuickLink[]>(db.links, []),
    quotes: parseJsonField<KeyQuote[]>(db.quotes, []),
    todos: parseJsonField<TodoItem[]>(db.todos, []),
  };
}

// ── Data hooks ──────────────────────────────────────────

interface Thesis {
  id: string;
  title: string;
  author?: string;
  discipline?: string;
}

function useTheses() {
  return useQuery<Thesis[]>({
    queryKey: ["thesis"],
    queryFn: async () => {
      const res = await fetch("/api/thesis");
      if (!res.ok) throw new Error("Erreur lors du chargement des thèses");
      const json = await res.json();
      return json.data as Thesis[];
    },
    staleTime: 10 * 1000,
  });
}

// ── Component ───────────────────────────────────────────

export function OngletRecherchePage() {
  const queryClient = useQueryClient();
  const { data: theses, isLoading: thesesLoading } = useTheses();
  const storeThesisId = useAppStore((s) => s.activeThesisId);
  const setStoreThesisId = useAppStore((s) => s.setActiveThesisId);

  // Thesis selection (same pattern as cadrage-page.tsx)
  const selectedThesis = useMemo(() => {
    if (!theses || theses.length === 0) return null;
    const id = storeThesisId || theses[0].id;
    return theses.find((t) => t.id === id) || theses[0];
  }, [theses, storeThesisId]);

  const thesisId = selectedThesis?.id ?? null;

  // ── Fetch research tabs ──
  const { data: dbTabs, isLoading: tabsLoading } = useQuery<DbResearchTab[]>({
    queryKey: ["research-tabs", thesisId],
    queryFn: async () => {
      if (!thesisId) return [];
      const res = await fetch(`/api/thesis/${thesisId}/research-tabs`);
      if (!res.ok) throw new Error("Erreur lors du chargement des onglets");
      const json = await res.json();
      return json.data as DbResearchTab[];
    },
    enabled: !!thesisId,
    staleTime: 5 * 1000,
  });

  // Parse DB tabs → UI tabs
  const tabs = useMemo(() => (dbTabs ?? []).map(parseTab), [dbTabs]);

  // Active tab ID (local UI state)
  const [activeTabId, setActiveTabId] = useState<string>("");

  // Track which thesis had its default tab auto-created
  const [autoCreatedFor, setAutoCreatedFor] = useState<string | null>(null);
  const prevThesisRef = useRef<string | null>(null);

  // ── Per-tab debounce timers ──
  const debounceRefs = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  // Reset active tab when thesis changes
  useEffect(() => {
    if (thesisId !== prevThesisRef.current) {
      prevThesisRef.current = thesisId;
      startTransition(() => {
        setActiveTabId("");
      });
      // Clear all pending debounce timers
      debounceRefs.current.forEach((timer) => clearTimeout(timer));
      debounceRefs.current.clear();
    }
  }, [thesisId]);

  // Sync active tab when tabs change
  useEffect(() => {
    if (tabs.length === 0) return;
    if (!activeTabId || !tabs.find((t) => t.id === activeTabId)) {
      startTransition(() => {
        setActiveTabId(tabs[0].id);
      });
    }
  }, [tabs, activeTabId]);

  // ── Create mutation (POST) ──
  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      pinned?: boolean;
      notes?: string;
      links?: QuickLink[];
      quotes?: KeyQuote[];
      todos?: TodoItem[];
    }) => {
      if (!thesisId) throw new Error("No thesis");
      const res = await fetch(`/api/thesis/${thesisId}/research-tabs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json() as Promise<{ data: DbResearchTab }>;
    },
    onMutate: async (data) => {
      if (!thesisId) return { prev: undefined, tempId: "" };
      await queryClient.cancelQueries({
        queryKey: ["research-tabs", thesisId],
      });
      const prev = queryClient.getQueryData<DbResearchTab[]>([
        "research-tabs",
        thesisId,
      ]);
      const tempId = `temp-${uid()}`;
      const optimistic: DbResearchTab = {
        id: tempId,
        thesisId,
        title: data.title,
        pinned: data.pinned ?? false,
        notes: data.notes || "",
        links: JSON.stringify(data.links || []),
        quotes: JSON.stringify(data.quotes || []),
        todos: JSON.stringify(data.todos || []),
        sortOrder: prev?.length ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<DbResearchTab[]>(
        ["research-tabs", thesisId],
        [...(prev || []), optimistic]
      );
      return { prev, tempId };
    },
    onSuccess: (data, _vars, context) => {
      if (thesisId && context) {
        queryClient.setQueryData<DbResearchTab[]>(
          ["research-tabs", thesisId],
          (old) =>
            old?.map((t) => (t.id === context.tempId ? data.data : t))
        );
      }
      if (thesisId) {
        queryClient.invalidateQueries({
          queryKey: ["research-tabs", thesisId],
        });
      }
    },
    onError: (_err, _vars, context) => {
      if (thesisId && context?.prev) {
        queryClient.setQueryData(
          ["research-tabs", thesisId],
          context.prev
        );
      }
      toast.error("Erreur lors de la création de l'onglet");
    },
  });

  // Auto-create default tab on first visit
  useEffect(() => {
    if (
      thesisId &&
      !tabsLoading &&
      tabs.length === 0 &&
      autoCreatedFor !== thesisId
    ) {
      startTransition(() => {
        setAutoCreatedFor(thesisId);
      });
      createMutation.mutate({ title: "Recherche principale" });
    }
  }, [thesisId, tabsLoading, tabs.length, autoCreatedFor, createMutation]);

  // ── Save mutation (PUT) ──
  const saveTabMutation = useMutation({
    mutationFn: async (tabId: string) => {
      if (!thesisId) return;
      const cached = queryClient.getQueryData<DbResearchTab[]>([
        "research-tabs",
        thesisId,
      ]);
      const tab = cached?.find((t) => t.id === tabId);
      if (!tab) return;
      const res = await fetch(`/api/research-tabs/${tabId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tab.title,
          pinned: tab.pinned,
          notes: tab.notes,
          links: tab.links,
          quotes: tab.quotes,
          todos: tab.todos,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
    },
    onSuccess: () => {
      if (thesisId) {
        queryClient.invalidateQueries({
          queryKey: ["research-tabs", thesisId],
        });
      }
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
      if (thesisId) {
        queryClient.invalidateQueries({
          queryKey: ["research-tabs", thesisId],
        });
      }
    },
  });

  // ── Delete mutation (DELETE) ──
  const deleteMutation = useMutation({
    mutationFn: async (tabId: string) => {
      const res = await fetch(`/api/research-tabs/${tabId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur");
    },
    onSuccess: (_data, tabId) => {
      if (thesisId) {
        queryClient.invalidateQueries({
          queryKey: ["research-tabs", thesisId],
        });
      }
      if (tabId === activeTabId) {
        setActiveTabId("");
      }
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'onglet");
    },
  });

  // Unmount cleanup for debounce timers
  useEffect(() => {
    const currentMap = debounceRefs.current;
    return () => {
      currentMap.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const scheduleSave = useCallback(
    (tabId: string) => {
      const existing = debounceRefs.current.get(tabId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        debounceRefs.current.delete(tabId);
        saveTabMutation.mutate(tabId);
      }, 1500);
      debounceRefs.current.set(tabId, timer);
    },
    [saveTabMutation]
  );

  // ── Optimistic updateTab (updates cache + schedules debounced save) ──
  const updateTab = useCallback(
    (tabId: string, patch: Partial<ResearchTab>) => {
      if (!thesisId) return;
      queryClient.setQueryData<DbResearchTab[]>(
        ["research-tabs", thesisId],
        (old) => {
          if (!old) return old;
          return old.map((t) => {
            if (t.id !== tabId) return t;
            const updated = { ...t };
            if (patch.title !== undefined) updated.title = patch.title;
            if (patch.pinned !== undefined) updated.pinned = patch.pinned;
            if (patch.notes !== undefined) updated.notes = patch.notes;
            if (patch.links !== undefined)
              updated.links = JSON.stringify(patch.links);
            if (patch.quotes !== undefined)
              updated.quotes = JSON.stringify(patch.quotes);
            if (patch.todos !== undefined)
              updated.todos = JSON.stringify(patch.todos);
            return updated;
          });
        }
      );
      scheduleSave(tabId);
    },
    [thesisId, queryClient, scheduleSave]
  );

  // ── UI state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");

  const [todoInput, setTodoInput] = useState("");

  // Derived
  const activeTab = tabs.find((t) => t.id === activeTabId);

  // ── Tab handlers (DB-backed) ──
  const addTab = useCallback(
    (title?: string) => {
      if (!thesisId) return;
      const tabTitle = title ?? `Onglet ${tabs.length + 1}`;
      createMutation.mutate(
        { title: tabTitle },
        {
          onSuccess: (data) => {
            setActiveTabId(data.data.id);
          },
        }
      );
    },
    [thesisId, tabs.length, createMutation]
  );

  const closeTab = useCallback(
    (tabId: string) => {
      // Cancel any pending debounce for this tab
      const existing = debounceRefs.current.get(tabId);
      if (existing) {
        clearTimeout(existing);
        debounceRefs.current.delete(tabId);
      }
      deleteMutation.mutate(tabId);
    },
    [deleteMutation]
  );

  const duplicateTab = useCallback(
    (tabId: string) => {
      const source = tabs.find((t) => t.id === tabId);
      if (!source || !thesisId) return;
      createMutation.mutate(
        {
          title: `${source.title} (copie)`,
          notes: source.notes,
          links: source.links,
          quotes: source.quotes,
          todos: source.todos,
        },
        {
          onSuccess: (data) => {
            setActiveTabId(data.data.id);
            toast.success("Onglet dupliqué");
          },
        }
      );
    },
    [tabs, thesisId, createMutation]
  );

  const pinTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return;
      updateTab(tabId, { pinned: !tab.pinned });
    },
    [tabs, updateTab]
  );

  const clearTab = useCallback(
    (tabId: string) => {
      updateTab(tabId, { notes: "", links: [], quotes: [], todos: [] });
      toast.success("Contenu de l'onglet effacé");
    },
    [updateTab]
  );

  // ── Search → new tab ──
  const handleSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (!q || !thesisId) return;
    const scholarLink: QuickLink = {
      id: uid(),
      title: `Google Scholar — ${q}`,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(q)}`,
    };
    const openAlexLink: QuickLink = {
      id: uid(),
      title: `OpenAlex — ${q}`,
      url: `https://api.openalex.org/works?search=${encodeURIComponent(q)}&per_page=25`,
    };
    createMutation.mutate(
      {
        title: `Recherche : ${q}`,
        notes: `Recherche lancée : « ${q} »\n\nRésultats et notes à venir…`,
        links: [scholarLink, openAlexLink],
      },
      {
        onSuccess: (data) => {
          setActiveTabId(data.data.id);
          setSearchQuery("");
          toast.success(`Nouvel onglet créé pour « ${q} »`);
        },
      }
    );
  }, [searchQuery, thesisId, createMutation]);

  // ── Rename ──
  const startRename = useCallback(
    (tabId: string, currentTitle: string) => {
      setRenamingId(tabId);
      setRenameValue(currentTitle);
      setTimeout(() => renameRef.current?.focus(), 0);
    },
    []
  );

  const commitRename = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      updateTab(renamingId, { title: renameValue.trim() });
    }
    setRenamingId(null);
    setRenameValue("");
  }, [renamingId, renameValue, updateTab]);

  // ── Links ──
  const addLink = useCallback(() => {
    if (!activeTab || !linkTitle.trim() || !linkUrl.trim()) return;
    const newLink: QuickLink = {
      id: uid(),
      title: linkTitle.trim(),
      url: linkUrl.trim().startsWith("http")
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`,
    };
    updateTab(activeTab.id, {
      links: [...activeTab.links, newLink],
    });
    setLinkTitle("");
    setLinkUrl("");
    setLinkDialogOpen(false);
  }, [activeTab, linkTitle, linkUrl, updateTab]);

  const removeLink = useCallback(
    (linkId: string) => {
      if (!activeTab) return;
      updateTab(activeTab.id, {
        links: activeTab.links.filter((l) => l.id !== linkId),
      });
    },
    [activeTab, updateTab]
  );

  // ── Quotes ──
  const addQuote = useCallback(() => {
    if (!activeTab || !quoteText.trim()) return;
    const newQuote: KeyQuote = {
      id: uid(),
      text: quoteText.trim(),
      author: quoteAuthor.trim(),
    };
    updateTab(activeTab.id, {
      quotes: [...activeTab.quotes, newQuote],
    });
    setQuoteText("");
    setQuoteAuthor("");
    setQuoteDialogOpen(false);
  }, [activeTab, quoteText, quoteAuthor, updateTab]);

  const removeQuote = useCallback(
    (quoteId: string) => {
      if (!activeTab) return;
      updateTab(activeTab.id, {
        quotes: activeTab.quotes.filter((q) => q.id !== quoteId),
      });
    },
    [activeTab, updateTab]
  );

  // ── Todos ──
  const addTodo = useCallback(() => {
    if (!activeTab || !todoInput.trim()) return;
    const newTodo: TodoItem = {
      id: uid(),
      text: todoInput.trim(),
      done: false,
    };
    updateTab(activeTab.id, {
      todos: [...activeTab.todos, newTodo],
    });
    setTodoInput("");
  }, [activeTab, todoInput, updateTab]);

  const toggleTodo = useCallback(
    (todoId: string) => {
      if (!activeTab) return;
      updateTab(activeTab.id, {
        todos: activeTab.todos.map((td) =>
          td.id === todoId ? { ...td, done: !td.done } : td
        ),
      });
    },
    [activeTab, updateTab]
  );

  const removeTodo = useCallback(
    (todoId: string) => {
      if (!activeTab) return;
      updateTab(activeTab.id, {
        todos: activeTab.todos.filter((td) => td.id !== todoId),
      });
    },
    [activeTab, updateTab]
  );

  // ── Summary stats ──
  const totalLinks = tabs.reduce((s, t) => s + t.links.length, 0);
  const totalQuotes = tabs.reduce((s, t) => s + t.quotes.length, 0);
  const totalTodos = tabs.reduce((s, t) => s + t.todos.length, 0);
  const doneTodos = tabs.reduce(
    (s, t) => s + t.todos.filter((td) => td.done).length,
    0
  );
  const pinnedCount = tabs.filter((t) => t.pinned).length;

  // ── Sorted tabs (pinned first) ──
  const sortedTabs = [...tabs].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  // ────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────

  // No theses at all
  if (thesesLoading) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/15">
            <PanelLeftOpen className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Onglet Recherche
            </h1>
            <p className="text-sm text-muted-foreground">Chargement…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!theses || theses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/15">
            <PanelLeftOpen className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Onglet Recherche
            </h1>
            <p className="text-sm text-muted-foreground">
              Parcourez et organisez vos recherches dans des onglets
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Aucune thèse</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Créez d'abord une thèse pour utiliser les onglets de recherche.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/15">
            <PanelLeftOpen className="h-5 w-5 text-chart-2" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Onglet Recherche
            </h1>
            <p className="text-sm text-muted-foreground">
              Parcourez et organisez vos recherches dans des onglets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary((s) => !s)}
          >
            {showSummary ? (
              <PanelLeftClose className="mr-1.5 h-4 w-4" />
            ) : (
              <LayoutDashboard className="mr-1.5 h-4 w-4" />
            )}
            {showSummary ? "Espace de travail" : "Résumé de session"}
          </Button>
          <Button size="sm" onClick={() => addTab()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Nouvel onglet
          </Button>
        </div>
      </div>

      {/* ─── Thesis Selector ─── */}
      {theses.length > 1 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Thèse :</span>
          {theses.map((t) => (
            <Button
              key={t.id}
              variant={t.id === selectedThesis?.id ? "default" : "outline"}
              size="sm"
              onClick={() => setStoreThesisId(t.id)}
            >
              {t.title}
            </Button>
          ))}
        </div>
      )}

      {/* ─── Session Summary ─── */}
      {showSummary && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-chart-2" />
              <CardTitle className="text-lg">Résumé de session</CardTitle>
            </div>
            <CardDescription>
              Vue d'ensemble de tous vos onglets de recherche
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-chart-2">
                  {tabs.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Onglets
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-chart-1">
                  {pinnedCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Épinglés
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {totalLinks}
                </p>
                <p className="text-xs text-muted-foreground">
                  Liens
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-chart-4">
                  {totalQuotes}
                </p>
                <p className="text-xs text-muted-foreground">
                  Citations
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {doneTodos}/{totalTodos}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tâches
                </p>
              </div>
            </div>

            <Separator />

            {/* Tab overview list */}
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => {
                const noteLen = tab.notes.length;
                const todoProgress =
                  tab.todos.length > 0
                    ? Math.round(
                        (tab.todos.filter((t) => t.done).length /
                          tab.todos.length) *
                          100
                      )
                    : null;
                return (
                  <div
                    key={tab.id}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">
                          {tab.title}
                        </span>
                        {tab.pinned && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            <Pin className="mr-0.5 h-2.5 w-2.5" />
                            Épinglé
                          </Badge>
                        )}
                        {tab.id === activeTabId && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-chart-2 text-chart-2"
                          >
                            Actif
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {noteLen > 0
                          ? `${noteLen} car. · `
                          : "Aucune note · "}
                        {tab.links.length} lien(s) · {tab.quotes.length} citation(s)
                        {todoProgress !== null &&
                          ` · ${todoProgress}% tâches`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 h-7 text-xs"
                      onClick={() => {
                        setActiveTabId(tab.id);
                        setShowSummary(false);
                      }}
                    >
                      Ouvrir
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Search Bar ─── */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un sujet et ouvrir dans un nouvel onglet…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="mr-1.5 h-4 w-4" />
              Rechercher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Tab Bar ─── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
        {sortedTabs.map((tab) => (
          <div
            key={tab.id}
            className={
              "group flex items-center gap-1.5 rounded-t-lg border border-b-0 px-3 py-2 cursor-pointer select-none shrink-0 transition-colors " +
              (tab.id === activeTabId
                ? "bg-card border-border text-foreground"
                : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground")
            }
            onClick={() => setActiveTabId(tab.id)}
            onDoubleClick={() => startRename(tab.id, tab.title)}
          >
            {tab.pinned && (
              <Pin className="h-3 w-3 text-chart-1 shrink-0" />
            )}

            {renamingId === tab.id ? (
              <input
                ref={renameRef}
                className="bg-transparent border-b border-chart-2 outline-none text-sm w-32"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setRenamingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="text-sm whitespace-nowrap max-w-[160px] truncate">
                {tab.title}
              </span>
            )}

            <button
              className={
                "ml-1 rounded p-0.5 hover:bg-muted-foreground/20 transition-colors shrink-0 " +
                (tab.id === activeTabId
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100")
              }
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              aria-label="Fermer l'onglet"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          className="flex items-center justify-center rounded-t-lg px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          onClick={() => addTab()}
          aria-label="Ajouter un onglet"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* ─── Active Tab Content ─── */}
      {tabsLoading && tabs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Chargement des onglets…
            </p>
          </CardContent>
        </Card>
      ) : activeTab ? (
        <div className="flex flex-col gap-6">
          {/* Tab Header with Quick Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{activeTab.title}</h2>
              {activeTab.pinned && (
                <Badge variant="secondary" className="text-xs">
                  <Pin className="mr-0.5 h-3 w-3" />
                  Épinglé
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() =>
                  startRename(activeTab.id, activeTab.title)
                }
              >
                <Pencil className="mr-1 h-3 w-3" />
                Renommer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => pinTab(activeTab.id)}
              >
                {activeTab.pinned ? (
                  <PinOff className="mr-1 h-3 w-3" />
                ) : (
                  <Pin className="mr-1 h-3 w-3" />
                )}
                {activeTab.pinned ? "Désépingler" : "Épingler"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => duplicateTab(activeTab.id)}
              >
                <Copy className="mr-1 h-3 w-3" />
                Dupliquer
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 text-destructive hover:text-destructive"
                onClick={() => clearTab(activeTab.id)}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Effacer
              </Button>
            </div>
          </div>

          {/* 2-column grid for workspace */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── Left Column ── */}
            <div className="flex flex-col gap-6">
              {/* Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-chart-2" />
                    <CardTitle className="text-base">Notes</CardTitle>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {activeTab.notes.length} car.
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Prenez vos notes de recherche ici…"
                    value={activeTab.notes}
                    onChange={(e) =>
                      updateTab(activeTab.id, { notes: e.target.value })
                    }
                    className="min-h-[200px] resize-y"
                  />
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <CardTitle className="text-base">
                        Liens rapides
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {activeTab.links.length}
                      </Badge>
                    </div>
                    <Dialog
                      open={linkDialogOpen}
                      onOpenChange={setLinkDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="mr-1 h-3 w-3" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter un lien</DialogTitle>
                          <DialogDescription>
                            Entrez le titre et l'URL du lien.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-2">
                          <Input
                            placeholder="Titre du lien"
                            value={linkTitle}
                            onChange={(e) => setLinkTitle(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && addLink()
                            }
                          />
                          <Input
                            placeholder="https://…"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && addLink()
                            }
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            size="sm"
                            onClick={addLink}
                            disabled={!linkTitle.trim() || !linkUrl.trim()}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Ajouter
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTab.links.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Aucun lien ajouté pour le moment.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto scrollbar-thin">
                      {activeTab.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center gap-2 rounded-md border p-2 group"
                        >
                          <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {link.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {link.url}
                            </p>
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded p-1 hover:bg-muted transition-colors"
                            aria-label="Ouvrir le lien"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          <button
                            className="shrink-0 rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => removeLink(link.id)}
                            aria-label="Supprimer le lien"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Right Column ── */}
            <div className="flex flex-col gap-6">
              {/* Key Quotes */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Quote className="h-4 w-4 text-chart-4" />
                      <CardTitle className="text-base">
                        Citations clés
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {activeTab.quotes.length}
                      </Badge>
                    </div>
                    <Dialog
                      open={quoteDialogOpen}
                      onOpenChange={setQuoteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Plus className="mr-1 h-3 w-3" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Ajouter une citation
                          </DialogTitle>
                          <DialogDescription>
                            Entrez la citation et son auteur.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-2">
                          <Textarea
                            placeholder="« La citation… »"
                            value={quoteText}
                            onChange={(e) => setQuoteText(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <Input
                            placeholder="Auteur (optionnel)"
                            value={quoteAuthor}
                            onChange={(e) => setQuoteAuthor(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && addQuote()
                            }
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            size="sm"
                            onClick={addQuote}
                            disabled={!quoteText.trim()}
                          >
                            <Check className="mr-1 h-3.5 w-3.5" />
                            Ajouter
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeTab.quotes.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      Aucune citation enregistrée.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-thin">
                      {activeTab.quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className="relative rounded-md border-l-4 border-l-chart-4 bg-muted/30 p-3 group"
                        >
                          <button
                            className="absolute right-2 top-2 rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => removeQuote(quote.id)}
                            aria-label="Supprimer la citation"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <p className="text-sm italic pr-6">
                            « {quote.text} »
                          </p>
                          {quote.author && (
                            <p className="text-xs text-muted-foreground mt-1">
                              — {quote.author}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* To-do Items */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-base">
                      Tâches à faire
                    </CardTitle>
                    {activeTab.todos.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs ml-auto"
                      >
                        {activeTab.todos.filter((t) => t.done).length}/{" "}
                        {activeTab.todos.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Add todo */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="Ajouter une tâche…"
                      value={todoInput}
                      onChange={(e) => setTodoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTodo();
                      }}
                      className="flex-1 h-9 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={addTodo}
                      disabled={!todoInput.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Todo list */}
                  {activeTab.todos.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2 text-center">
                      Aucune tâche pour le moment.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto scrollbar-thin">
                      {activeTab.todos.map((todo) => (
                        <div
                          key={todo.id}
                          className="flex items-center gap-2 rounded-md border px-2.5 py-2 group"
                        >
                          <Checkbox
                            checked={todo.done}
                            onCheckedChange={() => toggleTodo(todo.id)}
                          />
                          <span
                            className={
                              "flex-1 text-sm " +
                              (todo.done
                                ? "line-through text-muted-foreground"
                                : "")
                            }
                          >
                            {todo.text}
                          </span>
                          <button
                            className="shrink-0 rounded p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => removeTodo(todo.id)}
                            aria-label="Supprimer la tâche"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}