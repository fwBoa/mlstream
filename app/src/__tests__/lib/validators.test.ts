/**
 * Tests for lib/validators.ts
 * Zod schemas for validating app creation, AI configuration,
 * and theme configuration inputs.
 */
import { describe, it, expect } from "vitest";

/**
 * Expected exports from @/lib/validators:
 *
 * createAppSchema - validates app creation input
 * updateAppSchema - validates app update input (partial)
 * aiConfigSchema  - validates AI configuration
 * themeConfigSchema - validates theme configuration
 * slugSchema      - validates URL-safe slugs
 */

describe("validators - createAppSchema", () => {
  it("should accept a valid app creation payload", async () => {
    const { createAppSchema } = await import("@/lib/validators");
    const result = createAppSchema.safeParse({
      name: "My Recipe Bot",
      description: "An AI that generates recipes",
      slug: "my-recipe-bot",
      app_type: "chat",
    });
    expect(result.success).toBe(true);
  });

  it("should reject when name is missing", async () => {
    const { createAppSchema } = await import("@/lib/validators");
    const result = createAppSchema.safeParse({
      description: "test",
      slug: "test",
      app_type: "chat",
    });
    expect(result.success).toBe(false);
  });

  it("should reject when name is too short (< 2 chars)", async () => {
    const { createAppSchema } = await import("@/lib/validators");
    const result = createAppSchema.safeParse({
      name: "A",
      slug: "a",
      app_type: "chat",
    });
    expect(result.success).toBe(false);
  });

  it("should reject when name is too long (> 100 chars)", async () => {
    const { createAppSchema } = await import("@/lib/validators");
    const result = createAppSchema.safeParse({
      name: "x".repeat(101),
      slug: "test",
      app_type: "chat",
    });
    expect(result.success).toBe(false);
  });

  it("should only accept valid app_type values: chat, text_gen, image_gen", async () => {
    const { createAppSchema } = await import("@/lib/validators");
    const validTypes = ["chat", "text_gen", "image_gen"];
    for (const type of validTypes) {
      const result = createAppSchema.safeParse({
        name: "Test App",
        slug: "test-app",
        app_type: type,
      });
      expect(result.success).toBe(true);
    }
    const invalid = createAppSchema.safeParse({
      name: "Test App",
      slug: "test-app",
      app_type: "invalid_type",
    });
    expect(invalid.success).toBe(false);
  });

  it("should allow description to be optional", async () => {
    const { createAppSchema } = await import("@/lib/validators");
    const result = createAppSchema.safeParse({
      name: "Test App",
      slug: "test-app",
      app_type: "chat",
    });
    expect(result.success).toBe(true);
  });
});

describe("validators - slugSchema", () => {
  it("should accept valid URL-safe slugs", async () => {
    const { slugSchema } = await import("@/lib/validators");
    const validSlugs = ["my-app", "recipe-bot-2", "a1b2c3", "hello-world"];
    for (const slug of validSlugs) {
      expect(slugSchema.safeParse(slug).success).toBe(true);
    }
  });

  it("should reject slugs with uppercase letters", async () => {
    const { slugSchema } = await import("@/lib/validators");
    expect(slugSchema.safeParse("My-App").success).toBe(false);
  });

  it("should reject slugs with spaces or special characters", async () => {
    const { slugSchema } = await import("@/lib/validators");
    const invalidSlugs = ["my app", "my_app", "hello@world", "test!", "a/b"];
    for (const slug of invalidSlugs) {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    }
  });

  it("should reject slugs shorter than 2 or longer than 60 characters", async () => {
    const { slugSchema } = await import("@/lib/validators");
    expect(slugSchema.safeParse("a").success).toBe(false);
    expect(slugSchema.safeParse("a".repeat(61)).success).toBe(false);
  });

  it("should reject slugs starting or ending with a hyphen", async () => {
    const { slugSchema } = await import("@/lib/validators");
    expect(slugSchema.safeParse("-my-app").success).toBe(false);
    expect(slugSchema.safeParse("my-app-").success).toBe(false);
  });
});

