import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PUT } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    doctoralToolbox: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindUnique = vi.mocked(db.doctoralToolbox.findUnique);
const mockCreate = vi.mocked(db.doctoralToolbox.create);
const mockUpdate = vi.mocked(db.doctoralToolbox.update);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockToolbox = (overrides = {}) => ({
  id: 'toolbox-1',
  thesisId: 'thesis-1',
  checklist: '{}',
  milestones: '[]',
  documents: '[]',
  contacts: '[]',
  notes: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/thesis/thesis-1/doctoral-toolbox`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'thesis-1') => Promise.resolve({ id });

// ── GET /api/thesis/[id]/doctoral-toolbox ──────────────────────────────
describe('GET /api/thesis/[id]/doctoral-toolbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with data when found', async () => {
    const toolbox = mockToolbox();
    mockFindUnique.mockResolvedValue(toolbox);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('toolbox-1');
    expect(json.data.thesisId).toBe('thesis-1');
  });

  it('returns 200 with data:null when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeNull();
  });

  it('returns 500 on DB error', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/thesis/[id]/doctoral-toolbox ─────────────────────────────
describe('POST /api/thesis/[id]/doctoral-toolbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates and returns 201', async () => {
    mockFindUnique.mockResolvedValue(null);
    const toolbox = mockToolbox({ notes: 'Some notes' });
    mockCreate.mockResolvedValue(toolbox);

    const res = await POST(
      makeRequest('POST', { checklist: { item1: true }, notes: 'Some notes' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.notes).toBe('Some notes');
  });

  it('returns 409 if already exists', async () => {
    mockFindUnique.mockResolvedValue(mockToolbox());

    const res = await POST(
      makeRequest('POST', { notes: 'dup' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(409);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('returns 500 on DB error', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(
      makeRequest('POST', { notes: 'fail' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});

// ── PUT /api/thesis/[id]/doctoral-toolbox ──────────────────────────────
describe('PUT /api/thesis/[id]/doctoral-toolbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates and returns 200', async () => {
    const existing = mockToolbox();
    const updated = mockToolbox({ notes: 'Updated notes' });
    mockFindUnique.mockResolvedValue(existing);
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { notes: 'Updated notes' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.notes).toBe('Updated notes');
  });

  it('returns 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await PUT(
      makeRequest('PUT', { notes: 'orphan' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(404);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('returns 500 on DB error', async () => {
    mockFindUnique.mockResolvedValue(mockToolbox());
    mockUpdate.mockRejectedValue(new Error('DB down'));

    const res = await PUT(
      makeRequest('PUT', { notes: 'fail' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});
