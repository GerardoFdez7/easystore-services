import { Injectable } from '@nestjs/common';
import { PaymentProviderFactoryService } from './payment-provider-factory.service';
import {
  InitiatePaymentParams,
  CompletePaymentParams,
  RefundPaymentParams,
  PaymentResult,
} from '../../aggregates/entities/provider/payment-provider.interface';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly providerFactory: PaymentProviderFactoryService,
  ) {}

  async initiatePayment(
    tenantId: string,
    providerType: string,
    params: InitiatePaymentParams,
  ): Promise<PaymentResult> {
    const provider = await this.providerFactory.getProvider(
      tenantId,
      providerType,
    );
    return provider.initiatePayment(params);
  }

  async completePayment(
    tenantId: string,
    providerType: string,
    params: CompletePaymentParams,
  ): Promise<PaymentResult> {
    const provider = await this.providerFactory.getProvider(
      tenantId,
      providerType,
    );
    return provider.completePayment(params);
  }

  async refundPayment(
    tenantId: string,
    providerType: string,
    params: RefundPaymentParams,
  ): Promise<PaymentResult> {
    const provider = await this.providerFactory.getProvider(
      tenantId,
      providerType,
    );

    if (!provider.refundPayment) {
      return {
        success: false,
        error: 'Refund not supported for this provider',
        raw: params,
      };
    }

    return provider.refundPayment(params);
  }
}
