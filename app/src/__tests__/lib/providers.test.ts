/**
 * Tests for lib/ai/providers.ts
 * AI provider adapter layer.
 */
import { describe, it, expect } from "vitest";

describe("providers - getProvider", () => {
  it("should return an OpenAI provider", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("openai");
    expect(provider.name).toBe("openai");
  });

  it("should return a HuggingFace provider", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("huggingface");
    expect(provider.name).toBe("huggingface");
  });

  it("should throw for an unknown provider", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    expect(() => getProvider("unknown" as any)).toThrow();
  });
});

describe("providers - OpenAI adapter", () => {
  it("should build the correct API URL", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("openai");
    const url = provider.buildRequestUrl("gpt-4o-mini");
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("should build correct authorization headers", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("openai");
    const headers = provider.buildRequestHeaders("sk-test-key");
    expect(headers["Authorization"]).toBe("Bearer sk-test-key");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("should build a valid request body with system prompt first", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("openai");
    const body = provider.buildRequestBody({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
      system_prompt: "You are a helper.",
      max_tokens: 512,
      temperature: 0.7,
      stream: true,
    });
    expect(body.model).toBe("gpt-4o-mini");
    expect(body.stream).toBe(true);
    expect(body.max_tokens).toBe(512);
    const messages = body.messages as Array<{ role: string; content: string }>;
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toBe("You are a helper.");
    expect(messages[1].role).toBe("user");
  });
});

describe("providers - HuggingFace adapter", () => {
  it("should build the correct API URL using the model ID", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("huggingface");
    const url = provider.buildRequestUrl("meta-llama/Llama-2-7b-chat-hf");
    expect(url).toContain("meta-llama/Llama-2-7b-chat-hf");
    expect(url).toContain("huggingface");
  });

  it("should build correct authorization headers", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("huggingface");
    const headers = provider.buildRequestHeaders("hf_test_token");
    expect(headers["Authorization"]).toBe("Bearer hf_test_token");
  });

  it("should build a valid request body", async () => {
    const { getProvider } = await import("@/lib/ai/providers");
    const provider = getProvider("huggingface");
    const body = provider.buildRequestBody({
      model: "meta-llama/Llama-2-7b-chat-hf",
      messages: [{ role: "user", content: "Hello" }],
      system_prompt: "You are a coder.",
      max_tokens: 256,
      temperature: 0.5,
      stream: true,
    });
    expect(body).toBeDefined();
    expect(body.stream).toBe(true);
  });
});
