import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  PageBreak,
  TableOfContents,
  Header,
  Footer,
  PageNumber,
  SectionType,
  FileChild,
  ParagraphChild,
} from 'docx';
import { db } from '@/lib/db';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface ExportDocxRequest {
  thesisId: string;
  options: {
    includeCover: boolean;
    includeToc: boolean;
    includeReferences: boolean;
    lineSpacing: '1.15' | '1.5' | '2.0';
    fontSize: '11' | '12' | '13';
    margins: 'normal' | 'narrow' | 'wide';
    headerText: string;
    includePageNumbers: boolean;
  };
}

interface MarginPreset {
  top: number;
  bottom: number;
  left: number;
  right: number;
  header: number;
  footer: number;
}

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════

const MARGINS: Record<string, MarginPreset> = {
  normal: { top: 1440, bottom: 1440, left: 1701, right: 1417, header: 850, footer: 992 },
  narrow: { top: 1080, bottom: 1080, left: 1080, right: 1080, header: 720, footer: 720 },
  wide: { top: 1800, bottom: 1800, left: 2160, right: 1800, header: 1080, footer: 1080 },
};

const FONT_SIZES: Record<string, number> = { '11': 22, '12': 24, '13': 26 };
const LINE_SPACINGS: Record<string, number> = { '1.15': 276, '1.5': 360, '2.0': 480 };

const BODY_FONT = 'Times New Roman';
const INDENT_FIRST_LINE = 480;

// ═══════════════════════════════════════════════════════════════
// HTML → Paragraphs Parser
// ═══════════════════════════════════════════════════════════════

/**
 * Strips all HTML tags and decodes entities, returning plain text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .trim();
}

/**
 * Parse inline HTML (<strong>, <b>, <em>, <i>, <a>, <br>) into TextRun arrays.
 */
function parseInlineRuns(
  html: string,
  baseRunOpts: {
    font?: { name: string; ascii: string };
    size?: number;
    color?: string;
    bold?: boolean;
    italics?: boolean;
  } = {}
): TextRun[] {
  const runs: TextRun[] = [];

  // Pre-convert <br> to a sentinel character for reliable splitting
  const preprocessed = html.replace(/<br\s*\/?/gi, '\n');

  // Split by inline tags while preserving the tags for processing
  const parts = preprocessed.split(/(<\/?[^>]+>)/g);

  let isBold = false;
  let isItalic = false;
  let currentText = '';

  const flushText = () => {
    const cleaned = currentText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&rsquo;/g, '\u2019')
      .replace(/&lsquo;/g, '\u2018')
      .replace(/&rdquo;/g, '\u201D')
      .replace(/&ldquo;/g, '\u201C')
      .replace(/&ndash;/g, '\u2013')
      .replace(/&mdash;/g, '\u2014');

    if (!cleaned) {
      currentText = '';
      return;
    }

    // Handle \n (from <br>) as line break runs
    if (cleaned.includes('\n')) {
      const lines = cleaned.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (i > 0) {
          runs.push(
            new TextRun({
              font: baseRunOpts.font,
              size: baseRunOpts.size,
              color: baseRunOpts.color,
              bold: isBold || baseRunOpts.bold,
              italics: isItalic || baseRunOpts.italics,
              break: 1,
            })
          );
        }
        if (lines[i]) {
          runs.push(
            new TextRun({
              font: baseRunOpts.font,
              size: baseRunOpts.size,
              color: baseRunOpts.color,
              text: lines[i],
              bold: isBold || baseRunOpts.bold,
              italics: isItalic || baseRunOpts.italics,
            })
          );
        }
      }
    } else {
      runs.push(
        new TextRun({
          font: baseRunOpts.font,
          size: baseRunOpts.size,
          color: baseRunOpts.color,
          text: cleaned,
          bold: isBold || baseRunOpts.bold,
          italics: isItalic || baseRunOpts.italics,
        })
      );
    }

    currentText = '';
  };

  for (const part of parts) {
    const closeTagMatch = part.match(/^<\/(strong|b|em|i|a)>$/i);
    const openTagMatch = part.match(/^<(strong|b|em|i)(?:\s[^>]*)?>$/i);
    const brMatch = part.match(/^<br\s*\/?/i); // shouldn't happen after pre-processing

    if (brMatch) {
      flushText();
      runs.push(
        new TextRun({
          font: baseRunOpts.font,
          size: baseRunOpts.size,
          break: 1,
        })
      );
    } else if (closeTagMatch) {
      const tag = closeTagMatch[1].toLowerCase();
      flushText();
      if (tag === 'strong' || tag === 'b') isBold = false;
      if (tag === 'em' || tag === 'i') isItalic = false;
    } else if (openTagMatch) {
      const tag = openTagMatch[1].toLowerCase();
      flushText();
      if (tag === 'strong' || tag === 'b') isBold = true;
      if (tag === 'em' || tag === 'i') isItalic = true;
    } else if (part.match(/^<a\s/i) || part.match(/^<\/a>$/i)) {
      // Skip anchor tags — text content will be captured
      flushText();
    } else {
      // Plain text
      currentText += part;
    }
  }

  flushText();
  return runs;
}

