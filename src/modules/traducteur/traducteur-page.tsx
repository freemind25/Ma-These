"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Languages, ArrowRightLeft, Copy, Check, ClipboardPaste, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Academic-relevant language pairs
const ACADEMIC_LANGS: [string, string][] = [
  ["auto", "Détecter automatiquement"],
  ["fr", "Français"],
  ["en", "English"],
  ["de", "Deutsch"],
  ["es", "Español"],
  ["it", "Italiano"],
  ["pt", "Português"],
  ["nl", "Nederlands"],
  ["pl", "Polski"],
  ["ru", "Русский"],
  ["zh", "中文"],
  ["ja", "日本語"],
  ["ko", "한국어"],
  ["ar", "العربية"],
  ["hi", "हिन्दी"],
  ["tr", "Türkçe"],
  ["sv", "Svenska"],
  ["da", "Dansk"],
  ["fi", "Suomi"],
  ["no", "Norsk"],
  ["el", "Ελληνικά"],
  ["cs", "Čeština"],
  ["ro", "Română"],
  ["hu", "Magyar"],
  ["uk", "Українська"],
  ["id", "Bahasa Indonesia"],
  ["vi", "Tiếng Việt"],
  ["th", "ไทย"],
];

const QUICK_PAIRS: { label: string; source: string; target: string }[] = [
  { label: "FR → EN", source: "fr", target: "en" },
  { label: "EN → FR", source: "en", target: "fr" },
  { label: "FR → DE", source: "fr", target: "de" },
  { label: "FR → ES", source: "fr", target: "es" },
  { label: "EN → DE", source: "en", target: "de" },
  { label: "EN → ES", source: "en", target: "es" },
];

export function TraducteurPage() {
  const { toast } = useToast();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("fr");
  const [targetLang, setTargetLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Track char count
  useEffect(() => {
    setCharCount(sourceText.length);
  }, [sourceText]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) {
      setError("Veuillez saisir du texte à traduire.");
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setTranslatedText("");
    setDetectedLang("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: sourceText,
          source: sourceLang,
          target: targetLang,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de traduction.");
        return;
      }

      setTranslatedText(data.translatedText || "");
      if (data.source && data.source !== "auto") {
        setDetectedLang(data.source);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, [sourceText, sourceLang, targetLang]);

  const handleSwapLanguages = () => {
    if (sourceLang === "auto") return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copié", description: "Texte copié dans le presse-papiers." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier.", variant: "destructive" });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setSourceText(text);
    } catch {
      toast({ title: "Erreur", description: "Accès au presse-papiers refusé.", variant: "destructive" });
    }
  };

  const handleClear = () => {
    setSourceText("");
    setTranslatedText("");
    setError("");
    setDetectedLang("");
  };

  const handleQuickPair = (pair: (typeof QUICK_PAIRS)[number]) => {
    setSourceLang(pair.source);
    setTargetLang(pair.target);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
          <Languages className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Traducteur</h1>
          <p className="text-sm text-muted-foreground">
            Traduction automatique open source via LibreTranslate
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto text-xs">
          LibreTranslate
        </Badge>
      </div>

      {/* Quick language pairs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground font-medium">Paires rapides :</span>
            {QUICK_PAIRS.map((pair) => (
              <Button
                key={pair.label}
                variant={sourceLang === pair.source && targetLang === pair.target ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => handleQuickPair(pair)}
              >
                {pair.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main translation area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="w-[180px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_LANGS.map(([code, label]) => (
                      <SelectItem key={code} value={code} className="text-sm">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePaste} title="Coller">
                  <ClipboardPaste className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClear} title="Effacer">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <Textarea
              placeholder="Saisissez ou collez le texte à traduire..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-[280px] lg:min-h-[400px] resize-y text-sm leading-relaxed"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleTranslate();
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {charCount.toLocaleString("fr-FR")} caractères
              </span>
              <span className="text-xs text-muted-foreground">
                Ctrl+Entrée pour traduire
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Target panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-[180px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_LANGS.filter(([code]) => code !== "auto").map(([code, label]) => (
                      <SelectItem key={code} value={code} className="text-sm">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {detectedLang && (
                  <Badge variant="outline" className="text-xs font-normal">
                    Détecté : {ACADEMIC_LANGS.find(([c]) => c === detectedLang)?.[1] || detectedLang}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopy(translatedText)}
                disabled={!translatedText}
                title="Copier la traduction"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pt-0">
            <div className="min-h-[280px] lg:min-h-[400px] rounded-md border bg-muted/30 p-3 text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Traduction en cours...</span>
                </div>
              ) : translatedText ? (
                translatedText
              ) : (
                <span className="text-muted-foreground">
                  La traduction apparaîtra ici...
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={handleTranslate}
          disabled={loading || !sourceText.trim()}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {loading ? "Traduction..." : "Traduire"}
        </Button>

        <Button
          variant="outline"
          onClick={handleSwapLanguages}
          disabled={sourceLang === "auto" || (!translatedText && !sourceText)}
          className="gap-2"
        >
          <ArrowRightLeft className="h-4 w-4" />
          Inverser
        </Button>

        <div className="ml-auto text-xs text-muted-foreground">
          Propulsé par <a href="https://github.com/LibreTranslate/LibreTranslate" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">LibreTranslate</a> — Open Source, auto-hébergeable, hors ligne
        </div>
      </div>

      {/* Info card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">À propos de LibreTranslate</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>LibreTranslate</strong> est une API de traduction automatique libre et open source (AGPL-3.0),
            propulsée par le moteur <strong>Argos Translate</strong>. Contrairement à Google Translate ou DeepL,
            elle ne repose sur aucun service propriétaire.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0 mt-0.5">100%</Badge>
              <span>Gratuit, aucune clé API requise</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0 mt-0.5">OSS</Badge>
              <span>Code source ouvert, auto-hébergeable</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0 mt-0.5">PRIVÉ</Badge>
              <span>Aucune donnée envoyée à des tiers propriétaires</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
