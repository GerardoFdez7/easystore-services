import { PagaditoCredentials } from '../../infrastructure/providers/pagadito/pagadito.provider';
import { PaypalCredentials } from '../../infrastructure/providers/paypal/paypal.provider';
import { VisanetCredentials } from '../../infrastructure/providers/visanet/visanet.provider';

export interface PaymentProviderCredentialRepository {
  getCredentials(
    tenantId: string,
    providerType: string,
  ): Promise<PagaditoCredentials | VisanetCredentials | PaypalCredentials>; // Replace any with a proper type if needed
  saveCredentials(
    tenantId: string,
    providerType: string,
    credentials: Record<string, unknown>,
  ): Promise<void>;
}
