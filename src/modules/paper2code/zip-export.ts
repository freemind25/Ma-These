/**
 * Export ZIP réel du module Article → Code.
 *
 * Construit côté client (JSZip) une archive prête à l'emploi :
 *   - un fichier .py séparé par fichier généré (noms issus du plan) ;
 *   - requirements.txt (dépendances détectées pendant la planification) ;
 *   - config.yaml (configuration d'exécution) ;
 *   - README.md pré-rempli : description, structure, commandes
 *     d'installation (venv + pip), utilisation, configuration ;
 *   - docs/architecture.mmd (+ docs/sequence.mmd) — diagrammes Mermaid
 *     visualisables sur mermaid.live ;
 *   - docs/analyses/<fichier>.md — l'analyse détaillée de chaque fichier.
 *
 * Module volontairement autonome (aucune dépendance React/alias) pour
 * rester testable hors navigateur (bun run).
 */
import JSZip from "jszip";

/** Structure minimale attendue du plan (compatible PlanResult du module). */
export interface Paper2CodePlanForZip {
  overview: string;
  file_list: string[];
  class_diagram: string;
  sequence_diagram: string;
  task_descriptions: Record<string, string>;
  config_yaml: string;
  required_packages: string[];
}

/** Nom du fichier ZIP téléchargé. */
export const PAPER2CODE_ZIP_NAME = "paper2code.zip";

/* ------------------------------------------------------------------ */
/* Helpers texte                                                       */
/* ------------------------------------------------------------------ */

/** Garantit un retour à la ligne final (fichiers texte propres). */
function ensureTrailingNewline(s: string): string {
  return s.endsWith("\n") ? s : `${s}\n`;
}

/** Neutralise les séparateurs Windows et les remontées de chemin. */
function sanitizeZipPath(name: string): string {
  const cleaned = name.replace(/\\/g, "/").replace(/^\/+/, "");
  return cleaned
    .split("/")
    .filter((part) => part.length > 0 && part !== "." && part !== "..")
    .join("/");
}

/** Nom du fichier d'analyse markdown correspondant à un fichier .py. */
function mdNameFor(pyFile: string): string {
  return `${pyFile.replace(/\.py$/i, "")}.md`;
}

