import { GraduationCap } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>ThesisFrame v1.0.0</span>
        </div>
        <span>Assistant intelligent pour la rédaction de thèses</span>
      </div>
    </footer>
  );
}
