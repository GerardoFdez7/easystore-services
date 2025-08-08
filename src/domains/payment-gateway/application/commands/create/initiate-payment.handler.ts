import { Injectable } from '@nestjs/common';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { InitiatePaymentDto } from './initiate-payment.dto';
import { PaymentResult } from '../../../aggregates/entities/provider/payment-provider.interface';

@Injectable()
export class InitiatePaymentHandler {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  async handle(dto: InitiatePaymentDto): Promise<PaymentResult> {
    // Assume dto contains tenantId, providerType, amount, currency, orderId
    return this.paymentGatewayService.initiatePayment(
      dto.tenantId,
      dto.providerType,
      {
        amount: dto.amount,
        currency: dto.currency,
        orderId: dto.orderId,
      },
    );
  }
}
