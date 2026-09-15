import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    part: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.part.findMany);
const mockCreate = vi.mocked(db.part.create);
const mockCount = vi.mocked(db.part.count);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockPart = (overrides = {}) => ({
  id: 'part-1',
  thesisId: 'thesis-1',
  title: 'Introduction',
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/thesis/thesis-1/parts`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'thesis-1') => Promise.resolve({ id });

// ── GET /api/thesis/[id]/parts ──────────────────────────────────────────
describe('GET /api/thesis/[id]/parts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with parts list', async () => {
    const parts = [mockPart(), mockPart({ id: 'part-2', title: 'Methodology', sortOrder: 1 })];
    mockFindMany.mockResolvedValue(parts);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.count).toBe(2);
  });

  it('returns 200 with empty array', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters by thesisId', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeRequest('GET'), { params: makeParams('thesis-abc') });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { thesisId: 'thesis-abc' } }),
    );
  });

  it('returns 500 on DB error', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/thesis/[id]/parts ─────────────────────────────────────────
describe('POST /api/thesis/[id]/parts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates and returns 201', async () => {
    mockCount.mockResolvedValue(2);
    const part = mockPart({ title: 'Discussion' });
    mockCreate.mockResolvedValue(part);

    const res = await POST(
      makeRequest('POST', { title: 'Discussion' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe('Discussion');
  });

  it('returns 400 when title is missing', async () => {
    const res = await POST(
      makeRequest('POST', {}),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is empty', async () => {
    const res = await POST(
      makeRequest('POST', { title: '' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('assigns default sortOrder from count', async () => {
    mockCount.mockResolvedValue(3);
    mockCreate.mockResolvedValue(mockPart());

    await POST(
      makeRequest('POST', { title: 'New Part' }),
      { params: makeParams() },
    );

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.sortOrder).toBe(3);
  });

  it('returns 500 on DB error', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(
      makeRequest('POST', { title: 'Fail Part' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});
