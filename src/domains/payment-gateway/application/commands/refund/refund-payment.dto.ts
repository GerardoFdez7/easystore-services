import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { PaymentAmountVO } from '../../../aggregates/value-objects/payment/payment-amount.vo';

export class RefundPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  constructor(
    paymentId: string,
    tenantId: string,
    amount?: number,
    reason?: string,
  ) {
    this.paymentId = paymentId;
    this.tenantId = tenantId;
    this.amount = amount;
    this.reason = reason;
  }

  get amountVO(): PaymentAmountVO | undefined {
    return this.amount ? new PaymentAmountVO(this.amount) : undefined;
  }
}
