/**
 * Export ZIP réel du module Article → Code.
 *
 * Construit côté client (JSZip) une archive prête à l'emploi :
 *   - un fichier .py séparé par fichier généré (noms issus du plan) ;
 *   - requirements.txt COMPLET : fusion de la liste planifiée par l'IA et
 *     des imports réellement présents dans le code généré (scan automatique,
 *     mapping module → paquet pip). Évite le classique
 *     « ModuleNotFoundError: No module named 'torch' » après installation ;
 *   - check_env.py : vérification de l'environnement avant exécution
 *     (affiche la commande pip exacte si une dépendance manque) ;
 *   - run.bat (Windows) et run.sh (macOS/Linux) : scripts tout-en-un
 *     venv + dépendances + lancement, pour éviter les étapes sautées ;
 *   - config.yaml (configuration d'exécution) ;
 *   - README.md pré-rempli : description, structure, installation
 *     (automatique + PowerShell + Git Bash + macOS/Linux), dépannage ;
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
/* Analyse des imports Python                                          */
/* ------------------------------------------------------------------ */

/**
 * Extrait les modules racine importés par un fichier Python :
 * `import torch.nn as nn` → torch ; `from collections import X` →
 * collections ; `from .models import Y` → ignoré (import relatif).
 */
export function extractPyImports(code: string): Set<string> {
  const mods = new Set<string>();
  for (const raw of code.split("\n")) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^import\s+(.+?)(?:\s*#.*)?$/))) {
      for (const part of m[1].split(",")) {
        const name = part
          .trim()
          .replace(/\s+as\s+\w+$/, "")
          .split(".")[0]
          .trim();
        if (name) mods.add(name);
      }
    } else if ((m = line.match(/^from\s+([.\w]+)\s+import\b/))) {
      const mod = m[1];
      if (mod.startsWith(".")) continue; // import relatif → module local
      mods.add(mod.split(".")[0]);
    }
  }
  mods.delete("");
  return mods;
}

/**
 * Modules standards de la bibliothèque Python (jamais dans requirements).
 */
const STDLIB_MODULES = new Set([
  "__future__", "abc", "aifc", "antigravity", "argparse", "array", "ast",
  "asynchat", "asyncio", "atexit", "audioop", "base64", "bdb", "binascii",
  "binhex", "bisect", "builtins", "bz2", "calendar", "cgi", "cgitb", "chunk",
  "cmath", "cmd", "code", "codecs", "codeop", "collections", "colorsys",
  "compileall", "concurrent", "configparser", "contextlib", "contextvars",
  "copy", "copyreg", "cProfile", "crypt", "csv", "ctypes", "curses",
  "dataclasses", "datetime", "dbm", "decimal", "difflib", "dis", "distutils",
  "doctest", "email", "encodings", "ensurepip", "enum", "errno",
  "faulthandler", "filecmp", "fileinput", "ftplib", "functools", "gc",
  "getopt", "getpass", "gettext", "glob", "graphlib", "gzip", "hashlib",
  "heapq", "hmac", "html", "http", "imaplib", "imghdr", "imp", "importlib",
  "inspect", "io", "ipaddress", "itertools", "json", "keyword", "linecache",
  "locale", "logging", "lzma", "mailbox", "mailcap", "marshal", "math",
  "mimetypes", "mmap", "modulenotfounderror", "multiprocessing", "netrc",
  "nis", "nntplib", "numbers", "operator", "optparse", "os", "ossaudiodev",
  "pathlib", "pdb", "pickle", "pickletools", "pipes", "pkg_resources",
  "pkgutil", "platform", "plistlib", "poplib", "posixpath", "pprint",
  "profile", "pstats", "pty", "pwd", "py_compile", "pyclbr", "pydoc",
  "queue", "quopri", "random", "re", "readline", "reprlib", "resource",
  "rlcompleter", "runpy", "sched", "secrets", "select", "selectors",
  "shelve", "shlex", "shutil", "signal", "site", "smtpd", "smtplib",
  "sndhdr", "socket", "socketserver", "sqlite3", "ssl", "stat", "statistics",
  "string", "stringprep", "struct", "subprocess", "sunau", "symtable", "sys",
  "sysconfig", "syslog", "tabnanny", "tarfile", "telnetlib", "tempfile",
  "termios", "textwrap", "this", "threading", "time", "timeit", "tkinter",
  "token", "tokenize", "trace", "traceback", "tracemalloc", "tty", "turtle",
  "types", "typing", "unicodedata", "unittest", "urllib", "uu", "uuid",
  "venv", "warnings", "wave", "weakref", "webbrowser", "winreg", "winsound",
  "wsgiref", "xdrlib", "xml", "xmlrpc", "zipapp", "zipfile", "zipimport",
  "zlib", "zoneinfo", "setuptools", "pip",
]);

