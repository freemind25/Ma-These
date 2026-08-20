import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    researchSource: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindUnique = vi.mocked(db.researchSource.findUnique);
const mockUpdate = vi.mocked(db.researchSource.update);
const mockDelete = vi.mocked(db.researchSource.delete);

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
  entries: [],
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/sources/src-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'src-1') => Promise.resolve({ id });

// ── GET /api/sources/[id] ────────────────────────────────────────────────
describe('GET /api/sources/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with source and entries', async () => {
    mockFindUnique.mockResolvedValue(
      mockSource({ entries: [{ id: 'e-1', question: 'Q?' }] }),
    );

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('src-1');
    expect(json.data.entries).toHaveLength(1);
  });

  it('returns 404 when source not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toContain('introuvable');
  });

  it('includes entries ordered by updatedAt desc', async () => {
    mockFindUnique.mockResolvedValue(mockSource());

    await GET(makeRequest('GET'), { params: makeParams() });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'src-1' },
      include: { entries: { orderBy: { updatedAt: 'desc' } } },
    });
  });

  it('returns 500 when database throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── PUT /api/sources/[id] ───────────────────────────────────────────────
describe('PUT /api/sources/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a source and returns 200', async () => {
    const updated = mockSource({ title: 'Updated Title' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { title: 'Updated Title' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Updated Title');
  });

  it('updates multiple fields', async () => {
    mockUpdate.mockResolvedValue(mockSource());

    await PUT(
      makeRequest('PUT', { title: 'New', authors: 'Doe', year: 2022 }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'src-1' },
        data: { title: 'New', authors: 'Doe', year: 2022 },
      }),
    );
  });

  it('returns 400 for invalid type', async () => {
    const res = await PUT(
      makeRequest('PUT', { type: 'invalid' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for empty title', async () => {
    const res = await PUT(
      makeRequest('PUT', { title: '' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws', async () => {
    mockUpdate.mockRejectedValue(new Error('DB down'));

    const res = await PUT(
      makeRequest('PUT', { title: 'X' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/sources/[id] ─────────────────────────────────────────────
describe('DELETE /api/sources/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a source and returns 200', async () => {
    mockDelete.mockResolvedValue(mockSource());

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('src-1');
  });

  it('calls delete with correct id', async () => {
    mockDelete.mockResolvedValue(mockSource());

    await DELETE(makeRequest('DELETE'), { params: makeParams('src-del') });

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'src-del' } });
  });

  it('returns 500 when database throws', async () => {
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
