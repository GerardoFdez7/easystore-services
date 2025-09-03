import {
  PaymentProvider,
  InitiatePaymentParams,
  CompletePaymentParams,
  RefundPaymentParams,
  PaymentResult,
} from '../../../aggregates/entities/provider/payment-provider.interface';
import { PagaditoCredentialsVO } from '../../../aggregates/value-objects/provider/pagadito-credentials.vo';
import { PaymentDetailsVO } from '../../../aggregates/value-objects/payment/payment-details.vo';
import { ExternalReferenceNumberVO } from '../../../aggregates/value-objects/payment/external-reference-number.vo';

// Pagadito API Operations
const opConnect = 'f3f191ce3326905ff4403bb05b0de150';
const opExecTrans = '41216f8caf94aaa598db137e36d4673e';
const opGetStatus = '0b50820c65b0de71ce78f6221a5cf876';

// API Response types
interface PagaditoApiResponse {
  code: string;
  message?: string;
  value: string;
}

interface PagaditoStatusResponse {
  status: string;
  reference?: string;
  dateTrans?: string;
}

export interface PagaditoCredentials {
  uid: string;
  wsk: string;
  sandbox?: boolean;
}

export class PagaditoProvider implements PaymentProvider {
  private credentials: PagaditoCredentialsVO;

  constructor(credentials: PagaditoCredentials) {
    this.credentials = PagaditoCredentialsVO.create(credentials);
  }

  private calcAmount(details: PaymentDetailsVO[]): string {
    return details
      .reduce((acc, d) => acc + Number(d.quantity) * Number(d.price), 0)
      .toFixed(2);
  }

  private toFormUrlEncoded(params: Record<string, unknown>): string {
    return new URLSearchParams(
      Object.entries(params).reduce((acc, [k, v]) => {
        acc[k] = typeof v === 'boolean' ? String(v) : (v ?? '');
        return acc;
      }, {}),
    ).toString();
  }

  private async callApi(
    params: Record<string, unknown>,
  ): Promise<PagaditoApiResponse> {
    const body = this.toFormUrlEncoded(params);
    const response = await fetch(this.credentials.getEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${await response.text()}`);
    }

    const data = (await response.json()) as PagaditoApiResponse;
    return data;
  }

  private async connect(): Promise<string> {
    const params = {
      operation: opConnect,
      uid: this.credentials.uid,
      wsk: this.credentials.wsk,
      format_return: 'json',
    };

    const response = await this.callApi(params);

    if (response?.code !== 'PG1001') {
      throw new Error(
        `${response?.code || 'ERR'}: ${response?.message || 'Fallo en connect()'}`,
      );
    }

    return response.value; // token de connect
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    try {
      // 1. Connect to get session token
      const connectToken = await this.connect();

      // 2. Prepare payment details
      const details = params.details?.map((d) =>
        PaymentDetailsVO.create(d),
      ) || [
        PaymentDetailsVO.create({
          quantity: 1,
          description: `Order ${params.orderId}`,
          price: params.amount,
        }),
      ];

      // 3. Generate external reference number
      const ern =
        params.externalReferenceNumber ||
        ExternalReferenceNumberVO.generate().toString();

      // 4. Execute transaction
      const execParams = {
        operation: opExecTrans,
        token: connectToken,
        ern,
        amount: this.calcAmount(details),
        details: JSON.stringify(details.map((d) => d.toJSON())),
        custom_params: JSON.stringify(params.customParams || {}),
        currency: params.currency || 'USD',
        format_return: 'json',
        allow_pending_payments: params.allowPendingPayments ? 'true' : 'false',
      };

      const response = await this.callApi(execParams);

      if (response?.code !== 'PG1002') {
        throw new Error(
          `${response?.code || 'ERR'}: ${response?.message || 'Fallo en exec_trans()'}`,
        );
      }

      // Decode the checkout URL
      const checkoutUrl = decodeURIComponent(response.value);

      return {
        success: true,
        transactionId: ern,
        checkoutUrl,
        raw: response,
      };
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      const rawError: unknown = error;

      if (error instanceof Error) {
        errorMessage = error.message;
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
      // 1. Connect to get session token
      const connectToken = await this.connect();

      // 2. Get transaction status
      const statusParams = {
        operation: opGetStatus,
        token: connectToken,
        token_trans: params.paymentId,
        format_return: 'json',
      };

      const response = await this.callApi(statusParams);

      if (response?.code !== 'PG1003') {
        throw new Error(
          `${response?.code || 'ERR'}: ${response?.message || 'Fallo en get_status()'}`,
        );
      }

      const status = JSON.parse(response.value) as PagaditoStatusResponse;

      return {
        success: status.status === 'COMPLETED',
        transactionId: params.paymentId,
        raw: status,
      };
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      const rawError: unknown = error;

      if (error instanceof Error) {
        errorMessage = error.message;
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

  refundPayment(params: RefundPaymentParams): Promise<PaymentResult> {
    // Pagadito refund functionality not yet available
    return Promise.resolve({
      success: false,
      error: 'Refund functionality not implemented for Pagadito',
      raw: params,
    });
  }
}
