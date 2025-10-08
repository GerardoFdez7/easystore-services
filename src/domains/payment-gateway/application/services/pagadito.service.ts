import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PaymentCredentialsService } from '../../../tenant/application/services/payment-credentials.service';
import {
  PagaditoCredentials,
  PagaditoProvider,
} from '../../infrastructure/providers/pagadito/pagadito.provider';
import {
  InitiatePaymentParams,
  PaymentResult,
} from '../../aggregates/entities/provider/payment-provider.interface';
import { PaymentProviderTypeVO } from '../../../tenant/aggregates/value-objects/payment-provider-type.vo';

@Injectable()
export class PagaditoService {
  constructor(
    @Inject(forwardRef(() => PaymentCredentialsService))
    private readonly credentialsService: PaymentCredentialsService,
  ) {}

  async initiatePayment(
    tenantId: string,
    params: InitiatePaymentParams,
  ): Promise<PaymentResult> {
    const credentials = await this.credentialsService.getDecryptedCredentials(
      tenantId,
      PaymentProviderTypeVO.PAGADITO,
    );
    const provider = new PagaditoProvider(
      credentials as unknown as PagaditoCredentials,
    );
    return provider.initiatePayment(params);
  }
}
