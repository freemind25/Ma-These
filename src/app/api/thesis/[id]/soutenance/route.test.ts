import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    soutenancePrep: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    thesis: {
      findUnique: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindUnique = vi.mocked(db.soutenancePrep.findUnique);
const mockUpsert = vi.mocked(db.soutenancePrep.upsert);
const mockThesisFindUnique = vi.mocked(db.thesis.findUnique);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockRecord = (overrides = {}) => ({
  id: 'prep-1',
  thesisId: 'thesis-1',
  slides: JSON.stringify([{ title: 'Titre', points: ['Point 1', 'Point 2'] }]),
  speech: 'Discours de test',
  speechDurationMin: 15,
  questions: JSON.stringify([
    { family: 'Méthodologie', items: [{ question: 'Q1 ?', angle: 'Angle 1' }] },
  ]),
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-02T10:00:00Z'),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/thesis/thesis-1/soutenance`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'thesis-1') => Promise.resolve({ id });

// ── GET /api/thesis/[id]/soutenance ─────────────────────────────────────
describe('GET /api/thesis/[id]/soutenance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with {data: null} when no record exists', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeNull();
  });

  it('returns 200 with a serialized record (JSON columns parsed)', async () => {
    mockFindUnique.mockResolvedValue(mockRecord());

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slides).toEqual([{ title: 'Titre', points: ['Point 1', 'Point 2'] }]);
    expect(json.data.speech).toBe('Discours de test');
    expect(json.data.speechDurationMin).toBe(15);
    expect(json.data.questions).toEqual([
      { family: 'Méthodologie', items: [{ question: 'Q1 ?', angle: 'Angle 1' }] },
    ]);
    expect(json.data.createdAt).toBe('2026-01-01T10:00:00.000Z');
  });

  it('returns 500 when database throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── PUT /api/thesis/[id]/soutenance ─────────────────────────────────────
describe('PUT /api/thesis/[id]/soutenance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockThesisFindUnique.mockResolvedValue({ id: 'thesis-1' } as { id: string });
  });

  it('upserts slides and normalizes 7 points to 6', async () => {
    mockUpsert.mockResolvedValue(mockRecord());

    const res = await PUT(
      makeRequest('PUT', {
        slides: [{ title: 'Titre', points: ['1', '2', '3', '4', '5', '6', '7'] }],
      }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slides).toEqual([{ title: 'Titre', points: ['Point 1', 'Point 2'] }]);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { thesisId: 'thesis-1' },
        update: expect.objectContaining({
          slides: JSON.stringify([{ title: 'Titre', points: ['1', '2', '3', '4', '5', '6'] }]),
        }),
      }),
    );
  });

  it('updates only the provided artefact (partial upsert)', async () => {
    mockUpsert.mockResolvedValue(mockRecord({ speech: 'Nouveau discours' }));

    const res = await PUT(
      makeRequest('PUT', { speech: 'Nouveau discours', speechDurationMin: 10 }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.speech).toBe('Nouveau discours');
    const call = mockUpsert.mock.calls[0][0];
    expect(call.update).toEqual({ speech: 'Nouveau discours', speechDurationMin: 10 });
  });

  it('caps 13 slides to 12 on create', async () => {
    mockUpsert.mockResolvedValue(mockRecord());

    const slides = Array.from({ length: 13 }, (_, i) => ({
      title: `Slide ${i + 1}`,
      points: ['Point'],
    }));
    await PUT(makeRequest('PUT', { slides }), { params: makeParams() });

    const call = mockUpsert.mock.calls[0][0];
    const stored = JSON.parse((call.create as { slides: string }).slides);
    expect(stored).toHaveLength(12);
  });

  it('returns 404 when thesis does not exist', async () => {
    mockThesisFindUnique.mockResolvedValue(null);

    const res = await PUT(makeRequest('PUT', { speech: 'x' }), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe('Thèse non trouvée');
  });

  it('returns 400 with zod flatten on invalid payload', async () => {
    const res = await PUT(makeRequest('PUT', { speechDurationMin: 17 }), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Données invalides');
    expect(json.details.fieldErrors.speechDurationMin).toBeDefined();
  });

  it('returns 400 when a slide has no title', async () => {
    const res = await PUT(
      makeRequest('PUT', { slides: [{ points: ['Point'] }] }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws', async () => {
    mockUpsert.mockRejectedValue(new Error('DB down'));

    const res = await PUT(makeRequest('PUT', { speech: 'x' }), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
