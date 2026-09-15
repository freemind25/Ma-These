import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    thesis: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/api-schemas', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-schemas')>('@/lib/api-schemas');
  return { ...actual };
});

import { db } from '@/lib/db';
const mockFindMany = vi.mocked(db.thesis.findMany);
const mockCreate = vi.mocked(db.thesis.create);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockThesis = (overrides = {}) => ({
  id: 'thesis-1',
  title: 'Ma Thèse',
  subtitle: 'Sous-titre',
  author: 'Jean Dupont',
  email: 'jean@example.com',
  institution: 'Université',
  laboratory: 'Labo',
  discipline: 'Informatique',
  directorName: 'Dr. Martin',
  status: 'draft' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  chapters: [],
  ...overrides,
});

// ── GET /api/thesis ──────────────────────────────────────────────────────
describe('GET /api/thesis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with a list of theses', async () => {
    const theses = [mockThesis(), mockThesis({ id: 'thesis-2', title: 'Deuxième' })];
    mockFindMany.mockResolvedValue(theses);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toHaveLength(2);
    expect(json.meta.count).toBe(2);
  });

  it('returns 200 with empty array when no theses exist', async () => {
    mockFindMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(json.meta.count).toBe(0);
  });

  it('calls findMany with correct orderBy and include', async () => {
    mockFindMany.mockResolvedValue([]);

    await GET();

    expect(mockFindMany).toHaveBeenCalledWith({
      orderBy: { updatedAt: 'desc' },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, number: true, title: true, wordCount: true, status: true },
        },
      },
    });
  });

  it('returns 500 when database throws', async () => {
    mockFindMany.mockRejectedValue(new Error('DB down'));

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain('récupération');
  });

  it('returns chapters with limited fields for each thesis', async () => {
    const chapter = { id: 'ch-1', number: 1, title: 'Intro', wordCount: 500, status: 'draft' };
    mockFindMany.mockResolvedValue([mockThesis({ chapters: [chapter] })]);

    const res = await GET();
    const json = await res.json();

    expect(json.data[0].chapters[0]).toEqual(chapter);
  });
});

// ── POST /api/thesis ─────────────────────────────────────────────────────
describe('POST /api/thesis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    title: 'Ma Thèse',
    author: 'Jean Dupont',
  };

  it('creates a thesis and returns 201', async () => {
    const created = mockThesis();
    mockCreate.mockResolvedValue(created);

    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.title).toBe('Ma Thèse');
  });

  it('creates default 7 chapters for a new thesis', async () => {
    mockCreate.mockResolvedValue(mockThesis());

    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    await POST(req);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.data.chapters.create).toHaveLength(7);
    expect(callArgs.data.chapters.create[0].title).toBe('Introduction');
    expect(callArgs.data.chapters.create[6].title).toBe('Conclusion');
  });

  it('returns 400 when title is missing', async () => {
    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify({ author: 'Jean' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('invalides');
  });

  it('returns 400 when author is missing', async () => {
    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify({ title: 'Thèse' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toContain('invalides');
  });

  it('returns 400 when body is empty object', async () => {
    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when email is invalid', async () => {
    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify({ ...validBody, email: 'not-an-email' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('creates thesis with all optional fields', async () => {
    const fullBody = {
      title: 'Full Thèse',
      author: 'Marie',
      subtitle: 'Sous-titre',
      email: 'marie@test.com',
      institution: 'ENS',
      laboratory: 'LIP6',
      discipline: 'Mathématiques',
      directorName: 'Pr. Durand',
    };
    mockCreate.mockResolvedValue(mockThesis(fullBody));

    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify(fullBody),
    });

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Full Thèse',
          institution: 'ENS',
          laboratory: 'LIP6',
        }),
      }),
    );
  });

  it('returns 500 when database throws on create', async () => {
    mockCreate.mockRejectedValue(new Error('DB down'));

    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain('création');
  });

  it('sets default chapter sort order as number - 1', async () => {
    mockCreate.mockResolvedValue(mockThesis());

    const req = new NextRequest('http://localhost/api/thesis', {
      method: 'POST',
      body: JSON.stringify(validBody),
    });

    await POST(req);

    const callArgs = mockCreate.mock.calls[0][0];
    const chapters = callArgs.data.chapters.create;
    expect(chapters[0].sortOrder).toBe(0);
    expect(chapters[2].sortOrder).toBe(2);
    expect(chapters[6].sortOrder).toBe(6);
  });
});
