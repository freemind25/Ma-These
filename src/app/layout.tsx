import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ThesisFrame — Assistant de thèse",
    template: "%s | ThesisFrame",
  },
  description:
    "ThesisFrame est un assistant intelligent pour la rédaction de thèses de doctorat. Éditeur riche, IA d'écriture, méthodologie, bibliographie et plus.",
  keywords: [
    "thèse",
    "doctorat",
    "rédaction",
    "assistant",
    "IA",
    "méthodologie",
    "bibliographie",
    "ThesisFrame",
  ],
  authors: [{ name: "ThesisFrame" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
