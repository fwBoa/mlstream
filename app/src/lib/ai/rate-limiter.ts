/**
 * In-memory sliding window rate limiter.
 * Used by the AI proxy to limit requests per IP address.
 */

interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private windows: Map<string, { count: number; startTime: number }>;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.windows = new Map();
  }

  /**
   * Check if a request from the given identifier is allowed.
   * Increments the counter if allowed.
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now();
    const window = this.windows.get(identifier);

    // New window or expired window
    if (!window || now - window.startTime >= this.windowMs) {
      if (this.maxRequests <= 0) {
        this.windows.set(identifier, { count: 0, startTime: now });
        return { allowed: false, remaining: 0, resetAt: now + this.windowMs };
      }
      this.windows.set(identifier, { count: 1, startTime: now });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs };
    }

    // Existing window — check if over limit
    if (window.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: window.startTime + this.windowMs };
    }

    window.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - window.count,
      resetAt: window.startTime + this.windowMs,
    };
  }

  /** Reset the counter for a specific identifier */
  reset(identifier: string): void {
    this.windows.delete(identifier);
  }

  /** Reset all counters */
  resetAll(): void {
    this.windows.clear();
  }
}
