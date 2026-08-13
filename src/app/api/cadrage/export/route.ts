import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  CADRAGE_FIELDS_MAP,
  CADRAGE_SECTIONS,
  TYPE_RECHERCHE_LABELS,
  TYPE_REVUE_LABELS,
  TYPE_THESE_LABELS,
  METHODES_COLLECTE_LABELS,
  STATUT_VALIDATION_LABELS,
} from "@/data/cadrage-fields";

// ════════════════════════════════════════════════════════════════════════════════════════════
// GET /api/cadrage/export?cadrageId=xxx
// Generates a formatted text export of the cadrage
// ════════════════════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cadrageId = searchParams.get("cadrageId");

    if (!cadrageId) {
      return NextResponse.json(
        { error: "Le paramètre cadrageId est requis" },
        { status: 400 }
      );
    }

    // ── Fetch cadrage with thesis info and fields ─────────────────────────────────────────

    const cadrage = await db.thesisCadrage.findUnique({
      where: { id: cadrageId },
      include: {
        thesis: { select: { title: true, author: true } },
        fields: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!cadrage) {
      return NextResponse.json(
        { error: "Cadrage introuvable" },
        { status: 404 }
      );
    }

    // ── Build fields lookup ─────────────────────────────────────────────────────────────

    const fieldValues: Record<string, string | null> = {};
    for (const f of cadrage.fields) {
      fieldValues[f.fieldKey] = f.value;
    }

    // ── Status label ────────────────────────────────────────────────────────────────────

    const statutLabel =
      STATUT_VALIDATION_LABELS[cadrage.statut] ?? cadrage.statut;

    // ── Build text output ──────────────────────────────────────────────────────────────

    const lines: string[] = [];

    // Header
    lines.push("CADRAGE PRÉALABLE DU PROJET DE THÈSE");
    lines.push("=====================================");
    if (cadrage.thesis?.title) {
      lines.push(cadrage.thesis.title);
    } else {
      lines.push("Non renseigné");
    }

    // Meta
    const lastMod = formatDateFr(cadrage.updatedAt);
    lines.push(`Dernière modification : ${lastMod}`);
    lines.push(`Statut : ${statutLabel}`);

    if (cadrage.thesis?.author) {
      lines.push(`Doctorant : ${cadrage.thesis.author}`);
    }
    if (cadrage.label) {
      lines.push(`Intitulé du cadrage : ${cadrage.label}`);
    }
    lines.push(`Version : ${cadrage.versionNumber}`);

    lines.push("");

    // ── Sections ─────────────────────────────────────────────────────────────────────────

    for (const section of CADRAGE_SECTIONS) {
      const def = CADRAGE_FIELDS_MAP[section.fieldKey];
      if (!def) continue;

      const sectionNum = Math.floor(section.number);
      const displayNum =
        sectionNum < 10 ? ` ${sectionNum}` : `${sectionNum}`;

      lines.push(
        `── ${displayNum}. ${section.title.toUpperCase()} ${"─".repeat(
          Math.max(3, 39 - section.title.length - displayNum.length)
        )}`
      );

      // For select fields with sub-fields, format the select value + sub-fields
      if (
        def.type === "select" &&
        def.subFields &&
        def.subFields.length > 0
      ) {
        // Main select value
        const rawValue = fieldValues[section.fieldKey];
        const displayVal = formatSelectValue(section.fieldKey, rawValue);
        lines.push(displayVal);
        lines.push("");

        // Sub-fields
        for (const sub of def.subFields) {
          const subRaw = fieldValues[sub.key];
          const subDisplay = subRaw?.trim()
            ? subRaw.trim()
            : "Non renseigné";
          lines.push(`  ${sub.label} :`);
          lines.push(`    ${subDisplay}`);
          lines.push("");
        }
      } else if (section.fieldKey === "questions_recherche") {
        formatQuestionsSection(lines, fieldValues[section.fieldKey]);
      } else if (section.fieldKey === "objectifs") {
        formatObjectifsSection(lines, fieldValues[section.fieldKey]);
      } else if (section.fieldKey === "hypotheses") {
        formatHypothesesSection(lines, fieldValues[section.fieldKey]);
      } else if (section.fieldKey === "methodologie") {
        formatMethodologieSection(lines, fieldValues[section.fieldKey]);
      } else if (section.fieldKey === "mots_cles") {
        formatMotsClesSection(lines, fieldValues[section.fieldKey]);
      } else if (section.fieldKey === "statut_validation") {
        // System field — show current statut
        lines.push(statutLabel);
        lines.push("");
      } else {
        // Simple text/textarea/select value
        const rawValue = fieldValues[section.fieldKey];
        if (
          section.fieldKey === "type_recherche" ||
          section.fieldKey === "type_revue_litterature" ||
          section.fieldKey === "type_these"
        ) {
          lines.push(formatSelectValue(section.fieldKey, rawValue));
        } else {
          lines.push(
            rawValue?.trim() ? rawValue.trim() : "Non renseigné"
          );
        }
        lines.push("");
      }
    }

    // Footer
    lines.push("─".repeat(60));
    lines.push("Généré par MaTh-se · ThesisFrame");
    const generatedAt = formatDateFr(new Date());
    lines.push(`Date d'export : ${generatedAt}`);

    const textContent = lines.join("\n");

    // ── Filename ────────────────────────────────────────────────────────────────────────

    const thesisSlug = cadrage.thesis?.title
      ?.toLowerCase()
      .replace(/[^a-z0-9áàâäéèêëíìîïóòôöúùûüñç\s-]/gi, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) ?? "cadrage";
    const filename = `cadrage-${thesisSlug}-v${cadrage.versionNumber}.txt`;

    return new NextResponse(textContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch (error) {
    console.error("[GET /api/cadrage/export] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'export" },
      { status: 500 }
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════════════════════
// Formatting helpers
// ════════════════════════════════════════════════════════════════════════════════════════════

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", " à");
}

function formatSelectValue(
  fieldKey: string,
  rawValue: string | null
): string {
  if (!rawValue?.trim()) return "Non renseigné";

  const labelMaps: Record<string, Record<string, string>> = {
    type_recherche: TYPE_RECHERCHE_LABELS,
    type_revue_litterature: TYPE_REVUE_LABELS,
    type_these: TYPE_THESE_LABELS,
  };

  return labelMaps[fieldKey]?.[rawValue] ?? rawValue;
}

function safeJsonParse(raw: string | null): unknown {
  if (!raw?.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatQuestionsSection(
  lines: string[],
  raw: string | null
): void {
  const parsed = safeJsonParse(raw);

  if (!parsed || typeof parsed !== "object") {
    lines.push(raw?.trim() ? raw.trim() : "Non renseigné");
    lines.push("");
    return;
  }

  const obj = parsed as Record<string, unknown>;

  // Question principale
  const principal = obj.principal;
  lines.push(
    `Question principale : ${principal ? String(principal) : "Non renseignée"}`
  );

  // Questions secondaires
  const secondaires = Array.isArray(obj.secondaires) ? obj.secondaires : [];
  if (secondaires.length > 0) {
    lines.push("Sous-questions :");
    for (const sq of secondaires) {
      lines.push(`  - ${String(sq)}`);
    }
  } else {
    lines.push("Sous-questions : Non renseignées");
  }

  lines.push("");
}

function formatObjectifsSection(
  lines: string[],
  raw: string | null
): void {
  const parsed = safeJsonParse(raw);

  if (!parsed || typeof parsed !== "object") {
    lines.push(raw?.trim() ? raw.trim() : "Non renseigné");
    lines.push("");
    return;
  }

  const obj = parsed as Record<string, unknown>;

  // Objectif général
  const general = obj.general;
  lines.push(
    `Objectif général : ${general ? String(general) : "Non renseigné"}`
  );

  // Objectifs spécifiques
  const specifiques = Array.isArray(obj.specifiques)
    ? obj.specifiques
    : [];
  if (specifiques.length > 0) {
    lines.push("Objectifs spécifiques :");
    for (const os of specifiques) {
      lines.push(`  - ${String(os)}`);
    }
  } else {
    lines.push("Objectifs spécifiques : Non renseignés");
  }

  lines.push("");
}

function formatHypothesesSection(
  lines: string[],
  raw: string | null
): void {
  const parsed = safeJsonParse(raw);

  if (!parsed) {
    lines.push(raw?.trim() ? raw.trim() : "Non renseigné");
    lines.push("");
    return;
  }

  if (Array.isArray(parsed)) {
    if (parsed.length > 0) {
      for (const h of parsed) {
        lines.push(`  - ${String(h)}`);
      }
    } else {
      lines.push(
        "  Aucune hypothèse formulée (démarche exploratoire/inductive)"
      );
    }
  } else {
    lines.push(String(parsed));
  }

  lines.push("");
}

function formatMethodologieSection(
  lines: string[],
  raw: string | null
): void {
  const parsed = safeJsonParse(raw);

  if (!parsed || typeof parsed !== "object") {
    lines.push(raw?.trim() ? raw.trim() : "Non renseigné");
    lines.push("");
    return;
  }

  const obj = parsed as Record<string, unknown>;

  // Méthodes de collecte
  const methodes = Array.isArray(obj.methodes_collecte)
    ? obj.methodes_collecte
    : [];
  if (methodes.length > 0) {
    const labels = methodes.map(
      (m) => METHODES_COLLECTE_LABELS[String(m)] ?? String(m)
    );
    lines.push(`Méthodes de collecte : ${labels.join(", ")}`);
  } else {
    lines.push("Méthodes de collecte : Non renseignées");
  }

  // Unité d'analyse
  lines.push(
    `Unité d'analyse : ${obj.unite_analyse ? String(obj.unite_analyse) : "Non renseignée"}`
  );

  // Justification unité d'analyse
  lines.push(
    `Justification : ${obj.justification_unite_analyse ? String(obj.justification_unite_analyse) : "Non renseignée"}`
  );

  // Terrain / Corpus
  lines.push(
    `Terrain / Corpus : ${obj.terrain_corpus ? String(obj.terrain_corpus) : "Non renseigné"}`
  );

  // Limites anticipées
  lines.push(
    `Limites anticipées : ${obj.limites_anticipees ? String(obj.limites_anticipees) : "Non renseignées"}`
  );

  lines.push("");
}

function formatMotsClesSection(
  lines: string[],
  raw: string | null
): void {
  const parsed = safeJsonParse(raw);

  if (!parsed || typeof parsed !== "object") {
    lines.push(raw?.trim() ? raw.trim() : "Non renseigné");
    lines.push("");
    return;
  }

  const obj = parsed as Record<string, unknown>;

  // Mots-clés disciplinaires
  const disciplinaires = Array.isArray(obj.disciplinaires)
    ? obj.disciplinaires
    : [];
  if (disciplinaires.length > 0) {
    lines.push(
      `Mots-clés disciplinaires : ${disciplinaires.join(", ")}`
    );
  } else {
    lines.push("Mots-clés disciplinaires : Non renseignés");
  }

  // Mots-clés spécifiques
  const specifiques = Array.isArray(obj.specifiques_projet)
    ? obj.specifiques_projet
    : [];
  if (specifiques.length > 0) {
    lines.push(
      `Mots-clés spécifiques : ${specifiques.join(", ")}`
    );
  } else {
    lines.push("Mots-clés spécifiques : Non renseignés");
  }

  lines.push("");
}
