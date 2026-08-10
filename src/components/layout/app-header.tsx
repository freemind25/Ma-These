"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAppStore, NAVIGATION_ITEMS } from "@/lib/stores/app-store";
import { Settings, HelpCircle, ChevronRight } from "lucide-react";

export function AppHeader() {
  const { currentView } = useAppStore();
  const currentNav = NAVIGATION_ITEMS.find((item) => item.id === currentView);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />

      <Separator orientation="vertical" className="h-6" />

      {/* Breadcrumb-style navigation */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">ThesisFrame</span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="font-medium text-foreground">
          {currentNav?.label ?? "Tableau de bord"}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* Help dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Aide</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Aide &amp; Support</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Guide d&apos;utilisation</DropdownMenuItem>
            <DropdownMenuItem>Raccourcis clavier</DropdownMenuItem>
            <DropdownMenuItem>À propos de ThesisFrame</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Paramètres</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Configuration</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Fournisseur IA</DropdownMenuItem>
            <DropdownMenuItem>Préférences</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