interface ParsedBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet' | 'numbered' | 'blockquote' | 'empty';
  content: string;
}

/**
 * Parse Tiptap HTML into structured blocks for DOCX conversion.
 */
function parseHtmlToBlocks(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  if (!html || !html.trim()) return blocks;

  // Normalize: replace </p> etc. with newlines, then split into blocks
  const normalized = html
    .replace(/<br\s*\/?/gi, '\n')
    .replace(/\n{2,}/g, '\n');

  // Split into top-level blocks using regex
  const blockRegex = /<(h[1-3]|p|blockquote|ul|ol|li)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(normalized)) !== null) {
    const tag = match[1].toLowerCase();
    const inner = match[2].trim();

    if (!inner) {
      blocks.push({ type: 'empty', content: '' });
      continue;
    }

    switch (tag) {
      case 'h1':
        blocks.push({ type: 'heading1', content: stripHtml(inner) });
        break;
      case 'h2':
        blocks.push({ type: 'heading2', content: stripHtml(inner) });
        break;
      case 'h3':
        blocks.push({ type: 'heading3', content: stripHtml(inner) });
        break;
      case 'p':
        blocks.push({ type: 'paragraph', content: inner });
        break;
      case 'blockquote':
        blocks.push({ type: 'blockquote', content: stripHtml(inner) });
        break;
      case 'ul':
      case 'ol': {
        const listType = tag === 'ol' ? ('numbered' as const) : ('bullet' as const);
        const liRegex = /<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/gi;
        let liMatch: RegExpExecArray | null;
        while ((liMatch = liRegex.exec(inner)) !== null) {
          const liContent = liMatch[1].trim();
          if (liContent) {
            blocks.push({ type: listType, content: liContent });
          }
        }
        // If no <li> found, treat whole content as a single item
        if (!inner.includes('<li') && inner) {
          blocks.push({ type: listType, content: inner });
        }
        break;
      }
      default:
        break;
    }
  }

  // Handle loose content not wrapped in tags (e.g., plain text)
  const stripped = stripHtml(html);
  if (stripped && blocks.length === 0) {
    blocks.push({ type: 'paragraph', content: html });
  }

  return blocks;
}

// ═══════════════════════════════════════════════════════════════
// DOCX Builders
// ═══════════════════════════════════════════════════════════════

interface SectionConfig {
  readonly headers?: {
    readonly default?: Header;
    readonly first?: Header;
    readonly even?: Header;
  };
  readonly footers?: {
    readonly default?: Footer;
    readonly first?: Footer;
    readonly even?: Footer;
  };
  readonly properties?: {
    readonly page?: {
      readonly size?: { readonly width?: number; readonly height?: number; readonly orientation?: string };
      readonly margin?: {
        readonly top?: number;
        readonly bottom?: number;
        readonly left?: number;
        readonly right?: number;
        readonly header?: number;
        readonly footer?: number;
        readonly gutter?: number;
      };
      readonly pageNumbers?: {
        readonly start?: number;
      };
    };
    readonly type?: (typeof SectionType)[keyof typeof SectionType];
    readonly titlePage?: boolean;
  };
  readonly children: readonly FileChild[];
}

