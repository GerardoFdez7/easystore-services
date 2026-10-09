import { Logger } from '@nestjs/common';
import { Prisma } from '.prisma/postgres';
import { isDevelopmentEnvironment } from '@config/environment/environment';
import {
  DatabaseOperationError,
  DomainError,
  ForeignKeyConstraintViolationError,
  ResourceNotFoundError,
  UniqueConstraintViolationError,
} from './errors';

interface PrismaDatabaseErrorOptions {
  resource: string;
  foreignKeyEntities?: Readonly<Record<string, string>>;
  uniqueConstraintError?: (
    error: Prisma.PrismaClientKnownRequestError,
    field: string,
  ) => UniqueConstraintViolationError | undefined;
}

const prismaErrorLogger = new Logger('PrismaErrorUtils');

type PrismaDatabaseFailureDiagnostic = {
  event: 'unmapped_prisma_database_error';
  resource: string;
  operation: string;
  errorClass: string;
  prismaCode?: string;
  hasPrismaMetadata?: true;
  postgresCode?: string;
  databaseCause?: string;
  databaseIdentifier?: string;
};

function getDevelopmentDatabaseCause(
  error: Prisma.PrismaClientKnownRequestError,
): Pick<
  PrismaDatabaseFailureDiagnostic,
  'postgresCode' | 'databaseCause' | 'databaseIdentifier'
> {
  if (error.code !== 'P2010') {
    return {};
  }

  const diagnostic: ReturnType<typeof getDevelopmentDatabaseCause> = {};
  const postgresCode = error.meta?.code;
  if (typeof postgresCode === 'string' && /^[A-Z0-9]{5}$/.test(postgresCode)) {
    diagnostic.postgresCode = postgresCode;
  }

  const message = error.meta?.message;
  if (typeof message !== 'string') {
    return diagnostic;
  }

  // PostgreSQL identifiers in these errors refer to schema objects, not query
  // parameters. Only accept identifier characters from the message.
  const missingObject = message.match(
    /\b(column|relation|function) ([A-Za-z_"][A-Za-z_0-9".]*) does not exist\b/i,
  );
  if (missingObject) {
    diagnostic.databaseCause = `${missingObject[1].toLowerCase()} does not exist`;
    diagnostic.databaseIdentifier = missingObject[2];
    return diagnostic;
  }

  if (/\boperator does not exist\b/i.test(message)) {
    diagnostic.databaseCause = 'operator does not exist';
  }

  return diagnostic;
}

function getPrismaErrorCode(error: unknown): string | undefined {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'errorCode' in error &&
    typeof error.errorCode === 'string' &&
    /^P\d{4}$/.test(error.errorCode)
  ) {
    return error.errorCode;
  }

  return undefined;
}

function logUnmappedPrismaDatabaseError(
  error: unknown,
  operation: string,
  resource: string,
): void {
  const diagnostic: PrismaDatabaseFailureDiagnostic = {
    event: 'unmapped_prisma_database_error',
    resource,
    operation,
    errorClass: error instanceof Error ? error.constructor.name : typeof error,
  };
  const prismaCode = getPrismaErrorCode(error);

  if (prismaCode) {
    diagnostic.prismaCode = prismaCode;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.meta !== undefined
  ) {
    diagnostic.hasPrismaMetadata = true;
  }

  if (
    isDevelopmentEnvironment(process.env) &&
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    Object.assign(diagnostic, getDevelopmentDatabaseCause(error));
  }

  // Never log complete Prisma messages or metadata: they can contain SQL, values,
  // connection details, or other sensitive data, even in development.
  prismaErrorLogger.error(JSON.stringify(diagnostic));
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

  logUnmappedPrismaDatabaseError(error, operation, options.resource);
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
