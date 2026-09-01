"use client";

import { useState, useMemo } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  Sparkles,
  FlaskConical,
  Newspaper,
  BookOpen,
  ListTree,
  Wrench,
  Globe,
  Library,
  Search,
  ClipboardCheck,
  Route,
  Unlock,
  GitBranch,
  Compass,
  FileCheck,
  ShieldCheck,
  SpellCheck,
  FileDown,
  Scale,
  GitFork,
  Type,
  Briefcase,
  GitCompareArrows,
  PanelLeftOpen,
  PenTool,
  Brain,
  BookOpenText,
  MapPin,
  FileCode2,
  Stamp,
  Binoculars,
  Languages,
  ChevronsUpDown,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useAppStore, NAVIGATION_ITEMS, NAV_CATEGORY_META, type NavCategory } from "@/lib/stores/app-store";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// ── Icon Registry ──
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, FileText, Sparkles, FlaskConical, Newspaper, BookOpen, ListTree,
  Wrench, Globe, Library, Search, ClipboardCheck, Route, Unlock, GitBranch,
  Compass, FileCheck, ShieldCheck, SpellCheck, FileDown, Scale, GitFork, Type,
  Briefcase, GitCompareArrows, PanelLeftOpen, PenTool, Brain, BookOpenText,
  MapPin, FileCode2, Stamp, Binoculars, Languages,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={cn("h-4 w-4", className)} />;
}

// ── Category collapse state (persists in component) ──
const DEFAULT_COLLAPSED = new Set<string>();

const CATEGORY_ORDER: NavCategory[] = [
  "redaction", "structure", "recherche", "methodologie", "ia-outils", "export",
];

export function AppSidebar() {
  const { currentView, setCurrentView } = useAppStore();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(DEFAULT_COLLAPSED);

  // Toggle a category
  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  // Filter items by search
  const filtered = useMemo(() => {
    if (!search.trim()) return NAVIGATION_ITEMS;
    const q = search.toLowerCase();
    return NAVIGATION_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [search]);

  // Group items by category
  const pinned = filtered.filter((i) => i.category === "_pinned");
  const grouped = useMemo(() => {
 const map = new Map<string, typeof filtered>();
    for (const item of filtered) {
      if (!item.category || item.category === "_pinned") continue;
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [filtered]);

  const isSearching = search.trim().length > 0;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          {/* Logo image — visible only when sidebar is expanded */}
          <div className="h-9 w-auto max-w-[120px] min-w-0 overflow-hidden group-data-[collapsible=icon]:hidden">
            <img
              src="/logo.png"
              alt="Ma Thèse"
              className="h-full w-auto object-contain"
            />
          </div>
          {/* Fallback icon — visible only when sidebar is collapsed to icon mode */}
          <div className="hidden group-data-[collapsible=icon]:flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
      </SidebarHeader>

      <Separator className="bg-sidebar-border" />

      {/* Search bar */}
      <div className="px-3 py-2 group-data-[collapsible=icon]:hidden">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sidebar-foreground/40" />
          <Input
            placeholder="Rechercher un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs bg-sidebar-accent/40 border-sidebar-border/50 focus-visible:ring-sidebar-accent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:text-sidebar-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <SidebarContent className="px-2 py-1">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {/* Pinned items (always visible) */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {pinned.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={currentView === item.id}
                      onClick={() => setCurrentView(item.id)}
                      tooltip={item.label}
                      className={cn(
                        "gap-3 px-3",
                        currentView === item.id &&
                          "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <NavIcon name={item.icon} />
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-auto h-5 px-1.5 text-[10px] font-semibold bg-sidebar-accent/30 text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-1 bg-sidebar-border/50" />

          {/* Category groups */}
          {CATEGORY_ORDER.map((catKey) => {
            const items = grouped.get(catKey);
            if (!items || items.length === 0) return null;
            const meta = NAV_CATEGORY_META[catKey];
            const isCatCollapsed = collapsed.has(catKey);

            // When searching, show all flat without collapsible headers
            if (isSearching) {
              return (
                <SidebarGroup key={catKey}>
                  <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">
                    {meta?.label ?? catKey}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {items.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={currentView === item.id}
                            onClick={() => setCurrentView(item.id)}
                            tooltip={item.label}
                            className={cn(
                              "gap-3 px-3",
                              currentView === item.id &&
                                "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            )}
                          >
                            <NavIcon name={item.icon} />
                            <span className="truncate">{item.label}</span>
                            {item.badge && (
                              <Badge
                                variant="secondary"
                                className="ml-auto h-5 px-1.5 text-[10px] font-semibold bg-sidebar-accent/30 text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            }

            // Normal: collapsible category
            return (
              <Collapsible key={catKey} open={!isCatCollapsed} onOpenChange={() => toggleCategory(catKey)}>
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="group/label cursor-pointer select-none px-2 py-1.5 text-[11px] uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors">
                      <span className="flex items-center gap-1.5">
                        <ChevronDown className={cn(
                          "h-3 w-3 transition-transform duration-200",
                          isCatCollapsed && "-rotate-90"
                        )} />
                        {meta?.label ?? catKey}
                        <span className="ml-1 text-[10px] font-normal text-sidebar-foreground/30">
                          {items.length}
                        </span>
                      </span>
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {items.map((item) => (
                          <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                              isActive={currentView === item.id}
                              onClick={() => setCurrentView(item.id)}
                              tooltip={item.label}
                              className={cn(
                                "gap-3 px-3",
                                currentView === item.id &&
                                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              )}
                            >
                              <NavIcon name={item.icon} />
                              <span className="truncate">{item.label}</span>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-auto h-5 px-1.5 text-[10px] font-semibold bg-sidebar-accent/30 text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <ThemeToggle />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="text-xs group-data-[collapsible=icon]:hidden">
        {isDark ? "Mode clair" : "Mode sombre"}
      </span>
    </Button>
  );
}
