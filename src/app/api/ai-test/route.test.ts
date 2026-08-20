import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { detectBackend, getBaseUrl } from "@/lib/ai/ai-provider";
import AiSDK from "z-ai-web-dev-sdk";

// ── Mocks ───────────────────────────────────────────────────────────────
vi.mock("@/lib/ai/ai-provider", () => ({
  detectBackend: vi.fn(),
  getBaseUrl: vi.fn(),
}));

vi.mock("z-ai-web-dev-sdk", () => ({
  default: {
    create: vi.fn(),
  },
}));

const mockDetectBackend = vi.mocked(detectBackend);
const mockGetBaseUrl = vi.mocked(getBaseUrl);
const mockAiSDKCreate = vi.mocked(AiSDK.create);

// Spy on global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai-test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── zai backend ────────────────────────────────────────────────────────
  describe("zai backend", () => {
    beforeEach(() => {
      mockDetectBackend.mockReturnValue("zai");
    });

    it("should return ok:true when zai SDK responds successfully", async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({ content: "pong" }),
          },
        },
      };
      mockAiSDKCreate.mockResolvedValue(mockClient as any);

      const res = await POST(createRequest({}) as any);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.response).toBeTruthy();
    });

    it("should truncate zai response to 50 chars", async () => {
      const longResponse = "a".repeat(100);
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({ content: longResponse }),
          },
        },
      };
      mockAiSDKCreate.mockResolvedValue(mockClient as any);

      const res = await POST(createRequest({}) as any);
      const data = await res.json();

      expect(data.response.length).toBeLessThanOrEqual(50);
    });

    it("should handle string response from zai SDK", async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue("string response"),
          },
        },
      };
      mockAiSDKCreate.mockResolvedValue(mockClient as any);

      const res = await POST(createRequest({}) as any);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(data.response).toContain("string response");
    });

    it("should default to zai provider when no provider specified", async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({ content: "ok" }),
          },
        },
      };
      mockAiSDKCreate.mockResolvedValue(mockClient as any);

      await POST(createRequest({}) as any);

      expect(mockDetectBackend).toHaveBeenCalledWith("zai");
    });

    it("should return 500 when zai SDK create fails", async () => {
      mockAiSDKCreate.mockRejectedValue(new Error("SDK init failed"));

      const res = await POST(createRequest({}) as any);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error).toContain("SDK init failed");
    });

    it("should return 500 when zai chat completion fails", async () => {
      const mockClient = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error("Timeout")),
          },
        },
      };
      mockAiSDKCreate.mockResolvedValue(mockClient as any);

      const res = await POST(createRequest({}) as any);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.ok).toBe(false);
    });
  });

  // ── API backend (non-zai providers) ────────────────────────────────────
  describe("API backend (OpenAI-compatible)", () => {
    beforeEach(() => {
      mockDetectBackend.mockReturnValue("api");
      mockGetBaseUrl.mockReturnValue("https://api.openai.com/v1");
    });

    it("should return 400 when apiKey is missing for non-zai provider", async () => {
      const res = await POST(
        createRequest({ provider: "openai" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain("Clé API");
    });

    it("should return ok:true with provider and model on success", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "sk-test", model: "gpt-4o" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.provider).toBe("openai");
      expect(data.model).toBe("gpt-4o");
    });

    it("should use Authorization Bearer header for openai", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await POST(
        createRequest({ provider: "openai", apiKey: "sk-test" }) as any
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer sk-test",
          }),
        })
      );
    });

    it("should use x-api-key header for anthropic", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await POST(
        createRequest({ provider: "anthropic", apiKey: "sk-ant-test" }) as any
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "x-api-key": "sk-ant-test",
            "anthropic-version": "2023-06-01",
          }),
        })
      );
    });

    it("should use /messages endpoint for anthropic", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await POST(
        createRequest({ provider: "anthropic", apiKey: "sk-ant-test" }) as any
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/messages"),
        expect.anything()
      );
    });

    it("should use /chat/completions endpoint for openai", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await POST(
        createRequest({ provider: "openai", apiKey: "sk-test" }) as any
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/chat/completions"),
        expect.anything()
      );
    });

    it("should default model to gpt-4o-mini for openai when not specified", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await POST(
        createRequest({ provider: "openai", apiKey: "sk-test" }) as any
      );

      const bodyArg = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(bodyArg.model).toBe("gpt-4o-mini");
    });

    it("should default model to claude-3-haiku for anthropic when not specified", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await POST(
        createRequest({ provider: "anthropic", apiKey: "sk-ant-test" }) as any
      );

      const bodyArg = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(bodyArg.model).toBe("claude-3-haiku-20240307");
    });
  });

  // ── API error handling ────────────────────────────────────────────────
  describe("API error handling", () => {
    beforeEach(() => {
      mockDetectBackend.mockReturnValue("api");
      mockGetBaseUrl.mockReturnValue("https://api.openai.com/v1");
    });

    it("should return 502 when fetch returns non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "sk-test" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.ok).toBe(false);
    });

    it("should return 502 with friendly message for 503 all_keys_failed", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: () =>
          Promise.resolve(
            JSON.stringify({ error: { type: "all_keys_failed", message: "overloaded" }, model: "gpt-4o" })
          ),
      });

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "sk-test", model: "gpt-4o" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.error).toContain("indisponible");
      expect(data.error).toContain("503");
    });

    it("should return 502 with friendly message for 429 rate limit", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: () =>
          Promise.resolve(
            JSON.stringify({ error: { type: "rate_limit_exceeded", message: "Slow down" } })
          ),
      });

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "sk-test" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.error).toContain("Limite");
      expect(data.error).toContain("429");
    });

    it("should return 502 with friendly message for 401 invalid key", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () =>
          Promise.resolve(
            JSON.stringify({ error: { type: "invalid_api_key", message: "Bad key" } })
          ),
      });

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "bad-key" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.error).toContain("invalide");
    });

    it("should return 502 with friendly message for 404 model not found", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify({ error: { type: "not_found", message: "Model not found" } })),
      });

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "sk-test", model: "nonexistent-model" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.error).toContain("introuvable");
    });

    it("should truncate error text to 300 chars", async () => {
      const longError = "x".repeat(500);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve(longError),
      });

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "sk-test" }) as any
      );
      const data = await res.json();

      expect(data.error.length).toBeLessThanOrEqual(300);
    });

    it("should handle Mistral-style error format (top-level message/code)", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: () =>
          Promise.resolve(
            JSON.stringify({ message: "Model not available", code: "invalid_request_error" })
          ),
      });

      const res = await POST(
        createRequest({ provider: "mistral", apiKey: "sk-test" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(502);
      expect(data.error).toContain("Model not available");
    });

    it("should return 500 when fetch throws an unexpected error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const res = await POST(
        createRequest({ provider: "openai", apiKey: "sk-test" }) as any
      );
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.ok).toBe(false);
    });

    it("should return 500 for invalid JSON body", async () => {
      const req = new Request("http://localhost:3000/api/ai-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not-json",
      });

      const res = await POST(req as any);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.ok).toBe(false);
    });
  });
});
