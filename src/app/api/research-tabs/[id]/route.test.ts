import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    researchTab: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindUnique = vi.mocked(db.researchTab.findUnique);
const mockUpdate = vi.mocked(db.researchTab.update);
const mockDelete = vi.mocked(db.researchTab.delete);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockTab = (overrides = {}) => ({
  id: 'tab-1',
  thesisId: 'thesis-1',
  title: 'Literature Review',
  pinned: false,
  notes: '',
  links: '[]',
  quotes: '[]',
  todos: '[]',
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/research-tabs/tab-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'tab-1') => Promise.resolve({ id });

// ── GET /api/research-tabs/[id] ────────────────────────────────────────
describe('GET /api/research-tabs/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with the research tab', async () => {
    mockFindUnique.mockResolvedValue(mockTab());

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('tab-1');
    expect(json.data.title).toBe('Literature Review');
  });

  it('returns 404 when tab does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: makeParams('nonexistent') });

    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── PUT /api/research-tabs/[id] ────────────────────────────────────────
describe('PUT /api/research-tabs/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates title and returns 200', async () => {
    mockFindUnique.mockResolvedValue(mockTab());
    const updated = mockTab({ title: 'Updated Title' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { title: 'Updated Title' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.title).toBe('Updated Title');
  });

  it('updates pinned status', async () => {
    mockFindUnique.mockResolvedValue(mockTab());
    const updated = mockTab({ pinned: true });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { pinned: true }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.pinned).toBe(true);
  });

  it('updates links from array to JSON string', async () => {
    mockFindUnique.mockResolvedValue(mockTab());
    const updated = mockTab({ links: JSON.stringify([{ id: '1', title: 'Test', url: 'http://example.com' }]) });
    mockUpdate.mockResolvedValue(updated);

    const linksArray = [{ id: '1', title: 'Test', url: 'http://example.com' }];
    const res = await PUT(
      makeRequest('PUT', { links: linksArray }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          links: JSON.stringify(linksArray),
        }),
      }),
    );
  });

  it('returns 404 when tab does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await PUT(
      makeRequest('PUT', { title: 'Updated' }),
      { params: makeParams('nonexistent') },
    );

    expect(res.status).toBe(404);
  });

  it('returns 500 on DB error', async () => {
    mockFindUnique.mockResolvedValue(mockTab());
    mockUpdate.mockRejectedValue(new Error('DB down'));

    const res = await PUT(
      makeRequest('PUT', { title: 'Fail' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/research-tabs/[id] ─────────────────────────────────────
describe('DELETE /api/research-tabs/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes and returns the id', async () => {
    mockDelete.mockResolvedValue(mockTab());

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('tab-1');
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'tab-1' } });
  });

  it('returns 500 on DB error', async () => {
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
