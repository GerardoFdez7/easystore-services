import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
import { PaymentCredentialsService } from '../../../tenant/application/services/payment-credentials.service';
import { PaymentProviderTypeVO } from '../../../tenant/aggregates/value-objects/payment-provider-type.vo';

@Injectable()
export class PaymentProviderFactoryService {
  constructor(
    @Inject(forwardRef(() => PaymentCredentialsService))
    private readonly credentialsService: PaymentCredentialsService,
  ) {}

  async getProvider(
    tenantId: string,
    providerType: string,
  ): Promise<PaymentProvider> {
    const providerTypeVO = PaymentProviderTypeVO.create(providerType);
    const credentials = await this.credentialsService.getDecryptedCredentials(
      tenantId,
      providerTypeVO,
    );

    switch (providerType) {
      case 'PAGADITO':
        return new PagaditoProvider(
          credentials as unknown as PagaditoCredentials,
        );
      case 'VISANET':
        return new VisanetProvider(
          credentials as unknown as VisanetCredentials,
        );
      case 'PAYPAL':
        return new PaypalProvider(credentials as unknown as PaypalCredentials);
      default:
        throw new Error('Unsupported payment provider');
    }
  }
}
