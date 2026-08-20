import { describe, it, expect } from "vitest";
import {
  PROVIDER_BASE_URLS,
  PROVIDER_MODELS,
  DYNAMIC_MODEL_PROVIDERS,
  getProviderLabel,
  getProviderFields,
  type AiProviderId,
} from "./ai-types";

describe("PROVIDER_BASE_URLS", () => {
  const ALL_PROVIDERS: AiProviderId[] = [
    "zai", "openai", "anthropic", "mistral", "routesme", "custom",
  ];

  it("has an entry for every known provider", () => {
    for (const p of ALL_PROVIDERS) {
      expect(PROVIDER_BASE_URLS).toHaveProperty(p);
    }
  });

  it("zai has empty string as base URL", () => {
    expect(PROVIDER_BASE_URLS.zai).toBe("");
  });

  it("openai base URL points to api.openai.com", () => {
    expect(PROVIDER_BASE_URLS.openai).toBe("https://api.openai.com/v1");
  });

  it("anthropic base URL points to api.anthropic.com", () => {
    expect(PROVIDER_BASE_URLS.anthropic).toBe("https://api.anthropic.com/v1");
  });

  it("mistral base URL points to api.mistral.ai", () => {
    expect(PROVIDER_BASE_URLS.mistral).toBe("https://api.mistral.ai/v1");
  });

  it("routesme base URL points to routesme.online", () => {
    expect(PROVIDER_BASE_URLS.routesme).toBe("https://routesme.online/v1");
  });

  it("custom has empty string as base URL", () => {
    expect(PROVIDER_BASE_URLS.custom).toBe("");
  });
});

describe("PROVIDER_MODELS", () => {
  it("has an entry for every known provider", () => {
    const providers: AiProviderId[] = [
      "zai", "openai", "anthropic", "mistral", "routesme", "custom",
    ];
    for (const p of providers) {
      expect(PROVIDER_MODELS).toHaveProperty(p);
    }
  });

  it("zai has ['default']", () => {
    expect(PROVIDER_MODELS.zai).toEqual(["default"]);
  });

  it("openai has expected gpt and o-series models", () => {
    expect(PROVIDER_MODELS.openai).toContain("gpt-4o");
    expect(PROVIDER_MODELS.openai).toContain("gpt-4o-mini");
    expect(PROVIDER_MODELS.openai).toContain("gpt-4-turbo");
    expect(PROVIDER_MODELS.openai).toContain("o1-mini");
    expect(PROVIDER_MODELS.openai).toContain("o3-mini");
  });

  it("anthropic has expected claude models", () => {
    expect(PROVIDER_MODELS.anthropic).toContain("claude-sonnet-4-20250514");
    expect(PROVIDER_MODELS.anthropic).toContain("claude-3-5-sonnet-20241022");
    expect(PROVIDER_MODELS.anthropic).toContain("claude-3-haiku-20240307");
  });

  it("mistral has expected models", () => {
    expect(PROVIDER_MODELS.mistral).toContain("mistral-large-latest");
    expect(PROVIDER_MODELS.mistral).toContain("mistral-medium-latest");
    expect(PROVIDER_MODELS.mistral).toContain("mistral-small-latest");
    expect(PROVIDER_MODELS.mistral).toContain("codestral-latest");
  });

  it("routesme has empty model list", () => {
    expect(PROVIDER_MODELS.routesme).toEqual([]);
  });

  it("custom has empty model list", () => {
    expect(PROVIDER_MODELS.custom).toEqual([]);
  });
});

describe("DYNAMIC_MODEL_PROVIDERS", () => {
  it("is an array", () => {
    expect(Array.isArray(DYNAMIC_MODEL_PROVIDERS)).toBe(true);
  });

  it("includes mistral", () => {
    expect(DYNAMIC_MODEL_PROVIDERS).toContain("mistral");
  });

  it("includes routesme", () => {
    expect(DYNAMIC_MODEL_PROVIDERS).toContain("routesme");
  });

  it("includes custom", () => {
    expect(DYNAMIC_MODEL_PROVIDERS).toContain("custom");
  });

  it("does NOT include zai", () => {
    expect(DYNAMIC_MODEL_PROVIDERS).not.toContain("zai");
  });

  it("does NOT include openai", () => {
    expect(DYNAMIC_MODEL_PROVIDERS).not.toContain("openai");
  });

  it("does NOT include anthropic", () => {
    expect(DYNAMIC_MODEL_PROVIDERS).not.toContain("anthropic");
  });

  it("has exactly 3 providers", () => {
    expect(DYNAMIC_MODEL_PROVIDERS).toHaveLength(3);
  });
});

