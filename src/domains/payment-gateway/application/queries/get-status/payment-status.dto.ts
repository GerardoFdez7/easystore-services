import { PaymentStatus } from '../../../aggregates/entities/payment-gateway/payment-gateway.attributes';

export class PaymentStatusDto {
  constructor(
    public readonly paymentId: string,
    public readonly status: PaymentStatus,
    public readonly updatedAt: Date,
  ) {}
}
