import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api", () => {
  it("should return hello world message", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Hello, world!");
  });

  it("should return JSON content type", async () => {
    const res = await GET();
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("should only have message property", async () => {
    const res = await GET();
    const data = await res.json();
    expect(Object.keys(data)).toEqual(["message"]);
  });
});