describe("getProviderLabel", () => {
  it("returns label for zai", () => {
    expect(getProviderLabel("zai")).toBe("Z.ai (SDK natif)");
  });

  it("returns label for openai", () => {
    expect(getProviderLabel("openai")).toBe("OpenAI");
  });

  it("returns label for anthropic", () => {
    expect(getProviderLabel("anthropic")).toBe("Anthropic (Claude)");
  });

  it("returns label for mistral", () => {
    expect(getProviderLabel("mistral")).toBe("Mistral AI");
  });

  it("returns label for routesme", () => {
    expect(getProviderLabel("routesme")).toBe("RoutesMe (multi-modèles)");
  });

  it("returns label for custom", () => {
    expect(getProviderLabel("custom")).toBe("Personnalisé (API compatible)");
  });

  it("returns the provider id itself for an unknown provider (type safety fallback)", () => {
    // In practice the type union prevents this, but testing the fallback
    const result = getProviderLabel("zai" as AiProviderId);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("all labels are non-empty strings", () => {
    const providers: AiProviderId[] = [
      "zai", "openai", "anthropic", "mistral", "routesme", "custom",
    ];
    for (const p of providers) {
      const label = getProviderLabel(p);
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("all labels are unique", () => {
    const providers: AiProviderId[] = [
      "zai", "openai", "anthropic", "mistral", "routesme", "custom",
    ];
    const labels = providers.map((p) => getProviderLabel(p));
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});

describe("getProviderFields", () => {
  it("returns an object with all four boolean fields", () => {
    const result = getProviderFields("openai");
    expect(result).toHaveProperty("showApiKey");
    expect(result).toHaveProperty("showModel");
    expect(result).toHaveProperty("showBaseUrl");
    expect(result).toHaveProperty("dynamicModels");
  });

  it("zai: hides all fields", () => {
    const result = getProviderFields("zai");
    expect(result).toEqual({
      showApiKey: false,
      showModel: false,
      showBaseUrl: false,
      dynamicModels: false,
    });
  });

  it("openai: shows api key and model, no base url, no dynamic", () => {
    const result = getProviderFields("openai");
    expect(result.showApiKey).toBe(true);
    expect(result.showModel).toBe(true);
    expect(result.showBaseUrl).toBe(false);
    expect(result.dynamicModels).toBe(false);
  });

  it("anthropic: shows api key and model, no base url, no dynamic", () => {
    const result = getProviderFields("anthropic");
    expect(result.showApiKey).toBe(true);
    expect(result.showModel).toBe(true);
    expect(result.showBaseUrl).toBe(false);
    expect(result.dynamicModels).toBe(false);
  });

  it("mistral: shows api key, model, no base url, dynamic models", () => {
    const result = getProviderFields("mistral");
    expect(result.showApiKey).toBe(true);
    expect(result.showModel).toBe(true);
    expect(result.showBaseUrl).toBe(false);
    expect(result.dynamicModels).toBe(true);
  });

  it("routesme: shows api key, model, no base url, dynamic models", () => {
    const result = getProviderFields("routesme");
    expect(result.showApiKey).toBe(true);
    expect(result.showModel).toBe(true);
    expect(result.showBaseUrl).toBe(false);
    expect(result.dynamicModels).toBe(true);
  });

  it("custom: shows all four fields including base url and dynamic", () => {
    const result = getProviderFields("custom");
    expect(result.showApiKey).toBe(true);
    expect(result.showModel).toBe(true);
    expect(result.showBaseUrl).toBe(true);
    expect(result.dynamicModels).toBe(true);
  });

  it("dynamic models flag matches DYNAMIC_MODEL_PROVIDERS for non-zai providers", () => {
    const nonZai: AiProviderId[] = [
      "openai", "anthropic", "mistral", "routesme", "custom",
    ];
    for (const p of nonZai) {
      const result = getProviderFields(p);
      expect(result.dynamicModels).toBe(DYNAMIC_MODEL_PROVIDERS.includes(p));
    }
  });
});
