// src/domain/tenant/utils/exception-handler.ts
import { LoggerService } from '@shared/winston/winston.service';

export enum DomainErrorCode {
  TENANT_NOT_FOUND = 'TENANT_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
}

export interface DomainExceptionResponse {
  errorType: string;
  errorCode: string;
  message: string;
  headers?: Record<string, string>;
}

export class DomainException extends Error {
  constructor(
    public readonly response: DomainExceptionResponse,
    public readonly statusCode: number = 400,
  ) {
    super(response.message);
  }
}

export class ExceptionHandler {
  constructor(private readonly logger: LoggerService) {}

  handle(
    errorType: string,
    message: string,
    errorCode: DomainErrorCode,
    headers?: Record<string, string>,
  ): never {
    const formattedError: DomainExceptionResponse = {
      errorType,
      errorCode,
      message,
      headers: headers || {},
    };

    this.logger.error(`[${errorType}] ${message}`, formattedError);

    throw new DomainException(formattedError);
  }
}
