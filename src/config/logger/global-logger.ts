import { Logger } from '@nestjs/common';

// Global logger instance
let globalLogger: Logger;

// Initialize the global logger
export function initializeGlobalLogger(): void {
  globalLogger = new Logger('Global');
}

// Global logger functions that can be used anywhere without imports
declare global {
  var logger: {
    log: (message: string, context?: unknown) => void;
    error: (message: string, context?: unknown) => void;
    warn: (message: string, context?: unknown) => void;
    debug: (message: string, context?: unknown) => void;
    verbose: (message: string, context?: unknown) => void;
  };
}

// Set up global logger functions
global.logger = {
  log: (message: string, context?: unknown) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.log(message, context);
  },
  error: (message: string, context?: unknown) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.error(message, context);
  },
  warn: (message: string, context?: unknown) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.warn(message, context);
  },
  debug: (message: string, context?: unknown) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.debug(message, context);
  },
  verbose: (message: string, context?: unknown) => {
    if (!globalLogger) initializeGlobalLogger();
    globalLogger.verbose(message, context);
  },
};

export { globalLogger };
