/**
 * Tests for lib/crypto.ts
 * AES-256-GCM encryption/decryption of creator API keys.
 * These keys are stored encrypted in Supabase and decrypted only
 * inside serverless functions at runtime.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// The module under test — will be implemented by [The Developer]
// import { encryptApiKey, decryptApiKey } from "@/lib/crypto";

/**
 * We define the expected interface here so the Developer knows
 * exactly what to implement.
 *
 * encryptApiKey(plaintext: string, secret: string): string
 *   - Returns a base64-encoded string: iv:authTag:ciphertext
 *   - Uses AES-256-GCM
 *   - Generates a random 12-byte IV per encryption
 *
 * decryptApiKey(encrypted: string, secret: string): string
 *   - Accepts the format produced by encryptApiKey
 *   - Returns the original plaintext
 *   - Throws on tampered data or wrong secret
 */

describe("crypto - encryptApiKey / decryptApiKey", () => {
  const TEST_SECRET = "a".repeat(64); // 32 bytes hex = 64 chars
  const TEST_API_KEY = "sk-proj-abc123def456ghi789";

  it("should encrypt and decrypt an API key back to the original value", async () => {
    const { encryptApiKey, decryptApiKey } = await import("@/lib/crypto");
    const encrypted = encryptApiKey(TEST_API_KEY, TEST_SECRET);
    const decrypted = decryptApiKey(encrypted, TEST_SECRET);
    expect(decrypted).toBe(TEST_API_KEY);
  });

  it("should produce different ciphertexts for the same plaintext (random IV)", async () => {
    const { encryptApiKey } = await import("@/lib/crypto");
    const encrypted1 = encryptApiKey(TEST_API_KEY, TEST_SECRET);
    const encrypted2 = encryptApiKey(TEST_API_KEY, TEST_SECRET);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("should produce output in the format iv:authTag:ciphertext (base64 segments)", async () => {
    const { encryptApiKey } = await import("@/lib/crypto");
    const encrypted = encryptApiKey(TEST_API_KEY, TEST_SECRET);
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    // Each part should be valid base64
    parts.forEach((part) => {
      expect(() => Buffer.from(part, "base64")).not.toThrow();
      expect(Buffer.from(part, "base64").length).toBeGreaterThan(0);
    });
  });

  it("should throw when decrypting with the wrong secret", async () => {
    const { encryptApiKey, decryptApiKey } = await import("@/lib/crypto");
    const wrongSecret = "b".repeat(64);
    const encrypted = encryptApiKey(TEST_API_KEY, TEST_SECRET);
    expect(() => decryptApiKey(encrypted, wrongSecret)).toThrow();
  });

  it("should throw when the ciphertext is tampered with", async () => {
    const { encryptApiKey, decryptApiKey } = await import("@/lib/crypto");
    const encrypted = encryptApiKey(TEST_API_KEY, TEST_SECRET);
    const tampered = encrypted.slice(0, -4) + "XXXX";
    expect(() => decryptApiKey(tampered, TEST_SECRET)).toThrow();
  });

  it("should throw when the encrypted string format is invalid", async () => {
    const { decryptApiKey } = await import("@/lib/crypto");
    expect(() => decryptApiKey("not-valid-format", TEST_SECRET)).toThrow();
    expect(() => decryptApiKey("", TEST_SECRET)).toThrow();
  });

  it("should handle empty string API key", async () => {
    const { encryptApiKey, decryptApiKey } = await import("@/lib/crypto");
    const encrypted = encryptApiKey("", TEST_SECRET);
    const decrypted = decryptApiKey(encrypted, TEST_SECRET);
    expect(decrypted).toBe("");
  });

  it("should handle very long API keys", async () => {
    const { encryptApiKey, decryptApiKey } = await import("@/lib/crypto");
    const longKey = "sk-" + "x".repeat(500);
    const encrypted = encryptApiKey(longKey, TEST_SECRET);
    const decrypted = decryptApiKey(encrypted, TEST_SECRET);
    expect(decrypted).toBe(longKey);
  });

  it("should reject secrets that are not 64 hex characters (32 bytes)", async () => {
    const { encryptApiKey } = await import("@/lib/crypto");
    expect(() => encryptApiKey(TEST_API_KEY, "tooshort")).toThrow();
    expect(() => encryptApiKey(TEST_API_KEY, "")).toThrow();
  });
});
