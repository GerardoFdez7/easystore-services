declare global {
  var logger: {
    log: (message: string, context?: string) => void;
    error: (message: string, context?: string) => void;
    warn: (message: string, context?: string) => void;
    debug: (message: string, context?: string) => void;
    verbose: (message: string, context?: string) => void;
  };
}

export {};
