/**
 * AI provider adapters — normalizes different AI API interfaces
 * into a unified format for the MLstream proxy.
 */

export interface AIProvider {
  name: string;
  buildRequestUrl(model: string): string;
  buildRequestHeaders(apiKey: string): Record<string, string>;
  buildRequestBody(params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    system_prompt: string;
    max_tokens: number;
    temperature: number;
    stream: boolean;
  }): Record<string, unknown>;
  parseStreamChunk(chunk: string): string | null;
}

const openaiProvider: AIProvider = {
  name: "openai",

  buildRequestUrl(): string {
    return "https://api.openai.com/v1/chat/completions";
  },

  buildRequestHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  },

  buildRequestBody(params) {
    return {
      model: params.model,
      messages: [
        { role: "system", content: params.system_prompt },
        ...params.messages,
      ],
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      stream: params.stream,
    };
  },

  parseStreamChunk(chunk: string): string | null {
    if (chunk === "[DONE]") return null;
    try {
      const parsed = JSON.parse(chunk);
      return parsed.choices?.[0]?.delta?.content ?? null;
    } catch {
      return null;
    }
  },
};

const huggingfaceProvider: AIProvider = {
  name: "huggingface",

  buildRequestUrl(model: string): string {
    return `https://api-inference.huggingface.co/models/${model}/v1/chat/completions`;
  },

  buildRequestHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  },

  buildRequestBody(params) {
    return {
      model: params.model,
      messages: [
        { role: "system", content: params.system_prompt },
        ...params.messages,
      ],
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      stream: params.stream,
    };
  },

  parseStreamChunk(chunk: string): string | null {
    if (chunk === "[DONE]") return null;
    try {
      const parsed = JSON.parse(chunk);
      return parsed.choices?.[0]?.delta?.content ?? null;
    } catch {
      return null;
    }
  },
};

const providers: Record<string, AIProvider> = {
  openai: openaiProvider,
  huggingface: huggingfaceProvider,
};

/** Returns the adapter for the specified AI provider */
export function getProvider(name: "openai" | "huggingface"): AIProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown AI provider: ${name}`);
  }
  return provider;
}
