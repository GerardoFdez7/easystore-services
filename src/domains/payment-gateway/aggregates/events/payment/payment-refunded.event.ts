import { IEvent } from '@nestjs/cqrs';

export class PaymentRefundedEvent implements IEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;

  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly providerType: string,
    public readonly originalAmount: number,
    public readonly refundAmount: number,
    public readonly currency: string,
    public readonly orderId: string,
    public readonly transactionId: string,
    public readonly isPartialRefund: boolean,
    public readonly refundedAt: Date,
    eventId?: string,
    occurredOn?: Date,
  ) {
    this.eventId = eventId || this.generateEventId();
    this.occurredOn = occurredOn || new Date();
  }

  eventName(): string {
    return 'payment.refunded';
  }

  toPrimitives(): Record<string, unknown> {
    return {
      paymentId: this.paymentId,
      tenantId: this.tenantId,
      providerType: this.providerType,
      originalAmount: this.originalAmount,
      refundAmount: this.refundAmount,
      currency: this.currency,
      orderId: this.orderId,
      transactionId: this.transactionId,
      isPartialRefund: this.isPartialRefund,
      refundedAt: this.refundedAt.toISOString(),
    };
  }

  static fromPrimitives(
    data: Record<string, unknown>,
    eventId: string,
    occurredOn: Date,
  ): PaymentRefundedEvent {
    return new PaymentRefundedEvent(
      data.paymentId as string,
      data.tenantId as string,
      data.providerType as string,
      data.originalAmount as number,
      data.refundAmount as number,
      data.currency as string,
      data.orderId as string,
      data.transactionId as string,
      data.isPartialRefund as boolean,
      new Date(data.refundedAt as string),
      eventId,
      occurredOn,
    );
  }

  private generateEventId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}
