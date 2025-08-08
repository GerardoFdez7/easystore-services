import {
  PaymentProvider,
  InitiatePaymentParams,
  CompletePaymentParams,
  RefundPaymentParams,
  PaymentResult,
} from '../../../aggregates/entities/provider/payment-provider.interface';
import axios from 'axios';

export interface PagaditoCredentials {
  apiKey: string;
  apiSecret: string;
  merchantId: string;
}

export class PagaditoProvider implements PaymentProvider {
  constructor(private credentials: PagaditoCredentials) {}

  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      'https://api.pagadito.com/v1/auth/token',
      {
        apiKey: this.credentials.apiKey,
        apiSecret: this.credentials.apiSecret,
        merchantId: this.credentials.merchantId,
      },
    );
    const data = response.data as unknown as { access_token: string };
    return data.access_token;
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    try {
      // 1. Get access token (if required)
      const accessToken = await this.getAccessToken();

      // 2. Call Pagadito's payment initiation endpoint
      const response = await axios.post(
        'https://api.pagadito.com/v1/payments',
        {
          amount: params.amount,
          currency: params.currency,
          orderId: params.orderId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
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
    // TODO: Implement as needed for Pagadito
    return new Promise((resolve) => {
      resolve({ success: true, raw: params });
    });
  }

  async refundPayment(params: RefundPaymentParams): Promise<PaymentResult> {
    // TODO: Implement as needed for Pagadito
    return new Promise((resolve) => {
      resolve({ success: true, raw: params });
    });
  }
}
