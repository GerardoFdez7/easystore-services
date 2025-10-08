import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { PaymentStatusEnum } from '../../../aggregates/value-objects/payment/payment-status.vo';

export class ListPaymentsDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsEnum(PaymentStatusEnum)
  status?: PaymentStatusEnum;

  @IsOptional()
  @IsString()
  providerType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  constructor(
    tenantId: string,
    orderId?: string,
    status?: PaymentStatusEnum,
    providerType?: string,
    page?: number,
    limit?: number,
  ) {
    this.tenantId = tenantId;
    this.orderId = orderId;
    this.status = status;
    this.providerType = providerType;
    this.page = page || 1;
    this.limit = limit || 20;
  }
}
