# Task p4d — Export PDF Module

## Agent: full-stack-developer

## What was done

1. **Created** `src/modules/export-pdf/export-pdf-page.tsx` — full ExportPdfPage component with:
   - Thesis selector (dropdown from GET /api/thesis)
   - Chapter selection with checkboxes, select all/deselect all, status badges, word counts
   - Thesis metadata form: title, subtitle, author, director, institution, year, laboratory, discipline
   - Formatting options: font size (10/11/12pt), line spacing (1.0/1.5/2.0), margins (narrow/normal/wide)
   - Toggles: include cover page, include table of contents, include page numbers
   - 3-tab layout: Configuration | Aperçu | Exporter
   - Live preview in iframe with formatted HTML (Times New Roman, A4 @page rules, print CSS)
   - Print-to-PDF via `window.print()` on a new window
   - HTML download as fallback
   - Auto-generated cover page with thesis metadata
   - Auto-generated table of contents
   - Export summary tab with stats (chapters, words, estimated pages, options recap)

2. **Registered** module:
   - `src/lib/stores/app-store.ts` — added `"export-pdf"` to ViewId union and NAVIGATION_ITEMS (icon: FileDown)
   - `src/app/page.tsx` — added import and case for ExportPdfPage
   - `src/components/layout/app-sidebar.tsx` — added FileDown to ICON_MAP and import

3. **Lint**: 0 errors, 0 new warnings from this module

## Files changed
- `src/modules/export-pdf/export-pdf-page.tsx` (new)
- `src/lib/stores/app-store.ts` (modified)
- `src/app/page.tsx` (modified)
- `src/components/layout/app-sidebar.tsx` (modified)
- `worklog.md` (appended)