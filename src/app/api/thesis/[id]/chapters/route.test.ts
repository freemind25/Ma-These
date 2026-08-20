import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    chapter: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.chapter.findMany);
const mockCreate = vi.mocked(db.chapter.create);
const mockCount = vi.mocked(db.chapter.count);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockChapter = (overrides = {}) => ({
  id: 'ch-1',
  thesisId: 'thesis-1',
  number: 1,
  title: 'Introduction',
  romanNumeral: 'I',
  sortOrder: 0,
  status: 'not_started' as const,
  content: '',
  plainText: '',
  wordCount: 0,
  parentId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/thesis/thesis-1/chapters`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'thesis-1') => Promise.resolve({ id });

// ── GET /api/thesis/[id]/chapters ────────────────────────────────────────
describe('GET /api/thesis/[id]/chapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with chapters list', async () => {
    const chapters = [mockChapter(), mockChapter({ id: 'ch-2', number: 2, title: 'Lit Review' })];
    mockFindMany.mockResolvedValue(chapters);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.count).toBe(2);
  });

  it('returns 200 with empty array for no chapters', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters chapters by thesisId from params', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeRequest('GET'), { params: makeParams('thesis-abc') });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { thesisId: 'thesis-abc' } }),
    );
  });

  it('orders chapters by sortOrder asc', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeRequest('GET'), { params: makeParams() });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { sortOrder: 'asc' } }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/thesis/[id]/chapters ───────────────────────────────────────
describe('POST /api/thesis/[id]/chapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a chapter and returns 201', async () => {
    mockCount.mockResolvedValue(5);
    mockCreate.mockResolvedValue(mockChapter({ number: 6 }));

    const res = await POST(
      makeRequest('POST', { title: 'Annexe', romanNumeral: 'VIII' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.number).toBe(6);
  });

  it('assigns next number based on existing count', async () => {
    mockCount.mockResolvedValue(7);
    mockCreate.mockResolvedValue(mockChapter());

    await POST(
      makeRequest('POST', { title: 'New Ch' }),
      { params: makeParams() },
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ number: 8 }),
      }),
    );
  });

  it('sets default sortOrder to existingCount when not provided', async () => {
    mockCount.mockResolvedValue(3);
    mockCreate.mockResolvedValue(mockChapter());

    await POST(
      makeRequest('POST', { title: 'New Ch' }),
      { params: makeParams() },
    );

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.sortOrder).toBe(3);
  });

  it('uses provided sortOrder when given', async () => {
    mockCount.mockResolvedValue(3);
    mockCreate.mockResolvedValue(mockChapter());

    await POST(
      makeRequest('POST', { title: 'New Ch', sortOrder: 10 }),
      { params: makeParams() },
    );

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.sortOrder).toBe(10);
  });

  it('sets status to not_started by default', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue(mockChapter());

    await POST(
      makeRequest('POST', { title: 'Intro' }),
      { params: makeParams() },
    );

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.status).toBe('not_started');
  });

  it('returns 400 when title is missing', async () => {
    const res = await POST(
      makeRequest('POST', {}),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when title is empty string', async () => {
    const res = await POST(
      makeRequest('POST', { title: '' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(
      makeRequest('POST', { title: 'Intro' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });

  it('passes thesisId from params to create', async () => {
    mockCount.mockResolvedValue(0);
    mockCreate.mockResolvedValue(mockChapter());

    await POST(
      makeRequest('POST', { title: 'Ch' }),
      { params: makeParams('thesis-xyz') },
    );

    const callData = mockCreate.mock.calls[0][0].data;
    expect(callData.thesisId).toBe('thesis-xyz');
  });
});
