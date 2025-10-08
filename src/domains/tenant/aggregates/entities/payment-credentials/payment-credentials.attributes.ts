import { PaymentProviderTypeVO } from '../../value-objects/payment-provider-type.vo';

export interface PaymentCredentialsAttributes {
  id: string;
  tenantId: string;
  providerType: PaymentProviderTypeVO;
  encryptedCredentials: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
