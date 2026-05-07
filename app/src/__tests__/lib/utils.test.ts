/**
 * Tests for lib/utils.ts
 * Shared utility functions: slug generation, IP hashing, etc.
 */
import { describe, it, expect } from "vitest";

/**
 * Expected exports from @/lib/utils:
 *
 * generateSlug(name: string): string
 *   - Converts "My Recipe Bot" -> "my-recipe-bot"
 *   - Removes special characters, lowercases, replaces spaces with hyphens
 *   - Trims leading/trailing hyphens, collapses multiple hyphens
 *
 * hashIp(ip: string): string
 *   - Returns a SHA-256 hash of the IP (for privacy-safe rate limiting logs)
 *
 * cn(...classes: (string | undefined | null | false)[]): string
 *   - Utility for conditional classnames (à la clsx)
 *
 * truncate(str: string, maxLen: number): string
 *   - Truncates string and adds "..." if over maxLen
 */

describe("utils - generateSlug", () => {
  it("should convert a normal name to a URL-safe slug", async () => {
    const { generateSlug } = await import("@/lib/utils");
    expect(generateSlug("My Recipe Bot")).toBe("my-recipe-bot");
  });

  it("should remove special characters", async () => {
    const { generateSlug } = await import("@/lib/utils");
    expect(generateSlug("Hello World! @#$%")).toBe("hello-world");
  });

  it("should collapse multiple spaces/hyphens into one hyphen", async () => {
    const { generateSlug } = await import("@/lib/utils");
    expect(generateSlug("too   many   spaces")).toBe("too-many-spaces");
    expect(generateSlug("too---many---hyphens")).toBe("too-many-hyphens");
  });

  it("should trim leading and trailing hyphens", async () => {
    const { generateSlug } = await import("@/lib/utils");
    expect(generateSlug("  -hello world-  ")).toBe("hello-world");
  });

  it("should handle accented characters gracefully", async () => {
    const { generateSlug } = await import("@/lib/utils");
    const slug = generateSlug("Café Résumé");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("should return empty string for empty input", async () => {
    const { generateSlug } = await import("@/lib/utils");
    expect(generateSlug("")).toBe("");
  });
});

describe("utils - hashIp", () => {
  it("should return a hex string", async () => {
    const { hashIp } = await import("@/lib/utils");
    const hash = hashIp("192.168.1.1");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should return the same hash for the same IP", async () => {
    const { hashIp } = await import("@/lib/utils");
    expect(hashIp("10.0.0.1")).toBe(hashIp("10.0.0.1"));
  });

  it("should return different hashes for different IPs", async () => {
    const { hashIp } = await import("@/lib/utils");
    expect(hashIp("10.0.0.1")).not.toBe(hashIp("10.0.0.2"));
  });
});

describe("utils - cn", () => {
  it("should join class names", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should filter out falsy values", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("should return empty string with no args", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn()).toBe("");
  });
});

describe("utils - truncate", () => {
  it("should not modify strings shorter than maxLen", async () => {
    const { truncate } = await import("@/lib/utils");
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("should truncate and add ellipsis for long strings", async () => {
    const { truncate } = await import("@/lib/utils");
    const result = truncate("this is a very long string", 10);
    expect(result.length).toBeLessThanOrEqual(13); // 10 + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("should handle empty strings", async () => {
    const { truncate } = await import("@/lib/utils");
    expect(truncate("", 5)).toBe("");
  });
});
