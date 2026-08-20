import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    agileSprint: {
      findUnique: vi.fn(),
    },
    agileStory: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockSprintFindUnique = vi.mocked(db.agileSprint.findUnique);
const mockStoryFindMany = vi.mocked(db.agileStory.findMany);
const mockStoryCount = vi.mocked(db.agileStory.count);
const mockStoryCreate = vi.mocked(db.agileStory.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockSprint = (overrides = {}) => ({
  id: 'sprint-1',
  phase: 'phase_1' as const,
  title: 'Sprint 1',
  description: null,
  status: 'planned' as const,
  startDate: null,
  endDate: null,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
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
  new NextRequest(`http://localhost/api/sprints/sprint-1/stories`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'sprint-1') => Promise.resolve({ id });

// ── GET /api/sprints/[id]/stories ───────────────────────────────────────
describe('GET /api/sprints/[id]/stories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with stories list', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryFindMany.mockResolvedValue([mockStory()]);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.meta.count).toBe(1);
  });

  it('returns 404 when sprint not found', async () => {
    mockSprintFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(404);
  });

  it('returns empty list for sprint with no stories', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters stories by sprintId from params', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryFindMany.mockResolvedValue([]);

    await GET(makeRequest('GET'), { params: makeParams('sprint-abc') });

    expect(mockStoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sprintId: 'sprint-abc' } }),
    );
  });

  it('orders stories by sortOrder asc', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryFindMany.mockResolvedValue([]);

    await GET(makeRequest('GET'), { params: makeParams() });

    expect(mockStoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { sortOrder: 'asc' } }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockSprintFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/sprints/[id]/stories ──────────────────────────────────────
describe('POST /api/sprints/[id]/stories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = { title: 'New Story' };

  it('creates a story and returns 201', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryCount.mockResolvedValue(3);
    mockStoryCreate.mockResolvedValue(mockStory({ title: 'New Story' }));

    const res = await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe('New Story');
  });

  it('returns 404 when sprint not found', async () => {
    mockSprintFindUnique.mockResolvedValue(null);

    const res = await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );

    expect(res.status).toBe(404);
  });

  it('sets sprintId from params', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryCount.mockResolvedValue(0);
    mockStoryCreate.mockResolvedValue(mockStory());

    await POST(
      makeRequest('POST', validBody),
      { params: makeParams('sprint-xyz') },
    );

    expect(mockStoryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sprintId: 'sprint-xyz' }),
      }),
    );
  });

  it('assigns default sortOrder based on count', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryCount.mockResolvedValue(5);
    mockStoryCreate.mockResolvedValue(mockStory());

    await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );

    const callData = mockStoryCreate.mock.calls[0][0].data;
    expect(callData.sortOrder).toBe(5);
  });

  it('uses provided sortOrder when given', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryCount.mockResolvedValue(5);
    mockStoryCreate.mockResolvedValue(mockStory());

    await POST(
      makeRequest('POST', { ...validBody, sortOrder: 10 }),
      { params: makeParams() },
    );

    const callData = mockStoryCreate.mock.calls[0][0].data;
    expect(callData.sortOrder).toBe(10);
  });

  it('defaults priority to medium', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryCount.mockResolvedValue(0);
    mockStoryCreate.mockResolvedValue(mockStory());

    await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );

    const callData = mockStoryCreate.mock.calls[0][0].data;
    expect(callData.priority).toBe('medium');
  });

  it('returns 400 when title is missing', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());

    const res = await POST(
      makeRequest('POST', {}),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is empty', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());

    const res = await POST(
      makeRequest('POST', { title: '' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid priority', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());

    const res = await POST(
      makeRequest('POST', { ...validBody, priority: 'urgent' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws on create', async () => {
    mockSprintFindUnique.mockResolvedValue(mockSprint());
    mockStoryCount.mockResolvedValue(0);
    mockStoryCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});
