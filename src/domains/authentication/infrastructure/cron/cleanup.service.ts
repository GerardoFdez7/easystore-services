import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '@winston/winston.service';
import { PasswordResetRateLimiter } from '../rate-limiting/password-reset-rate-limiter';

/**
 * Service responsible for periodic cleanup of expired rate limiting entries
 * to prevent memory leaks and maintain optimal performance.
 */
@Injectable()
export class CleanupService {
  private readonly logger: LoggerService;

  constructor(
    private readonly passwordResetRateLimiter: PasswordResetRateLimiter,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
  }

  /**
   * Runs every hour to clean up expired rate limiting entries.
   * This prevents memory accumulation and maintains optimal performance.
   */
  @Cron(CronExpression.EVERY_HOUR)
  cleanupExpiredRateLimits(): void {
    try {
      const startTime = Date.now();
      const cleanedCount = this.passwordResetRateLimiter.cleanup();
      const duration = Date.now() - startTime;

      this.logger.log(
        `Reset password tokens cleanup completed: ${cleanedCount} expired entries removed in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to cleanup expired rate limiting entries',
        error,
      );
    }
  }

  /**
   * Manual cleanup method that can be called on-demand.
   * Useful for testing or manual maintenance operations.
   */
  manualCleanup(): number {
    try {
      const cleanedCount = this.passwordResetRateLimiter.cleanup();
      this.logger.log(
        `Manual cleanup: ${cleanedCount} expired entries removed`,
      );
      return cleanedCount;
    } catch (error) {
      this.logger.error('Failed to perform manual cleanup', error);
      throw error;
    }
  }
}
