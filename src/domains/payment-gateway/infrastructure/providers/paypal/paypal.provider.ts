import {
  PaymentProvider,
  InitiatePaymentParams,
  CompletePaymentParams,
  RefundPaymentParams,
  PaymentResult,
} from '../../../aggregates/entities/provider/payment-provider.interface';
import axios from 'axios';

export interface PaypalCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

export class PaypalProvider implements PaymentProvider {
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(private credentials: PaypalCredentials) {}

  private getBaseUrl(): string {
    return this.credentials.environment === 'production'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          auth: {
            username: this.credentials.clientId,
            password: this.credentials.clientSecret,
          },
        },
      );

      const data = response.data as {
        access_token: string;
        expires_in: number;
      };
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      throw new Error(
        `Failed to get PayPal access token: ${(error as Error).message}`,
      );
    }
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      const paymentData = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        transactions: [
          {
            amount: {
              total: params.amount.toString(),
              currency: params.currency,
            },
            description: `Payment for order ${params.orderId}`,
            custom: params.orderId,
          },
        ],
        redirect_urls: {
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`,
        },
      };

      const response = await axios.post(
        `${this.getBaseUrl()}/v1/payments/payment`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = response.data as {
        id: string;
        links: Array<{ href: string; rel: string }>;
      };

      // Find approval URL
      const approvalUrl = data.links.find(
        (link) => link.rel === 'approval_url',
      )?.href;

      return {
        success: true,
        transactionId: data.id,
        checkoutUrl: approvalUrl,
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
    try {
      const accessToken = await this.getAccessToken();

      // For PayPal, completion means executing the payment
      // This requires the payer ID and payment ID from the approval process
      const executeData = {
        payer_id: params.payerId || 'default_payer_id', // This should come from the approval process
      };

      const response = await axios.post(
        `${this.getBaseUrl()}/v1/payments/payment/${params.paymentId}/execute`,
        executeData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = response.data as {
        id: string;
        state: string;
        transactions: Array<{ amount: { total: string; currency: string } }>;
      };

      return {
        success: data.state === 'approved',
        transactionId: data.id,
        raw: {
          status: data.state,
          amount: data.transactions[0]?.amount.total,
          currency: data.transactions[0]?.amount.currency,
          ...data,
        },
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

  async refundPayment(params: RefundPaymentParams): Promise<PaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      // For PayPal, we need to find the sale transaction to refund
      // First, get the payment details to find the sale ID
      const paymentResponse = await axios.get(
        `${this.getBaseUrl()}/v1/payments/payment/${params.paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const paymentData = paymentResponse.data as {
        transactions: Array<{
          related_resources: Array<{
            sale?: { id: string };
          }>;
        }>;
      };

      // Find the sale ID from the payment
      const saleId =
        paymentData.transactions[0]?.related_resources[0]?.sale?.id;

      if (!saleId) {
        throw new Error('No sale found for this payment');
      }

      // Create refund request
      const refundData = {
        amount: {
          total: params.amount.toString(),
          currency: params.currency || 'USD',
        },
        description: params.reason || 'Refund request',
      };

      const response = await axios.post(
        `${this.getBaseUrl()}/v1/payments/sale/${saleId}/refund`,
        refundData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      const data = response.data as {
        id: string;
        state: string;
        amount: { total: string; currency: string };
      };

      return {
        success: data.state === 'completed',
        transactionId: data.id,
        raw: {
          status: data.state,
          amount: data.amount.total,
          currency: data.amount.currency,
          originalTransactionId: params.paymentId,
          ...data,
        },
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
}
