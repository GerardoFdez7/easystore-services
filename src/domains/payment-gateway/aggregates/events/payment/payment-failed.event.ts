import { IEvent } from '@nestjs/cqrs';

export class PaymentFailedEvent implements IEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly providerType: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly orderId: string,
    public readonly failureReason: string,
    public readonly failedAt: Date,
    eventId?: string,
    occurredOn?: Date,
  ) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = occurredOn || new Date();
  }

  eventName(): string {
    return 'payment.failed';
  }

  toPrimitives(): Record<string, unknown> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      providerType: this.providerType,
      amount: this.amount,
      currency: this.currency,
      orderId: this.orderId,
      failureReason: this.failureReason,
      failedAt: this.failedAt.toISOString(),
    };
  }

  static fromPrimitives(
    data: Record<string, unknown>,
    eventId: string,
    occurredOn: Date,
  ): PaymentFailedEvent {
    return new PaymentFailedEvent(
      data.paymentId as string,
      data.tenantId as string,
      data.providerType as string,
      data.amount as number,
      data.currency as string,
      data.orderId as string,
      data.failureReason as string,
      new Date(data.failedAt as string),
      eventId,
      occurredOn,
    );
  }

  private generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
