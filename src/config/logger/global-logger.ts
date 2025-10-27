/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import pino from 'pino';
import path from 'path';

// Global logger instance
let globalLogger: Logger;
let pinoLogger: pino.Logger;

// Initialize the global logger
export function initializeGlobalLogger(): void {
  // Create pino logger with development and production configurations
  const isDevelopment = process.env.NODE_ENV === 'development';
  const logDir = path.join(process.cwd(), 'logs');

  const today = new Date().toISOString().split('T')[0];
  const appLogFile = path.join(logDir, `app-${today}.log`);
  const errorLogFile = path.join(logDir, `error-${today}.log`);

  const streams = [
    {
      level: 'info',
      stream: pino.destination({
        dest: appLogFile,
        mkdir: true,
        sync: false,
      }),
    },
    {
      level: 'error',
      stream: pino.destination({
        dest: errorLogFile,
        mkdir: true,
        sync: false,
      }),
    },
  ];

  const multistreams = [...streams];

  if (isDevelopment) {
    multistreams.push({
      level: 'debug',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:h:MM:ss TT',
          ignore: 'pid,hostname,context,req,res',
          messageFormat: '\x1b[37m{msg}\x1b[0m',
          levelFirst: false,
          hideObject: true,
          singleLine: false,
          colorizeObjects: false,
        },
      }),
    });
  }

  pinoLogger = pino(
    {
      level: isDevelopment ? 'debug' : 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      base: {
        service: 'easystore-backend',
      },
    },
    pino.multistream(multistreams),
  );

  globalLogger = new Logger('Global');

  // Override NestJS Logger methods to use our pino logger
  globalLogger.log = (message: any, context?: string) => {
    pinoLogger.info(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  };

  globalLogger.error = (message: any, trace?: string, context?: string) => {
    pinoLogger.error(
      { context, trace },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  };

  globalLogger.warn = (message: any, context?: string) => {
    pinoLogger.warn(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  };

  globalLogger.debug = (message: any, context?: string) => {
    pinoLogger.debug(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  };

  globalLogger.verbose = (message: any, context?: string) => {
    pinoLogger.trace(
      { context },
      typeof message === 'string' ? message : JSON.stringify(message),
    );
  };
}

// Global logger functions that can be used anywhere without imports
declare global {
  var logger: {
    log: (message: any, context?: any) => void;
    error: (message: any, context?: any) => void;
    warn: (message: any, context?: any) => void;
    debug: (message: any, context?: any) => void;
    verbose: (message: any, context?: any) => void;
    fatal: (message: any, context?: any) => void;
  };
}

// Set up global logger functions
global.logger = {
  log: (message: any, context?: any) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.log(message, context);
  },
  error: (message: any, context?: any) => {
    if (!globalLogger) initializeGlobalLogger();
    if (message instanceof Error) {
      globalLogger.error(message, context);
    } else if (
      Array.isArray(message) ||
      (typeof message === 'object' && message !== null)
    ) {
      globalLogger.error(JSON.stringify(message), context);
    } else {
      globalLogger.error(String(message), context);
    }
  },
  warn: (message: any, context?: any) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.warn(message, context);
  },
  debug: (message: any, context?: any) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.debug(message, context);
  },
  verbose: (message: any, context?: any) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.verbose(message, context);
  },
  fatal: (message: any, context?: any) => {
    if (!globalLogger) initializeGlobalLogger();
    if (message instanceof Error) {
      globalLogger.fatal(message, context);
    } else if (
      Array.isArray(message) ||
      (typeof message === 'object' && message !== null)
    ) {
      globalLogger.fatal(JSON.stringify(message), context);
    } else {
      globalLogger.fatal(String(message), context);
    }
  },
};

// Export the pino logger for direct use
export function getPinoLogger(): pino.Logger {
  if (!pinoLogger) {
    initializeGlobalLogger();
  }
  return pinoLogger;
}

export { globalLogger };
