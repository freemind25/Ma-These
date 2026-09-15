import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT, DELETE } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    notebookEntry: {
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/lib/db';
const mockUpdate = vi.mocked(db.notebookEntry.update);
const mockDelete = vi.mocked(db.notebookEntry.delete);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockEntry = (overrides = {}) => ({
  id: 'e-1',
  sourceId: null,
  question: 'What is AI?',
  answer: 'AI is...',
  tags: 'ai',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeRequest = (method: string, body?: object) =>
  new NextRequest(`http://localhost/api/entries/e-1`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

const makeParams = (id = 'e-1') => Promise.resolve({ id });

// ── PUT /api/entries/[id] ───────────────────────────────────────────────
describe('PUT /api/entries/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates an entry and returns 200', async () => {
    const updated = mockEntry({ question: 'Updated Q?' });
    mockUpdate.mockResolvedValue(updated);

    const res = await PUT(
      makeRequest('PUT', { question: 'Updated Q?' }),
      { params: makeParams() },
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.question).toBe('Updated Q?');
  });

  it('updates answer field', async () => {
    mockUpdate.mockResolvedValue(mockEntry({ answer: 'New answer' }));

    await PUT(
      makeRequest('PUT', { answer: 'New answer' }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { answer: 'New answer' } }),
    );
  });

  it('updates tags field', async () => {
    mockUpdate.mockResolvedValue(mockEntry({ tags: 'new-tag' }));

    await PUT(
      makeRequest('PUT', { tags: 'new-tag' }),
      { params: makeParams() },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { tags: 'new-tag' } }),
    );
  });

  it('returns 400 for empty question', async () => {
    const res = await PUT(
      makeRequest('PUT', { question: '' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(400);
  });

  it('returns 500 when database throws', async () => {
    mockUpdate.mockRejectedValue(new Error('DB down'));

    const res = await PUT(
      makeRequest('PUT', { question: 'Valid?' }),
      { params: makeParams() },
    );

    expect(res.status).toBe(500);
  });

  it('uses id from params', async () => {
    mockUpdate.mockResolvedValue(mockEntry());

    await PUT(
      makeRequest('PUT', { question: 'Q?' }),
      { params: makeParams('e-abc') },
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'e-abc' } }),
    );
  });
});

// ── DELETE /api/entries/[id] ────────────────────────────────────────────
describe('DELETE /api/entries/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes an entry and returns 200', async () => {
    mockDelete.mockResolvedValue(mockEntry());

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('e-1');
  });

  it('calls delete with correct id', async () => {
    mockDelete.mockResolvedValue(mockEntry());

    await DELETE(makeRequest('DELETE'), { params: makeParams('e-del') });

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'e-del' } });
  });

  it('returns 500 when database throws', async () => {
    mockDelete.mockRejectedValue(new Error('DB down'));

    const res = await DELETE(makeRequest('DELETE'), { params: makeParams() });

    expect(res.status).toBe(500);
  });
});
