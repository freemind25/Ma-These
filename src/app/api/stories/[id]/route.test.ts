import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    agileStory: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindUnique = vi.mocked(db.agileStory.findUnique);
const mockUpdate = vi.mocked(db.agileStory.update);
const mockDelete = vi.mocked(db.agileStory.delete);

// ── Helpers ──────────────────────────────────────────────────────────────
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
  new NextRequest(`http://localhost/api/stories/story-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'story-1') => Promise.resolve({ id });

// ── PUT /api/stories/[id] ───────────────────────────────────────────────
describe('PUT /api/stories/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates a story and returns 200', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    const updated = mockStory({ title: 'Updated Story' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { title: 'Updated Story' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Updated Story');
  });

  it('updates status field', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockUpdate.mockResolvedValue(mockStory({ status: 'done' }));

    await PUT(
      makeRequest('PUT', { status: 'done' }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'done' }),
      }),
    );
  });

  it('updates priority and storyPoints', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockUpdate.mockResolvedValue(mockStory());

    await PUT(
      makeRequest('PUT', { priority: 'high', storyPoints: 8 }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ priority: 'high', storyPoints: 8 }),
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

  it('returns 400 for invalid priority', async () => {
    const res = await PUT(
      makeRequest('PUT', { priority: 'urgent' }),
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

  it('returns 400 for negative storyPoints', async () => {
    const res = await PUT(
      makeRequest('PUT', { storyPoints: -1 }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 404 when story not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await PUT(
      makeRequest('PUT', { title: 'New' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(404);
  });

  it('verifies story exists before updating', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockUpdate.mockResolvedValue(mockStory());

    await PUT(
      makeRequest('PUT', { title: 'X' }),
      { params: makeParams() },
    );

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'story-1' } });
  });

  it('returns 500 when database throws', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockUpdate.mockRejectedValue(new Error('DB down'));

    const res = await PUT(
      makeRequest('PUT', { title: 'X' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/stories/[id] ────────────────────────────────────────────
describe('DELETE /api/stories/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a story and returns 200', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockDelete.mockResolvedValue(mockStory());

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('story-1');
  });

  it('returns 404 when story not found', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(404);
  });

  it('checks existence before deleting', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockDelete.mockResolvedValue(mockStory());

    await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(mockFindUnique).toHaveBeenCalledWith({ where: { id: 'story-1' } });
    expect(mockDelete).toHaveBeenCalled();
  });

  it('calls delete with correct id', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockDelete.mockResolvedValue(mockStory());

    await DELETE(makeRequest('DELETE'), { params: makeParams('story-del') });

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'story-del' } });
  });

  it('returns 500 when database throws', async () => {
    mockFindUnique.mockResolvedValue(mockStory());
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
