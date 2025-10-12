import { PaymentIdVO } from '../../value-objects/payment/payment-id.vo';
import { PaymentAmountVO } from '../../value-objects/payment/payment-amount.vo';
import { PaymentStatusVO } from '../../value-objects/payment/payment-status.vo';
import { CurrencyVO } from '../../value-objects/payment/currency.vo';
import { PaymentProviderTypeVO } from '../../value-objects/provider/payment-provider-type.vo';

export interface PaymentAttributes {
  id: PaymentIdVO;
  tenantId: string;
  providerType: PaymentProviderTypeVO;
  amount: PaymentAmountVO;
  currency: CurrencyVO;
  status: PaymentStatusVO;
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
