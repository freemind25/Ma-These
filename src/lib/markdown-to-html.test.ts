// ═══════════════════════════════════════════════════════════════
// markdown-to-html — tests unitaires (Vitest)
// Couverture : titres, gras/italique, listes, blockquote, paragraphes,
// échappement <script>, balise hors liste blanche, htmlToPlainText.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { markdownToHtml, htmlToPlainText, escapeHtml } from "./markdown-to-html";

// ── Titres ───────────────────────────────────────────────────────────────
describe("markdownToHtml > titres", () => {
  it("convertit « ## » en h2", () => {
    expect(markdownToHtml("## Introduction")).toBe("<h2>Introduction</h2>");
  });

  it("convertit « ### » en h3", () => {
    expect(markdownToHtml("### Sous-section")).toBe("<h3>Sous-section</h3>");
  });

  it("normalise « # » en h2 et « #### » en h3 (liste blanche)", () => {
    expect(markdownToHtml("# Titre")).toBe("<h2>Titre</h2>");
    expect(markdownToHtml("#### Détail")).toBe("<h3>Détail</h3>");
  });

  it("échappe le contenu d'un titre", () => {
    expect(markdownToHtml("## Cadre <théorique>")).toBe(
      "<h2>Cadre &lt;théorique&gt;</h2>"
    );
  });
});

// ── Gras / italique ──────────────────────────────────────────────────────
describe("markdownToHtml > gras et italique", () => {
  it("convertit **gras** en strong", () => {
    expect(markdownToHtml("Un terme **important** ici.")).toBe(
      "<p>Un terme <strong>important</strong> ici.</p>"
    );
  });

  it("convertit *italique* en em", () => {
    expect(markdownToHtml("Une nuance *délicate* ici.")).toBe(
      "<p>Une nuance <em>délicate</em> ici.</p>"
    );
  });

  it("combine gras et italique imbriqués", () => {
    expect(markdownToHtml("**Cadre *analytique* retenu**")).toBe(
      "<p><strong>Cadre <em>analytique</em> retenu</strong></p>"
    );
  });
});

// ── Listes ───────────────────────────────────────────────────────────────
describe("markdownToHtml > listes", () => {
  it("convertit une liste à puces en ul/li", () => {
    expect(markdownToHtml("- Premier point\n- Deuxième point")).toBe(
      "<ul><li>Premier point</li><li>Deuxième point</li></ul>"
    );
  });

  it("convertit une liste ordonnée en ol/li", () => {
    expect(markdownToHtml("1. Premier\n2. Deuxième")).toBe(
      "<ol><li>Premier</li><li>Deuxième</li></ol>"
    );
  });

  it("ferme la liste quand un paragraphe interrompt", () => {
    const out = markdownToHtml("- Un\n- Deux\n\nSuite du texte.");
    expect(out).toBe("<ul><li>Un</li><li>Deux</li></ul>\n<p>Suite du texte.</p>");
  });

  it("applique le rendu en ligne dans les éléments de liste", () => {
    expect(markdownToHtml("- Point **clé**")).toBe("<ul><li>Point <strong>clé</strong></li></ul>");
  });
});

// ── Citations et paragraphes ─────────────────────────────────────────────
describe("markdownToHtml > blockquote et paragraphes", () => {
  it("convertit une citation en blockquote", () => {
    expect(markdownToHtml("> Citation directe.")).toBe(
      "<blockquote>Citation directe.</blockquote>"
    );
  });

  it("regroupe les lignes consécutives en un paragraphe", () => {
    expect(markdownToHtml("Ligne une\nLigne deux")).toBe(
      "<p>Ligne une Ligne deux</p>"
    );
  });

  it("sépare les blocs par des lignes vides", () => {
    const out = markdownToHtml("## Titre\n\nPremier paragraphe.");
    expect(out).toBe("<h2>Titre</h2>\n<p>Premier paragraphe.</p>");
  });
});

// ── Sécurité ─────────────────────────────────────────────────────────────
describe("markdownToHtml > échappement et liste blanche", () => {
  it("échappe <script> injecté dans le texte", () => {
    const out = markdownToHtml("Texte avec <script>alert('x')</script> piégé.");
    expect(out).toContain("&lt;script&gt;");
    expect(out).not.toContain("<script>");
  });

  it("échappe une balise hors liste blanche (<div>)", () => {
    const out = markdownToHtml("Paragraphe avec <div>une balise</div> inconnue.");
    expect(out).not.toContain("<div>");
    expect(out).toContain("&lt;div&gt;");
  });

  it("ne produit AUCUNE balise hors liste blanche", () => {
    const out = markdownToHtml(
      "## Titre\n\nTexte <iframe src=\"x\"></iframe> et <a href=\"https://x.y\">lien</a>.\n\n- puce\n\n> citation\n\n1. un"
    );
    const allowed = new Set(["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "blockquote"]);
    const tags = out.match(/<\/?[a-zA-Z][a-zA-Z0-9]*>/g) ?? [];
    expect(tags.length).toBeGreaterThan(0);
    for (const tag of tags) {
      const name = tag.replace(/[<\/>]/g, "").toLowerCase();
      expect(allowed.has(name)).toBe(true);
    }
  });

  it("échappe les esperluettes", () => {
    expect(escapeHtml("A & B < C")).toBe("A &amp; B &lt; C");
  });
});

// ── Cas limites ──────────────────────────────────────────────────────────
describe("markdownToHtml > cas limites", () => {
  it("retourne une chaîne vide pour une entrée vide ou blanche", () => {
    expect(markdownToHtml("")).toBe("");
    expect(markdownToHtml("   \n  \n")).toBe("");
  });
});

// ── htmlToPlainText ──────────────────────────────────────────────────────
describe("htmlToPlainText", () => {
  it("retire les balises et sépare les blocs par des sauts de ligne", () => {
    expect(htmlToPlainText("<h2>Titre</h2><p>Un <strong>mot</strong>.</p>")).toBe(
      "Titre\nUn mot."
    );
  });

  it("décode les entités courantes", () => {
    expect(htmlToPlainText("<p>A &amp; B &lt; C</p>")).toBe("A & B < C");
  });

  it("retourne une chaîne vide pour une entrée vide", () => {
    expect(htmlToPlainText("")).toBe("");
  });
});