describe("validators - aiConfigSchema", () => {
  it("should accept a valid OpenAI config", async () => {
    const { aiConfigSchema } = await import("@/lib/validators");
    const result = aiConfigSchema.safeParse({
      provider: "openai",
      model: "gpt-4o-mini",
      system_prompt: "You are a helpful recipe assistant.",
      max_tokens: 1024,
      temperature: 0.7,
    });
    expect(result.success).toBe(true);
  });

  it("should accept a valid HuggingFace config", async () => {
    const { aiConfigSchema } = await import("@/lib/validators");
    const result = aiConfigSchema.safeParse({
      provider: "huggingface",
      model: "meta-llama/Llama-2-7b-chat-hf",
      system_prompt: "You are a coding assistant.",
      max_tokens: 512,
      temperature: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid provider", async () => {
    const { aiConfigSchema } = await import("@/lib/validators");
    const result = aiConfigSchema.safeParse({
      provider: "anthropic",
      model: "claude-3",
      system_prompt: "test",
    });
    expect(result.success).toBe(false);
  });

  it("should reject temperature outside 0-2 range", async () => {
    const { aiConfigSchema } = await import("@/lib/validators");
    expect(
      aiConfigSchema.safeParse({
        provider: "openai",
        model: "gpt-4o-mini",
        system_prompt: "test",
        temperature: -0.1,
      }).success
    ).toBe(false);
    expect(
      aiConfigSchema.safeParse({
        provider: "openai",
        model: "gpt-4o-mini",
        system_prompt: "test",
        temperature: 2.1,
      }).success
    ).toBe(false);
  });

  it("should reject max_tokens outside 1-16384 range", async () => {
    const { aiConfigSchema } = await import("@/lib/validators");
    expect(
      aiConfigSchema.safeParse({
        provider: "openai",
        model: "gpt-4o-mini",
        system_prompt: "test",
        max_tokens: 0,
      }).success
    ).toBe(false);
    expect(
      aiConfigSchema.safeParse({
        provider: "openai",
        model: "gpt-4o-mini",
        system_prompt: "test",
        max_tokens: 20000,
      }).success
    ).toBe(false);
  });

  it("should default max_tokens to 1024 and temperature to 0.7 when omitted", async () => {
    const { aiConfigSchema } = await import("@/lib/validators");
    const result = aiConfigSchema.safeParse({
      provider: "openai",
      model: "gpt-4o-mini",
      system_prompt: "test",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.max_tokens).toBe(1024);
      expect(result.data.temperature).toBe(0.7);
    }
  });
});

describe("validators - themeConfigSchema", () => {
  it("should accept a valid theme config with a preset palette", async () => {
    const { themeConfigSchema } = await import("@/lib/validators");
    const result = themeConfigSchema.safeParse({
      palette: "midnight",
      primaryColor: "#6366f1",
      accentColor: "#818cf8",
      backgroundColor: "#0f0f23",
      mode: "dark",
      borderRadius: "md",
      fontFamily: "inter",
    });
    expect(result.success).toBe(true);
  });

  it("should accept 'custom' palette with any valid hex colors", async () => {
    const { themeConfigSchema } = await import("@/lib/validators");
    const result = themeConfigSchema.safeParse({
      palette: "custom",
      primaryColor: "#ff5500",
      accentColor: "#ff8844",
      backgroundColor: "#111111",
      mode: "dark",
      borderRadius: "lg",
      fontFamily: "outfit",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid hex colors", async () => {
    const { themeConfigSchema } = await import("@/lib/validators");
    const result = themeConfigSchema.safeParse({
      palette: "custom",
      primaryColor: "not-a-color",
      accentColor: "#818cf8",
      backgroundColor: "#0f0f23",
      mode: "dark",
      borderRadius: "md",
      fontFamily: "inter",
    });
    expect(result.success).toBe(false);
  });

  it("should only accept valid mode values: dark, light", async () => {
    const { themeConfigSchema } = await import("@/lib/validators");
    const base = {
      palette: "midnight",
      primaryColor: "#6366f1",
      accentColor: "#818cf8",
      backgroundColor: "#0f0f23",
      borderRadius: "md",
      fontFamily: "inter",
    };
    expect(themeConfigSchema.safeParse({ ...base, mode: "dark" }).success).toBe(true);
    expect(themeConfigSchema.safeParse({ ...base, mode: "light" }).success).toBe(true);
    expect(themeConfigSchema.safeParse({ ...base, mode: "auto" }).success).toBe(false);
  });

  it("should only accept valid borderRadius values", async () => {
    const { themeConfigSchema } = await import("@/lib/validators");
    const base = {
      palette: "midnight",
      primaryColor: "#6366f1",
      accentColor: "#818cf8",
      backgroundColor: "#0f0f23",
      mode: "dark",
      fontFamily: "inter",
    };
    const validRadii = ["none", "sm", "md", "lg", "full"];
    for (const r of validRadii) {
      expect(themeConfigSchema.safeParse({ ...base, borderRadius: r }).success).toBe(true);
    }
    expect(themeConfigSchema.safeParse({ ...base, borderRadius: "xl" }).success).toBe(false);
  });

  it("should only accept valid fontFamily values", async () => {
    const { themeConfigSchema } = await import("@/lib/validators");
    const base = {
      palette: "midnight",
      primaryColor: "#6366f1",
      accentColor: "#818cf8",
      backgroundColor: "#0f0f23",
      mode: "dark",
      borderRadius: "md",
    };
    const validFonts = ["inter", "outfit", "mono", "system"];
    for (const f of validFonts) {
      expect(themeConfigSchema.safeParse({ ...base, fontFamily: f }).success).toBe(true);
    }
    expect(themeConfigSchema.safeParse({ ...base, fontFamily: "comic-sans" }).success).toBe(false);
  });
});