/**
 * Mapping module Python → nom du paquet pip à installer (paquets
 * tiers dont le nom d'import diffère du nom pip, ou noms canoniques
 * que l'on veut garantir). Les noms absents de ce mapping sont ajoutés
 * tels quels en section « à vérifier ».
 */
const MODULE_TO_PIP: Record<string, string> = {
  // Deep learning
  torch: "torch",
  torchvision: "torchvision",
  torchaudio: "torchaudio",
  pytorch_lightning: "pytorch-lightning",
  pytorch_msssim: "pytorch-msssim",
  efficientnet_pytorch: "efficientnet-pytorch",
  pretrainedmodels: "pretrainedmodels",
  timm: "timm",
  kornia: "kornia",
  einops: "einops",
  safetensors: "safetensors",
  transformers: "transformers",
  datasets: "datasets",
  tokenizers: "tokenizers",
  sentencepiece: "sentencepiece",
  accelerate: "accelerate",
  peft: "peft",
  huggingface_hub: "huggingface_hub",
  tensorflow: "tensorflow",
  keras: "keras",
  jax: "jax",
  flax: "flax",
  // Sciences / données
  numpy: "numpy",
  scipy: "scipy",
  pandas: "pandas",
  matplotlib: "matplotlib",
  seaborn: "seaborn",
  plotly: "plotly",
  bokeh: "bokeh",
  sklearn: "scikit-learn",
  skimage: "scikit-image",
  statsmodels: "statsmodels",
  sympy: "sympy",
  networkx: "networkx",
  h5py: "h5py",
  numba: "numba",
  joblib: "joblib",
  dill: "dill",
  cloudpickle: "cloudpickle",
  // Vision
  cv2: "opencv-python",
  PIL: "Pillow",
  albumentations: "albumentations",
  open3d: "open3d",
  trimesh: "trimesh",
  // Texte / NLP
  nltk: "nltk",
  spacy: "spacy",
  gensim: "gensim",
  textblob: "textblob",
  wordcloud: "wordcloud",
  bs4: "beautifulsoup4",
  lxml: "lxml",
  regex: "regex",
  inflect: "inflect",
  // I/O et formats
  yaml: "PyYAML",
  jsonschema: "jsonschema",
  jinja2: "Jinja2",
  markupsafe: "MarkupSafe",
  soundfile: "soundfile",
  librosa: "librosa",
  audioread: "audioread",
  pywt: "PyWavelets",
  wavfile: "scipy",
  // ML classique / optimisation
  xgboost: "xgboost",
  lightgbm: "lightgbm",
  catboost: "catboost",
  optuna: "optuna",
  hyperopt: "hyperopt",
  ray: "ray",
  gym: "gym",
  gymnasium: "gymnasium",
  // Suivi / expérimentation
  tensorboard: "tensorboard",
  wandb: "wandb",
  mlflow: "mlflow",
  // Réseau / web
  requests: "requests",
  httpx: "httpx",
  aiohttp: "aiohttp",
  websocket: "websocket-client",
  websockets: "websockets",
  urllib3: "urllib3",
  dotenv: "python-dotenv",
  dateutil: "python-dateutil",
  slugify: "python-slugify",
  // Utilitaires généraux
  tqdm: "tqdm",
  psutil: "psutil",
  click: "click",
  rich: "rich",
  typer: "typer",
  pydantic: "pydantic",
  attr: "attrs",
  attrs: "attrs",
  colorama: "colorama",
  termcolor: "termcolor",
  tabulate: "tabulate",
  prettytable: "prettytable",
  humanize: "humanize",
  typing_extensions: "typing_extensions",
  IPython: "ipython",
  pytest: "pytest",
  ffmpeg: "ffmpeg-python",
  scenedetect: "scenedetect",
};

/** Reverse mapping pip → nom de module pour check_env.py. */
const PIP_TO_MODULE: Record<string, string> = {
  "opencv-python": "cv2",
  "opencv-contrib-python": "cv2",
  "opencv-python-headless": "cv2",
  "scikit-learn": "sklearn",
  "scikit-image": "skimage",
  pillow: "PIL",
  pyyaml: "yaml",
  "beautifulsoup4": "bs4",
  "python-dateutil": "dateutil",
  "python-dotenv": "dotenv",
  "python-slugify": "slugify",
  "pytorch-lightning": "pytorch_lightning",
  "pytorch-msssim": "pytorch_msssim",
  "efficientnet-pytorch": "efficientnet_pytorch",
  pywavelets: "pywt",
  typing_extensions: "typing_extensions",
  ipython: "IPython",
  attrs: "attr",
  "ffmpeg-python": "ffmpeg",
  jinja2: "jinja2",
  markupsafe: "markupsafe",
};

