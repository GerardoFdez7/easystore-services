export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentProviderType {
  PAGADITO = 'PAGADITO',
  VISANET = 'VISANET',
  PAYPAL = 'PAYPAL',
}

export enum PaymentCurrency {
  USD = 'USD',
  EUR = 'EUR',
  // Add more as needed
}

export interface PaymentGatewayAttributes {
  id: string;
  tenantId: string;
  provider: PaymentProviderType;
  amount: number;
  currency: PaymentCurrency;
  status: PaymentStatus;
  orderId: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}
