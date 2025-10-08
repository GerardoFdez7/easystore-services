import { PaymentIdVO } from '../../value-objects/payment/payment-id.vo';
import { PaymentAmountVO } from '../../value-objects/payment/payment-amount.vo';
import {
  PaymentStatusVO,
  PaymentStatusEnum,
} from '../../value-objects/payment/payment-status.vo';
import { CurrencyVO } from '../../value-objects/payment/currency.vo';
import { PaymentProviderTypeVO } from '../../value-objects/provider/payment-provider-type.vo';
import { PaymentAttributes } from './payment.attributes';
import { PaymentInitiatedEvent } from '../../events/payment/payment-initiated.event';
import { PaymentCompletedEvent } from '../../events/payment/payment-completed.event';
import { PaymentFailedEvent } from '../../events/payment/payment-failed.event';
import { PaymentRefundedEvent } from '../../events/payment/payment-refunded.event';
import { IEvent } from '@nestjs/cqrs';

export class PaymentEntity {
  private _domainEvents: IEvent[] = [];

  constructor(private readonly attributes: PaymentAttributes) {}

  static create(params: {
    tenantId: string;
    providerType: PaymentProviderTypeVO;
    amount: PaymentAmountVO;
    currency: CurrencyVO;
    orderId: string;
    externalReferenceNumber?: string;
    metadata?: Record<string, unknown>;
  }): PaymentEntity {
    const paymentId = PaymentIdVO.generate();
    const now = new Date();

    const payment = new PaymentEntity({
      id: paymentId,
      tenantId: params.tenantId,
      providerType: params.providerType,
      amount: params.amount,
      currency: params.currency,
      status: new PaymentStatusVO(PaymentStatusEnum.PENDING),
      orderId: params.orderId,
      externalReferenceNumber: params.externalReferenceNumber,
      metadata: params.metadata || {},
      createdAt: now,
      updatedAt: now,
    });

    // Emit domain event
    payment.addDomainEvent(
      new PaymentInitiatedEvent(
        paymentId.value,
        params.tenantId,
        params.providerType.value,
        params.amount.value,
        params.currency.value,
        params.orderId,
        now,
      ),
    );

    return payment;
  }

  static fromPersistence(attributes: PaymentAttributes): PaymentEntity {
    return new PaymentEntity(attributes);
  }

  // Getters
  get id(): PaymentIdVO {
    return this.attributes.id;
  }

  get tenantId(): string {
    return this.attributes.tenantId;
  }

  get providerType(): PaymentProviderTypeVO {
    return this.attributes.providerType;
  }

  get amount(): PaymentAmountVO {
    return this.attributes.amount;
  }

  get currency(): CurrencyVO {
    return this.attributes.currency;
  }

  get status(): PaymentStatusVO {
    return this.attributes.status;
  }

  get orderId(): string {
    return this.attributes.orderId;
  }

  get transactionId(): string | undefined {
    return this.attributes.transactionId;
  }

  get externalReferenceNumber(): string | undefined {
    return this.attributes.externalReferenceNumber;
  }

  get metadata(): Record<string, unknown> {
    return this.attributes.metadata || {};
  }

  get createdAt(): Date {
    return this.attributes.createdAt;
  }

  get updatedAt(): Date {
    return this.attributes.updatedAt;
  }

  get completedAt(): Date | undefined {
    return this.attributes.completedAt;
  }

  get failedAt(): Date | undefined {
    return this.attributes.failedAt;
  }

  get refundedAt(): Date | undefined {
    return this.attributes.refundedAt;
  }

  get failureReason(): string | undefined {
    return this.attributes.failureReason;
  }

  // Business methods
  startProcessing(): void {
    if (!this.status.canTransitionToStatus(PaymentStatusEnum.PROCESSING)) {
      throw new Error(
        `Cannot start processing payment in status: ${this.status.value}`,
      );
    }

    this.attributes.status = new PaymentStatusVO(PaymentStatusEnum.PROCESSING);
    this.attributes.updatedAt = new Date();
  }