/**
 * Build the cover page section.
 */
function buildCoverSection(
  thesis: {
    title: string;
    subtitle: string | null;
    author: string;
    institution: string | null;
    laboratory: string | null;
    directorName: string | null;
  },
  lineSpacing: number,
  margins: MarginPreset,
  fontSize: number
): SectionConfig {
  const year = new Date().getFullYear().toString();

  const children: FileChild[] = [];

  // Spacers to push content to vertical center
  for (let i = 0; i < 6; i++) {
    children.push(new Paragraph({ spacing: { after: 200 } }));
  }

  // Institution (large, bold)
  if (thesis.institution) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400, line: lineSpacing },
        children: [
          new TextRun({
            text: thesis.institution,
            font: { name: BODY_FONT, ascii: BODY_FONT },
            size: 32,
            bold: true,
            color: '000000',
          }),
        ],
      })
    );
  }

  // Spacer
  children.push(new Paragraph({ spacing: { after: 600 } }));

  // Title (18pt = 36 half-points)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, line: lineSpacing },
      children: [
        new TextRun({
          text: thesis.title,
          font: { name: BODY_FONT, ascii: BODY_FONT },
          size: 36,
          bold: true,
          color: '000000',
        }),
      ],
    })
  );

  // Subtitle (italic)
  if (thesis.subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400, line: lineSpacing },
        children: [
          new TextRun({
            text: thesis.subtitle,
            font: { name: BODY_FONT, ascii: BODY_FONT },
            size: 28,
            italics: true,
            color: '000000',
          }),
        ],
      })
    );
  }

  // Spacer
  children.push(new Paragraph({ spacing: { after: 600 } }));

  // Author
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, line: lineSpacing },
      children: [
        new TextRun({
          text: thesis.author,
          font: { name: BODY_FONT, ascii: BODY_FONT },
          size: fontSize,
          color: '000000',
        }),
      ],
    })
  );

  // Director
  if (thesis.directorName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, line: lineSpacing },
        children: [
          new TextRun({
            text: `Sous la direction de ${thesis.directorName}`,
            font: { name: BODY_FONT, ascii: BODY_FONT },
            size: fontSize,
            italics: true,
            color: '000000',
          }),
        ],
      })
    );
  }

  // Institution + Laboratory
  const instLab = [thesis.institution, thesis.laboratory].filter(Boolean).join(' — ');
  if (instLab) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, line: lineSpacing },
        children: [
          new TextRun({
            text: instLab,
            font: { name: BODY_FONT, ascii: BODY_FONT },
            size: fontSize,
            color: '000000',
          }),
        ],
      })
    );
  }

  // Year
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200, line: lineSpacing },
      children: [
        new TextRun({
          text: year,
          font: { name: BODY_FONT, ascii: BODY_FONT },
          size: fontSize,
          color: '000000',
        }),
      ],
    })
  );

  return {
    properties: {
      page: {
        margin: {
          top: margins.top,
          bottom: margins.bottom,
          left: margins.left,
          right: margins.right,
          header: margins.header,
          footer: margins.footer,
        },
      },
    },
    children,
  };
}

/**
 * Build the TOC section.
 */
