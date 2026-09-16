import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    reference: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.reference.findMany);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockRef = (overrides = {}) => ({
  id: 'ref-1',
  type: 'article',
  authors: 'Smith, John; Doe, Jane',
  title: 'A Great Paper on AI',
  year: 2023,
  journal: 'Nature',
  volume: '10',
  issue: '2',
  pages: '15-30',
  publisher: null,
  doi: '10.1234/test',
  isbn: null,
  url: 'https://example.com',
  abstract: null,
  keywords: null,
  notes: null,
  bibtexKey: 'smith2023great',
  isFavorite: false,
  source: 'manual',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// ── GET /api/references/bibtex ──────────────────────────────────────────
describe('GET /api/references/bibtex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with text/plain content type', async () => {
    mockFindMany.mockResolvedValue([mockRef()]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });

  it('returns Content-Disposition header for file download', async () => {
    mockFindMany.mockResolvedValue([mockRef()]);

    const res = await GET();

    expect(res.headers.get('Content-Disposition')).toContain('references.bib');
  });

  it('generates bibtex with article type', async () => {
    mockFindMany.mockResolvedValue([mockRef({ type: 'article' })]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@article{');
  });

  it('generates bibtex with book type mapped to book', async () => {
    mockFindMany.mockResolvedValue([mockRef({ type: 'book' })]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@book{');
  });

  it('maps thesis type to phdthesis', async () => {
    mockFindMany.mockResolvedValue([mockRef({ type: 'thesis' })]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@phdthesis{');
  });

  it('maps conference type to inproceedings', async () => {
    mockFindMany.mockResolvedValue([mockRef({ type: 'conference' })]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@inproceedings{');
  });

  it('maps report type to techreport', async () => {
    mockFindMany.mockResolvedValue([mockRef({ type: 'report' })]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@techreport{');
  });

  it('maps web and other types to misc', async () => {
    mockFindMany.mockResolvedValue([
      mockRef({ type: 'web', id: 'r1' }),
      mockRef({ type: 'other', id: 'r2' }),
    ]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@misc{');
  });

  it('includes author, title, year, journal fields when present', async () => {
    mockFindMany.mockResolvedValue([mockRef()]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('author = {Smith, John; Doe, Jane}');
    expect(text).toContain('title = {A Great Paper on AI}');
    expect(text).toContain('year = {2023}');
    expect(text).toContain('journal = {Nature}');
  });

  it('includes optional fields when present', async () => {
    mockFindMany.mockResolvedValue([
      mockRef({
        volume: '10',
        issue: '2',
        pages: '15-30',
        doi: '10.1234/test',
        url: 'https://example.com',
      }),
    ]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('volume = {10}');
    expect(text).toContain('number = {2}');
    expect(text).toContain('pages = {15-30}');
    expect(text).toContain('doi = {10.1234/test}');
    expect(text).toContain('url = {https://example.com}');
  });

  it('omits optional fields when null', async () => {
    mockFindMany.mockResolvedValue([
      mockRef({
        year: null,
        journal: null,
        volume: null,
        publisher: null,
        doi: null,
        isbn: null,
        url: null,
      }),
    ]);

    const res = await GET();
    const text = await res.text();

    expect(text).not.toContain('year = ');
    expect(text).not.toContain('journal = ');
    expect(text).not.toContain('publisher = ');
  });

  it('uses bibtexKey when available', async () => {
    mockFindMany.mockResolvedValue([mockRef({ bibtexKey: 'customkey2023' })]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@article{customkey2023,');
  });

  it('generates fallback key from authors+year when no bibtexKey', async () => {
    mockFindMany.mockResolvedValue([
      mockRef({ bibtexKey: null, authors: 'Smith, John', year: 2023 }),
    ]);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('@article{smith,john2023,');
  });

  it('returns 404 when no references exist', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toContain('Aucune');
  });

  it('orders by authors asc, then year desc', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET();

    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: [{ authors: 'asc' }, { year: 'desc' }],
    });
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET();

    expect(res.status).toBe(500);
  });
});
