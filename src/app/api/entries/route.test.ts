import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    notebookEntry: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.notebookEntry.findMany);
const mockCreate = vi.mocked(db.notebookEntry.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockEntry = (overrides = {}) => ({
  id: 'e-1',
  sourceId: null,
  question: 'What is AI?',
  answer: 'AI is...',
  tags: 'ai',
  createdAt: new Date(),
  updatedAt: new Date(),
  source: null,
  ...overrides,
});

const mockSource = () => ({ id: 'src-1', title: 'Source', type: 'article' as const });

const makeGetRequest = (url: string) => new NextRequest(url);
const makePostRequest = (body: object) =>
  new NextRequest('http://localhost/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ── GET /api/entries ─────────────────────────────────────────────────────
describe('GET /api/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with entries list including source', async () => {
    const entry = mockEntry({ source: mockSource() });
    mockFindMany.mockResolvedValue([entry]);

    const res = await GET(makeGetRequest('http://localhost/api/entries'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].source).toEqual({ id: 'src-1', title: 'Source', type: 'article' });
    expect(json.meta.count).toBe(1);
  });

  it('returns empty list', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET(makeGetRequest('http://localhost/api/entries'));
    const json = await res.json();

    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('filters by search query param (question + answer OR)', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/entries?search=machine'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toEqual([
      { question: { contains: 'machine' } },
      { answer: { contains: 'machine' } },
      { tags: { contains: 'machine' } },
    ]);
  });

  it('filters by tags query param', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/entries?tags=ai'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.tags).toEqual({ contains: 'ai' });
  });

  it('combines search and tags filters', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/entries?search=ml&tags=review'));

    const whereArg = mockFindMany.mock.calls[0][0].where;
    expect(whereArg.OR).toBeDefined();
    expect(whereArg.tags).toEqual({ contains: 'review' });
  });

  it('orders by updatedAt desc', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/entries'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
    );
  });

  it('includes source with select fields only', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET(makeGetRequest('http://localhost/api/entries'));

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          source: { select: { id: true, title: true, type: true } },
        },
      }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET(makeGetRequest('http://localhost/api/entries'));

    expect(res.status).toBe(500);
  });
});

// ── POST /api/entries ────────────────────────────────────────────────────
describe('POST /api/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = { question: 'What is deep learning?', answer: 'A subset of ML.' };

  it('creates an entry and returns 201', async () => {
    mockCreate.mockResolvedValue(mockEntry({ question: 'What is deep learning?' }));

    const res = await POST(makePostRequest(validBody));
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.question).toBe('What is deep learning?');
  });

  it('returns 400 when question is missing', async () => {
    const res = await POST(makePostRequest({ answer: 'something' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when answer is missing', async () => {
    const res = await POST(makePostRequest({ question: 'Q?' }));

    expect(res.status).toBe(400);
  });

  it('returns 400 when question is empty', async () => {
    const res = await POST(makePostRequest({ question: '', answer: 'ans' }));

    expect(res.status).toBe(400);
  });

  it('creates entry with optional sourceId and tags', async () => {
    mockCreate.mockResolvedValue(mockEntry());

    await POST(
      makePostRequest({ ...validBody, sourceId: 'src-1', tags: 'ml,ai' }),
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sourceId: 'src-1', tags: 'ml,ai' }),
      }),
    );
  });

  it('returns 500 when database throws', async () => {
    mockCreate.mockRejectedValue(new Error('DB down'));

    const res = await POST(makePostRequest(validBody));

    expect(res.status).toBe(500);
  });
});
