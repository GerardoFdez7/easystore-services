import { Injectable } from '@nestjs/common';
import { PaymentGatewayService } from '../../services/payment-gateway.service';
import { CompletePaymentDto } from './complete-payment.dto';
import { PaymentResult } from '../../../aggregates/entities/provider/payment-provider.interface';

@Injectable()
export class CompletePaymentHandler {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  async handle(dto: CompletePaymentDto): Promise<PaymentResult> {
    const dtoTyped = dto as {
      tenantId: string;
      providerType: string;
      paymentId: string;
    };
    return this.paymentGatewayService.completePayment(
      dtoTyped.tenantId,
      dtoTyped.providerType,
      {
        paymentId: dtoTyped.paymentId,
      },
    );
  }
}
