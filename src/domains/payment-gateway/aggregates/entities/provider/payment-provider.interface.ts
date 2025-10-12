export interface InitiatePaymentParams {
  paymentId?: string;
  tenantId: string;
  amount: number;
  currency: string;
  orderId: string;
  details?: Array<{
    quantity: number;
    description: string;
    price: number;
    urlProduct?: string;
  }>;
  customParams?: Record<string, unknown>;
  allowPendingPayments?: boolean;
  externalReferenceNumber?: string;
}

export interface CompletePaymentParams {
  paymentId: string;
  payerId?: string; // Required for PayPal
  // ...other common params
}

export interface RefundPaymentParams {
  paymentId: string;
  transactionId: string;
  amount?: number;
  currency?: string;
  reason?: string;
  // ...other common params
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  checkoutUrl?: string;
  error?: string;
  raw?: unknown;
}

export interface PaymentProvider {
  initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult>;
  completePayment(params: CompletePaymentParams): Promise<PaymentResult>;
  refundPayment?(params: RefundPaymentParams): Promise<PaymentResult>;
}
