import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    agileSprint: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.agileSprint.findMany);
const mockCreate = vi.mocked(db.agileSprint.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockSprint = (overrides = {}) => ({
  id: 'sprint-1',
  phase: 'phase_1' as const,
  title: 'Sprint 1',
  description: 'Description',
  status: 'planned' as const,
  startDate: null,
  endDate: null,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { stories: 5 },
  ...overrides,
});

// We need to mock nextUrl.searchParams since the route uses request.nextUrl
const makeGetRequest = (url: string) => {
  const req = new NextRequest(url);
  return req;
};

const makePostRequest = (body: object) =>
  new NextRequest('http://localhost/api/sprints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ── GET /api/sprints ─────────────────────────────────────────────────────
describe('GET /api/sprints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with sprints list including story counts', async () => {
    mockFindMany.mockResolvedValue([mockSprint()]);

    const res = await GET(makeGetRequest('http://localhost/api/sprints'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0]._count.stories).toBe(5);
    expect(json.meta.count).toBe(1);
  });

  it('returns empty list', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeGetRequest('http://localhost/api/sprints'));
    const json = await res.json();

    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters by phase query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sprints?phase=phase_2'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { phase: 'phase_2' } }),
    );
  });

  it('filters by status query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sprints?status=active'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'active' } }),
    );
  });

  it('combines phase and status filters', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sprints?phase=phase_1&status=completed'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { phase: 'phase_1', status: 'completed' },
      }),
    );
  });

  it('passes undefined where when no filters', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sprints'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined }),
    );
  });

  it('orders by sortOrder asc then createdAt desc', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/sprints'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeGetRequest('http://localhost/api/sprints'));

    expect(res.status).toBe(500);
  });
});

// ── POST /api/sprints ────────────────────────────────────────────────────
describe('POST /api/sprints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    phase: 'phase_1',
    title: 'New Sprint',
  };

  it('creates a sprint and returns 201', async () => {
    mockCreate.mockResolvedValue(mockSprint());

    const res = await POST(makePostRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe('Sprint 1');
  });

  it('returns 400 when phase is missing', async () => {
    const res = await POST(makePostRequest({ title: 'Sprint' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is missing', async () => {
    const res = await POST(makePostRequest({ phase: 'phase_1' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid phase', async () => {
    const res = await POST(makePostRequest({ phase: 'not_a_phase', title: 'Sprint' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid datetime string', async () => {
    const res = await POST(
      makePostRequest({ ...validBody, startDate: 'not-a-date' }),
    );

    expect(res.status).toBe(400);
  });

  it('creates sprint with all fields including dates', async () => {
    mockCreate.mockResolvedValue(mockSprint());

    const fullBody = {
      ...validBody,
      description: 'A detailed sprint',
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-02-15T00:00:00Z',
      sortOrder: 5,
    };

    await POST(makePostRequest(fullBody));

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.startDate).toBeInstanceOf(Date);
    expect(callData.endDate).toBeInstanceOf(Date);
    expect(callData.sortOrder).toBe(5);
  });

  it('defaults sortOrder to 0 when not provided', async () => {
    mockCreate.mockResolvedValue(mockSprint());

    await POST(makePostRequest(validBody));

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.sortOrder).toBe(0);
  });

  it('returns 500 when database throws', async () => {
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(makePostRequest(validBody));

    expect(res.status).toBe(500);
  });
});
