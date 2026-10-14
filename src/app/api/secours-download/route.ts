/**
 * Téléchargement propriétaire des sauvegardes de secours (Étape 1, vague 50).
 *
 * Objet : permettre au propriétaire de récupérer, depuis son interface
 * (panneau d'aperçu), les TROIS fichiers existants de
 * /home/sync/upload/secours-optionB-20261013/ — sans SSH, sans accès
 * au système de fichiers interne.
 *
 * Garanties :
 * - LECTURE PURE : les octets sont diffusés à la volée depuis les
 *   originaux (createReadStream). Aucune copie, aucun déplacement,
 *   aucune modification, aucune recréation, aucune archive nouvelle.
 * - WHITELIST FERMÉE : seuls les trois noms exacts ci-dessous sont
 *   servis. Aucun paramètre ne peut élargir le chemin (pas de
 *   construction de chemin depuis l'entrée utilisateur).
 * - AUCUNE MESURE : les SHA-256 affichés sont ceux consignés à
 *   l'Étape 1 (SHA256SUMS.txt, vague 50). Aucun hachage n'est
 *   recalculé par cet endpoint ; la validation finale reste la
 *   vérification locale du propriétaire.
 * - Gel respecté : zéro opération Git, zéro toucher aux bases,
 *   sauvegardes, preuves d'audit, worklog.
 */

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BASE_DIR = "/home/sync/upload/secours-optionB-20261013";

type SecoursEntry = {
  /** Nom exact du fichier (sert aussi de nom de téléchargement). */
  name: string;
  /** Chemin absolu fixe — jamais dérivé de l'entrée utilisateur. */
  path: string;
  /** SHA-256 consigné à l'Étape 1 (vague 50), non recalculé ici. */
  sha256: string | null;
  contentType: string;
  /** Rôle descriptif affiché sur la page d'index. */
  role: string;
};

const WHITELIST: SecoursEntry[] = [
  {
    name: "SHA256SUMS.txt",
    path: `${BASE_DIR}/SHA256SUMS.txt`,
    sha256: null,
    contentType: "text/plain; charset=utf-8",
    role: "Manifeste des empreintes attendues (2 lignes).",
  },
  {
    name: "etat-travail-20261013T062446Z.tar.gz",
    path: `${BASE_DIR}/etat-travail-20261013T062446Z.tar.gz`,
    sha256: "b3dd6369bf02cbdd017993c9b597cae4f317589606025c196bba2d2dea47d24d",
    contentType: "application/gzip",
    role: "État de travail (worklog, audit/baseline docs 00-64 + preuves, db/custom.db, db/urbanisme-test.db) — 644 entrées.",
  },
  {
    name: "git-magasin-20261013T062446Z.tar.gz",
    path: `${BASE_DIR}/git-magasin-20261013T062446Z.tar.gz`,
    sha256: "30d8d12148a43e1339607aa93d88d86bad9cfb2123e43ecddf52065c7a5bc1f9",
    contentType: "application/gzip",
    role: "Magasin Git complet (.git : refs, logs, 2 packs) — 3 121 entrées.",
  },
];

function findEntry(name: string | null): SecoursEntry | undefined {
  if (!name) return undefined;
  return WHITELIST.find((e) => e.name === name);
}

function baseHeaders(entry: SecoursEntry, size: number): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": entry.contentType,
    "content-length": String(size),
    "content-disposition": `attachment; filename="${entry.name}"`,
    "cache-control": "no-store",
  };
  if (entry.sha256) {
    headers["x-secours-sha256"] = entry.sha256;
  }
  return headers;
}

