import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    researchTab: {
      findMany: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.researchTab.findMany);
const mockCreate = vi.mocked(db.researchTab.create);
const mockAggregate = vi.mocked(db.researchTab.aggregate);

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
  new NextRequest(`http://localhost/api/thesis/thesis-1/research-tabs`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'thesis-1') => Promise.resolve({ id });

// ── GET /api/thesis/[id]/research-tabs ─────────────────────────────────
describe('GET /api/thesis/[id]/research-tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with tabs list', async () => {
    const tabs = [mockTab(), mockTab({ id: 'tab-2', title: 'Sources' })];
    mockFindMany.mockResolvedValue(tabs);

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

// ── POST /api/thesis/[id]/research-tabs ────────────────────────────────
describe('POST /api/thesis/[id]/research-tabs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates and returns 201', async () => {
    mockAggregate.mockResolvedValue({ _max: { sortOrder: null } });
    const tab = mockTab({ title: 'New Tab' });
    mockCreate.mockResolvedValue(tab);

    const res = await POST(
      makeRequest('POST', { title: 'New Tab' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe('New Tab');
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

  it('returns 500 on DB error', async () => {
    mockAggregate.mockResolvedValue({ _max: { sortOrder: null } });
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(
      makeRequest('POST', { title: 'Fail Tab' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});