/** Première ligne significative d'un texte markdown (sans titres/bullets). */
function firstMeaningfulLine(text: string, maxLen = 140): string {
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (/^(#{1,6}\s|[-*+]\s|>\s|---|```)/.test(line)) continue;
    const stripped = line.replace(/^(\d+[.)]\s|`)/, "").replace(/`/g, "");
    return stripped.length > maxLen ? `${stripped.slice(0, maxLen - 1)}…` : stripped;
  }
  return "";
}

/** Tronque une chaîne sur la longueur donnée (avec ellipse). */
function truncate(s: string, maxLen: number): string {
  return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
}

/** Titre court dérivé de la vue d'ensemble : d'abord le titre markdown. */
function titleFromOverview(overview: string): string {
  for (const raw of overview.split("\n")) {
    const line = raw.trim();
    if (/^#{1,6}\s/.test(line)) {
      const title = line.replace(/^#{1,6}\s+/, "").replace(/[*_`]/g, "").trim();
      if (title) return truncate(title, 80);
    }
  }
  return firstMeaningfulLine(overview, 80) || "Projet Article → Code";
}

/** Détecte le point d'entrée le plus plausible parmi les fichiers générés. */
export function detectEntryPoint(fileList: string[]): string {
  const pyFiles = fileList.filter((f) => f.endsWith(".py"));
  const candidates = ["main.py", "run.py", "app.py", "train.py", "pipeline.py"];
  for (const candidate of candidates) {
    if (pyFiles.includes(candidate)) return candidate;
  }
  return pyFiles[0] ?? "main.py";
}

/* ------------------------------------------------------------------ */
/* README.md                                                           */
/* ------------------------------------------------------------------ */

const FENCE = "```";
const FENCE4 = "````";

function buildReadme(
  plan: Paper2CodePlanForZip,
  entryPoint: string,
): string {
  const title = titleFromOverview(plan.overview);
  const date = new Date().toLocaleDateString("fr-FR");
  const pyFiles = plan.file_list.filter((f) => f.endsWith(".py"));

  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(
    `Projet généré par **Ma Thèse** — module « Article → Code » — le ${date}.`,
  );
  lines.push("");
  lines.push("## Description du projet");
  lines.push("");
  lines.push(plan.overview.trim() || "_(vue d'ensemble indisponible)_");
  lines.push("");
  lines.push("## Structure du projet");
  lines.push("");
  for (const f of pyFiles) {
    const role = firstMeaningfulLine(plan.task_descriptions[f] ?? "");
    const isEntry = f === entryPoint;
    const roleText = role || (isEntry ? "Point d'entrée du programme." : "Voir docs/analyses.");
    lines.push(`- \`${f}\` — ${roleText}${isEntry ? " **(point d'entrée)**" : ""}`);
  }
  lines.push("");
  lines.push("## Installation");
  lines.push("");
  lines.push("Prérequis : Python 3.10+ installé sur la machine.");
  lines.push("");
  lines.push("Sous Windows (PowerShell) :");
  lines.push("");
  lines.push(`${FENCE}bash`);
  lines.push("python -m venv venv");
  lines.push("venv\\Scripts\\activate");
  lines.push("pip install -r requirements.txt");
  lines.push(FENCE);
  lines.push("");
  lines.push("Sous macOS / Linux :");
  lines.push("");
  lines.push(`${FENCE}bash`);
  lines.push("python3 -m venv venv");
  lines.push("source venv/bin/activate");
  lines.push("pip install -r requirements.txt");
  lines.push(FENCE);
  lines.push("");
  lines.push("## Utilisation");
  lines.push("");
  lines.push("1. Éditez `config.yaml` : chemins des données, hyperparamètres, options d'exécution.");
  lines.push("2. Placez les données attendues aux emplacements indiqués par `config.yaml`.");
  lines.push("3. Lancez le point d'entrée :");
  lines.push("");
  lines.push(`${FENCE}bash`);
  lines.push(`python ${entryPoint}`);
  lines.push(FENCE);
  lines.push("");
  lines.push("## Configuration");
  lines.push("");
  lines.push("Tous les paramètres d'exécution se trouvent dans `config.yaml` :");
  lines.push("");
  // Clôture 4 backticks : le YAML peut contenir des blocs ``` imbriqués.
  lines.push(`${FENCE4}yaml`);
  lines.push(plan.config_yaml.trim() || "# (configuration vide)");
  lines.push(FENCE4);
  lines.push("");
  lines.push("## Architecture");
  lines.push("");
  if (plan.class_diagram.trim()) {
    lines.push("- Diagramme de classes (Mermaid) : `docs/architecture.mmd`");
  }
  if (plan.sequence_diagram.trim()) {
    lines.push("- Diagramme de séquence (Mermaid) : `docs/sequence.mmd`");
  }
  if (plan.class_diagram.trim() || plan.sequence_diagram.trim()) {
    lines.push("- Visualisation en ligne : https://mermaid.live (collez le contenu du fichier)");
  }
  if (pyFiles.length > 0) {
    lines.push("- Analyse détaillée de chaque fichier : `docs/analyses/<fichier>.md`");
  }
  lines.push("");
  lines.push("## Avertissement");
  lines.push("");
  lines.push(
    "Ce code a été généré automatiquement par IA à partir du texte de l'article source. " +
      "Avant toute utilisation sérieuse, vérifiez :",
  );
  lines.push("");
  lines.push("- les chemins de données dans `config.yaml` ;");
  lines.push("- les hyperparamètres et équations par rapport à l'article original ;");
  lines.push("- la compatibilité des dépendances (`requirements.txt`) avec votre version de Python.");
  lines.push("");
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Construction de l'archive                                           */
/* ------------------------------------------------------------------ */

/**
 * Construit le Blob ZIP. Lève une erreur explicite si aucun code n'a été
 * généré (l'appelant l'affiche dans un toast).
 */
export async function buildPaper2CodeZip(
  plan: Paper2CodePlanForZip,
  codes: Record<string, string>,
  analyses: Record<string, string>,
): Promise<Blob> {
  const codeEntries = Object.entries(codes).filter(([name]) => name.endsWith(".py"));
  if (codeEntries.length === 0) {
    throw new Error("Aucun fichier de code généré à exporter.");
  }

  const zip = new JSZip();

  // 1) Fichiers Python séparés, à la racine du ZIP.
  for (const [name, content] of codeEntries) {
    zip.file(sanitizeZipPath(name), ensureTrailingNewline(content));
  }

  // 2) Dépendances.
  if (plan.required_packages.length > 0) {
    zip.file("requirements.txt", `${plan.required_packages.join("\n")}\n`);
  }

  // 3) Configuration.
  if (plan.config_yaml.trim()) {
    zip.file("config.yaml", ensureTrailingNewline(plan.config_yaml));
  }

  // 4) README pré-rempli (installation, utilisation, structure).
  zip.file("README.md", buildReadme(plan, detectEntryPoint(plan.file_list)));

  // 5) docs/ — diagrammes Mermaid + analyses par fichier.
  const docs: Array<[string, string]> = [];
  if (plan.class_diagram.trim()) docs.push(["architecture.mmd", plan.class_diagram]);
  if (plan.sequence_diagram.trim()) docs.push(["sequence.mmd", plan.sequence_diagram]);
  for (const [pyFile, content] of Object.entries(analyses)) {
    if (!content.trim()) continue;
    docs.push([`analyses/${mdNameFor(sanitizeZipPath(pyFile))}`, content]);
  }
  for (const [path, content] of docs) {
    zip.file(`docs/${path}`, ensureTrailingNewline(content));
  }

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

/**
 * Déclenche le téléchargement d'un Blob dans le navigateur / WebView
 * (Tauri WebView2 route les téléchargements blob vers le dossier
 * Téléchargements de l'utilisateur, comme pour l'export .txt existant).
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
