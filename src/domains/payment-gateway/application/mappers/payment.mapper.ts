import { PaymentEntity } from '../../aggregates/entities/payment/payment.entity';
import { PaymentStatusEnum } from '../../aggregates/value-objects/payment/payment-status.vo';

export interface PaymentDto {
  id: string;
  tenantId: string;
  providerType: string;
  amount: number;
  currency: string;
  status: PaymentStatusEnum;
  orderId: string;
  transactionId?: string;
  externalReferenceNumber?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  failureReason?: string;
}

export interface PaymentSummaryDto {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatusEnum;
  orderId: string;
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class PaymentMapper {
  static toDto(payment: PaymentEntity): PaymentDto {
    const id = (payment.id as { value: string }).value;
    const providerType = (payment.providerType as { value: string }).value;
    const amount = (payment.amount as { value: number }).value;
    const currency = (payment.currency as { value: string }).value;
    const status = (payment.status as { value: PaymentStatusEnum }).value;

    return {
      id,
      tenantId: payment.tenantId,
      providerType,
      amount,
      currency,
      status,
      orderId: payment.orderId,
      transactionId: payment.transactionId,
      externalReferenceNumber: payment.externalReferenceNumber,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      completedAt: payment.completedAt,
      failedAt: payment.failedAt,
      refundedAt: payment.refundedAt,
      failureReason: payment.failureReason,
    };
  }

  static toSummaryDto(payment: PaymentEntity): PaymentSummaryDto {
    const id = (payment.id as { value: string }).value;
    const amount = (payment.amount as { value: number }).value;
    const currency = (payment.currency as { value: string }).value;
    const status = (payment.status as { value: PaymentStatusEnum }).value;

    return {
      id,
      amount,
      currency,
      status,
      orderId: payment.orderId,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    };
  }

  static toDtoList(payments: PaymentEntity[]): PaymentDto[] {
    return payments.map((payment) => this.toDto(payment));
  }

  static toSummaryDtoList(payments: PaymentEntity[]): PaymentSummaryDto[] {
    return payments.map((payment) => this.toSummaryDto(payment));
  }
}
