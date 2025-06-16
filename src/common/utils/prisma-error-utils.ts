import { Prisma } from '.prisma/postgres';

/**
 * Utility functions for handling Prisma errors across all domains
 */
export class PrismaErrorUtils {
  /**
   * Extracts field name from Prisma unique constraint error
   * @param error The Prisma error containing constraint information
   * @returns The field name that caused the constraint violation
   */
  static extractFieldFromUniqueConstraintError(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    const target = error.meta?.target as string[] | undefined;
    if (target && target.length > 0) {
      // Return the last field in the constraint (usually the most relevant)
      return target[target.length - 1];
    }
    return 'field';
  }

  /**
   * Extracts the field name from foreign key constraint errors
   * @param error The Prisma error containing foreign key information
   * @returns The field name that caused the foreign key violation
   */
  static extractFieldFromForeignKeyError(
    error: Prisma.PrismaClientKnownRequestError,
  ): string {
    const field = error.meta?.field_name as string | undefined;
    return field || 'unknown field';
  }
}
