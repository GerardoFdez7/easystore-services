import { Injectable } from '@nestjs/common';
import { PaymentProviderFactoryService } from './payment-provider-factory.service';
import { PaymentProviderCredentialRepository } from '../../aggregates/repositories/payment-provider-credential.interface';
import {
  InitiatePaymentParams,
  CompletePaymentParams,
  PaymentResult,
} from '../../aggregates/entities/provider/payment-provider.interface';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly providerFactory: PaymentProviderFactoryService,
    private readonly credentialRepo: PaymentProviderCredentialRepository,
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

  async saveOrUpdateProviderKeys(
    tenantId: string,
    providerType: string,
    credentials: Record<string, unknown>,
  ): Promise<void> {
    await this.credentialRepo.saveCredentials(
      tenantId,
      providerType,
      credentials,
    );
  }
}
