import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// ── Mocks ────────────────────────────────────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: {
    soutenancePrep: {
      upsert: vi.fn(),
    },
    thesis: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ai/zai-client', () => ({
  generateCompletion: vi.fn(),
}));

import { db } from '@/lib/db';
import { generateCompletion } from '@/lib/ai/zai-client';
const mockUpsert = vi.mocked(db.soutenancePrep.upsert);
const mockThesisFindUnique = vi.mocked(db.thesis.findUnique);
const mockGenerateCompletion = vi.mocked(generateCompletion);

// ── Helpers ──────────────────────────────────────────────────────────────
const mockThesis = {
  id: 'thesis-1',
  title: 'Urbanisme durable',
  subtitle: null,
  author: 'Marie Dupont',
  discipline: 'Urbanisme',
  directorName: 'Pr. Martin',
  cadrages: [
    {
      fields: [
        { label: 'Problématique', value: 'Comment rendre la ville durable ?' },
      ],
    },
  ],
  chapters: [
    { number: 1, title: 'Introduction', plainText: 'Contenu du chapitre 1.' },
    { number: 2, title: 'Méthodologie', plainText: 'Contenu du chapitre 2.' },
  ],
};

const mockRecord = (overrides = {}) => ({
  id: 'prep-1',
  thesisId: 'thesis-1',
  slides: '[]',
  speech: '',
  speechDurationMin: 15,
  questions: '[]',
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-01T10:00:00Z'),
  ...overrides,
});

const makeRequest = (body: object) =>
  new NextRequest(`http://localhost/api/soutenance/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

// ── POST /api/soutenance/generate ────────────────────────────────────────
describe('POST /api/soutenance/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockThesisFindUnique.mockResolvedValue(mockThesis as never);
  });

  it('returns 400 on invalid payload (type inconnu)', async () => {
    const res = await POST(makeRequest({ thesisId: 'thesis-1', type: 'poster' }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe('Données invalides');
    expect(json.details.fieldErrors.type).toBeDefined();
  });

  it('returns 400 when thesisId is missing', async () => {
    const res = await POST(makeRequest({ type: 'slides' }));

    expect(res.status).toBe(400);
  });

  it('returns 404 when thesis does not exist', async () => {
    mockThesisFindUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ thesisId: 'unknown', type: 'slides' }));
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe('Thèse non trouvée');
  });

  it('returns 502 when AI answer is not structured (slides)', async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: 'Désolé, je ne peux pas produire de JSON.',
      model: 'test-model',
      provider: 'test',
    });

    const res = await POST(makeRequest({ thesisId: 'thesis-1', type: 'slides' }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe('Réponse IA non structurée, relancez la génération');
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('returns 502 when AI answer is not structured (questions)', async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: 'Voici mes questions sans format JSON.',
      model: 'test-model',
      provider: 'test',
    });

    const res = await POST(makeRequest({ thesisId: 'thesis-1', type: 'questions' }));
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe('Réponse IA non structurée, relancez la génération');
  });

  it('generates slides from a fenced JSON block, normalizes and persists', async () => {
    const aiSlides = Array.from({ length: 13 }, (_, i) => ({
      title: `Slide ${i + 1}`,
      points: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
    }));
    mockGenerateCompletion.mockResolvedValue({
      content: 'Voici le plan :\n```json\n' + JSON.stringify(aiSlides) + '\n```',
      model: 'test-model',
      provider: 'test',
    });
    mockUpsert.mockResolvedValue(
      mockRecord({
        slides: JSON.stringify(
          Array.from({ length: 12 }, (_, i) => ({
            title: `Slide ${i + 1}`,
            points: ['a', 'b', 'c', 'd', 'e', 'f'],
          })),
        ),
      }) as never,
    );

    const res = await POST(makeRequest({ thesisId: 'thesis-1', type: 'slides' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slides).toHaveLength(12);
    expect(json.data.slides[0].points).toHaveLength(6);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(mockUpsert.mock.calls[0][0].create.slides);
    expect(stored).toHaveLength(12);
    expect(stored[0].points).toHaveLength(6);
  });

  it('generates and persists the speech with the requested duration', async () => {
    mockGenerateCompletion.mockResolvedValue({
      content: '  [Salutations]\n\nMesdames et messieurs les membres du jury.  ',
      model: 'test-model',
      provider: 'test',
    });
    mockUpsert.mockResolvedValue(
      mockRecord({ speech: '[Salutations]\n\nMesdames et messieurs les membres du jury.', speechDurationMin: 10 }) as never,
    );

    const res = await POST(makeRequest({ thesisId: 'thesis-1', type: 'speech', durationMin: 10 }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.speech).toContain('Mesdames et messieurs');
    expect(json.data.speechDurationMin).toBe(10);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { thesisId: 'thesis-1' },
        update: expect.objectContaining({ speechDurationMin: 10 }),
      }),
    );
  });

  it('returns 500 when generateCompletion throws', async () => {
    mockGenerateCompletion.mockRejectedValue(new Error('Tous les fournisseurs IA ont échoué'));

    const res = await POST(makeRequest({ thesisId: 'thesis-1', type: 'slides' }));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain('Tous les fournisseurs IA ont échoué');
  });

  it('caps 15 questions across families to 12', async () => {
    const aiQuestions = [
      {
        family: 'Méthodologie',
        items: Array.from({ length: 8 }, (_, i) => ({ question: `Q${i + 1} ?`, angle: 'A' })),
      },
      {
        family: 'Résultats',
        items: Array.from({ length: 7 }, (_, i) => ({ question: `R${i + 1} ?`, angle: 'A' })),
      },
    ];
    mockGenerateCompletion.mockResolvedValue({
      content: JSON.stringify(aiQuestions),
      model: 'test-model',
      provider: 'test',
    });
    mockUpsert.mockResolvedValue(mockRecord() as never);

    const res = await POST(makeRequest({ thesisId: 'thesis-1', type: 'questions' }));

    expect(res.status).toBe(200);
    const stored = JSON.parse(mockUpsert.mock.calls[0][0].create.questions);
    const total = stored.reduce((acc: number, f: { items: unknown[] }) => acc + f.items.length, 0);
    expect(total).toBe(12);
    expect(stored[0].items).toHaveLength(8);
    expect(stored[1].items).toHaveLength(4);
  });
});
