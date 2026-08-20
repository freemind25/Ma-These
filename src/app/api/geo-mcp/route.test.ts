import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

// ── Mocks ─────────────────────────────────────────────

const { mockGeoMcpTools, mockCallGeoMcpTool } = vi.hoisted(() => ({
  mockGeoMcpTools: [
    { name: "validate_coords", description: "Validate coordinates" },
    { name: "geocode", description: "Geocode a place" },
  ],
  mockCallGeoMcpTool: vi.fn(),
}));

vi.mock("@/lib/geo-mcp-tools", () => ({
  GEO_MCP_TOOLS: mockGeoMcpTools,
  callGeoMcpTool: mockCallGeoMcpTool,
}));

// ── Helpers ───────────────────────────────────────────

function makeGetRequest(url: string) {
  return new NextRequest(url);
}

function makePostRequest(body: unknown) {
  return new NextRequest("http://localhost:3000/api/geo-mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────

describe("GET /api/geo-mcp", () => {
  it("should return health status with action=health", async () => {
    const req = makeGetRequest("http://localhost:3000/api/geo-mcp?action=health");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.tools_count).toBe(2);
  });

  it("should return tools list with action=list_tools", async () => {
    const req = makeGetRequest("http://localhost:3000/api/geo-mcp?action=list_tools");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tools).toHaveLength(2);
    expect(data.tools[0]).toEqual({ name: "validate_coords", description: "Validate coordinates" });
  });

  it("should return 400 for unknown action", async () => {
    const req = makeGetRequest("http://localhost:3000/api/geo-mcp?action=unknown");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("non reconnue");
  });

  it("should return 400 for missing action", async () => {
    const req = makeGetRequest("http://localhost:3000/api/geo-mcp");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/geo-mcp", () => {
  it("should call callGeoMcpTool with tool and args", async () => {
    mockCallGeoMcpTool.mockResolvedValue({ result: "ok" });
    const req = makePostRequest({
      tool: "validate_coords",
      args: { lat: 45.75, lon: 4.85 },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockCallGeoMcpTool).toHaveBeenCalledWith("validate_coords", { lat: 45.75, lon: 4.85 });
  });

  it("should pass empty args object when args missing", async () => {
    mockCallGeoMcpTool.mockResolvedValue({ result: "ok" });
    const req = makePostRequest({ tool: "geocode" });
    await POST(req);
    expect(mockCallGeoMcpTool).toHaveBeenCalledWith("geocode", {});
  });

  it("should return 400 when tool is missing", async () => {
    const req = makePostRequest({ args: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("tool");
  });

  it("should return 400 when tool is empty string", async () => {
    const req = makePostRequest({ tool: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 500 when tool call fails", async () => {
    mockCallGeoMcpTool.mockRejectedValue(new Error("Tool not found"));
    const req = makePostRequest({ tool: "nonexistent_tool" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Tool not found");
  });

  it("should return 500 with generic message for non-Error exceptions", async () => {
    mockCallGeoMcpTool.mockRejectedValue("string error");
    const req = makePostRequest({ tool: "fail" });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe("Erreur");
  });

  it("should handle tool that returns complex result", async () => {
    mockCallGeoMcpTool.mockResolvedValue({
      type: "Feature",
      geometry: { type: "Point", coordinates: [4.85, 45.75] },
    });
    const req = makePostRequest({ tool: "geocode", args: { query: "Lyon" } });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe("Feature");
  });

  it("should handle invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/geo-mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