function buildTocSection(
  lineSpacing: number,
  margins: MarginPreset
): SectionConfig {
  const children: FileChild[] = [];

  // TOC heading (H1 style, centered, no number)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360, line: lineSpacing },
      children: [
        new TextRun({
          text: 'Table des matières',
          font: { name: BODY_FONT, ascii: BODY_FONT },
          size: 32,
          bold: true,
          color: '000000',
        }),
      ],
    })
  );

  // TableOfContents field
  children.push(
    new TableOfContents('Table des matières', {
      hyperlink: true,
      headingStyleRange: '1-3',
    })
  );

  // Hint paragraph
  children.push(
    new Paragraph({
      spacing: { before: 240, after: 120, line: lineSpacing },
      children: [
        new TextRun({
          text: 'Pour mettre à jour la table des matières dans Word : clic droit sur la table → « Mettre à jour les champs ».',
          font: { name: BODY_FONT, ascii: BODY_FONT },
          size: 18,
          italics: true,
          color: '888888',
        }),
      ],
    })
  );

  // MANDATORY: PageBreak after TOC in its own Paragraph
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  return {
    properties: {
      page: {
        margin: {
          top: margins.top,
          bottom: margins.bottom,
          left: margins.left,
          right: margins.right,
          header: margins.header,
          footer: margins.footer,
        },
      },
      type: SectionType.CONTINUOUS,
    },
    children,
  };
}

/**
 * Build the body section with all chapters and optional references.
 */
function buildBodySection(
  chapters: {
    number: number;
    title: string;
    romanNumeral: string | null;
    content: string;
  }[],
  references: {
    authors: string;
    title: string;
    year: number | null;
    type: string;
    journal: string | null;
    volume: string | null;
    issue: string | null;
    pages: string | null;
    publisher: string | null;
    doi: string | null;
    url: string | null;
  }[],
  options: ExportDocxRequest['options'],
  margins: MarginPreset,
  lineSpacing: number,
  fontSize: number
): SectionConfig {
  const children: FileChild[] = [];

  const fontOpt = { name: BODY_FONT, ascii: BODY_FONT };

  // Process each chapter
  for (const chapter of chapters) {
    // Chapter heading
    const headingText = chapter.romanNumeral
      ? `${chapter.romanNumeral}. ${chapter.title}`
      : chapter.title;

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 360, line: lineSpacing },
        children: [
          new TextRun({
            text: headingText,
            font: fontOpt,
            size: 32,
            bold: true,
            color: '000000',
          }),
        ],
      })
    );

    // Parse chapter content
    const blocks = parseHtmlToBlocks(chapter.content);

    for (const block of blocks) {
      if (block.type === 'empty') continue;

      const baseOpts = { font: fontOpt, size: fontSize, color: '000000' };

      switch (block.type) {
        case 'heading1': {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 480, after: 360, line: lineSpacing },
              children: [
                new TextRun({
                  ...baseOpts,
                  text: block.content,
                  size: 32,
                  bold: true,
                }),
              ],
            })
          );
          break;
        }
        case 'heading2': {
          children.push(
            new Paragraph({
              spacing: { before: 360, after: 240, line: lineSpacing },
              children: [
                new TextRun({
                  ...baseOpts,
                  text: block.content,
                  size: 28,
                  bold: true,
                }),
              ],
            })
          );
          break;
        }
        case 'heading3': {
          children.push(
            new Paragraph({
              spacing: { before: 240, after: 120, line: lineSpacing },
              children: [
                new TextRun({
                  ...baseOpts,
                  text: block.content,
                  size: 24,
                  bold: true,
                }),
              ],
            })
          );
          break;
        }
        case 'paragraph': {
          const text = stripHtml(block.content);
          if (!text) continue;

          const runs = parseInlineRuns(block.content, baseOpts);
          children.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 120, line: lineSpacing },
              indent: { firstLine: INDENT_FIRST_LINE },
              children: runs,
            })
          );
          break;
        }
        case 'bullet': {
          const text = stripHtml(block.content);
          if (!text) continue;

          const runs = parseInlineRuns(block.content, baseOpts);
          children.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 60, line: lineSpacing },
              indent: { left: 720, hanging: 360 },
              children: [
                new TextRun({
                  ...baseOpts,
                  text: '• ',
                }),
                ...runs,
              ],
            })
          );
          break;
        }
        case 'numbered': {
          const text = stripHtml(block.content);
          if (!text) continue;

          const runs = parseInlineRuns(block.content, baseOpts);
          children.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 60, line: lineSpacing },
              indent: { left: 720, hanging: 360 },
              children: [
                new TextRun({
                  ...baseOpts,
                  text: '- ',
                }),
                ...runs,
              ],
            })
          );
          break;
        }
        case 'blockquote': {
          if (!block.content) continue;

          children.push(
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { before: 120, after: 120, line: lineSpacing },
              indent: { left: 960, right: 480 },
              children: [
                new TextRun({
                  ...baseOpts,
                  text: block.content,
                  italics: true,
                  color: '444444',
                }),
              ],
            })
          );
          break;
        }
      }
    }
  }

  // References section
  if (options.includeReferences && references.length > 0) {
    // References heading (H1, no number)
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 360, line: lineSpacing },
        children: [
          new TextRun({
            text: 'Références',
            font: fontOpt,
            size: 32,
            bold: true,
            color: '000000',
          }),
        ],
      })
    );

    // Sort references by author surname then year
    const sortedRefs = [...references].sort((a, b) => {
      const aAuthor = a.authors.split(';')[0]?.trim() || '';
      const bAuthor = b.authors.split(';')[0]?.trim() || '';
      const cmp = aAuthor.localeCompare(bAuthor, 'fr');
      if (cmp !== 0) return cmp;
      return (a.year || 0) - (b.year || 0);
    });

    for (const ref of sortedRefs) {
      const refText = formatReferenceApa(ref);
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 200, line: lineSpacing },
          indent: { left: 480, hanging: 480 },
          children: [
            new TextRun({
              text: refText,
              font: fontOpt,
              size: fontSize,
              color: '000000',
            }),
          ],
        })
      );
    }
  }

  // Build headers/footers
  const headerChildren: Paragraph[] = [];
  if (options.headerText) {
    headerChildren.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: options.headerText,
            font: fontOpt,
            size: 18,
            color: '888888',
            italics: true,
          }),
        ],
      })
    );
  }

  const footerChildren: Paragraph[] = [];
  if (options.includePageNumbers) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: [PageNumber.CURRENT],
            font: fontOpt,
            size: 20,
            color: '000000',
          }),
        ],
      })
    );
  }

  return {
    properties: {
      page: {
        margin: {
          top: margins.top,
          bottom: margins.bottom,
          left: margins.left,
          right: margins.right,
          header: margins.header,
          footer: margins.footer,
        },
        pageNumbers: {
          start: 1,
        },
      },
      type: SectionType.CONTINUOUS,
    },
    headers: {
      default: new Header({
        children: headerChildren,
      }),
    },
    footers: {
      default: new Footer({
        children: footerChildren,
      }),
    },
    children,
  };
}

