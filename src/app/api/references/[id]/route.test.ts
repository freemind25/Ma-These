import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    reference: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockUpdate = vi.mocked(db.reference.update);
const mockDelete = vi.mocked(db.reference.delete);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockRef = (overrides = {}) => ({
  id: 'ref-1',
  type: 'article',
  authors: 'Smith J',
  title: 'A Great Paper',
  year: 2023,
  journal: 'Nature',
  volume: null,
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

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/references/ref-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'ref-1') => Promise.resolve({ id });

// ── PUT /api/references/[id] ─────────────────────────────────────────────
describe('PUT /api/references/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a reference and returns 200', async () => {
    const updated = mockRef({ title: 'Updated Title' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { title: 'Updated Title' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Updated Title');
  });

  it('toggles isFavorite', async () => {
    const updated = mockRef({ isFavorite: true });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { isFavorite: true }),
      { params: makeParams() },
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isFavorite: true } }),
    );
  });

  it('updates multiple fields at once', async () => {
    mockUpdate.mockResolvedValue(mockRef({ title: 'New', year: 2024 }));

    await PUT(
      makeRequest('PUT', { title: 'New', year: 2024, doi: '10.5678/new' }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'New', year: 2024, doi: '10.5678/new' }),
      }),
    );
  });

  it('returns 400 for invalid type', async () => {
    const res = await PUT(
      makeRequest('PUT', { type: 'not-a-valid-type' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid year (below 1900)', async () => {
    const res = await PUT(
      makeRequest('PUT', { year: 1850 }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for non-integer year', async () => {
    const res = await PUT(
      makeRequest('PUT', { year: 2023.5 }),
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

  it('uses id from params', async () => {
    mockUpdate.mockResolvedValue(mockRef());

    await PUT(
      makeRequest('PUT', { title: 'X' }),
      { params: makeParams('ref-abc') },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ref-abc' } }),
    );
  });
});

// ── DELETE /api/references/[id] ──────────────────────────────────────────
describe('DELETE /api/references/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a reference and returns 200', async () => {
    mockDelete.mockResolvedValue(mockRef());

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('ref-1');
  });

  it('calls delete with correct id', async () => {
    mockDelete.mockResolvedValue(mockRef());

    await DELETE(makeRequest('DELETE'), { params: makeParams('ref-del') });

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'ref-del' } });
  });

  it('returns 500 when database throws', async () => {
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
