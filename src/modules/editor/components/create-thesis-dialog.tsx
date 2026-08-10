"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateThesis } from "../hooks/use-thesis";
import { useState } from "react";
import { Plus, GraduationCap } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";

export function CreateThesisDialog() {
  const { setCurrentView } = useAppStore();
  const createThesis = useCreateThesis();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [directorName, setDirectorName] = useState("");

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim()) return;

    await createThesis.mutateAsync({
      title: title.trim(),
      author: author.trim(),
      subtitle: subtitle.trim() || undefined,
      institution: institution.trim() || undefined,
      discipline: discipline.trim() || undefined,
      directorName: directorName.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setAuthor("");
    setSubtitle("");
    setInstitution("");
    setDiscipline("");
    setDirectorName("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle thèse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Créer une nouvelle thèse
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de base pour créer votre projet de
            thèse. Vous pourrez modifier ces informations ultérieurement.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Titre de la thèse *</Label>
            <Input
              id="title"
              placeholder="Ex: L'impact de l'urbanisation durable sur..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author">Auteur / Doctorant *</Label>
            <Input
              id="author"
              placeholder="Votre nom complet"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subtitle">Sous-titre (optionnel)</Label>
            <Input
              id="subtitle"
              placeholder="Précision du sujet"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                placeholder="Université / École"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discipline">Discipline</Label>
              <Input
                id="discipline"
                placeholder="Architecture, Droit..."
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="director">Directeur / Directrice de thèse</Label>
            <Input
              id="director"
              placeholder="Pr. Nom Prénom"
              value={directorName}
              onChange={(e) => setDirectorName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !author.trim() || createThesis.isPending}
          >
            {createThesis.isPending ? "Création..." : "Créer la thèse"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
