"use client";

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Bloc « Provenance des savoirs » (partagé)
// Résumé court en ligne + détail dépliable (décisions validées
// n°1 et n°2 de specs/sceau-provenance-savoirs). Utilisé par le
// brouillon de chapitre, l'historique et l'assistant d'écriture —
// même format partout (CA-1.1 / CA-2.x / CA-3.1).
// ═══════════════════════════════════════════════════════════════

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollText, ChevronDown } from "lucide-react";
import {
  formatKnowledgeStampDetail,
  formatKnowledgeStampSummary,
  type KnowledgeStamp,
} from "@/lib/ai/knowledge-stamp";

/**
 * `stamp === undefined` → rien (donnée pas encore chargée).
 * `stamp === null` → mention « saisie manuelle » (décision validée n°2).
 */
export function KnowledgeStampBlock({
  stamp,
  manualLabel = "saisie manuelle",
}: {
  stamp: KnowledgeStamp | null | undefined;
  manualLabel?: string;
}) {
  if (stamp === undefined) return null;
  return (
    <Collapsible className="rounded-md border bg-muted/40">
      <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:text-foreground">
        <ScrollText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="flex-1">
          Provenance des savoirs :{" "}
          {stamp ? formatKnowledgeStampSummary(stamp) : manualLabel}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </CollapsibleTrigger>
      {stamp && (
        <CollapsibleContent>
          <ul className="space-y-1 border-t px-3 py-2 text-xs text-muted-foreground">
            {formatKnowledgeStampDetail(stamp).map((line) => (
              <li key={line}>{line}</li>
            ))}
            <li>
              généré le{" "}
              {new Date(stamp.generatedAt).toLocaleString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </li>
          </ul>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
