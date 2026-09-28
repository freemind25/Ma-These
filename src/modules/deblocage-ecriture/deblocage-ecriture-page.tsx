"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Unlock,
  Brain,
  Timer,
  PenTool,
  Target,
  Quote,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  ChevronRight,
  AlertTriangle,
  Zap,
  Coffee,
  Flame,
  BookOpen,
  MessageSquare,
  Network,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiConfig } from "@/hooks/use-ai-config";

// ═══════════════════════════════════════════════════════════════════════
// DATA — Writing Blocks
// ═══════════════════════════════════════════════════════════════════════

const WRITING_BLOCKS = [
  {
    id: "page-blanche",
    label: "Page blanche",
    description: "Difficulté à commencer, écran vide intimidant",
    icon: AlertTriangle,
  },
  {
    id: "imposteur",
    label: "Syndrome de l'imposteur",
    description: "Douter de sa légitimité et de ses compétences",
    icon: Brain,
  },
  {
    id: "perfectionnisme",
    label: "Perfectionnisme paralysant",
    description: "Tout doit être parfait avant d'écrire",
    icon: Target,
  },
  {
    id: "motivation",
    label: "Manque de motivation",
    description: "Perte d'enthousiasme et de direction",
    icon: Zap,
  },
  {
    id: "surcharge",
    label: "Surcharge d'informations",
    description: "Trop de lectures, impossibilité de synthétiser",
    icon: BookOpen,
  },
  {
    id: "procrastination",
    label: "Procrastination",
    description: "Reporter sans cesse le moment d'écrire",
    icon: Coffee,
  },
  {
    id: "doute",
    label: "Doute sur la contribution",
    description: "Se demander si son travail apporte quelque chose",
    icon: MessageSquare,
  },
  {
    id: "fatigue",
    label: "Fatigue intellectuelle",
    description: "Épuisement mental, difficulté à se concentrer",
    icon: Flame,
  },
];

// ═══════════════════════════════════════════════════════════════════════
// DATA — Motivational Quotes (French academic writing)
// ═══════════════════════════════════════════════════════════════════════

const MOTIVATIONAL_QUOTES = [
  { text: "Un texte parfait n'existe pas. Un texte fini, oui.", author: "Paul Valéry" },
  { text: "Écrire, c'est réécrire. La première version n'est jamais que le brouillon de la pensée.", author: "Michel de Montaigne" },
  { text: "La thèse est une longue conversation avec soi-même, éclairée par les autres.", author: "Pierre Bourdieu" },
  { text: "L'écriture est la meilleure façon de penser sans savoir qu'on pense.", author: "Marcel Proust" },
  { text: "Le secret de l'écriture : écrire tous les jours, même quand on n'en a pas envie.", author: "Stephen King" },
  { text: "Chaque mot écrit est un pas de plus vers la soutenance.", author: "Sagesse doctorale" },
  { text: "Il n'y a pas de bonne écriture, il n'y a que de la réécriture.", author: "Truman Capote" },
  { text: "La page blanche n'est pas un mur, c'est une porte ouverte.", author: "Amélie Nothomb" },
  { text: "Commencer est toujours la partie la plus difficile. Après, le texte vous entraîne.", author: "Albert Camus" },
  { text: "La persévérance est le talent qui ne se révèle qu'au quotidien.", author: "Jean-Paul Sartre" },
];

// ═══════════════════════════════════════════════════════════════════════
// DATA — Freewriting Durations
// ═══════════════════════════════════════════════════════════════════════

const FREEWRITING_DURATIONS = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
];

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

interface DailyEntry {
  date: string;
  goal: number;
  achieved: number;
}

// ═══════════════════════════════════════════════════════════════════════
// HELPER — Format timer
// ═══════════════════════════════════════════════════════════════════════

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

