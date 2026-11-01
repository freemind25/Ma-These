"use client";

// ═══════════════════════════════════════════════════════════════
// AppUpdateDialog — Mises à jour automatiques (Tauri updater v2)
// ═══════════════════════════════════════════════════════════════
// Vérifie l'endpoint configuré dans tauri.conf.json
// (releases GitHub latest.json), télécharge l'installeur signé,
// l'installe et relance l'application.
// Fonctionne uniquement dans l'app de bureau (Tauri) — la version
// web/dev affiche un message explicite.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Rocket,
} from "lucide-react";

type Phase =
  | "idle"
  | "checking"
  | "up-to-date"
  | "available"
  | "downloading"
  | "stopping-server"
  | "installing"
  | "done"
  | "error";

function isTauri(): boolean {
  return (
    typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
  );
}

function formatBytes(n: number): string {
  if (!n) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v.toFixed(v >= 100 || u === 0 ? 0 : 1)} ${units[u]}`;
}

export function AppUpdateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentVersion, setCurrentVersion] = useState<string>("");
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string>("");
  const [desktop, setDesktop] = useState(true);

  useEffect(() => {
    setDesktop(isTauri());
    if (!isTauri()) return;
    let cancelled = false;
    (async () => {
      try {
        const { getVersion } = await import("@tauri-apps/api/app");
        const v = await getVersion();
        if (!cancelled) setCurrentVersion(v);
      } catch {
        // version indisponible hors Tauri — non bloquant
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function checkForUpdate() {
    setError("");
    setPhase("checking");
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (update) {
        setAvailableVersion(update.version);
        setPhase("available");
      } else {
        setAvailableVersion(null);
        setPhase("up-to-date");
      }
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // FIX-UPD-1 : téléchargement et installation sont désormais DÉCOUPLÉS.
  // Cause racine de l'échec d'installation en 1.10.18 (« Erreur lors de
  // l'ouverture du fichier en écriture : …\Ma Thèse\node.exe ») : le plugin
  // updater ferme l'application via std::process::exit(0) juste après avoir
  // spawné l'installeur NSIS, ce qui contourne l'arrêt du serveur embarqué
  // prévu dans RunEvent::Exit (C2-R5). node.exe survivait en orphelin et
  // verrouillait son propre fichier pendant l'écrasement. On arrête donc
  // explicitement le serveur (commande Rust stop_server_for_update) ENTRE le
  // téléchargement et l'installation. Filet de sécurité : le hook NSIS
  // PREINSTALL de l'installeur tue tout process résiduel du dossier.
  async function downloadAndInstall() {
    setError("");
    setPhase("downloading");
    setDownloaded(0);
    setTotal(0);
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (!update) {
        setPhase("up-to-date");
        return;
      }
      setAvailableVersion(update.version);
      let received = 0;
      let size = 0;
      await update.download((event) => {
        if (event.event === "Started") {
          size = event.data.contentLength ?? 0;
          setTotal(size);
        } else if (event.event === "Progress") {
          received += event.data.chunkLength;
          setDownloaded(received);
        }
      });

      setPhase("stopping-server");
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("stop_server_for_update");
      } catch (stopErr) {
        // Non bloquant : le hook NSIS PREINSTALL tue les process résiduels
        // au début de l'installation (y compris pour une MAJ depuis une
        // version antérieure au présent correctif).
        console.warn(
          "stop_server_for_update a échoué — le hook NSIS prendra le relais :",
          stopErr,
        );
      }

      setPhase("installing");
      // Windows : le plugin ferme l'application (exit(0)) dès le spawn de
      // l'installeur — la promesse ne résout jamais, l'installeur NSIS prend
      // la main puis relance l'application (restart_after_install). Les
      // phases « done »/« error » restent atteignables sur les autres OS.
      await update.install();
      setPhase("done");
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function relaunchApp() {
    try {
      const { relaunch } = await import("@tauri-apps/plugin-process");
      await relaunch();
    } catch (e) {
      setPhase("error");
      setError(
        `Mise à jour installée mais relance impossible (${e instanceof Error ? e.message : String(e)}). Fermez et rouvrez l'application.`,
      );
    }
  }

  function closeAndReset() {
    onOpenChange(false);
    setTimeout(() => {
      setPhase("idle");
      setAvailableVersion(null);
      setDownloaded(0);
      setTotal(0);
      setError("");
    }, 300);
  }

  const pct = total > 0 ? Math.min(100, Math.round((downloaded / total) * 100)) : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) closeAndReset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Mises à jour
          </DialogTitle>
          <DialogDescription>
            Version actuelle{currentVersion ? ` : ${currentVersion}` : ""}. L&apos;application vérifie les nouvelles versions signées publiées sur GitHub.
          </DialogDescription>
        </DialogHeader>

        {!desktop ? (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-3 text-[12px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              La recherche de mise à jour n&apos;est disponible que dans l&apos;application de bureau Ma Thèse.
            </span>
          </div>
        ) : phase === "idle" || phase === "checking" ? (
          <div className="space-y-4">
            <Button onClick={checkForUpdate} disabled={phase === "checking"} className="w-full">
              {phase === "checking" ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recherche en cours…
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rechercher les mises à jour
                </>
              )}
            </Button>
          </div>
        ) : phase === "up-to-date" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-[12px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Vous utilisez déjà la dernière version{currentVersion ? ` (${currentVersion})` : ""}.
              </span>
            </div>
            <Button variant="outline" onClick={closeAndReset} className="w-full">
              Fermer
            </Button>
          </div>
        ) : phase === "available" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-sky-200 dark:border-sky-800/50 bg-sky-50 dark:bg-sky-950/20 p-3 text-[12px] text-sky-800 dark:text-sky-300 flex items-start gap-2">
              <Download className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Nouvelle version disponible : <span className="font-semibold">{availableVersion}</span>
                {currentVersion ? ` (actuelle : ${currentVersion})` : ""}. Le téléchargement est vérifié par signature numérique.
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadAndInstall} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Télécharger et installer
              </Button>
              <Button variant="outline" onClick={closeAndReset}>
                Plus tard
              </Button>
            </div>
          </div>
        ) : phase === "downloading" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Téléchargement : {formatBytes(downloaded)}
              {total > 0 ? ` / ${formatBytes(total)}` : ""}
            </div>
            <Progress value={pct} className="h-2" />
            <p className="text-[11px] text-muted-foreground">
              L&apos;installation démarrera automatiquement à la fin du téléchargement. Ne fermez pas l&apos;application.
            </p>
          </div>
        ) : phase === "stopping-server" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Arrêt du serveur embarqué…
            </div>
            <p className="text-[11px] text-muted-foreground">
              Le serveur interne doit être arrêté avant l&apos;installation pour
              libérer les fichiers à mettre à jour (FIX-UPD-1).
            </p>
          </div>
        ) : phase === "installing" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Installation de la mise à jour…
            </div>
            <p className="text-[11px] text-muted-foreground">
              L&apos;application va se fermer, l&apos;installeur prendra le relais puis
              relancera Ma Thèse automatiquement.
            </p>
          </div>
        ) : phase === "done" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/20 p-3 text-[12px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
              <Rocket className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Mise à jour <span className="font-semibold">{availableVersion}</span> installée. Redémarrez pour l&apos;appliquer.
              </span>
            </div>
            <Button onClick={relaunchApp} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Redémarrer maintenant
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/20 p-3 text-[12px] text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="break-words">{error || "Erreur inconnue."}</span>
            </div>
            <Button variant="outline" onClick={closeAndReset} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
