import { IEvent } from '@nestjs/cqrs';

/**
 * Base class for all domain events
 * Provides common functionality for domain events
 */
export abstract class DomainEvent implements IEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(eventId?: string, occurredOn?: Date) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = occurredOn || new Date();
  }

  abstract eventName(): string;

  abstract toPrimitives(): Record<string, unknown>;

  static fromPrimitives<T extends DomainEvent>(
    this: new (...args: unknown[]) => T,
    data: Record<string, unknown>,
    eventId: string,
    occurredOn: Date,
  ): T {
    return new this(data, eventId, occurredOn);
  }

  private generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
