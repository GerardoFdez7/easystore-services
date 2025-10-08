import { PaymentEntity } from '../entities/payment/payment.entity';
import { PaymentIdVO } from '../value-objects/payment/payment-id.vo';
import {
  PaymentStatusVO,
  PaymentStatusEnum,
} from '../value-objects/payment/payment-status.vo';
import { PaymentProviderTypeVO } from '../value-objects/provider/payment-provider-type.vo';

export const PaymentRepository = Symbol('PAYMENT_REPOSITORY');

export interface PaymentRepository {
  save(payment: PaymentEntity): Promise<void>;
  findById(id: PaymentIdVO): Promise<PaymentEntity | null>;
  findByTransactionId(transactionId: string): Promise<PaymentEntity | null>;
  findByOrderId(orderId: string): Promise<PaymentEntity[]>;
  findByTenantId(tenantId: string): Promise<PaymentEntity[]>;
  findByTenantAndStatus(
    tenantId: string,
    status: PaymentStatusVO,
  ): Promise<PaymentEntity[]>;
  findByTenantAndProvider(
    tenantId: string,
    providerType: PaymentProviderTypeVO,
  ): Promise<PaymentEntity[]>;
  findPendingPayments(olderThan?: Date): Promise<PaymentEntity[]>;
  findFailedPayments(olderThan?: Date): Promise<PaymentEntity[]>;
  delete(id: PaymentIdVO): Promise<void>;
  exists(id: PaymentIdVO): Promise<boolean>;
  count(): Promise<number>;
  countByTenant(tenantId: string): Promise<number>;
  countByStatus(status: PaymentStatusEnum): Promise<number>;
}
