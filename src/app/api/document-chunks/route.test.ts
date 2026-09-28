import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    documentChunk: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.documentChunk.findMany);
const mockDeleteMany = vi.mocked(db.documentChunk.deleteMany);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockChunk = (overrides = {}) => ({
  id: 'ch-1',
  sourceType: 'chapter',
  sourceId: 'src-1',
  sourceTitle: 'Chapter 1',
  content: 'This is some chunk content.',
  chunkIndex: 0,
  metadata: '{}',
  tokenCount: 42,
  createdAt: new Date(),
  ...overrides,
});

const makeGetRequest = (url: string) => new NextRequest(url);

const makeDeleteRequest = (url: string, body?: object) =>
  new NextRequest(url, {
    method: 'DELETE',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

// ── GET /api/document-chunks ─────────────────────────────────────────────
describe('GET /api/document-chunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with chunks list ordered by createdAt desc', async () => {
    const chunks = [mockChunk(), mockChunk({ id: 'ch-2', chunkIndex: 1 })];
    mockFindMany.mockResolvedValue(chunks);

    const res = await GET(makeGetRequest('http://localhost/api/document-chunks'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.count).toBe(2);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    );
  });

  it('returns empty list when no chunks', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeGetRequest('http://localhost/api/document-chunks'));
    const json = await res.json();

    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters by sourceType query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/document-chunks?sourceType=chapter'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.sourceType).toBe('chapter');
  });

  it('filters by sourceId query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/document-chunks?sourceId=src-123'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.sourceId).toBe('src-123');
  });

  it('filters by search query param (content contains)', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/document-chunks?search=morphologie'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.content).toEqual({ contains: 'morphologie' });
  });

  it('combines sourceType and search filters', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/document-chunks?sourceType=reference&search=urban'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.sourceType).toBe('reference');
    expect(whereArg.content).toEqual({ contains: 'urban' });
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeGetRequest('http://localhost/api/document-chunks'));

    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/document-chunks ──────────────────────────────────────────
describe('DELETE /api/document-chunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes chunks filtered by sourceType', async () => {
    mockDeleteMany.mockResolvedValue({ count: 3 });

    const req = makeDeleteRequest('http://localhost/api/document-chunks?sourceType=chapter');
    await DELETE(req);

    expect(mockDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sourceType: 'chapter' } }),
    );
  });

  it('deletes chunks filtered by sourceId', async () => {
    mockDeleteMany.mockResolvedValue({ count: 5 });

    const req = makeDeleteRequest('http://localhost/api/document-chunks?sourceId=src-abc');
    const res = await DELETE(req);
    const json = await res.json();

    expect(mockDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sourceId: 'src-abc' } }),
    );
    expect(json.data.deletedCount).toBe(5);
  });

  it('deletes chunks filtered by both sourceType and sourceId', async () => {
    mockDeleteMany.mockResolvedValue({ count: 2 });

    const req = makeDeleteRequest('http://localhost/api/document-chunks?sourceType=notebook&sourceId=nb-1');
    await DELETE(req);

    expect(mockDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sourceType: 'notebook', sourceId: 'nb-1' },
      }),
    );
  });

  it('deletes all chunks when confirmAll is true in body', async () => {
    mockDeleteMany.mockResolvedValue({ count: 100 });

    const req = makeDeleteRequest('http://localhost/api/document-chunks', { confirmAll: true });
    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.deletedCount).toBe(100);
    expect(mockDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('returns 400 when deleting all without confirmAll', async () => {
    const req = makeDeleteRequest('http://localhost/api/document-chunks');
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when confirmAll is false', async () => {
    const req = makeDeleteRequest('http://localhost/api/document-chunks', { confirmAll: false });
    const res = await DELETE(req);

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws', async () => {
    mockDeleteMany.mockRejectedValue(new Error('DB down'));

    const req = makeDeleteRequest('http://localhost/api/document-chunks?sourceType=chapter');
    const res = await DELETE(req);

    expect(res.status).toBe(500);
  });
});
