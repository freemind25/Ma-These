"use client";

import { useAppStore } from "@/lib/stores/app-store";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { EditorPage } from "@/modules/editor/editor-page";
import { ReferencesPage } from "@/modules/references/references-page";
import { AiWritingPage } from "@/modules/ai-writing/ai-writing-page";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

function CurrentView() {
  const { currentView } = useAppStore();

  switch (currentView) {
    case "dashboard":
      return <DashboardPage />;
    case "editor":
      return <EditorPage />;
    case "ai-writing":
      return <AiWritingPage />;
    case "references":
      return <ReferencesPage />;
    case "methodology":
    case "articles":
    case "thesis-plan":
    case "ai-tools":
    case "academic-db":
      return <ModulePlaceholder />;
    default:
      return <DashboardPage />;
  }
}

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <CurrentView />
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
