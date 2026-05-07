/**
 * AES-256-GCM encryption/decryption for creator API keys.
 * Keys are encrypted before storage in Supabase and decrypted
 * only inside serverless functions at request time.
 */
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

/**
 * Validates that the secret is a 64-character hex string (32 bytes).
 */
function validateSecret(secret: string): void {
  if (!secret || secret.length !== 64 || !/^[a-fA-F0-9]{64}$/.test(secret)) {
    throw new Error("Secret must be a 64-character hex string (32 bytes)");
  }
}

/**
 * Encrypts an API key using AES-256-GCM.
 * @param plaintext - The API key to encrypt
 * @param secret - 64-char hex string (32 bytes) used as the encryption key
 * @returns Base64-encoded string in format: iv:authTag:ciphertext
 */
export function encryptApiKey(plaintext: string, secret: string): string {
  validateSecret(secret);

  const key = Buffer.from(secret, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

/**
 * Decrypts an API key previously encrypted with encryptApiKey.
 * @param encrypted - The encrypted string in format iv:authTag:ciphertext
 * @param secret - The same 64-char hex secret used for encryption
 * @returns The original plaintext API key
 * @throws On tampered data, wrong secret, or invalid format
 */
export function decryptApiKey(encrypted: string, secret: string): string {
  validateSecret(secret);

  if (!encrypted) {
    throw new Error("Encrypted string cannot be empty");
  }

  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format: expected iv:authTag:ciphertext");
  }

  const [ivB64, authTagB64, ciphertextB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const key = Buffer.from(secret, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}
