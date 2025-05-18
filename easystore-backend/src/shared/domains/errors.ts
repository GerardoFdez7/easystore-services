/**
 * Base class for all domain-specific errors.
 * Provides a common structure including an error code and optional metadata.
 */
export class DomainError extends Error {
  /**
   * Constructs a new DomainError.
   * @param code A unique code for this type of error (e.g., 'RESOURCE_NOT_FOUND').
   * @param message A human-readable description of the error.
   * @param metadata Optional additional data related to the error.
   */
  constructor(
    public readonly code: string,
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Error indicating that a requested resource could not be found.
 */
export class ResourceNotFoundError extends DomainError {
  /**
   * Constructs a new ResourceNotFoundError.
   * @param resource The type of resource that was not found (e.g., 'User', 'Product').
   * @param identifier Optional identifier of the resource that was not found.
   */
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} with identifier ${identifier} was not found`
      : `${resource} was not found`;
    super('RESOURCE_NOT_FOUND', message, { resource, identifier });
  }
}

/**
 * Error indicating that a unique constraint was violated (e.g., a field that must be unique already has the given value).
 */
export class UniqueConstraintViolationError extends DomainError {
  /**
   * Constructs a new UniqueConstraintViolationError.
   * @param field The field that caused the unique constraint violation.
   * @param customMessage Optional custom message to override the default.
   */
  constructor(field: string, customMessage?: string) {
    const message =
      customMessage || `${field} already exists and must be unique`;
    super('UNIQUE_CONSTRAINT_VIOLATION', message, { field });
  }
}

/**
 * Error indicating that a foreign key constraint was violated (e.g., a referenced entity does not exist).
 */
export class ForeignKeyConstraintViolationError extends DomainError {
  /**
   * Constructs a new ForeignKeyConstraintViolationError.
   * @param field The field that references the related entity.
   * @param relatedEntity The type of the related entity that was expected but not found.
   */
  constructor(field: string, relatedEntity: string) {
    super(
      'FOREIGN_KEY_CONSTRAINT_VIOLATION',
      `Referenced ${relatedEntity} for ${field} does not exist`,
      { field, relatedEntity },
    );
  }
}

/**
 * Error indicating that a database operation failed for an unexpected reason.
 */
export class DatabaseOperationError extends DomainError {
  /**
   * Constructs a new DatabaseOperationError.
   * @param operation The type of database operation that failed (e.g., 'save', 'find').
   * @param detail Optional detailed message about the failure.
   * @param originalError Optional original error that caused this database operation error.
   */
  constructor(operation: string, detail?: string, originalError?: Error) {
    const message = detail
      ? `Database ${operation} failed: ${detail}`
      : `Database ${operation} failed`;

    super('DATABASE_OPERATION_ERROR', message, {
      operation,
      originalError: originalError
        ? {
            name: originalError.name,
            message: originalError.message,
            stack: originalError.stack,
          }
        : undefined,
    });
  }
}
