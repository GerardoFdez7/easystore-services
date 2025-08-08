import {
  PaymentProvider,
  InitiatePaymentParams,
  CompletePaymentParams,
  RefundPaymentParams,
  PaymentResult,
} from '../../../aggregates/entities/provider/payment-provider.interface';
import axios from 'axios';

export interface VisanetCredentials {
  apiKey: string;
  apiSecret: string;
  merchantId: string;
}

export class VisanetProvider implements PaymentProvider {
  constructor(private credentials: VisanetCredentials) {}

  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    try {
      const response = await axios.post(
        'https://api.visanet.com/v1/payments',
        {
          amount: params.amount,
          currency: params.currency,
          orderId: params.orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.credentials.apiKey}`,
            'X-Secret': this.credentials.apiSecret,
            'X-Merchant-Id': this.credentials.merchantId,
          },
        },
      );

      const data = response.data as unknown as { transactionId: string };
      return {
        success: true,
        transactionId: data.transactionId,
        raw: response.data,
      };
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      let rawError: unknown = error;

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as unknown;
        let message: string | null = null;

        if (
          responseData &&
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData
        ) {
          const dataWithMessage = responseData as { message: unknown };
          if (typeof dataWithMessage.message === 'string') {
            message = dataWithMessage.message;
          }
        }

        errorMessage = message || error.message || 'Axios error occurred';
        rawError = error.response?.data || error;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return {
        success: false,
        error: errorMessage,
        raw: rawError,
      };
    }
  }

  async completePayment(params: CompletePaymentParams): Promise<PaymentResult> {
    // TODO: Implement as needed for Visanet
    return new Promise((resolve) => {
      resolve({ success: true, raw: params });
    });
  }

  async refundPayment(params: RefundPaymentParams): Promise<PaymentResult> {
    // TODO: Implement as needed for Visanet
    return new Promise((resolve) => {
      resolve({ success: true, raw: params });
    });
  }
}
