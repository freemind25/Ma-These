import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("returns a single class name unchanged", () => {
    expect(cn("px-4")).toBe("px-4");
  });

  it("joins multiple class names with a space", () => {
    expect(cn("px-4", "py-2", "bg-red-500")).toBe("px-4 py-2 bg-red-500");
  });

  it("returns empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("filters out undefined values", () => {
    expect(cn("px-4", undefined, "py-2")).toBe("px-4 py-2");
  });

  it("filters out null values", () => {
    expect(cn("px-4", null, "py-2")).toBe("px-4 py-2");
  });

  it("filters out empty strings", () => {
    expect(cn("px-4", "", "py-2")).toBe("px-4 py-2");
  });

  it("filters out false values", () => {
    expect(cn("px-4", false, "py-2")).toBe("px-4 py-2");
  });

  it("handles arrays of class names", () => {
    expect(cn(["px-4", "py-2"], "bg-red-500")).toBe("px-4 py-2 bg-red-500");
  });

  it("handles conditional classes via ternary", () => {
    const active = true;
    const disabled = false;
    expect(cn("base", active && "active", disabled && "disabled")).toBe(
      "base active"
    );
  });

  it("handles conditional classes with undefined fallback", () => {
    const isActive = false;
    expect(cn("base", isActive ? "active-class" : undefined)).toBe("base");
  });

  it("merges conflicting tailwind classes — later class wins for padding-x", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("merges conflicting tailwind classes — later class wins for padding-y", () => {
    expect(cn("py-2", "py-8")).toBe("py-8");
  });

  it("merges conflicting tailwind classes — later class wins for margin", () => {
    expect(cn("mx-4", "mx-auto")).toBe("mx-auto");
  });

  it("merges conflicting tailwind classes — later class wins for text color", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("merges conflicting tailwind classes — later class wins for background color", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("keeps non-conflicting classes from both arguments", () => {
    expect(cn("px-2", "py-4")).toBe("px-2 py-4");
  });

  it("handles object syntax for conditional classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cn({
        "px-4": true,
        "py-2": isActive,
        "opacity-50": isDisabled,
      })
    ).toBe("px-4 py-2");
  });

  it("handles deeply nested arrays", () => {
    expect(cn(["px-4", ["py-2", ["bg-red-500"]]])).toBe(
      "px-4 py-2 bg-red-500"
    );
  });

  it("handles all falsy inputs returning empty string", () => {
    expect(cn(undefined, null, false, "", 0)).toBe("");
  });

  it("handles number class names (clsx supports numbers)", () => {
    // clsx coerces numbers to strings but filters out falsy values (0 is falsy)
    // so cn(0, 1, 'px-4') → clsx filters 0, keeps 1 → "1 px-4"
    expect(cn(0, 1, "px-4")).toBe("1 px-4");
  });

  it("deduplicates identical class names", () => {
    expect(cn("px-4", "px-4")).toBe("px-4");
  });

  it("correctly merges complex conflicting class sets", () => {
    const result = cn(
      "px-2 py-1 text-sm text-gray-500 bg-white",
      "px-4 text-base text-blue-600"
    );
    expect(result).not.toContain("px-2");
    expect(result).not.toContain("text-sm");
    expect(result).not.toContain("text-gray-500");
    expect(result).toContain("px-4");
    expect(result).toContain("py-1");
    expect(result).toContain("text-base");
    expect(result).toContain("text-blue-600");
    expect(result).toContain("bg-white");
  });
});
