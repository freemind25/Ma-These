// ═══════════════════════════════════════
// markdown-to-html — convertisseur Markdown minimal (liste blanche)
//
// Dédié au générateur de brouillon de chapitre : la sortie IA (Markdown pur)
// est convertie en HTML insérable dans un chapitre Tiptap. Volontairement
// minimal et sûr :
//   - liste blanche stricte de balises : h2, h3, p, ul, ol, li, strong, em,
//     blockquote — aucune autre balise n'est jamais produite ;
//   - tout texte non reconnu finit en paragraphe (le texte hors liste reste
//     lisible) ;
//   - le texte est ÉCHAPPÉ avant tout rendu : une balise HTML (ou Markdown)
//     inconnue dans l'entrée apparaît comme du texte, jamais comme du HTML.
//
// Non supporté (hors liste blanche) : titres de niveau 1 (normalisés h2),
// titres >= 4 (normalisés h3), liens, images, code, tableaux, listes imbriquées.
// ═══════════════════════════════════════

/** Échappe les caractères HTML sensibles du texte brut. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Rendu en ligne : échappement puis gras (**x**) puis italique (*x*). */
function renderInline(raw: string): string {
  let out = escapeHtml(raw);
  // Gras AVANT italique : il ne reste plus de ** après le premier remplacement.
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  return out;
}

interface OpenList {
  type: "ul" | "ol";
  items: string[];
}

/**
 * Convertit un texte Markdown minimal en HTML propre (liste blanche).
 * Blocs reconnus : titres « ## » / « ### », paragraphes, listes « - » / « 1. »,
 * citations « > ». Les lignes vides séparent les blocs.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown || !markdown.trim()) return "";

  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];

  let paragraphLines: string[] = [];
  let list: OpenList | null = null;
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const text = renderInline(paragraphLines.join(" ").trim());
      if (text) blocks.push(`<p>${text}</p>`);
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (list) {
      blocks.push(
        `<${list.type}>${list.items.map((item) => `<li>${item}</li>`).join("")}</${list.type}>`
      );
      list = null;
    }
  };

  const flushQuote = () => {
    if (quoteLines.length > 0) {
      const text = renderInline(quoteLines.join(" ").trim());
      if (text) blocks.push(`<blockquote>${text}</blockquote>`);
      quoteLines = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    // Ligne vide : termine le bloc en cours.
    if (!trimmed) {
      flushAll();
      continue;
    }

    // Titres « ### » et au-delà → h3 (normalisation défensive).
    const h3 = trimmed.match(/^#{3,}\s+(.+)$/);
    if (h3) {
      flushAll();
      blocks.push(`<h3>${renderInline(h3[1].trim())}</h3>`);
      continue;
    }

    // Titres « ## » → h2 ; « # » (hors liste, normalisé) → h2.
    const h2 = trimmed.match(/^#{1,2}\s+(.+)$/);
    if (h2) {
      flushAll();
      blocks.push(`<h2>${renderInline(h2[1].trim())}</h2>`);
      continue;
    }

    // Citation « > … ».
    const quote = trimmed.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      quoteLines.push(quote[1]);
      continue;
    }

    // Liste non ordonnée « - » / « * ».
    const ulItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulItem) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(renderInline(ulItem[1].trim()));
      continue;
    }

    // Liste ordonnée « 1. » / « 1) ».
    const olItem = trimmed.match(/^\d+[.)]\s+(.+)$/);
    if (olItem) {
      flushParagraph();
      flushQuote();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(renderInline(olItem[1].trim()));
      continue;
    }

    // Tout le reste : paragraphe (le texte hors liste reste lisible).
    flushList();
    flushQuote();
    paragraphLines.push(trimmed);
  }

  flushAll();

  return blocks.join("\n");
}

/**
 * Convertit du HTML (produit par markdownToHtml ou Tiptap) en texte brut :
 * les balises de bloc deviennent des sauts de ligne, les balises restantes
 * sont retirées, les entités courantes sont décodées.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|h[1-6]|li|blockquote|div)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
