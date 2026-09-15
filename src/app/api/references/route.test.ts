import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    reference: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.reference.findMany);
const mockCreate = vi.mocked(db.reference.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockRef = (overrides = {}) => ({
  id: 'ref-1',
  type: 'article',
  authors: 'Smith J',
  title: 'A Great Paper',
  year: 2023,
  journal: 'Nature',
  volume: '10',
  issue: null,
  pages: null,
  publisher: null,
  doi: '10.1234/test',
  isbn: null,
  url: null,
  abstract: null,
  keywords: null,
  notes: null,
  bibtexKey: null,
  isFavorite: false,
  source: 'manual',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeGetRequest = (url: string) => new NextRequest(url);
const makePostRequest = (body: object) =>
  new NextRequest('http://localhost/api/references', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ── GET /api/references ──────────────────────────────────────────────────
describe('GET /api/references', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with all references', async () => {
    const refs = [mockRef(), mockRef({ id: 'ref-2' })];
    mockFindMany.mockResolvedValue(refs);

    const res = await GET(makeGetRequest('http://localhost/api/references'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.count).toBe(2);
  });

  it('returns empty list with count 0', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeGetRequest('http://localhost/api/references'));
    const json = await res.json();

    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters by type query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/references?type=book'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'book' }),
      }),
    );
  });

  it('ignores type=all in query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/references?type=all'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.type).toBeUndefined();
  });

  it('filters by source query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/references?source=zotero'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ source: 'zotero' }),
      }),
    );
  });

  it('filters by favorites=true query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/references?favorites=true'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isFavorite: true }),
      }),
    );
  });

  it('does not filter by favorites when favorites=false', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/references?favorites=false'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.isFavorite).toBeUndefined();
  });

  it('adds OR search filter when search param provided', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/references?search=machine'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toBeDefined();
    expect(whereArg.OR).toHaveLength(3);
  });

  it('orders by updatedAt desc', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/references'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeGetRequest('http://localhost/api/references'));

    expect(res.status).toBe(500);
  });
});

// ── POST /api/references ─────────────────────────────────────────────────
describe('POST /api/references', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    authors: 'Smith J',
    title: 'A Great Paper',
  };

  it('creates a reference and returns 201', async () => {
    mockCreate.mockResolvedValue(mockRef());

    const res = await POST(makePostRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe('A Great Paper');
  });

  it('returns 400 when authors is missing', async () => {
    const res = await POST(makePostRequest({ title: 'Paper' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is missing', async () => {
    const res = await POST(makePostRequest({ authors: 'Smith' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, type: 'invalid_type' }),
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid year (string)', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, year: 'not-a-number' as unknown as number }),
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for year below 1900', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, year: 1800 }),
    );

    expect(res.status).toBe(400);
  });

  it('creates reference with all optional fields', async () => {
    const fullBody = {
      type: 'book' as const,
      authors: 'Doe J',
      title: 'A Book',
      year: 2020,
      volume: '1',
      issue: '2',
      pages: '10-20',
      publisher: 'Springer',
      doi: '10.1234/book',
      isbn: '978-3-16-148410-0',
      url: 'https://example.com',
      abstract: 'Abstract here',
      keywords: 'ml, ai',
      notes: 'My notes',
      bibtexKey: 'doe2020book',
    };
    mockCreate.mockResolvedValue(mockRef(fullBody));

    const res = await POST(makePostRequest(fullBody));

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ publisher: 'Springer' }) }),
    );
  });

  it('defaults source to "manual"', async () => {
    mockCreate.mockResolvedValue(mockRef());

    await POST(makePostRequest(validBody));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ source: 'manual' }) }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(makePostRequest(validBody));

    expect(res.status).toBe(500);
  });
});
