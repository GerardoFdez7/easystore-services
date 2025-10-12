import { IsString, IsNotEmpty } from 'class-validator';

export class GetPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  tenantId: string;

  constructor(paymentId: string, tenantId: string) {
    this.paymentId = paymentId;
    this.tenantId = tenantId;
  }
}
