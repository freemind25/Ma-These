import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    researchSource: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.researchSource.findMany);
const mockCreate = vi.mocked(db.researchSource.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockSource = (overrides = {}) => ({
  id: 'src-1',
  title: 'Research Article',
  authors: 'Smith J',
  year: 2023,
  type: 'article' as const,
  url: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { entries: 3 },
  ...overrides,
});

const makeGetRequest = (url: string) => new NextRequest(url);
const makePostRequest = (body: object) =>
  new NextRequest('http://localhost/api/sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ── GET /api/sources ─────────────────────────────────────────────────────
describe('GET /api/sources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with all sources including entry counts', async () => {
    const sources = [mockSource(), mockSource({ id: 'src-2', _count: { entries: 0 } })];
    mockFindMany.mockResolvedValue(sources);

    const res = await GET(makeGetRequest('http://localhost/api/sources'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.count).toBe(2);
    expect(json.data[0]._count.entries).toBe(3);
  });

  it('returns empty list', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeGetRequest('http://localhost/api/sources'));
    const json = await res.json();

    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters by type query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sources?type=book'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ type: 'book' }) }),
    );
  });

  it('ignores type=all', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sources?type=all'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.type).toBeUndefined();
  });

  it('filters by search query param with OR conditions', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sources?search=machine'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toHaveLength(3);
    expect(whereArg.OR).toEqual(
      expect.arrayContaining([
        { title: { contains: 'machine' } },
        { authors: { contains: 'machine' } },
        { notes: { contains: 'machine' } },
      ]),
    );
  });

  it('orders by updatedAt desc', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sources'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeGetRequest('http://localhost/api/sources'));

    expect(res.status).toBe(500);
  });
});

// ── POST /api/sources ────────────────────────────────────────────────────
describe('POST /api/sources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = { title: 'New Source' };

  it('creates a source and returns 201', async () => {
    mockCreate.mockResolvedValue(mockSource());

    const res = await POST(makePostRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe('Research Article');
  });

  it('returns 400 when title is missing', async () => {
    const res = await POST(makePostRequest({}));

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is empty', async () => {
    const res = await POST(makePostRequest({ title: '' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid type', async () => {
    const res = await POST(makePostRequest({ ...validBody, type: 'invalid' }));

    expect(res.status).toBe(400);
  });

  it('creates source with all fields', async () => {
    const full = {
      title: 'Full Source',
      authors: 'Doe J',
      year: 2022,
      type: 'thesis' as const,
      url: 'https://example.com',
      notes: 'Important paper',
    };
    mockCreate.mockResolvedValue(mockSource(full));

    const res = await POST(makePostRequest(full));

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'thesis', notes: 'Important paper' }) }),
    );
  });

  it('defaults type to article', async () => {
    mockCreate.mockResolvedValue(mockSource());

    await POST(makePostRequest(validBody));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'article' }) }),
    );
  });

  it('returns 400 for invalid year (below 1900)', async () => {
    const res = await POST(makePostRequest({ ...validBody, year: 1800 }));

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws', async () => {
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(makePostRequest(validBody));

    expect(res.status).toBe(500);
  });
});
