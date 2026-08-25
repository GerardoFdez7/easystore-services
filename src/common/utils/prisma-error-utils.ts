import { Prisma } from '.prisma/postgres';
import {
  DatabaseOperationError,
  DomainError,
  ForeignKeyConstraintViolationError,
  ResourceNotFoundError,
  UniqueConstraintViolationError,
} from '@shared/errors';

interface PrismaDatabaseErrorOptions {
  resource: string;
  foreignKeyEntities?: Readonly<Record<string, string>>;
  uniqueConstraintError?: (
    error: Prisma.PrismaClientKnownRequestError,
    field: string,
  ) => UniqueConstraintViolationError | undefined;
}

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

/**
 * Translates infrastructure-specific Prisma failures into shared domain errors.
 */
export function handlePrismaDatabaseError(
  error: unknown,
  operation: string,
  options: PrismaDatabaseErrorOptions,
): never {
  if (error instanceof DomainError) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const field =
        PrismaErrorUtils.extractFieldFromUniqueConstraintError(error);
      const customError = options.uniqueConstraintError?.(error, field);

      throw (
        customError ??
        new UniqueConstraintViolationError(
          field,
          `${options.resource} ${field} already exists`,
        )
      );
    }

    if (error.code === 'P2003') {
      const field = PrismaErrorUtils.extractFieldFromForeignKeyError(error);
      let relatedEntity = 'Related Entity';
      if (options.foreignKeyEntities) {
        for (const [foreignKeyField, entityName] of Object.entries(
          options.foreignKeyEntities,
        )) {
          if (foreignKeyField === field && typeof entityName === 'string') {
            relatedEntity = entityName;
            break;
          }
        }
      }

      throw new ForeignKeyConstraintViolationError(field, relatedEntity);
    }

    if (error.code === 'P2025') {
      throw new ResourceNotFoundError(options.resource);
    }
  }

  throw new DatabaseOperationError(operation);
}

export async function executeDatabaseOperation<T>(
  operation: () => Promise<T>,
  handleError: (error: unknown) => never,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    return handleError(error);
  }
}