export function DeblocageEcriturePage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
            <Unlock className="h-5 w-5 text-chart-4" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Déblocage écriture</h1>
            <p className="text-sm text-muted-foreground">
              Diagnostic, exercices pratiques et outils pour surmonter le blocage de l&apos;écriture doctorale
            </p>
          </div>
        </div>
      </div>

      {/* Motivational Quote Banner */}
      <MotivationalQuoteBanner />

      {/* Main Tabs */}
      <Tabs defaultValue="diagnostic" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="diagnostic" className="gap-2 text-xs sm:text-sm">
            <Brain className="h-4 w-4 hidden sm:block" />
            Diagnostic
          </TabsTrigger>
          <TabsTrigger value="exercices" className="gap-2 text-xs sm:text-sm">
            <PenTool className="h-4 w-4 hidden sm:block" />
            Exercices
          </TabsTrigger>
          <TabsTrigger value="suivi" className="gap-2 text-xs sm:text-sm">
            <Target className="h-4 w-4 hidden sm:block" />
            Suivi
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="gap-2 text-xs sm:text-sm">
            <Timer className="h-4 w-4 hidden sm:block" />
            Pomodoro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostic" className="mt-6">
          <DiagnosticSection />
        </TabsContent>

        <TabsContent value="exercices" className="mt-6">
          <ExercicesSection />
        </TabsContent>

        <TabsContent value="suivi" className="mt-6">
          <SuiviSection />
        </TabsContent>

        <TabsContent value="pomodoro" className="mt-6">
          <PomodoroSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENT — Motivational Quote Banner
// ═══════════════════════════════════════════════════════════════════════

function MotivationalQuoteBanner() {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
  );

  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <Card className="border-chart-5/20 bg-chart-5/5">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-5/10">
          <Quote className="h-5 w-5 text-chart-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-1">&mdash; {quote.author}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() =>
            setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length)
          }
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENT — Diagnostic Section
// ═══════════════════════════════════════════════════════════════════════

