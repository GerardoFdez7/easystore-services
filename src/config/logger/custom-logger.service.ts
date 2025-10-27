/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { LoggerService } from '@nestjs/common';
import { getPinoLogger } from './global-logger';

export class CustomLoggerService implements LoggerService {
  private pinoLogger = getPinoLogger();

  log(message: any, context?: any): void {
    // Filter out module initialization logs to reduce noise
    const messageStr =
      typeof message === 'string' ? message : JSON.stringify(message);

    // Skip all module dependency initialization messages
    if (
      messageStr.includes('dependencies initialized') ||
      messageStr.includes('Mapped {/gql, POST} route') ||
      messageStr.includes('Nest application successfully started') ||
      messageStr.includes('Starting Nest application...')
    ) {
      return;
    }

    this.pinoLogger.info({ context }, messageStr);
  }

  error(message: any, trace?: any, context?: any): void {
    this.pinoLogger.error(
      { context, trace },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  }

  warn(message: any, context?: any): void {
    this.pinoLogger.warn(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  }

  debug(message: any, context?: any): void {
    this.pinoLogger.debug(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  }

  verbose(message: any, context?: any): void {
    this.pinoLogger.trace(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  }

  fatal(message: any, context?: any): void {
    this.pinoLogger.fatal(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  }
}
