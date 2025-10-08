import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { PaymentProviderTypeVO } from '../../../aggregates/value-objects/provider/payment-provider-type.vo';
import { PaymentAmountVO } from '../../../aggregates/value-objects/payment/payment-amount.vo';
import { CurrencyVO } from '../../../aggregates/value-objects/payment/currency.vo';

export class InitiatePaymentDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  providerType: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsOptional()
  @IsString()
  externalReferenceNumber?: string;

  @IsOptional()
  details?: Record<string, unknown>;

  @IsOptional()
  customParams?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  allowPendingPayments?: boolean = false;

  constructor(
    tenantId: string,
    providerType: string,
    amount: number,
    currency: string,
    orderId: string,
    externalReferenceNumber?: string,
    details?: Record<string, unknown>,
    customParams?: Record<string, unknown>,
    allowPendingPayments?: boolean,
  ) {
    this.tenantId = tenantId;
    this.providerType = providerType;
    this.amount = amount;
    this.currency = currency;
    this.orderId = orderId;
    this.externalReferenceNumber = externalReferenceNumber;
    this.details = details;
    this.customParams = customParams;
    this.allowPendingPayments = allowPendingPayments || false;
  }

  get providerTypeVO(): PaymentProviderTypeVO {
    return PaymentProviderTypeVO.fromString(this.providerType);
  }

  get amountVO(): PaymentAmountVO {
    return new PaymentAmountVO(this.amount);
  }

  get currencyVO(): CurrencyVO {
    return CurrencyVO.fromString(this.currency);
  }
}
