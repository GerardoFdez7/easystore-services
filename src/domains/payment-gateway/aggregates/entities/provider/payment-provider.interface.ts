export interface InitiatePaymentParams {
  amount: number;
  currency: string;
  orderId: string;
  // ...other common params
}

export interface CompletePaymentParams {
  paymentId: string;
  // ...other common params
}

export interface RefundPaymentParams {
  paymentId: string;
  amount?: number;
  // ...other common params
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  raw?: unknown;
}

export interface PaymentProvider {
  initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult>;
  completePayment(params: CompletePaymentParams): Promise<PaymentResult>;
  refundPayment?(params: RefundPaymentParams): Promise<PaymentResult>;
}
