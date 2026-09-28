import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    researchSource: {
      findUnique: vi.fn(),
    },
    notebookEntry: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockSourceFindUnique = vi.mocked(db.researchSource.findUnique);
const mockEntryFindMany = vi.mocked(db.notebookEntry.findMany);
const mockEntryCreate = vi.mocked(db.notebookEntry.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockSource = (overrides = {}) => ({
  id: 'src-1',
  title: 'Source',
  authors: null,
  year: null,
  type: 'article' as const,
  url: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockEntry = (overrides = {}) => ({
  id: 'e-1',
  sourceId: 'src-1',
  question: 'What is AI?',
  answer: 'AI is...',
  tags: 'ai,ml',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/sources/src-1/entries`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'src-1') => Promise.resolve({ id });

// ── GET /api/sources/[id]/entries ───────────────────────────────────────
describe('GET /api/sources/[id]/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with entries list', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryFindMany.mockResolvedValue([mockEntry()]);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.meta.count).toBe(1);
  });

  it('returns 404 when source does not exist', async () => {
    mockSourceFindUnique.mockResolvedValue(null);

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(404);
  });

  it('returns empty list when no entries exist', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest('GET'), { params: makeParams() });
    const json = await res.json();

    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters by sourceId from params', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryFindMany.mockResolvedValue([]);

    await GET(makeRequest('GET'), { params: makeParams('src-abc') });

    expect(mockEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { sourceId: 'src-abc' } }),
    );
  });

  it('orders entries by updatedAt desc', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryFindMany.mockResolvedValue([]);

    await GET(makeRequest('GET'), { params: makeParams() });

    expect(mockEntryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockSourceFindUnique.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeRequest('GET'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/sources/[id]/entries ──────────────────────────────────────
describe('POST /api/sources/[id]/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = { question: 'What is ML?', answer: 'Machine Learning is...' };

  it('creates an entry and returns 201', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryCreate.mockResolvedValue(mockEntry({ question: 'What is ML?' }));

    const res = await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.question).toBe('What is ML?');
  });

  it('returns 404 when source does not exist', async () => {
    mockSourceFindUnique.mockResolvedValue(null);

    const res = await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );

    expect(res.status).toBe(404);
  });

  it('sets sourceId from params', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryCreate.mockResolvedValue(mockEntry());

    await POST(
      makeRequest('POST', validBody),
      { params: makeParams('src-xyz') },
    );

    expect(mockEntryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sourceId: 'src-xyz' }),
      }),
    );
  });

  it('returns 400 when question is missing', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());

    const res = await POST(
      makeRequest('POST', { answer: 'something' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 400 when answer is missing', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());

    const res = await POST(
      makeRequest('POST', { question: 'Q?' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('creates entry with optional tags', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryCreate.mockResolvedValue(mockEntry({ tags: 'ai,deep-learning' }));

    await POST(
      makeRequest('POST', { ...validBody, tags: 'ai,deep-learning' }),
      { params: makeParams() },
    );

    expect(mockEntryCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tags: 'ai,deep-learning' }),
      }),
    );
  });

  it('returns 500 when database throws on create', async () => {
    mockSourceFindUnique.mockResolvedValue(mockSource());
    mockEntryCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(
      makeRequest('POST', validBody),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });
});
