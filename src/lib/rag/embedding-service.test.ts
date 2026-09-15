import { describe, it, expect } from 'vitest';
import {
  cosineSimilarity,
  parseEmbedding,
  getEmbeddingInfo,
} from './embedding-service';

describe('embedding-service', () => {
  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      const v = [0.1, 0.5, 0.3, 0.8];
      expect(cosineSimilarity(v, v)).toBeCloseTo(1, 4);
    });

    it('returns 0 for orthogonal vectors', () => {
      const a = [1, 0, 0];
      const b = [0, 1, 0];
      expect(cosineSimilarity(a, b)).toBeCloseTo(0, 4);
    });

    it('returns 0 for empty vectors', () => {
      expect(cosineSimilarity([], [])).toBe(0);
    });

    it('returns 0 for mismatched dimensions', () => {
      expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    });

    it('returns correct similarity for known vectors', () => {
      const a = [1, 0, 0];
      const b = [1, 0, 0];
      expect(cosineSimilarity(a, b)).toBeCloseTo(1, 4);

      const c = [1, 1, 1];
      const d = [1, 0, 0];
      // cos(angle) = dot / (|a|*|b|) = 1 / (sqrt(3) * 1) = 0.5774
      expect(cosineSimilarity(c, d)).toBeCloseTo(0.5774, 3);
    });
  });

  describe('parseEmbedding', () => {
    it('parses valid JSON array', () => {
      const result = parseEmbedding('[0.1, 0.5, 0.3]');
      expect(result).toEqual([0.1, 0.5, 0.3]);
    });

    it('returns empty array for invalid JSON', () => {
      expect(parseEmbedding('not-json')).toEqual([]);
    });

    it('returns empty array for non-array JSON', () => {
      expect(parseEmbedding('{"a": 1}')).toEqual([]);
    });

    it('converts strings to numbers', () => {
      const result = parseEmbedding('["1", "2.5"]');
      expect(result).toEqual([1, 2.5]);
    });
  });

  describe('getEmbeddingInfo', () => {
    it('marks OpenAI as supported with default model', () => {
      const info = getEmbeddingInfo({ provider: 'openai' });
      expect(info.supported).toBe(true);
      expect(info.model).toBe('text-embedding-3-small');
    });

    it('marks Anthropic as unsupported', () => {
      const info = getEmbeddingInfo({ provider: 'anthropic' });
      expect(info.supported).toBe(false);
    });

    it('marks zai as unsupported', () => {
      const info = getEmbeddingInfo({ provider: 'zai' });
      expect(info.supported).toBe(false);
    });

    it('uses custom model if provided', () => {
      const info = getEmbeddingInfo({ provider: 'openai', model: 'my-embed' });
      expect(info.model).toBe('my-embed');
    });

    it('supports Mistral with mistral-embed', () => {
      const info = getEmbeddingInfo({ provider: 'mistral' });
      expect(info.supported).toBe(true);
      expect(info.model).toBe('mistral-embed');
    });

    it('supports Google with text-embedding-004', () => {
      const info = getEmbeddingInfo({ provider: 'google' });
      expect(info.supported).toBe(true);
      expect(info.model).toBe('text-embedding-004');
    });
  });
});
