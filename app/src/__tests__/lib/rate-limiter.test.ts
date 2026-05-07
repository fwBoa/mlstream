/**
 * Tests for lib/ai/rate-limiter.ts
 * IP-based rate limiter for the AI proxy endpoint.
 * Uses an in-memory sliding window approach.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Expected exports from @/lib/ai/rate-limiter:
 *
 * RateLimiter class:
 *   constructor(options: { windowMs: number, maxRequests: number })
 *   check(identifier: string): { allowed: boolean, remaining: number, resetAt: number }
 *   reset(identifier: string): void
 *   resetAll(): void
 */

describe("rate-limiter - RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should allow requests under the limit", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 5 });
    const result = limiter.check("127.0.0.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("should block requests over the limit", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 3 });

    limiter.check("127.0.0.1"); // 1 -> remaining 2
    limiter.check("127.0.0.1"); // 2 -> remaining 1
    limiter.check("127.0.0.1"); // 3 -> remaining 0

    const blocked = limiter.check("127.0.0.1"); // 4 -> blocked
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should track different identifiers independently", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 2 });

    limiter.check("user-a");
    limiter.check("user-a");
    const blockedA = limiter.check("user-a");
    expect(blockedA.allowed).toBe(false);

    const allowedB = limiter.check("user-b");
    expect(allowedB.allowed).toBe(true);
    expect(allowedB.remaining).toBe(1);
  });

  it("should reset the window after windowMs has elapsed", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 1 });

    limiter.check("127.0.0.1"); // use the 1 allowed
    const blocked = limiter.check("127.0.0.1");
    expect(blocked.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(61000);

    const allowed = limiter.check("127.0.0.1");
    expect(allowed.allowed).toBe(true);
  });

  it("should provide a valid resetAt timestamp", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 5 });
    const result = limiter.check("127.0.0.1");
    expect(result.resetAt).toBeGreaterThan(Date.now());
    expect(result.resetAt).toBeLessThanOrEqual(Date.now() + 60000);
  });

  it("should reset a specific identifier", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 1 });

    limiter.check("127.0.0.1");
    const blocked = limiter.check("127.0.0.1");
    expect(blocked.allowed).toBe(false);

    limiter.reset("127.0.0.1");
    const allowed = limiter.check("127.0.0.1");
    expect(allowed.allowed).toBe(true);
  });

  it("should reset all identifiers", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 1 });

    limiter.check("user-a");
    limiter.check("user-b");

    limiter.resetAll();

    expect(limiter.check("user-a").allowed).toBe(true);
    expect(limiter.check("user-b").allowed).toBe(true);
  });

  it("should handle edge case of maxRequests = 0 (always blocked)", async () => {
    const { RateLimiter } = await import("@/lib/ai/rate-limiter");
    const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 0 });
    const result = limiter.check("127.0.0.1");
    expect(result.allowed).toBe(false);
  });
});
