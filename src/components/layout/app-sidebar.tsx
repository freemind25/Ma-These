"use client";

import {
  GraduationCap, LayoutDashboard, FileText, Sparkles, FlaskConical,
  Newspaper, BookOpen, ListTree, Wrench, Globe, Compass, Library,
  Search, BookMarked, Scale, SpellCheck, ShieldCheck, Brain, Zap,
  PencilRuler, Download, FileSpreadsheet, Cloud, Box, ClipboardCheck,
  ClipboardList, BarChart3, ListChecks, FolderTree, BookCheck,
  Map, KeyRound, Shield, CircleHelp, PenLine, Route, GraduationCap as DirecteurIcon,
  PenTool,
  type LucideIcon,
} from "lucide-react";
import { useAppStore, NAVIGATION_ITEMS } from "@/lib/stores/app-store";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarFooter, SidebarRail,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Icon registry — comprehensive mapping for all navigation items
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, FileText, Sparkles, FlaskConical, Newspaper, BookOpen,
  ListTree, Wrench, Globe, Compass, Library, Search, BookMarked,
  Scale, SpellCheck, ShieldCheck, Brain, Zap, PencilRuler, Download,
  FileSpreadsheet, Cloud, Box, ClipboardCheck, ClipboardList, BarChart3,
  ListChecks, FolderTree, BookCheck, Map, KeyRound, Shield, CircleHelp,
  PenLine, Route, PenTool, GraduationCap: DirecteurIcon,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return <LayoutDashboard className={cn("h-4 w-4", className)} />;
  return <Icon className={cn("h-4 w-4", className)} />;
}

const CATEGORY_LABELS: Record<string, string> = {
  principal: "Principal",
  recherche: "Recherche",
  redaction: "Rédaction",
  ia: "IA & Outils",
  export: "Export & Sauvegarde",
  analyse: "Analyse",
  ressources: "Ressources",
  admin: "Administration",
};

const CATEGORY_ORDER = [
  "principal",
  "recherche",
  "redaction",
  "ia",
  "export",
  "analyse",
  "ressources",
  "admin",
];

export function AppSidebar() {
  const { currentView, setCurrentView } = useAppStore();

  // Group navigation items by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    label: CATEGORY_LABELS[cat] || cat,
    items: NAVIGATION_ITEMS.filter((item) => item.category === cat),
  })).filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              ThesisFrame
            </span>
            <span className="text-[10px] text-sidebar-foreground/60">
              Assistant de thèse
            </span>
          </div>
        </div>
      </SidebarHeader>

      <Separator className="bg-sidebar-border" />

      <SidebarContent className="px-2 py-2 max-h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
        {grouped.map((group, gi) => (
          <SidebarGroup key={group.label}>
            {gi > 0 && <Separator className="bg-sidebar-border/50 my-1" />}
            <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
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
        ))}
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
