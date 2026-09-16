import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    reference: {
      create: vi.fn(),
    },
  },
}));

const mockDetectFormat = vi.fn();
const mockParseBibTex = vi.fn();
const mockParseRIS = vi.fn();
const mockParseCSLJSON = vi.fn();

vi.mock('@/lib/parsers', () => ({
  parseBibTex: (...args: unknown[]) => mockParseBibTex(...args),
  parseRIS: (...args: unknown[]) => mockParseRIS(...args),
  parseCSLJSON: (...args: unknown[]) => mockParseCSLJSON(...args),
  detectFormat: (...args: unknown[]) => mockDetectFormat(...args),
}));

import { db } from '@/lib/db';
const mockCreate = vi.mocked(db.reference.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const makeFormDataRequest = (file: File | null, format?: string | null) => {
  const fd = new FormData();
  if (file) fd.append('file', file);
  if (format) fd.append('format', format);
  return new NextRequest('http://localhost/api/references/import', {
    method: 'POST',
    body: fd,
  });
};

const makeBibFile = (content: string, name = 'refs.bib') =>
  new File([content], name, { type: 'text/plain' });

const parsedRef = (overrides = {}) => ({
  type: 'article',
  authors: 'Smith J',
  title: 'Paper 1',
  year: 2023,
  journal: 'Nature',
  volume: null,
  issue: null,
  pages: null,
  publisher: null,
  doi: null,
  isbn: null,
  url: null,
  abstract: null,
  keywords: null,
  notes: null,
  bibtexKey: null,
  ...overrides,
});

// ── POST /api/references/import ──────────────────────────────────────────
describe('POST /api/references/import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when no file is provided', async () => {
    const res = await POST(makeFormDataRequest(null));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('fichier');
  });

  it('returns 400 when file exceeds 10MB', async () => {
    const bigContent = 'x'.repeat(11 * 1024 * 1024);
    const file = new File([bigContent], 'big.bib', { type: 'text/plain' });

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('volumineux');
  });

  it('returns 400 when file is empty', async () => {
    const file = makeBibFile('   \n   '); // whitespace only
    mockDetectFormat.mockReturnValue('bibtex');

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('vide');
  });

  it('returns 400 when format is not recognized', async () => {
    const file = makeBibFile('some content');
    mockDetectFormat.mockReturnValue(null);

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('non reconnu');
  });

  it('returns 400 when parser finds 0 references', async () => {
    const file = makeBibFile('@article{}');
    mockDetectFormat.mockReturnValue('bibtex');
    mockParseBibTex.mockReturnValue([]);

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('Aucune');
  });

  it('returns 400 when parsed references exceed 500', async () => {
    const file = makeBibFile('lots');
    mockDetectFormat.mockReturnValue('bibtex');
    const manyRefs = Array.from({ length: 501 }, (_, i) => parsedRef({ title: `Ref ${i}` }));
    mockParseBibTex.mockReturnValue(manyRefs);

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('Trop de');
  });

  it('imports bibtex references successfully', async () => {
    const file = makeBibFile('@article{...}');
    mockDetectFormat.mockReturnValue('bibtex');
    mockParseBibTex.mockReturnValue([parsedRef({ title: 'Paper 1' })]);
    mockCreate.mockResolvedValue({ id: 'ref-1', title: 'Paper 1' });

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.total).toBe(1);
    expect(json.data.imported).toBe(1);
    expect(json.data.skipped).toBe(0);
    expect(json.data.format).toBe('bibtex');
    expect(json.data.source).toBe('bibtex');
  });

  it('imports RIS references successfully', async () => {
    const file = makeBibFile('TY  - JOUR', 'refs.ris');
    mockDetectFormat.mockReturnValue('ris');
    mockParseRIS.mockReturnValue([parsedRef({ title: 'RIS Paper' })]);
    mockCreate.mockResolvedValue({ id: 'ref-2', title: 'RIS Paper' });

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.format).toBe('ris');
    expect(json.data.source).toBe('ris');
  });

  it('imports CSL-JSON references successfully', async () => {
    const file = makeBibFile('[{"type":"article"}]', 'refs.json');
    mockDetectFormat.mockReturnValue('csl-json');
    mockParseCSLJSON.mockReturnValue([parsedRef({ title: 'CSL Paper' })]);
    mockCreate.mockResolvedValue({ id: 'ref-3', title: 'CSL Paper' });

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.format).toBe('csl-json');
  });

  it('uses format hint from formData when provided', async () => {
    const file = makeBibFile('some content');
    mockParseBibTex.mockReturnValue([parsedRef()]);
    mockCreate.mockResolvedValue({ id: 'ref-4', title: 'Paper 1' });

    const res = await POST(makeFormDataRequest(file, 'bibtex'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mockDetectFormat).not.toHaveBeenCalled();
    expect(mockParseBibTex).toHaveBeenCalled();
  });

  it('skips references without a title', async () => {
    const file = makeBibFile('@article{}');
    mockDetectFormat.mockReturnValue('bibtex');
    mockParseBibTex.mockReturnValue([parsedRef({ title: '' }), parsedRef({ title: 'Valid' })]);
    mockCreate.mockResolvedValue({ id: 'ref-5', title: 'Valid' });

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.imported).toBe(1);
    expect(json.data.skipped).toBe(1);
  });

  it('skips references when db.create throws', async () => {
    const file = makeBibFile('@article{}');
    mockDetectFormat.mockReturnValue('bibtex');
    mockParseBibTex.mockReturnValue([parsedRef({ title: 'Dup' })]);
    mockCreate.mockRejectedValue(new Error('unique constraint'));

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.imported).toBe(0);
    expect(json.data.skipped).toBe(1);
  });

  it('handles mix of imported and skipped references', async () => {
    const file = makeBibFile('@article{}');
    mockDetectFormat.mockReturnValue('bibtex');
    mockParseBibTex.mockReturnValue([
      parsedRef({ title: 'Good 1' }),
      parsedRef({ title: '' }),
      parsedRef({ title: 'Good 2' }),
    ]);
    mockCreate
      .mockResolvedValueOnce({ id: 'r1', title: 'Good 1' })
      .mockResolvedValueOnce({ id: 'r2', title: 'Good 2' });

    const res = await POST(makeFormDataRequest(file));
    const json = await res.json();

    expect(json.data.total).toBe(3);
    expect(json.data.imported).toBe(2);
    expect(json.data.skipped).toBe(1);
  });

  it('returns 500 for unexpected errors', async () => {
    // Simulate formData() failing
    const req = new NextRequest('http://localhost/api/references/import', {
      method: 'POST',
      body: 'not-form-data',
      headers: { 'Content-Type': 'text/plain' },
    });

    const res = await POST(req);

    // The route catches all errors and returns 500
    expect(res.status).toBe(500);
  });

  it('ignores invalid format hint and falls back to detection', async () => {
    const file = makeBibFile('@article{}');
    mockDetectFormat.mockReturnValue('bibtex');
    mockParseBibTex.mockReturnValue([parsedRef()]);
    mockCreate.mockResolvedValue({ id: 'ref-6', title: 'P' });

    const res = await POST(makeFormDataRequest(file, 'xml'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mockDetectFormat).toHaveBeenCalled();
  });
});
