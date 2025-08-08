import {
  PaymentProvider,
  InitiatePaymentParams,
  CompletePaymentParams,
  RefundPaymentParams,
  PaymentResult,
} from '../../../aggregates/entities/provider/payment-provider.interface';
import axios, { AxiosResponse } from 'axios';

export interface PaypalCredentials {
  clientId: string;
  clientSecret: string;
}

export class PaypalProvider implements PaymentProvider {
  constructor(private credentials: PaypalCredentials) {}

  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    try {
      const response: AxiosResponse<string, unknown> = await axios.post(
        'https://api.paypal.com/v1/payments/payment',
        {
          amount: params.amount,
          currency: params.currency,
          orderId: params.orderId,
        },
        {
          auth: {
            username: this.credentials.clientId,
            password: this.credentials.clientSecret,
          },
        },
      );

      const data = response.data as unknown as { id: string };
      return {
        success: true,
        transactionId: data.id,
        raw: data,
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
    // TODO: Implement as needed for PayPal
    return new Promise((resolve) => {
      resolve({ success: true, raw: params });
    });
  }

  async refundPayment(params: RefundPaymentParams): Promise<PaymentResult> {
    // TODO: Implement as needed for PayPal
    return new Promise((resolve) => {
      resolve({ success: true, raw: params });
    });
  }
}
