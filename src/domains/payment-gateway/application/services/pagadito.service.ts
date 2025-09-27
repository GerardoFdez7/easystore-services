import { Injectable, Inject } from '@nestjs/common';
import { PaymentProviderCredentialRepository } from '../../aggregates/repositories/payment-provider-credential.interface';
import {
  PagaditoCredentials,
  PagaditoProvider,
} from '../../infrastructure/providers/pagadito/pagadito.provider';
import {
  InitiatePaymentParams,
  PaymentResult,
} from '../../aggregates/entities/provider/payment-provider.interface';
import { PaymentProviderType } from '../../aggregates/entities';

@Injectable()
export class PagaditoService {
  constructor(
    @Inject('PaymentProviderCredentialRepository')
    private readonly credentialRepo: PaymentProviderCredentialRepository,
  ) {}

  async initiatePayment(
    tenantId: string,
    params: InitiatePaymentParams,
  ): Promise<PaymentResult> {
    const credentials = await this.credentialRepo.getCredentials(
      tenantId,
      PaymentProviderType.PAGADITO,
    );
    const provider = new PagaditoProvider(credentials as PagaditoCredentials);
    return provider.initiatePayment(params);
  }
}