async function buildIndexHtml(): Promise<string> {
  const rows = await Promise.all(
    WHITELIST.map(async (entry) => {
      let sizeLabel = "taille indisponible";
      try {
        const st = await stat(entry.path);
        if (st.isFile()) {
          sizeLabel = `${st.size.toLocaleString("fr-FR")} octets`;
        }
      } catch {
        sizeLabel = "INTRUVABLE sur le canal (ne pas télécharger)";
      }
      const shaCell = entry.sha256
        ? `<code>${entry.sha256}</code>`
        : "<em>manifeste lui-même (contrôle à l'œil)</em>";
      return `
        <tr>
          <td><a href="/api/secours-download?file=${encodeURIComponent(entry.name)}">${entry.name}</a></td>
          <td>${sizeLabel}</td>
          <td>${shaCell}</td>
          <td>${entry.role}</td>
        </tr>`;
    }),
  );

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Secours Option B — téléchargement propriétaire</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 60rem; padding: 0 1rem; color: #1c1917; }
    h1 { font-size: 1.25rem; } h2 { font-size: 1rem; margin-top: 1.5rem; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d6d3d1; padding: 0.5rem; text-align: left; vertical-align: top; font-size: 0.875rem; }
    th { background: #f5f5f4; }
    code { word-break: break-all; font-size: 0.75rem; background: #f5f5f4; padding: 0.1rem 0.25rem; }
    pre { background: #f5f5f4; padding: 0.75rem; overflow-x: auto; font-size: 0.8rem; }
    .note { background: #fefce8; border: 1px solid #fde047; padding: 0.75rem; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Secours Option B — Étape 1 (2026-10-13T06:24:46Z) — téléchargement propriétaire</h1>
  <p class="note">
    Ces liens servent en <strong>lecture pure</strong> les originaux de
    <code>${BASE_DIR}/</code> — aucune copie intermédiaire n'est créée, aucun fichier
    n'est modifié. Les empreintes affichées sont celles <strong>consignées à l'Étape 1</strong> ;
    aucune mesure n'a été relancée. La validation finale = votre vérification locale des SHA-256.
  </p>
  <table>
    <thead><tr><th>Fichier (cliquer = télécharger)</th><th>Taille</th><th>SHA-256 consigné</th><th>Contenu</th></tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table>
  <h2>Vérification sur votre ordinateur Windows (PowerShell)</h2>
  <pre>Get-FileHash .\\etat-travail-20261013T062446Z.tar.gz -Algorithm SHA256
Get-FileHash .\\git-magasin-20261013T062446Z.tar.gz -Algorithm SHA256
# ou :
certutil -hashfile etat-travail-20261013T062446Z.tar.gz SHA256
certutil -hashfile git-magasin-20261013T062446Z.tar.gz SHA256</pre>
  <p>
    Comparez aux valeurs du tableau ci-dessus (identiques à
    <code>SHA256SUMS.txt</code>). En cas de téléchargement interrompu :
    retéléchargez le fichier concerné et recontrôlez — l'arbitre final est le SHA-256 local.
  </p>
</body>
</html>`;
}

async function handle(request: NextRequest): Promise<Response> {
  const requested = request.nextUrl.searchParams.get("file");

  if (requested === null) {
    // Pas de paramètre : page d'index des trois fichiers autorisés.
    return new Response(await buildIndexHtml(), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const entry = findEntry(requested);
  if (!entry) {
    return Response.json(
      { error: "paramètre file inconnu", autorisés: WHITELIST.map((e) => e.name) },
      { status: 400 },
    );
  }

  let size: number;
  try {
    const st = await stat(entry.path);
    if (!st.isFile()) throw new Error("pas un fichier régulier");
    size = st.size;
  } catch {
    return Response.json(
      { error: "archive introuvable sur le canal OSS", path: `${BASE_DIR}/${entry.name}` },
      { status: 404 },
    );
  }

  const headers = baseHeaders(entry, size);
  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  // Lecture pure : flux direct depuis l'original, octet pour octet.
  const webStream = Readable.toWeb(
    createReadStream(entry.path),
  ) as unknown as ReadableStream<Uint8Array>;
  return new Response(webStream, { status: 200, headers });
}

export async function GET(request: NextRequest): Promise<Response> {
  return handle(request);
}

export async function HEAD(request: NextRequest): Promise<Response> {
  return handle(request);
}
