import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordResetRateLimiter } from '../rate-limiting/password-reset-rate-limiter';

/**
 * Service responsible for periodic cleanup of expired rate limiting entries
 * to prevent memory leaks and maintain optimal performance.
 */
@Injectable()
export class CleanupService {
  constructor(
    private readonly passwordResetRateLimiter: PasswordResetRateLimiter,
  ) {}

  /**
   * Runs every hour to clean up expired rate limiting entries.
   * This prevents memory accumulation and maintains optimal performance.
   */
  @Cron(CronExpression.EVERY_HOUR)
  cleanupExpiredRateLimits(): void {
    try {
      this.passwordResetRateLimiter.cleanup();
    } catch (error) {
      logger.error('Failed to cleanup expired rate limiting entries', error);
    }
  }

  /**
   * Manual cleanup method that can be called on-demand.
   * Useful for testing or manual maintenance operations.
   */
  manualCleanup(): number {
    try {
      const cleanedCount = this.passwordResetRateLimiter.cleanup();
      logger.log(`Manual cleanup: ${cleanedCount} expired entries removed`);
      return cleanedCount;
    } catch (error) {
      logger.error('Failed to perform manual cleanup', error);
      throw error;
    }
  }
}
