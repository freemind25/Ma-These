import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Helpers ───────────────────────────────────────────

function makeGetRequest(url: string) {
  return new NextRequest(url);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/journaux-oa", () => {
  it("should return empty results for missing query", async () => {
    const req = makeGetRequest("http://localhost:3000/api/journaux-oa");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual([]);
    expect(data.meta.total).toBe(0);
  });

  it("should return empty results for too-short query (< 2 chars)", async () => {
    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=a");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("should return empty results for empty query string", async () => {
    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("should return empty results for whitespace-only query", async () => {
    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=%20%20");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data).toEqual([]);
  });

  it("should search both sources by default", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              {
                id: "oa-1",
                display_name: "Journal A",
                publisher: "PUB",
                issn: ["1234-5678"],
                topics: [{ display_name: "Urban studies" }],
                country_code: "FR",
                homepage_url: "https://a.com",
                is_oa: true,
                oa_status: "gold",
                apc_prices: [{ price: 1000, currency: "EUR" }],
                works_count: 100,
                cited_by_count: 500,
              },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            total: 1,
            page: 1,
            pageSize: 20,
            results: [
              {
                id: "doaj-1",
                bibjson: {
                  title: "Journal B",
                  publisher: { name: "PUB2" },
                  identifier: [{ type: "pissn", id: "9999-0000" }],
                  subject: [{ scheme: "LCC", term: "Urban" }],
                  link: [{ url: "https://b.com", type: "homepage" }],
                  country: "US",
                  apc: { max_price: [{ price: 0, currency: "EUR" }] },
                },
                total_articles: 50,
              },
            ],
          }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=urban");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(2);
    expect(data.meta.source).toBe("both");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should search only OpenAlex when source=openalex", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ results: [] }),
    });

    const req = makeGetRequest(
      "http://localhost:3000/api/journaux-oa?q=urban&source=openalex"
    );
    await GET(req);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("openalex");
  });

  it("should search only DOAJ when source=doaj", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
    });

    const req = makeGetRequest(
      "http://localhost:3000/api/journaux-oa?q=urban&source=doaj"
    );
    await GET(req);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("doaj");
  });

  it("should pass subject filter to OpenAlex", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ results: [] }),
    }).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
    });

    const req = makeGetRequest(
      "http://localhost:3000/api/journaux-oa?q=urban&subject=geography"
    );
    await GET(req);
    expect(mockFetch.mock.calls[0][0]).toContain("geography");
  });

  it("should normalize OpenAlex journal fields correctly", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              {
                id: "S123",
                display_name: "Urban Studies Journal",
                publisher: "Springer",
                issn: ["1234-5678", "8765-4321"],
                topics: [
                  { display_name: "Urban", subfield: { display_name: "Urban planning" } },
                ],
                country_code: "FR",
                homepage_url: "https://urban.com",
                oa_status: "gold",
                apc_prices: [{ price: 1500, currency: "EUR" }],
                works_count: 200,
                cited_by_count: 1000,
              },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=urban");
    const res = await GET(req);
    const data = await res.json();
    const journal = data.data[0];
    expect(journal.name).toBe("Urban Studies Journal");
    expect(journal.publisher).toBe("Springer");
    expect(journal.issn).toBe("1234-5678, 8765-4321");
    expect(journal.oaType).toBe("Or");
    expect(journal.country).toBe("France");
    expect(journal.source).toBe("openalex");
    expect(journal.apc).toContain("1500");
  });

  it("should normalize OA type diamond", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              {
                id: "oa-d",
                display_name: "Diamond Journal",
                oa_status: "diamond",
                works_count: 10,
              },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=diamond");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].oaType).toBe("Diamant");
  });

  it("should normalize OA type bronze", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { id: "oa-b", display_name: "Bronze J", oa_status: "bronze", works_count: 10 },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=bronze");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].oaType).toBe("Bronze");
  });

  it("should normalize OA type green", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { id: "oa-g", display_name: "Green J", oa_status: "green", works_count: 10 },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=green");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].oaType).toBe("Vert");
  });

  it("should normalize OA type hybrid", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { id: "oa-h", display_name: "Hybrid J", oa_status: "hybrid", works_count: 10 },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=hybrid");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].oaType).toBe("Hybride");
  });

  it("should handle missing OA status gracefully", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { id: "oa-u", display_name: "Unknown J", works_count: 10 },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=unknown");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].oaType).toBe("Non spécifié");
  });

  it("should sort results by relevanceScore descending", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { id: "oa-low", display_name: "Low J", works_count: 1, cited_by_count: 1 },
              { id: "oa-high", display_name: "High J", works_count: 100, cited_by_count: 1000 },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=test");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].id).toBe("oa-high");
    expect(data.data[1].id).toBe("oa-low");
  });

  it("should continue if OpenAlex fails but DOAJ succeeds", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("OpenAlex down"))
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            total: 1,
            page: 1,
            pageSize: 20,
            results: [
              {
                id: "doaj-1",
                bibjson: { title: "DOAJ Journal" },
              },
            ],
          }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=test");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.data).toHaveLength(1);
    expect(data.meta.warnings).toBeDefined();
    expect(data.meta.warnings[0]).toContain("OpenAlex");
  });

  it("should include warnings when a source fails", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=test");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.meta.warnings).toBeDefined();
    expect(data.meta.warnings.length).toBeGreaterThan(0);
  });

  it("should normalize DOAJ journal fields correctly", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            total: 1,
            page: 1,
            pageSize: 20,
            results: [
              {
                id: "doaj-2",
                bibjson: {
                  title: "DOAJ Journal Name",
                  publisher: { name: "DOAJ Publisher" },
                  identifier: [
                    { type: "pissn", id: "1111-2222" },
                    { type: "eissn", id: "3333-4444" },
                    { type: "doi", id: "10.1234/test" },
                  ],
                  subject: [
                    { scheme: "LCC", term: "Urban studies" },
                    { scheme: "LCC", term: "Architecture" },
                  ],
                  link: [{ url: "https://doaj-j.com", type: "homepage" }],
                  country: "DE",
                },
                total_articles: 100,
              },
            ],
          }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=urban");
    const res = await GET(req);
    const data = await res.json();
    const journal = data.data.find((j: { source: string }) => j.source === "doaj");
    expect(journal.name).toBe("DOAJ Journal Name");
    expect(journal.publisher).toBe("DOAJ Publisher");
    expect(journal.issn).toBe("1111-2222, 3333-4444");
    expect(journal.country).toBe("Allemagne");
    expect(journal.oaType).toBe("Or");
    expect(journal.homepageUrl).toBe("https://doaj-j.com");
  });

  it("should return 200 with warnings when all sources fail", async () => {
    mockFetch.mockImplementation(() => {
      throw new Error("Unexpected");
    });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=urban");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.meta.warnings).toBeDefined();
    expect(data.meta.warnings.length).toBeGreaterThan(0);
  });

  it("should map country code FR to France", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { id: "oa-fr", display_name: "FR J", country_code: "FR", works_count: 1 },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=fr");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].country).toBe("France");
  });

  it("should return raw country code for unknown code", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              { id: "oa-xx", display_name: "XX J", country_code: "ZZ", works_count: 1 },
            ],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ total: 0, page: 1, pageSize: 20, results: [] }),
      });

    const req = makeGetRequest("http://localhost:3000/api/journaux-oa?q=xx");
    const res = await GET(req);
    const data = await res.json();
    expect(data.data[0].country).toBe("ZZ");
  });
});