  complete(transactionId: string, metadata?: Record<string, unknown>): void {
    if (!this.status.canTransitionToStatus(PaymentStatusEnum.COMPLETED)) {
      throw new Error(
        `Cannot complete payment in status: ${this.status.value}`,
      );
    }

    this.attributes.status = new PaymentStatusVO(PaymentStatusEnum.COMPLETED);
    this.attributes.transactionId = transactionId;
    this.attributes.completedAt = new Date();
    this.attributes.updatedAt = new Date();

    if (metadata) {
      this.attributes.metadata = { ...this.metadata, ...metadata };
    }

    // Emit domain event
    this.addDomainEvent(
      new PaymentCompletedEvent(
        this.id.value,
        this.tenantId,
        this.providerType.value,
        this.amount.value,
        this.currency.value,
        this.orderId,
        transactionId,
        this.attributes.completedAt,
      ),
    );
  }

  fail(reason: string, metadata?: Record<string, unknown>): void {
    if (!this.status.canTransitionToStatus(PaymentStatusEnum.FAILED)) {
      throw new Error(`Cannot fail payment in status: ${this.status.value}`);
    }

    this.attributes.status = new PaymentStatusVO(PaymentStatusEnum.FAILED);
    this.attributes.failureReason = reason;
    this.attributes.failedAt = new Date();
    this.attributes.updatedAt = new Date();

    if (metadata) {
      this.attributes.metadata = { ...this.metadata, ...metadata };
    }

    // Emit domain event
    this.addDomainEvent(
      new PaymentFailedEvent(
        this.id.value,
        this.tenantId,
        this.providerType.value,
        this.amount.value,
        this.currency.value,
        this.orderId,
        reason,
        this.attributes.failedAt,
      ),
    );
  }

  cancel(reason?: string): void {
    if (!this.status.canTransitionToStatus(PaymentStatusEnum.CANCELLED)) {
      throw new Error(`Cannot cancel payment in status: ${this.status.value}`);
    }

    this.attributes.status = new PaymentStatusVO(PaymentStatusEnum.CANCELLED);
    this.attributes.failureReason = reason || 'Payment cancelled by user';
    this.attributes.updatedAt = new Date();
  }

  refund(amount?: PaymentAmountVO, reason?: string): void {
    if (!this.status.canBeRefunded) {
      throw new Error(`Cannot refund payment in status: ${this.status.value}`);
    }

    const refundAmount = amount || this.amount;

    if (refundAmount.value > this.amount.value) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const isPartialRefund = refundAmount.value < this.amount.value;
    const newStatus = isPartialRefund
      ? PaymentStatusEnum.PARTIALLY_REFUNDED
      : PaymentStatusEnum.REFUNDED;

    this.attributes.status = new PaymentStatusVO(newStatus);
    this.attributes.refundedAt = new Date();
    this.attributes.updatedAt = new Date();

    if (reason) {
      this.attributes.metadata = {
        ...this.metadata,
        refundReason: reason,
        refundAmount: refundAmount.value,
      };
    }

    // Emit domain event
    this.addDomainEvent(
      new PaymentRefundedEvent(
        this.id.value,
        this.tenantId,
        this.providerType.value,
        this.amount.value,
        refundAmount.value,
        this.currency.value,
        this.orderId,
        this.transactionId,
        isPartialRefund,
        this.attributes.refundedAt,
      ),
    );
  }

  updateMetadata(metadata: Record<string, unknown>): void {
    this.attributes.metadata = { ...this.metadata, ...metadata };
    this.attributes.updatedAt = new Date();
  }

  // Domain events
  addDomainEvent(event: IEvent): void {
    this._domainEvents.push(event);
  }

  getUncommittedEvents(): IEvent[] {
    return [...this._domainEvents];
  }

  markEventsAsCommitted(): void {
    this._domainEvents = [];
  }

  // Persistence methods
  toPersistence(): PaymentAttributes {
    return { ...this.attributes };
  }
}