/** Nom de base d'une exigence pip : `torch>=2.0 ; py<3.12` → `torch`. */
function pipBaseName(requirement: string): string {
  const m = requirement.trim().match(/^([A-Za-z0-9][A-Za-z0-9._-]*)/);
  return m ? m[1] : requirement.trim();
}

/** Clé de déduplication normalisée (PyPI ignore cas, - _ .). */
function pipKey(name: string): string {
  return name.toLowerCase().replace(/[-_.]+/g, "");
}

/** Nom de module Python à importer pour vérifier un paquet pip. */
function pipToImportName(pipName: string): string {
  const mapped = PIP_TO_MODULE[pipName.toLowerCase()];
  if (mapped) return mapped;
  return pipName.replace(/-/g, "_");
}

/** Résultat de la fusion plan + imports détectés. */
export interface MergedRequirements {
  /** Exigences à installer (liste du plan + imports tiers identifiés). */
  pinned: string[];
  /** Imports tiers non identifiés — proposés en commentaires. */
  suggested: string[];
}

/**
 * Fusionne les dépendances planifiées par l'IA (`plan.required_packages`)
 * avec les imports réellement présents dans le code généré. Les imports
 * tiers reconnus manquants sont ajoutés ; les inconnus sont proposés en
 * commentaires (pour ne jamais faire échouer `pip install` sur un faux nom).
 */
export function mergeRequirements(
  plan: Pick<Paper2CodePlanForZip, "required_packages" | "file_list">,
  codes: Record<string, string>,
): MergedRequirements {
  // Modules locaux : tout nom qui correspond à un fichier .py généré.
  const localModules = new Set<string>();
  for (const f of [...plan.file_list, ...Object.keys(codes)]) {
    if (f.endsWith(".py")) localModules.add(f.replace(/\.py$/i, ""));
  }

  // 1) Liste planifiée par l'IA (préservée telle quelle, versions comprises).
  const pinned: string[] = [];
  const seen = new Set<string>();
  for (const req of plan.required_packages ?? []) {
    const reqTrim = req.trim();
    if (!reqTrim || reqTrim.startsWith("#")) continue;
    const base = pipBaseName(reqTrim);
    if (!base) continue;
    if (STDLIB_MODULES.has(base) || localModules.has(base)) continue;
    if (seen.has(pipKey(base))) continue;
    seen.add(pipKey(base));
    pinned.push(reqTrim);
  }

  // 2) Imports réels du code généré.
  const imported = new Set<string>();
  for (const content of Object.values(codes)) {
    for (const mod of extractPyImports(content)) imported.add(mod);
  }

  const suggested: string[] = [];
  for (const mod of [...imported].sort()) {
    if (STDLIB_MODULES.has(mod) || localModules.has(mod)) continue;
    const pipName = MODULE_TO_PIP[mod];
    if (!pipName) {
      // Inconnu : proposé en commentaire (jamais de pip install cassé).
      if (!seen.has(pipKey(mod))) {
        seen.add(pipKey(mod));
        suggested.push(mod);
      }
      continue;
    }
    if (seen.has(pipKey(pipName))) continue;
    seen.add(pipKey(pipName));
    pinned.push(pipName);
  }

  return { pinned, suggested };
}

/* ------------------------------------------------------------------ */
/* Générateurs de fichiers                                             */
/* ------------------------------------------------------------------ */

/** Construit le contenu de requirements.txt (toujours écrit). */
export function buildRequirementsTxt(merged: MergedRequirements): string {
  const lines: string[] = [
    "# Dépendances du projet — généré automatiquement par Ma Thèse.",
    "# Installation : pip install -r requirements.txt",
    "# (liste planifiée par l'IA + imports détectés dans le code généré)",
  ];
  if (merged.pinned.length > 0) {
    lines.push("");
    lines.push(...merged.pinned);
  }
  if (merged.suggested.length > 0) {
    lines.push("");
    lines.push("# Modules importés non identifiés — décommentez si nécessaire :");
    for (const mod of merged.suggested) lines.push(`# ${mod}`);
  }
  return `${lines.join("\n")}\n`;
}