/**
 * Format a reference in APA-like style.
 */
function formatReferenceApa(ref: {
  authors: string;
  title: string;
  year: number | null;
  type: string;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  doi: string | null;
  url: string | null;
}): string {
  // Parse authors: "Doe, J.; Smith, A." → "Doe, J., & Smith, A."
  const authorList = ref.authors
    .split(';')
    .map((a) => a.trim())
    .filter(Boolean);
  let authorsStr = '';
  if (authorList.length === 1) {
    authorsStr = authorList[0];
  } else if (authorList.length === 2) {
    authorsStr = `${authorList[0]} & ${authorList[1]}`;
  } else if (authorList.length > 2) {
    const allButLast = authorList.slice(0, -1).join(', ');
    const last = authorList[authorList.length - 1];
    authorsStr = `${allButLast}, & ${last}`;
  }

  const year = ref.year ? `(${ref.year}).` : '(s.d.).';
  const title = ref.title.endsWith('.') ? ref.title : `${ref.title}.`;

  let result = `${authorsStr} ${year} ${title}`;

  switch (ref.type) {
    case 'article':
    case 'conference': {
      if (ref.journal) {
        result += ` ${ref.journal}`;
        if (ref.volume) result += `, ${ref.volume}`;
        if (ref.issue) result += `(${ref.issue})`;
        if (ref.pages) result += `, ${ref.pages}`;
        result += '.';
      }
      if (ref.doi) {
        result += ` https://doi.org/${ref.doi}`;
      }
      break;
    }
    case 'book': {
      if (ref.publisher) {
        result += ` ${ref.publisher}.`;
      }
      break;
    }
    case 'thesis': {
      if (ref.publisher) {
        result += ` ${ref.publisher}.`;
      }
      break;
    }
    case 'web': {
      if (ref.url) {
        result += ` Récupéré de ${ref.url}`;
      }
      break;
    }
    default: {
      if (ref.publisher) {
        result += ` ${ref.publisher}.`;
      }
      if (ref.url) {
        result += ` ${ref.url}`;
      }
      break;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// Route Handler
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExportDocxRequest;
    const { thesisId, options } = body;

    if (!thesisId || !options) {
      return NextResponse.json(
        { error: 'Paramètres manquants : thesisId et options sont requis.' },
        { status: 400 }
      );
    }

    // Fetch thesis with chapters
    const thesis = await db.thesis.findUnique({
      where: { id: thesisId },
      include: {
        chapters: {
          orderBy: [{ sortOrder: 'asc' }, { number: 'asc' }],
        },
      },
    });

    if (!thesis) {
      return NextResponse.json(
        { error: 'Thèse introuvable.' },
        { status: 404 }
      );
    }

    if (!thesis.chapters || thesis.chapters.length === 0) {
      return NextResponse.json(
        { error: 'Aucun chapitre trouvé pour cette thèse.' },
        { status: 400 }
      );
    }

    // Fetch all references (global — no thesisId in schema)
    let references: {
      authors: string;
      title: string;
      year: number | null;
      type: string;
      journal: string | null;
      volume: string | null;
      issue: string | null;
      pages: string | null;
      publisher: string | null;
      doi: string | null;
      url: string | null;
    }[] = [];

    if (options.includeReferences) {
      const refs = await db.reference.findMany({
        orderBy: [{ year: 'asc' }, { authors: 'asc' }],
      });
      references = refs;
    }

    // Resolve formatting options
    const fontSize = FONT_SIZES[options.fontSize] || 24;
    const lineSpacing = LINE_SPACINGS[options.lineSpacing] || 360;
    const margins = MARGINS[options.margins] || MARGINS.normal;

    // Build sections
    const sections: SectionConfig[] = [];

    // 1. Cover page
    if (options.includeCover) {
      sections.push(buildCoverSection(thesis, lineSpacing, margins, fontSize));
    }

    // 2. TOC section
    if (options.includeToc) {
      sections.push(buildTocSection(lineSpacing, margins));
    }

    // 3. Body section (chapters + optional references)
    sections.push(
      buildBodySection(
        thesis.chapters,
        references,
        options,
        margins,
        lineSpacing,
        fontSize
      )
    );

    // Build document
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: { name: BODY_FONT, ascii: BODY_FONT },
              size: fontSize,
              color: '000000',
            },
            paragraph: {
              spacing: { line: lineSpacing },
            },
          },
          heading1: {
            run: {
              font: { name: BODY_FONT, ascii: BODY_FONT },
              size: 32,
              bold: true,
              color: '000000',
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: { before: 480, after: 360, line: lineSpacing },
            },
          },
          heading2: {
            run: {
              font: { name: BODY_FONT, ascii: BODY_FONT },
              size: 28,
              bold: true,
              color: '000000',
            },
            paragraph: {
              spacing: { before: 360, after: 240, line: lineSpacing },
            },
          },
          heading3: {
            run: {
              font: { name: BODY_FONT, ascii: BODY_FONT },
              size: 24,
              bold: true,
              color: '000000',
            },
            paragraph: {
              spacing: { before: 240, after: 120, line: lineSpacing },
            },
          },
        },
      },
      sections: sections as any,
    });

    // Generate DOCX buffer
    const buffer = await Packer.toBuffer(doc);

    // Sanitize filename
    const safeTitle = thesis.title
      .replace(/[^a-zA-Z0-9\sàâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ\-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 60);
    const filename = `${safeTitle}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[export-docx] Error generating DOCX:', error);
    const message =
      error instanceof Error ? error.message : 'Erreur interne du serveur.';
    return NextResponse.json(
      { error: `Erreur lors de la génération du document : ${message}` },
      { status: 500 }
    );
  }
}
