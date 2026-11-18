"use client";

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — DatalabConfigDialog
// Clé API du fournisseur documentaire datalab.to : stockée dans un
// cookie httpOnly via /api/datalab/config (la clé ne touche jamais
// le JS client). Même sémantique que le dialogue Fournisseur IA.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, EyeOff, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DatalabConfigStatus {
  hasApiKey: boolean;
  maskedKey: string | null;
  source: "cookie" | "env" | null;
}

export function DatalabConfigDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [status, setStatus] = useState<DatalabConfigStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/datalab/config");
      const json = await res.json();
      if (res.ok && json?.data) setStatus(json.data as DatalabConfigStatus);
    } catch {
      /* statut indisponible */
    }
  };

  useEffect(() => {
    if (open) {
      loadStatus();
      setApiKey("");
    }
  }, [open]);

  const save = async () => {
    const trimmed = apiKey.trim();
    if (trimmed.length < 8) {
      toast.error("Clé Datalab invalide (minimum 8 caractères).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/datalab/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      toast.success("Clé Datalab enregistrée.");
      setApiKey("");
      await loadStatus();
      window.dispatchEvent(new CustomEvent("datalab-config-changed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/datalab/config", { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Clé Datalab effacée (la variable d'environnement, si définie, reste active).");
      await loadStatus();
      window.dispatchEvent(new CustomEvent("datalab-config-changed"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Datalab — Fournisseur documentaire
        </DialogTitle>
        <DialogDescription>
          Import PDF haute fidélité (colonnes, tableaux, formules), extraction structurée avec
          citations et conversion JATS XML des articles. La clé est stockée dans un cookie
          sécurisé — elle ne quitte jamais votre machine, sauf vers datalab.to.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 py-2">
        {/* Statut actuel */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">État :</span>
          {status === null ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : status.hasApiKey ? (
            <>
              <Badge variant="outline" className="text-emerald-700 border-emerald-600/40">
                Clé configurée
              </Badge>
              <code className="text-xs text-muted-foreground">{status.maskedKey}</code>
              <span className="text-xs text-muted-foreground">({status.source})</span>
            </>
          ) : (
            <Badge variant="outline">Aucune clé — repli local (unpdf/Tesseract)</Badge>
          )}
        </div>

        {/* Saisie de la clé */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="datalab-api-key">Clé API Datalab</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="datalab-api-key"
                type={showKey ? "text" : "password"}
                placeholder="dk_… (créer sur datalab.to/app/keys)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showKey ? "Masquer la clé" : "Afficher la clé"}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button onClick={save} disabled={saving || apiKey.trim().length < 8}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
          <a
            href="https://www.datalab.to/app/keys"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Créer une clé sur datalab.to/app/keys (compte gratuit : 10-20 $ de crédits par mois)
          </a>
        </div>

        {/* Note coût */}
        <p className="text-xs text-muted-foreground">
          Facturation à la page : Convert fast ≈ 1,33 $/1 000 pages, Extraction fast ≈ 6 $/1 000
          pages, JATS ≈ 10 $/1 000 pages. Sans clé, les imports repassent automatiquement par le
          moteur local — aucune fonctionnalité n&apos;est perdue.
        </p>
      </div>

      <DialogFooter className="gap-2 sm:justify-between">
        <Button
          variant="destructive"
          size="sm"
          onClick={remove}
          disabled={deleting || !status?.hasApiKey || status.source !== "cookie"}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Effacer la clé
        </Button>
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Fermer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