/** Génère check_env.py : vérifie chaque dépendance avant le lancement. */
export function buildCheckEnvPy(merged: MergedRequirements): string {
  const entries = merged.pinned
    .map((req) => {
      const base = pipBaseName(req);
      return `    ("${pipToImportName(base).replace(/"/g, '\\"')}", "${base.replace(/"/g, '\\"')}"),`;
    })
    .join("\n");
  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vérifie que toutes les dépendances sont installées avant de lancer le projet.

Usage :
    python check_env.py

Si des dépendances manquent, la commande pip exacte est affichée.
"""

import importlib
import sys

# (nom du module Python à importer, nom du paquet pip)
REQUIRED = [
${entries || "    # (aucune dépendance planifiée)"}
]


def main() -> int:
    missing = []
    for module_name, pip_name in REQUIRED:
        try:
            importlib.import_module(module_name)
        except Exception:
            missing.append(pip_name)
    if missing:
        print("Dependances manquantes : " + ", ".join(missing))
        print()
        print("Installez-les avec :")
        print()
        print("    pip install " + " ".join(missing))
        print()
        print("Puis relancez : python check_env.py")
        return 1
    print("OK : toutes les dependances sont installees.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
`;
}

/** Génère run.bat (Windows) : venv + dépendances + lancement automatique. */
export function buildRunBat(entryPoint: string): string {
  return `@echo off
setlocal
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
    echo [ERREUR] Python introuvable dans le PATH.
    echo Installez Python depuis https://www.python.org/downloads/
    echo en cochant "Add python.exe to PATH", puis relancez run.bat.
    pause
    exit /b 1
)

if not exist "venv\\Scripts\\python.exe" (
    echo [1/3] Creation de l'environnement virtuel...
    python -m venv venv
)

call "venv\\Scripts\\activate.bat"
python -m pip install --upgrade pip >nul

echo [2/3] Installation des dependances (plusieurs minutes possibles)...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERREUR] L'installation des dependances a echoue.
    echo Lisez les messages ci-dessus, corrigez puis relancez run.bat.
    pause
    exit /b 1
)

python check_env.py
if errorlevel 1 (
    pause
    exit /b 1
)

echo [3/3] Lancement : python ${entryPoint}
python ${entryPoint}
pause
`;
}

/** Génère run.sh (macOS/Linux) : venv + dépendances + lancement. */
export function buildRunSh(entryPoint: string): string {
  return `#!/usr/bin/env bash
# Lancement automatique : environnement virtuel + dépendances + programme.
set -e
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
    echo "[ERREUR] Python 3 introuvable. Installez-le puis relancez ce script."
    exit 1
fi

if [ ! -x "venv/bin/python" ]; then
    echo "[1/3] Création de l'environnement virtuel..."
    python3 -m venv venv
fi

source venv/bin/activate
python -m pip install --upgrade pip

echo "[2/3] Installation des dépendances (plusieurs minutes possibles)..."
pip install -r requirements.txt

python check_env.py

echo "[3/3] Lancement : python ${entryPoint}"
python ${entryPoint}
`;
}

/* ------------------------------------------------------------------ */
/* README.md                                                           */
/* ------------------------------------------------------------------ */

const FENCE = "```";
const FENCE4 = "````";

function buildReadme(
  plan: Paper2CodePlanForZip,
  codes: Record<string, string>,
): string {
  const title = titleFromOverview(plan.overview);
  const date = new Date().toLocaleDateString("fr-FR");
  const entryPoint = detectEntryPoint([...Object.keys(codes), ...plan.file_list]);
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
  lines.push(`- \`requirements.txt\` — dépendances (liste planifiée + imports détectés)`);
  lines.push(`- \`check_env.py\` — vérification des dépendances avant lancement`);
  lines.push(`- \`run.bat\` / \`run.sh\` — lancement automatique (voir ci-dessous)`);
  if (plan.config_yaml.trim()) {
    lines.push(`- \`config.yaml\` — configuration d'exécution`);
  }
  lines.push("");
  lines.push("## Installation");
  lines.push("");
  lines.push("Prérequis : [Python 3.10+](https://www.python.org/downloads/) installé.");
  lines.push("");
  lines.push("**Méthode automatique (recommandée)** — tout est fait pour vous :");
  lines.push("");
  lines.push("- **Windows** : double-cliquez sur `run.bat`");
  lines.push("- **macOS / Linux** : `./run.sh` dans un terminal");
  lines.push("");
  lines.push("Le script crée l'environnement virtuel, installe les dépendances,");
  lines.push("les vérifie (`check_env.py`) puis lance le programme.");
  lines.push("");
  lines.push("**Méthode manuelle — Windows (PowerShell) :**");
  lines.push("");
  lines.push(`${FENCE}bash`);
  lines.push("python -m venv venv");
  lines.push("venv\\Scripts\\activate");
  lines.push("pip install -r requirements.txt");
  lines.push("python check_env.py");
  lines.push(`python ${entryPoint}`);
  lines.push(FENCE);
  lines.push("");
  lines.push("**Méthode manuelle — Windows (Git Bash) :**");
  lines.push("");
  lines.push(`${FENCE}bash`);
  lines.push("python -m venv venv");
  lines.push("source venv/Scripts/activate");
  lines.push("pip install -r requirements.txt");
  lines.push("python check_env.py");
  lines.push(`python ${entryPoint}`);
  lines.push(FENCE);
  lines.push("");
  lines.push("**Méthode manuelle — macOS / Linux :**");
  lines.push("");
  lines.push(`${FENCE}bash`);
  lines.push("python3 -m venv venv");
  lines.push("source venv/bin/activate");
  lines.push("pip install -r requirements.txt");
  lines.push("python check_env.py");
  lines.push(`python ${entryPoint}`);
  lines.push(FENCE);
  lines.push("");
  lines.push(
    "Si le dossier `venv` existe déjà, sautez la création et passez " +
      "directement à l'activation.",
  );
  lines.push("");
  lines.push(
    "> **Important** : lancez le programme UNIQUEMENT après que " +
      "`pip install -r requirements.txt` s'est terminé SANS ERREUR. " +
      "La première installation peut durer plusieurs minutes (torch, " +
      "tensorflow… téléchargent plusieurs centaines de Mo).",
  );
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
  lines.push("## Dépannage");
  lines.push("");
  lines.push(
    "- **`ModuleNotFoundError: No module named 'X'`** : la dépendance `X` " +
      "n'est pas installée dans l'environnement actif. Vérifiez que votre " +
      "prompt affiche `(venv)` (sinon refaites l'activation), relancez " +
      "`pip install -r requirements.txt`, contrôlez avec `python check_env.py`. " +
      "Si `X` manque toujours : `pip install X`.",
  );
  lines.push(
    "- **Installation lente ou interrompue** : normal pour les paquets lourds " +
      "(torch, tensorflow) ; relancez la commande, elle reprend.",
  );
  lines.push(
    "- **`pip install` échoue sur un paquet précis** : vérifiez votre version " +
      "de Python (3.10+ requis) et faites `python -m pip install --upgrade pip` " +
      "avant de relancer.",
  );
  lines.push(
    "- **Erreur métier au lancement (ex. `No cities specified for analysis`)** : " +
      "bonne nouvelle, le programme s'est lancé — il attend un champ de " +
      "`config.yaml` encore vide (liste de villes, chemins de données…). " +
      "Ouvrez `config.yaml` (voir la section Configuration), remplissez les " +
      "champs requis et relancez. Le message d'erreur indique normalement " +
      "la clé exacte à compléter.",
  );
  lines.push(
    "- **`Permission denied` pendant `python -m venv venv`** : le dossier " +
      "`venv` existe déjà (étape à sauter) ou est verrouillé par un " +
      "antivirus/OneDrive ou un autre terminal ; passez directement à " +
      "l'activation.",
  );
  lines.push(
    "- **Autre erreur à l'exécution** : code généré par IA — lisez " +
      "`docs/analyses/<fichier>.md` pour comprendre puis corriger.",
  );
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

  const entryPoint = detectEntryPoint([...Object.keys(codes), ...plan.file_list]);
  const merged = mergeRequirements(plan, codes);

  const zip = new JSZip();

  // 1) Fichiers Python séparés, à la racine du ZIP.
  for (const [name, content] of codeEntries) {
    zip.file(sanitizeZipPath(name), ensureTrailingNewline(content));
  }

  // 2) Dépendances — TOUJOURS écrit, fusion plan + imports détectés.
  zip.file("requirements.txt", buildRequirementsTxt(merged));

  // 3) Vérification d'environnement + scripts de lancement automatiques.
  zip.file("check_env.py", buildCheckEnvPy(merged));
  zip.file("run.bat", buildRunBat(entryPoint));
  zip.file("run.sh", buildRunSh(entryPoint), { unixPermissions: "755" });

  // 4) Configuration.
  if (plan.config_yaml.trim()) {
    zip.file("config.yaml", ensureTrailingNewline(plan.config_yaml));
  }

  // 5) README pré-rempli (installation, utilisation, structure, dépannage).
  zip.file("README.md", buildReadme(plan, codes));

  // 6) docs/ — diagrammes Mermaid + analyses par fichier.
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