function DiagnosticSection() {
  const { withAiConfig } = useAiConfig();
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);
  const [solutions, setSolutions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBlock = (id: string) => {
    setSelectedBlocks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const fetchSolutions = useCallback(async () => {
    if (selectedBlocks.length === 0) return;

    setIsLoading(true);
    setError(null);
    const newSolutions: Record<string, string> = {};

    for (const blockId of selectedBlocks) {
      const block = WRITING_BLOCKS.find((b) => b.id === blockId);
      if (!block) continue;

      try {
        const res = await fetch("/api/ai-writing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(withAiConfig({
            mode: "deblocage",
            prompt: `Je suis doctorant(e) et je souffre de "${block.label}" : ${block.description}. Donne-moi 5 stratégies concrètes et personnalisées pour surmonter ce blocage d'écriture dans le cadre de ma thèse. Sois pratique, encourageant et spécifique au contexte doctoral.`,
          })),
        });

        if (!res.ok) throw new Error("Erreur lors de la génération");
        const json = await res.json();
        newSolutions[blockId] = json.data.content;
      } catch {
        newSolutions[blockId] = `Impossible de générer les stratégies. Réessayez plus tard.`;
      }
    }

    setSolutions(newSolutions);
    setIsLoading(false);
  }, [selectedBlocks, withAiConfig]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Block Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-4" />
            Diagnostic de blocage
          </CardTitle>
          <CardDescription>
            Sélectionnez un ou plusieurs blocs que vous rencontrez
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {WRITING_BLOCKS.map((block) => {
            const Icon = block.icon;
            const isSelected = selectedBlocks.includes(block.id);
            return (
              <button
                key={block.id}
                onClick={() => toggleBlock(block.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? "border-chart-4 bg-chart-4/5"
                    : "border-border hover:border-chart-4/40 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? "bg-chart-4/15" : "bg-muted"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-chart-4" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{block.label}</span>
                    {isSelected && <Check className="h-3 w-3 text-chart-4" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{block.description}</p>
                </div>
              </button>
            );
          })}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedBlocks.length} bloc(s) sélectionné(s)
            </span>
            <Button
              onClick={fetchSolutions}
              disabled={selectedBlocks.length === 0 || isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Obtenir des stratégies IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Solutions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-chart-2" />
            Stratégies personnalisées
          </CardTitle>
          <CardDescription>
            Solutions générées par l&apos;IA pour chaque bloc identifié
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="text-sm text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {!isLoading && selectedBlocks.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
              <Brain className="h-10 w-10 opacity-30" />
              <p className="text-sm text-center">
                Sélectionnez au moins un bloc pour obtenir des stratégies personnalisées
              </p>
            </div>
          )}

          {!isLoading &&
            selectedBlocks.length > 0 &&
            Object.keys(solutions).length === 0 && (
              <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                <Sparkles className="h-10 w-10 opacity-30" />
                <p className="text-sm text-center">
                  Cliquez sur &laquo; Obtenir des stratégies IA &raquo; pour analyser vos blocs
                </p>
              </div>
            )}

          {Object.entries(solutions).map(([blockId, content]) => {
            const block = WRITING_BLOCKS.find((b) => b.id === blockId);
            return (
              <div key={blockId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {block?.label ?? blockId}
                  </Badge>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
                <Separator />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENT — Exercices Section
// ═══════════════════════════════════════════════════════════════════════

function ExercicesSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Freewriting Timer */}
      <FreewritingExercise />

      {/* Starter Sentences */}
      <StarterSentencesExercise />

      {/* Mind Mapping */}
      <MindMappingExercise />
    </div>
  );
}

// ─── Freewriting Exercise ──────────────────────────────────────────────

function FreewritingExercise() {
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [text, setText] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer countdown + auto-stop when time runs out
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleDurationChange = (d: number) => {
    setDuration(d);
    if (!isRunning) setTimeLeft(d * 60);
  };

  const handleStart = () => {
    if (!isRunning && timeLeft === duration * 60) {
      setTimeLeft(duration * 60);
    }
    setIsRunning(true);
    textareaRef.current?.focus();
  };

  const handlePause = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(duration * 60);
    setText("");
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <PenTool className="h-4 w-4 text-chart-1" />
          Écriture libre chronométrée
        </CardTitle>
        <CardDescription>
          Écrivez sans vous arrêter, sans juger. Laissez couler.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        {/* Duration selector */}
        <div className="flex gap-2">
          {FREEWRITING_DURATIONS.map((d) => (
            <Button
              key={d.value}
              variant={duration === d.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleDurationChange(d.value)}
              disabled={isRunning}
              className="flex-1"
            >
              {d.label}
            </Button>
          ))}
        </div>

        {/* Timer display */}
        <div className="flex flex-col items-center gap-2">
          <span className={`text-4xl font-mono font-bold tabular-nums ${timeLeft === 0 ? "text-chart-2" : ""}`}>
            {formatTime(timeLeft)}
          </span>
          <Progress value={timeLeft === 0 ? 100 : progress} className="h-2 w-full" />
          {timeLeft === 0 && (
            <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
              Temps écoulé !
            </Badge>
          )}
        </div>

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          placeholder={
            isRunning
              ? "Écrivez librement... Ne vous arrêtez pas, ne corrigez pas..."
              : "Votre texte apparaîtra ici quand le chrono sera lancé."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 min-h-[120px] resize-none"
        />

        {/* Word count & controls */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {wordCount} mot{wordCount !== 1 ? "s" : ""} rédigé{wordCount !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button size="sm" onClick={handleStart} disabled={timeLeft === 0 && text.length > 0} className="gap-1">
                <Play className="h-3 w-3" />
                Démarrer
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={handlePause} className="gap-1">
                <Pause className="h-3 w-3" />
                Pause
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleReset} className="gap-1">
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Starter Sentences Exercise ────────────────────────────────────────

function StarterSentencesExercise() {
  const { withAiConfig } = useAiConfig();
  const [sentences, setSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSentence, setSelectedSentence] = useState<string | null>(null);

  const generateSentences = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(withAiConfig({
          mode: "deblocage",
          prompt: `Génère exactement 5 "phrases d'amorce" (starter sentences) pour aider un doctorant à surmonter la page blanche. Chaque phrase doit être une ouverture captivante pour un paragraphe de thèse. Varie les styles : question rhétorique, affirmation forte, anecdote, citation interprétée, mise en perspective. Numérote chaque phrase de 1 à 5. Réponds uniquement avec les 5 phrases, une par ligne.`,
        })),
      });

      if (!res.ok) throw new Error("Erreur lors de la génération");
      const json = await res.json();
      const content = json.data.content;
      const lines = content
        .split("\n")
        .map((l: string) => l.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((l: string) => l.length > 10);
      setSentences(lines.slice(0, 5));
    } catch {
      setSentences([
        "Il est frappant de constater que...",
        "Si l'on se penche attentivement sur...",
        "Au-delà des apparences, ce phénomène révèle...",
        "La question qui se pose alors est de savoir...",
        "Contrairement à l'idée reçue selon laquelle...",
      ]);
    }
    setIsLoading(false);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-chart-2" />
          Phrases d&apos;amorce
        </CardTitle>
        <CardDescription>
          Des ouvertures pour débloquer votre rédaction
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        {/* Generate button */}
        <Button onClick={generateSentences} disabled={isLoading} className="gap-2 w-full">
          {isLoading ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Générer 5 phrases d&apos;amorce
            </>
          )}
        </Button>

        {/* Sentence list */}
        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : sentences.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <Sparkles className="h-8 w-8 opacity-30" />
            <p className="text-xs text-center">
              Cliquez pour générer des phrases d&apos;ouverture inspirantes
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto">
            {sentences.map((sentence, index) => (
              <button
                key={index}
                onClick={() => setSelectedSentence(selectedSentence === sentence ? null : sentence)}
                className={`rounded-lg border p-3 text-left text-sm transition-all ${
                  selectedSentence === sentence
                    ? "border-chart-2 bg-chart-2/5"
                    : "border-border hover:border-chart-2/40 hover:bg-muted/50"
                }`}
              >
                <span className="text-xs text-muted-foreground mr-2 font-mono">{index + 1}.</span>
                {sentence}
              </button>
            ))}
          </div>
        )}

        {/* Selected sentence preview */}
        {selectedSentence && (
          <div className="rounded-lg bg-chart-2/5 border border-chart-2/20 p-3">
            <p className="text-xs text-muted-foreground mb-1">Phrase sélectionnée :</p>
            <p className="text-sm italic">&ldquo;{selectedSentence}&rdquo;</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Mind Mapping Exercise ─────────────────────────────────────────────

function MindMappingExercise() {
  const [nodes, setNodes] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [centerIdea, setCenterIdea] = useState("");

  const addNode = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !nodes.includes(trimmed)) {
      setNodes((prev) => [...prev, trimmed]);
      setInputValue("");
    }
  };

  const removeNode = (index: number) => {
    setNodes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Network className="h-4 w-4 text-chart-5" />
          Brainstorm textuel
        </CardTitle>
        <CardDescription>
          Organisez vos idées autour d&apos;un concept central
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        {/* Center idea input */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Idée centrale</Label>
          <Input
            placeholder="Ex : Les déterminants de l'adoption du numérique..."
            value={centerIdea}
            onChange={(e) => setCenterIdea(e.target.value)}
          />
        </div>

        {/* Node input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter une idée..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNode();
              }
            }}
          />
          <Button size="icon" variant="outline" onClick={addNode} disabled={!inputValue.trim()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mind map visualization */}
        <div className="flex-1 min-h-[200px] rounded-lg border bg-muted/20 p-4 overflow-y-auto max-h-[260px]">
          {centerIdea ? (
            <div className="flex flex-col items-center gap-3">
              {/* Center node */}
              <div className="rounded-lg bg-chart-5/10 border border-chart-5/30 px-4 py-2 text-center">
                <p className="text-sm font-medium text-chart-5">{centerIdea}</p>
              </div>

              {/* Connector lines and child nodes */}
              {nodes.length > 0 && (
                <div className="w-px h-4 bg-border" />
              )}

              <div className="grid grid-cols-2 gap-2 w-full">
                {nodes.map((node, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:border-chart-5/40 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-chart-5 shrink-0" />
                    <span className="flex-1 text-xs leading-tight">{node}</span>
                    <button
                      onClick={() => removeNode(index)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
              <Network className="h-8 w-8 opacity-30" />
              <p className="text-xs text-center">
                Définissez une idée centrale pour commencer le brainstorm
              </p>
            </div>
          )}
        </div>

        {nodes.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {nodes.length} idée{nodes.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setNodes([])}
            >
              Tout effacer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENT — Suivi Section (Daily Writing Tracker)
// ═══════════════════════════════════════════════════════════════════════

function SuiviSection() {
  const [entries, setEntries] = useState<DailyEntry[]>([
    { date: getToday(), goal: 500, achieved: 0 },
  ]);
  const [currentGoal, setCurrentGoal] = useState(500);
  const [currentAchieved, setCurrentAchieved] = useState(0);

  const todayEntry = entries.find((e) => e.date === getToday());

  const logToday = () => {
    setEntries((prev) => {
      const existing = prev.findIndex((e) => e.date === getToday());
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          date: getToday(),
          goal: currentGoal,
          achieved: currentAchieved,
        };
        return updated;
      }
      return [...prev, { date: getToday(), goal: currentGoal, achieved: currentAchieved }];
    });
  };

  const totalWords = entries.reduce((sum, e) => sum + e.achieved, 0);
  const totalGoal = entries.reduce((sum, e) => sum + e.goal, 0);
  const daysCompleted = entries.filter((e) => e.achieved > 0).length;
  const streakDays = (() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = entries.find((e) => e.date === dateStr);
      if (entry && entry.achieved > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Input */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-1" />
            Objectif du jour
          </CardTitle>
          <CardDescription>
            Enregistrez votre progression quotidienne
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Objectif (nombre de mots)
            </Label>
            <Input
              type="number"
              min={0}
              value={currentGoal}
              onChange={(e) => setCurrentGoal(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="500"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Mots rédigés aujourd&apos;hui
            </Label>
            <Input
              type="number"
              min={0}
              value={currentAchieved}
              onChange={(e) => setCurrentAchieved(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
            />
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>
                {currentAchieved} / {currentGoal} mots
              </span>
            </div>
            <Progress
              value={currentGoal > 0 ? Math.min((currentAchieved / currentGoal) * 100, 100) : 0}
              className="h-2"
            />
          </div>

          {todayEntry && todayEntry.achieved > 0 && (
            <div className="rounded-lg bg-chart-2/5 border border-chart-2/20 p-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-chart-2" />
              <span className="text-xs">
                Dernier enregistrement : {todayEntry.achieved} / {todayEntry.goal} mots
              </span>
            </div>
          )}

          <Button onClick={logToday} className="w-full gap-2">
            <Check className="h-4 w-4" />
            Enregistrer la journée
          </Button>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-chart-4" />
            Statistiques
          </CardTitle>
          <CardDescription>Votre progression globale</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-chart-1">{totalWords.toLocaleString("fr-FR")}</p>
              <p className="text-xs text-muted-foreground">Mots totaux</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-chart-2">{daysCompleted}</p>
              <p className="text-xs text-muted-foreground">Jours actifs</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-chart-4">{streakDays}</p>
              <p className="text-xs text-muted-foreground">
                Jour{streakDays !== 1 ? "s" : ""} de suite
              </p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-2xl font-bold text-chart-5">
                {totalGoal > 0 ? Math.round((totalWords / totalGoal) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">Objectif atteint</p>
            </div>
          </div>

          {/* Weekly mini-chart */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">7 derniers jours</p>
            <div className="flex items-end gap-1.5 h-16">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateStr = d.toISOString().split("T")[0];
                const entry = entries.find((e) => e.date === dateStr);
                const maxGoal = 1000;
                const height = entry
                  ? Math.max(
                      4,
                      Math.min(
                        (entry.achieved / maxGoal) * 100,
                        100
                      )
                    )
                  : 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-sm transition-all ${
                        entry && entry.achieved > 0
                          ? "bg-chart-1"
                          : "bg-muted"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-chart-5" />
            Historique
          </CardTitle>
          <CardDescription>Vos sessions d&apos;écriture</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <Target className="h-8 w-8 opacity-30" />
              <p className="text-xs">Aucune session enregistrée</p>
            </div>
          ) : (
            entries
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((entry) => {
                const pct = entry.goal > 0 ? Math.min((entry.achieved / entry.goal) * 100, 100) : 0;
                return (
                  <div key={entry.date} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {new Date(entry.date).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <Badge
                        variant={pct >= 100 ? "default" : "secondary"}
                        className={pct >= 100 ? "bg-chart-2 text-chart-2-foreground" : ""}
                      >
                        {pct >= 100 ? "Atteint" : `${Math.round(pct)}%`}
                      </Badge>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {entry.achieved} / {entry.goal} mots
                    </p>
                  </div>
                );
              })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SUB-COMPONENT — Pomodoro Section
// ═══════════════════════════════════════════════════════════════════════

function PomodoroSection() {
  const WORK_DURATION = 25;
  const BREAK_DURATION = 5;

  const [timeLeft, setTimeLeft] = useState(WORK_DURATION * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentDuration = isBreak ? BREAK_DURATION : WORK_DURATION;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (!isBreak) {
              setCompletedSessions((c) => c + 1);
              setIsBreak(true);
              return BREAK_DURATION * 60;
            } else {
              setIsBreak(false);
              return WORK_DURATION * 60;
            }
          }
          if (!isBreak) {
            setTotalWorkTime((t) => t + 1);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft, isBreak]);

  const handleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(WORK_DURATION * 60);
  };

  const progress = ((currentDuration * 60 - timeLeft) / (currentDuration * 60)) * 100;
  const totalWorkMinutes = Math.floor(totalWorkTime / 60);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Timer */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Timer className="h-4 w-4 text-chart-3" />
            Pomodoro
          </CardTitle>
          <CardDescription>
            Sessions de {WORK_DURATION} minutes de travail suivies de {BREAK_DURATION} minutes de pause
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 py-8">
          {/* Mode indicator */}
          <Badge
            variant={isBreak ? "secondary" : "default"}
            className={
              isBreak
                ? "bg-chart-5/10 text-chart-5 hover:bg-chart-5/15"
                : "bg-chart-3/10 text-chart-3 hover:bg-chart-3/15"
            }
          >
            {isBreak ? (
              <Coffee className="h-3 w-3 mr-1" />
            ) : (
              <Flame className="h-3 w-3 mr-1" />
            )}
            {isBreak ? "Pause" : "Session de travail"}
          </Badge>

          {/* Timer circle */}
          <div className="relative flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 flex items-center justify-center relative">
              {/* Progress ring (CSS-based) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 192 192">
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 92}
                  strokeDashoffset={2 * Math.PI * 92 * (1 - progress / 100)}
                  strokeLinecap="round"
                  className={isBreak ? "text-chart-5" : "text-chart-3"}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className={`text-5xl font-mono font-bold tabular-nums ${isBreak ? "text-chart-5" : "text-chart-3"}`}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {isBreak ? "Reposez-vous" : "Concentrez-vous"}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              className="h-12 w-12"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleStartPause}
              className="h-14 w-14 rounded-full gap-0"
              size="icon"
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={() => {
                setIsBreak((prev) => !prev);
                setIsRunning(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                setTimeLeft((!isBreak ? BREAK_DURATION : WORK_DURATION) * 60);
              }}
            >
              <Coffee className="h-5 w-5" />
            </Button>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-muted/50 p-4 max-w-md w-full">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              {isBreak
                ? "Levez-vous, étirez-vous, buvez de l'eau. Votre cerveau a besoin de repos pour être productif."
                : "Coupez les notifications, fermez les onglets inutiles. La règle Pomodoro : travailler sans distraction pendant 25 minutes."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-chart-4" />
            Sessions
          </CardTitle>
          <CardDescription>Suivi de vos sessions Pomodoro</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-3xl font-bold text-chart-3">{completedSessions}</p>
              <p className="text-xs text-muted-foreground">Sessions terminées</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-3xl font-bold text-chart-4">{totalWorkMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes de travail</p>
            </div>
          </div>

          {/* Session dots */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Objectif du jour : 4 sessions</p>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                    i < completedSessions
                      ? "border-chart-3 bg-chart-3/15 text-chart-3"
                      : "border-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Motivational message */}
          {completedSessions > 0 && (
            <div className="rounded-lg bg-chart-3/5 border border-chart-3/20 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-chart-4" />
                <span className="text-xs font-medium">Bravo !</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {completedSessions === 1
                  ? "Première session terminée. Continuez sur cette lancée !"
                  : `${completedSessions} sessions complétées. ${totalWorkMinutes} minutes de travail concentré. Vous êtes en feu !`}
              </p>
            </div>
          )}

          <Separator />

          {/* Pomodoro tips */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Conseils Pomodoro
            </p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <Check className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                Travaillez sur UNE tâche précise par session
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                Notez les distractions pour les traiter après
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                Après 4 sessions, prenez une longue pause (15-30 min)
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-3 w-3 text-chart-2 mt-0.5 shrink-0" />
                Adaptez la durée si 25 min est trop long/court
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
