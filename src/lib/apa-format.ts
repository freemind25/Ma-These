// ═══════════════════════════════════════════════════════════════
// apa-format — formatage APA d'une référence bibliographique.
//
// Extrait tel quel de src/app/api/export-docx/route.ts l.891-970
// (fonction formatReferenceApa) — la route importe désormais cette
// bibliothèque partagée (comportement identique, cycle
// export-notes-bas-page, décision n°2 de la spec).
// ═══════════════════════════════════════════════════════════════

/** Sous-ensemble du modèle Prisma Reference utilisé par le formateur. */
export interface ApaReference {
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
}

/**
 * Format a reference in APA-like style.
 */
export function formatReferenceApa(ref: ApaReference): string {
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
