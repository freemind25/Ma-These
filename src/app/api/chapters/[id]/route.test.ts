import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    chapter: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockUpdate = vi.mocked(db.chapter.update);
const mockDelete = vi.mocked(db.chapter.delete);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockChapter = (overrides = {}) => ({
  id: 'ch-1',
  thesisId: 'thesis-1',
  number: 1,
  title: 'Introduction',
  romanNumeral: 'I',
  sortOrder: 0,
  status: 'not_started' as const,
  content: '',
  plainText: '',
  wordCount: 0,
  partId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/chapters/ch-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'ch-1') => Promise.resolve({ id });

// ── PUT /api/chapters/[id] ───────────────────────────────────────────────
describe('PUT /api/chapters/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a chapter and returns 200', async () => {
    const updated = mockChapter({ title: 'Updated Intro' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { title: 'Updated Intro' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Updated Intro');
  });

  it('updates chapter content and wordCount', async () => {
    const updated = mockChapter({ content: 'New content', wordCount: 100 });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { content: 'New content', wordCount: 100 }),
      { params: makeParams() },
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ch-1' },
        data: { content: 'New content', wordCount: 100 },
      }),
    );
  });

  it('updates chapter status', async () => {
    mockUpdate.mockResolvedValue(mockChapter({ status: 'in_progress' }));

    const res = await PUT(
      makeRequest('PUT', { status: 'in_progress' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: 'in_progress' },
      }),
    );
  });

  it('returns 400 for invalid status', async () => {
    const res = await PUT(
      makeRequest('PUT', { status: 'invalid' }),
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

  it('returns 400 for negative wordCount', async () => {
    const res = await PUT(
      makeRequest('PUT', { wordCount: -5 }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws', async () => {
    mockUpdate.mockRejectedValue(new Error('DB down'));

    const res = await PUT(
      makeRequest('PUT', { title: 'New' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });

  it('uses id from params', async () => {
    mockUpdate.mockResolvedValue(mockChapter());

    await PUT(
      makeRequest('PUT', { title: 'X' }),
      { params: makeParams('ch-99') },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ch-99' } }),
    );
  });

  // ── Lot 9bis : sortOrder update (handleMoveChapter) ─────────────────────
  it('updates chapter sortOrder for chapter reorder (BUG-09)', async () => {
    const updated = mockChapter({ sortOrder: 2 });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { sortOrder: 2 }),
      { params: makeParams('ch-1') },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.sortOrder).toBe(2);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ch-1' },
        data: { sortOrder: 2 },
      }),
    );
  });

  it('accepts sortOrder: 0 (first position)', async () => {
    const updated = mockChapter({ sortOrder: 0 });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { sortOrder: 0 }),
      { params: makeParams() },
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { sortOrder: 0 } }),
    );
  });
});

// ── DELETE /api/chapters/[id] ────────────────────────────────────────────
describe('DELETE /api/chapters/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a chapter and returns 200', async () => {
    mockDelete.mockResolvedValue(mockChapter());

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('ch-1');
  });

  it('calls delete with correct id', async () => {
    mockDelete.mockResolvedValue(mockChapter());

    await DELETE(makeRequest('DELETE'), { params: makeParams('ch-abc') });

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'ch-abc' } });
  });

  it('returns 500 when database throws', async () => {
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
