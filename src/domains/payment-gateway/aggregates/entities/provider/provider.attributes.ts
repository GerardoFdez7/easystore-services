import { PaymentProviderType } from '../payment-gateway/payment-gateway.attributes';

export interface ProviderAttributes {
  id: string;
  tenantId: string;
  providerType: PaymentProviderType;
  credentials: Record<string, unknown>; // encrypted
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
