"use client";

// ═══════════════════════════════════════════════════════════════
// ThesisFrame — Onglet « Registre juridique » (URBANIS-DZ, §7 du pack)
// CRUD des entrées du référentiel juridique algérien — opt-in strict
// pour l'injection IA (mode expertise-urbaine-dz uniquement).
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Scale, Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";

interface LegalRefRow {
  id: string;
  domaine: string;
  reference: string;
  joradp: string | null;
  statut: string | null;
  textesLies: string | null;
  portee: string | null;
  questions: string | null;
  autorites: string | null;
  derniereVerification: string | null;
  niveauConfiance: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormState {
  domaine: string;
  reference: string;
  joradp: string;
  statut: string;
  textesLies: string;
  portee: string;
  questions: string;
  autorites: string;
  derniereVerification: string; // yyyy-mm-dd (input date) ou ""
  niveauConfiance: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = {
  domaine: "",
  reference: "",
  joradp: "",
  statut: "",
  textesLies: "",
  portee: "",
  questions: "",
  autorites: "",
  derniereVerification: "",
  niveauConfiance: "",
  enabled: false,
};

function rowToForm(row: LegalRefRow): FormState {
  return {
    domaine: row.domaine,
    reference: row.reference,
    joradp: row.joradp ?? "",
    statut: row.statut ?? "",
    textesLies: row.textesLies ?? "",
    portee: row.portee ?? "",
    questions: row.questions ?? "",
    autorites: row.autorites ?? "",
    derniereVerification: row.derniereVerification
      ? row.derniereVerification.slice(0, 10)
      : "",
    niveauConfiance: row.niveauConfiance ?? "",
    enabled: row.enabled,
  };
}

export function RegistreJuridiqueTab() {
  const [rows, setRows] = useState<LegalRefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // C-3 (AUD-FUNC-003) : suppression d'entrée juridique uniquement après confirmation
  const [rowToRemove, setRowToRemove] = useState<LegalRefRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/legal-refs");
      const json = await res.json();
      setRows(Array.isArray(json?.data) ? json.data : []);
    } catch {
      setError("Impossible de charger le registre juridique.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: LegalRefRow) => {
    setEditingId(row.id);
    setForm(rowToForm(row));
    setError(null);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.domaine.trim() || !form.reference.trim()) {
      setError("Domaine et référence sont requis.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        domaine: form.domaine.trim(),
        reference: form.reference.trim(),
        joradp: form.joradp.trim() || null,
        statut: form.statut.trim() || null,
        textesLies: form.textesLies.trim() || null,
        portee: form.portee.trim() || null,
        questions: form.questions.trim() || null,
        autorites: form.autorites.trim() || null,
        derniereVerification: form.derniereVerification
          ? new Date(`${form.derniereVerification}T12:00:00.000Z`).toISOString()
          : null,
        niveauConfiance: form.niveauConfiance || null,
        enabled: form.enabled,
      };
      const res = await fetch(
        editingId ? `/api/legal-refs/${editingId}` : "/api/legal-refs",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Enregistrement refusé");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (row: LegalRefRow, enabled: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled } : r)));
    try {
      const res = await fetch(`/api/legal-refs/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, enabled: !enabled } : r)));
    }
  };

  const remove = async (row: LegalRefRow) => {
    try {
      const res = await fetch(`/api/legal-refs/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError("Suppression impossible.");
    }
  };

  const filtered = rows.filter((r) => {
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (
        !r.reference.toLowerCase().includes(q) &&
        !r.domaine.toLowerCase().includes(q) &&
        !(r.portee ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const activeCount = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (référence, domaine, portée)…"
            className="pl-8"
            aria-label="Rechercher dans le registre juridique"
          />
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
          Nouvelle entrée
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {rows.length} entrée{rows.length > 1 ? "s" : ""} · {activeCount} utilisée
        {activeCount > 1 ? "s" : ""} par l&apos;IA (mode Expertise urbaine
        URBANIS-DZ). Avis technique non opposable — toute règle juridique doit
        être vérifiée au JORADP.
      </p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true" />
          Chargement du registre…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {rows.length === 0
              ? "Registre vide — ajoutez les textes du référentiel ou exécutez l'alimentation initiale du pack URBANIS-DZ."
              : "Aucune entrée ne correspond à la recherche."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {filtered.map((row) => (
            <Card key={row.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="shrink-0">
                        <Scale className="h-3 w-3 mr-1" aria-hidden="true" />
                        {row.domaine}
                      </Badge>
                      {row.niveauConfiance && (
                        <Badge variant="secondary" className="shrink-0">
                          confiance : {row.niveauConfiance}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-medium break-words">{row.reference}</p>
                    {row.portee && (
                      <p className="text-xs text-muted-foreground mt-0.5 break-words">{row.portee}</p>
                    )}
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {row.joradp && <p>JORADP : {row.joradp}</p>}
                      {row.statut && <p>Statut : {row.statut}</p>}
                      {row.derniereVerification && (
                        <p>
                          Dernière vérification :{" "}
                          {new Date(row.derniereVerification).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={row.enabled}
                        onCheckedChange={(v) => void toggleEnabled(row, v)}
                        aria-label={`Utilisée par l'IA : ${row.reference}`}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label={`Modifier ${row.reference}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setRowToRemove(row)} aria-label={`Supprimer ${row.reference}`}>
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Modifier l'entrée" : "Nouvelle entrée du registre"}
            </DialogTitle>
            <DialogDescription>
              Référentiel juridique URBANIS-DZ (§7 du pack). Les vigilances
              (statut, JORADP) sont conservées telles quelles — l&apos;avis
              reste non opposable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lr-domaine">Domaine *</Label>
                <Input
                  id="lr-domaine"
                  value={form.domaine}
                  onChange={(e) => setForm({ ...form, domaine: e.target.value })}
                  placeholder="Urbanisme, Foncier, Risques…"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lr-niveau">Niveau de confiance</Label>
                <Select
                  value={form.niveauConfiance || "none"}
                  onValueChange={(v) => setForm({ ...form, niveauConfiance: v === "none" ? "" : v })}
                >
                  <SelectTrigger id="lr-niveau">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    <SelectItem value="élevé">Élevé</SelectItem>
                    <SelectItem value="moyen">Moyen</SelectItem>
                    <SelectItem value="faible">Faible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lr-reference">Référence *</Label>
              <Input
                id="lr-reference"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="Loi n° 90-29 du 1er décembre 1990…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lr-joradp">JORADP</Label>
              <Input
                id="lr-joradp"
                value={form.joradp}
                onChange={(e) => setForm({ ...form, joradp: e.target.value })}
                placeholder="N° et date de publication…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lr-statut">Statut / vigilance</Label>
              <Input
                id="lr-statut"
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
                placeholder="En vigueur / À vérifier au JORADP / Modifié et complété…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lr-portee">Portée / usage urbanistique</Label>
              <Textarea
                id="lr-portee"
                value={form.portee}
                onChange={(e) => setForm({ ...form, portee: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lr-textes">Textes liés</Label>
                <Input
                  id="lr-textes"
                  value={form.textesLies}
                  onChange={(e) => setForm({ ...form, textesLies: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lr-autorites">Autorités compétentes</Label>
                <Input
                  id="lr-autorites"
                  value={form.autorites}
                  onChange={(e) => setForm({ ...form, autorites: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="lr-questions">Questions couvertes</Label>
                <Input
                  id="lr-questions"
                  value={form.questions}
                  onChange={(e) => setForm({ ...form, questions: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lr-verification">Dernière vérification</Label>
                <Input
                  id="lr-verification"
                  type="date"
                  value={form.derniereVerification}
                  onChange={(e) => setForm({ ...form, derniereVerification: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="lr-enabled" className="cursor-pointer">
                Utilisée par l&apos;IA
                <span className="block text-xs font-normal text-muted-foreground">
                  Injectée au mode Expertise urbaine (URBANIS-DZ)
                </span>
              </Label>
              <Switch
                id="lr-enabled"
                checked={form.enabled}
                onCheckedChange={(v) => setForm({ ...form, enabled: v })}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />}
              {editingId ? "Enregistrer" : "Créer l'entrée"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* C-3 (AUD-FUNC-003) : confirmation avant suppression d'une entrée du registre */}
      <ConfirmDeleteDialog
        open={!!rowToRemove}
        onOpenChange={(open) => !open && setRowToRemove(null)}
        title="Supprimer cette entrée juridique ?"
        description={
          rowToRemove
            ? `« ${rowToRemove.reference} » sera définitivement retirée du registre juridique. Cette action est irréversible.`
            : undefined
        }
        onConfirm={() => {
          if (!rowToRemove) return;
          void remove(rowToRemove);
          setRowToRemove(null);
        }}
      />
    </div>
  );
}
