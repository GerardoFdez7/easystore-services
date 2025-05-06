import { LoggerService } from '@shared/winston/winston.service';

// Excepciones de dominio

export class TenantNotFoundException extends Error {
  constructor() {
    super('Tenant not found');
    this.name = 'TenantNotFoundException';
  }

  getCode(): number {
    return 404;
  }

  getHeaders(): Record<string, string> {
    return {
      'X-Tenant-Error': 'TenantNotFound',
    };
  }
}

export class InvalidCredentialsException extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsException';
  }

  getCode(): number {
    return 401;
  }

  getHeaders(): Record<string, string> {
    return {
      'X-Tenant-Error': 'InvalidCredentials',
    };
  }
}

// Manejador de excepciones

export class ExceptionHandler {
  constructor(private readonly logger: LoggerService) {}

  handle(error: Error) {
    const timestamp = new Date().toISOString();
    const type = error.name;
    const message = error.message;
    const code = (error as any).getCode?.() || 500;
    const headers = (error as any).getHeaders?.() || {};

    this.logger.error(`[${timestamp}] [${type}] ${message}`, {
      code,
      headers,
    });

    return {
      statusCode: code,
      error: type,
      message,
      headers,
    };
  }
}

// Exportación opcional para facilitar uso

export const ExceptionTypes = {
  TenantNotFoundException,
  InvalidCredentialsException,
};
