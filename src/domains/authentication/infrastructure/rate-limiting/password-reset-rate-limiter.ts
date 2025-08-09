import { Injectable } from '@nestjs/common';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class PasswordResetRateLimiter {
  private readonly attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts = 3;
  private readonly windowMs = 60 * 60 * 1000; // 1 hour in milliseconds

  /**
   * Check if email has exceeded rate limit for password reset requests
   * @param email - The email address to check
   * @returns true if rate limit exceeded, false otherwise
   */
  isRateLimited(email: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(email);

    if (!entry) {
      return false;
    }

    // Reset counter if window has expired
    if (now > entry.resetTime) {
      this.attempts.delete(email);
      return false;
    }

    return entry.count >= this.maxAttempts;
  }

  /**
   * Record a password reset attempt for an email
   * @param email - The email address
   */
  recordAttempt(email: string): void {
    const now = Date.now();
    const entry = this.attempts.get(email);

    if (!entry || now > entry.resetTime) {
      // First attempt or window expired, create new entry
      this.attempts.set(email, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    } else {
      // Increment existing entry
      entry.count++;
    }
  }

  /**
   * Get remaining time until rate limit resets (in minutes)
   * @param email - The email address
   * @returns minutes until reset, or 0 if not rate limited
   */
  getTimeUntilReset(email: string): number {
    const entry = this.attempts.get(email);
    if (!entry) {
      return 0;
    }

    const now = Date.now();
    if (now > entry.resetTime) {
      return 0;
    }

    return Math.ceil((entry.resetTime - now) / (60 * 1000)); // Convert to minutes
  }

  /**
   * Clear rate limit for an email (useful for testing or admin actions)
   * @param email - The email address
   */
  clearRateLimit(email: string): void {
    this.attempts.delete(email);
  }

  /**
   * Get current attempt count for an email
   * @param email - The email address
   * @returns current attempt count
   */
  getAttemptCount(email: string): number {
    const entry = this.attempts.get(email);
    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }
    return entry.count;
  }

  /**
   * Clean up expired entries (should be called periodically)
   * @returns The number of expired entries that were removed
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [email, entry] of this.attempts.entries()) {
      if (now > entry.resetTime) {
        this.attempts.delete(email);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Clears all rate limiting attempts for a specific email
   * Used when a password reset is successfully completed
   * @param email - The email address to clear attempts for
   */
  clearAttempts(email: string): void {
    this.attempts.delete(email);
  }
}
