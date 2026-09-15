import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    thesis: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindUnique = vi.mocked(db.thesis.findUnique);
const mockUpdate = vi.mocked(db.thesis.update);
const mockDelete = vi.mocked(db.thesis.delete);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockThesis = (overrides = {}) => ({
  id: 'thesis-1',
  title: 'Ma Thèse',
  subtitle: 'Sous-titre',
  author: 'Jean Dupont',
  email: 'jean@example.com',
  institution: 'Université',
  laboratory: 'Labo',
  discipline: 'Informatique',
  directorName: 'Dr. Martin',
  status: 'draft' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  chapters: [],
  parts: [],
  cadrages: [],
  ...overrides,
});

const makeRequest = (method = 'GET', body?: object) =>
  new NextRequest(`http://localhost/api/thesis/thesis-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'thesis-1') => Promise.resolve({ id });

// ── GET /api/thesis/[id] ─────────────────────────────────────────────────
describe('GET /api/thesis/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with thesis data', async () => {
    mockFindUnique.mockResolvedValue(mockThesis());

    const res = await GET(makeRequest(), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('thesis-1');
    expect(json.data.title).toBe('Ma Thèse');
  });

  it('returns 404 when thesis not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest(), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toContain('non trouvée');
  });

  it('calls findUnique with includes for chapters, parts, and cadrages', async () => {
    mockFindUnique.mockResolvedValue(mockThesis());

    await GET(makeRequest(), { params: makeParams() });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'thesis-1' },
      include: {
        chapters: { orderBy: { sortOrder: 'asc' } },
        parts: { orderBy: { sortOrder: 'asc' } },
        cadrages: {
          where: { isActive: true },
          include: { fields: { orderBy: { sortOrder: 'asc' } } },
        },
      },
    });
  });

  it('returns 500 when database throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest(), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain('récupération');
  });

  it('uses the id from params', async () => {
    mockFindUnique.mockResolvedValue(mockThesis({ id: 'abc-123' }));

    await GET(makeRequest(), { params: makeParams('abc-123') });

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'abc-123' } }),
    );
  });
});

// ── PUT /api/thesis/[id] ─────────────────────────────────────────────────
describe('PUT /api/thesis/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a thesis and returns 200', async () => {
    const updated = mockThesis({ title: 'Updated Title' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(makeRequest('PUT', { title: 'Updated Title' }), {
      params: makeParams(),
    });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Updated Title');
  });

  it('passes validated data to db.thesis.update', async () => {
    mockUpdate.mockResolvedValue(mockThesis({ status: 'completed' }));

    const res = await PUT(
      makeRequest('PUT', { status: 'completed' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'thesis-1' },
        data: { status: 'completed' },
      }),
    );
  });

  it('returns 400 when updating with invalid status', async () => {
    const res = await PUT(
      makeRequest('PUT', { status: 'invalid_status' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is empty string', async () => {
    const res = await PUT(
      makeRequest('PUT', { title: '' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid structureMode', async () => {
    const res = await PUT(
      makeRequest('PUT', { structureMode: 'invalid' }),
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
});

// ── DELETE /api/thesis/[id] ──────────────────────────────────────────────
describe('DELETE /api/thesis/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a thesis and returns 200', async () => {
    mockDelete.mockResolvedValue(mockThesis());

    const res = await DELETE(makeRequest(), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('thesis-1');
  });

  it('calls delete with correct id', async () => {
    mockDelete.mockResolvedValue(mockThesis());

    await DELETE(makeRequest(), { params: makeParams('thesis-99') });

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'thesis-99' } });
  });

  it('returns 500 when database throws', async () => {
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest(), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
