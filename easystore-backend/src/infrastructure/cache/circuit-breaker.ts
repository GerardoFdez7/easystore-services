export enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

interface CircuitBreakerOptions {
  name: string;
  failureThreshold: number;
  resetTimeout: number;
  onOpen?: () => void;
  onClose?: () => void;
  onHalfOpen?: () => void;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private resetTimer: NodeJS.Timeout | null = null;
  private readonly options: CircuitBreakerOptions;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 30000,
      ...options,
    };
  }

  async execute<T>(func: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      throw new Error(`Circuit breaker ${this.options.name} is OPEN`);
    }

    try {
      const result = await func();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.setState(CircuitState.CLOSED);
    }
  }

  private onFailure(): void {
    this.failures++;

    if (
      (this.state === CircuitState.CLOSED &&
        this.failures >= this.options.failureThreshold) ||
      this.state === CircuitState.HALF_OPEN
    ) {
      this.setState(CircuitState.OPEN);
      this.scheduleReset();
    }
  }

  private setState(state: CircuitState): void {
    this.state = state;

    switch (state) {
      case CircuitState.OPEN:
        if (this.options.onOpen) this.options.onOpen();
        break;
      case CircuitState.HALF_OPEN:
        if (this.options.onHalfOpen) this.options.onHalfOpen();
        break;
      case CircuitState.CLOSED:
        if (this.options.onClose) this.options.onClose();
        break;
    }
  }

  private scheduleReset(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }

    this.resetTimer = setTimeout(() => {
      this.setState(CircuitState.HALF_OPEN);
      this.resetTimer = null;
    }, this.options.resetTimeout);
  }
}
