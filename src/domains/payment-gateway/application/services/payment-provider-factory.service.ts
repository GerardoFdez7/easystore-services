import { Injectable } from '@nestjs/common';
import { PaymentProvider } from '../../aggregates/entities/provider/payment-provider.interface';
import {
  PagaditoCredentials,
  PagaditoProvider,
} from '../../infrastructure/providers/pagadito/pagadito.provider';
import {
  VisanetCredentials,
  VisanetProvider,
} from '../../infrastructure/providers/visanet/visanet.provider';
import {
  PaypalCredentials,
  PaypalProvider,
} from '../../infrastructure/providers/paypal/paypal.provider';
import { PaymentProviderCredentialRepository } from '../../aggregates/repositories/payment-provider-credential.interface';

@Injectable()
export class PaymentProviderFactoryService {
  constructor(
    private readonly credentialRepo: PaymentProviderCredentialRepository,
  ) {}

  async getProvider(
    tenantId: string,
    providerType: string,
  ): Promise<PaymentProvider> {
    const credentials = await this.credentialRepo.getCredentials(
      tenantId,
      providerType,
    );
    switch (providerType) {
      case 'PAGADITO':
        return new PagaditoProvider(credentials as PagaditoCredentials);
      case 'VISANET':
        return new VisanetProvider(credentials as VisanetCredentials);
      case 'PAYPAL':
        return new PaypalProvider(credentials as PaypalCredentials);
      default:
        throw new Error('Unsupported payment provider');
    }
  }
}
