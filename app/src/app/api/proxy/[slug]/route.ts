import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptApiKey } from "@/lib/crypto";
import { getProvider } from "@/lib/ai/providers";
import { RateLimiter } from "@/lib/ai/rate-limiter";
import { z } from "zod";
import { aiConfigSchema } from "@/lib/validators";

// Initialize rate limiter map (in-memory, resets on server restart/redeploy)
// Key: slug
const limiters = new Map<string, RateLimiter>();

function getLimiter(slug: string, maxRequests: number): RateLimiter {
  if (!limiters.has(slug)) {
    limiters.set(
      slug,
      new RateLimiter({ windowMs: 60000, maxRequests }) // 1 minute window
    );
  }
  return limiters.get(slug)!;
}

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = createAdminClient();

    // 1. Fetch app config
    const { data: app, error: appError } = await supabase
      .from("apps")
      .select("id, ai_config, api_key_encrypted, rate_limit_rpm, status")
      .eq("slug", slug)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    if (app.status !== "published") {
      return NextResponse.json({ error: "App is not published" }, { status: 403 });
    }

    // 2. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const limiter = getLimiter(slug, app.rate_limit_rpm);
    const limitResult = limiter.check(ip);

    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(app.rate_limit_rpm),
            "X-RateLimit-Remaining": String(limitResult.remaining),
            "X-RateLimit-Reset": new Date(limitResult.resetAt).toUTCString(),
          },
        }
      );
    }

    // 3. Parse and validate request
    const body = await req.json();
    const parsedBody = requestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // 4. Validate AI config
    const parsedConfig = aiConfigSchema.safeParse(app.ai_config);
    if (!parsedConfig.success) {
      return NextResponse.json({ error: "Invalid app AI configuration" }, { status: 500 });
    }
    const aiConfig = parsedConfig.data;

    // 5. Decrypt API Key
    const encryptionSecret = process.env.ENCRYPTION_SECRET;
    if (!encryptionSecret) {
      throw new Error("Missing ENCRYPTION_SECRET");
    }
    const apiKey = decryptApiKey(app.api_key_encrypted, encryptionSecret);

    // 6. Build Provider Request
    const provider = getProvider(aiConfig.provider as "openai" | "huggingface");
    const url = provider.buildRequestUrl(aiConfig.model);
    const headers = provider.buildRequestHeaders(apiKey);
    const providerBody = provider.buildRequestBody({
      model: aiConfig.model,
      messages: parsedBody.data.messages,
      system_prompt: aiConfig.system_prompt,
      max_tokens: aiConfig.max_tokens,
      temperature: aiConfig.temperature,
      stream: true,
    });

    // 7. Execute Request and Stream Response
    const startTime = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(providerBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Provider error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Upstream provider error: ${response.statusText}` },
        { status: 502 }
      );
    }

    // Log usage asynchronously (fire and forget)
    // Note: In a production app, we'd calculate actual tokens used.
    // For MVP, we log the request.
    Promise.resolve().then(() => {
      supabase.from("usage_logs").insert({
        app_id: app.id,
        ip_hash: ip, // In a real app, hash this for privacy
        response_time_ms: Date.now() - startTime,
      }).then(({ error }) => {
        if (error) console.error("Failed to log usage:", error);
      });
    });

    // Transform upstream stream to generic stream
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                const parsedContent = provider.parseStreamChunk(data);
                if (parsedContent) {
                   controller.enqueue(new TextEncoder().encode(parsedContent));
                }
              }
            }
          }
        } catch (e) {
          console.error("Stream parsing error:", e);
          controller.error(e);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });

  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
