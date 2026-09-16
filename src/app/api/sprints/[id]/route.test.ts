import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    agileSprint: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindUnique = vi.mocked(db.agileSprint.findUnique);
const mockUpdate = vi.mocked(db.agileSprint.update);
const mockDelete = vi.mocked(db.agileSprint.delete);

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
  stories: [],
  ...overrides,
});

const mockStory = (overrides = {}) => ({
  id: 'story-1',
  sprintId: 'sprint-1',
  title: 'Story 1',
  description: null,
  status: 'todo' as const,
  priority: 'medium' as const,
  storyPoints: 3,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/sprints/sprint-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'sprint-1') => Promise.resolve({ id });

// ── GET /api/sprints/[id] ───────────────────────────────────────────────
describe('GET /api/sprints/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with sprint and stories', async () => {
    mockFindUnique.mockResolvedValue(
      mockSprint({ stories: [mockStory()] }),
    );

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('sprint-1');
    expect(json.data.stories).toHaveLength(1);
  });

  it('returns 404 when sprint not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toContain('non trouvé');
  });

  it('includes stories ordered by sortOrder asc', async () => {
    mockFindUnique.mockResolvedValue(mockSprint());

    await GET(makeRequest('GET'), { params: makeParams() });

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 'sprint-1' },
      include: { stories: { orderBy: { sortOrder: 'asc' } } },
    });
  });

  it('returns 500 when database throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── PUT /api/sprints/[id] ───────────────────────────────────────────────
describe('PUT /api/sprints/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a sprint and returns 200', async () => {
    const updated = mockSprint({ title: 'Updated Sprint' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { title: 'Updated Sprint' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Updated Sprint');
  });

  it('updates status field', async () => {
    mockUpdate.mockResolvedValue(mockSprint({ status: 'active' }));

    await PUT(
      makeRequest('PUT', { status: 'active' }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'active' }),
      }),
    );
  });

  it('updates dates as Date objects', async () => {
    mockUpdate.mockResolvedValue(mockSprint());

    await PUT(
      makeRequest('PUT', {
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-06-30T00:00:00Z',
      }),
      { params: makeParams() },
    );

    const callData = mockUpdate.mock.calls[0][0].data;
    expect(callData.startDate).toBeInstanceOf(Date);
    expect(callData.endDate).toBeInstanceOf(Date);
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

  it('returns 400 for invalid datetime', async () => {
    const res = await PUT(
      makeRequest('PUT', { startDate: 'not-date' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('includes stories in response', async () => {
    mockUpdate.mockResolvedValue(mockSprint());

    await PUT(
      makeRequest('PUT', { title: 'X' }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { stories: { orderBy: { sortOrder: 'asc' } } },
      }),
    );
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

// ── DELETE /api/sprints/[id] ─────────────────────────────────────────────
describe('DELETE /api/sprints/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a sprint and returns 200', async () => {
    mockFindUnique.mockResolvedValue(mockSprint());
    mockDelete.mockResolvedValue(mockSprint());

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('sprint-1');
  });

  it('returns 404 when sprint not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toContain('non trouvé');
  });

  it('checks existence before deleting', async () => {
    mockFindUnique.mockResolvedValue(mockSprint());
    mockDelete.mockResolvedValue(mockSprint());

    await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'sprint-1' } });
    expect(mockDelete).toHaveBeenCalled();
  });

  it('returns 500 when database throws', async () => {
    mockFindUnique.mockResolvedValue(mockSprint());
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
