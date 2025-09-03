import { Injectable } from '@nestjs/common';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { InitiatePaymentDto } from './initiate-payment.dto';
import { PaymentResult } from '../../../aggregates/entities/provider/payment-provider.interface';

@Injectable()
export class InitiatePaymentHandler {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  async handle(dto: InitiatePaymentDto): Promise<PaymentResult> {
    return this.paymentGatewayService.initiatePayment(
      dto.tenantId,
      dto.providerType,
      {
        amount: dto.amount,
        currency: dto.currency,
        orderId: dto.orderId,
        details: dto.details,
        customParams: dto.customParams,
        allowPendingPayments: dto.allowPendingPayments,
        externalReferenceNumber: dto.externalReferenceNumber,
      },
    );
  }
}
