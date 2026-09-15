import Image from "next/image";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-background px-6 py-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Ma Thèse"
            width={16}
            height={16}
            className="object-contain"
          />
          <span>Ma Thèse v1.2.0</span>
        </div>
        <span>Assistant intelligent pour la rédaction de thèses</span>
      </div>
    </footer>
  );
}
