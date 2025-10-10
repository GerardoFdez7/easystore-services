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
import { PaymentProviderLoggerService } from '../../logging/payment-provider-logger.service';

// Pagadito API Operations
const opConnect = 'f3f191ce3326905ff4403bb05b0de150';
const opExecTrans = '41216f8caf94aaa598db137e36d4673e';
const _opGetStatus = '0b50820c65b0de71ce78f6221a5cf876';

// API Response types
interface PagaditoApiResponse {
  code: string;
  message?: string;
  value: string;
}

export interface PagaditoCredentials {
  uid: string;
  wsk: string;
  sandbox?: boolean;
}

export class PagaditoProvider implements PaymentProvider {
  private credentials: PagaditoCredentialsVO;
  private readonly paymentLogger: PaymentProviderLoggerService;

  constructor(credentials: PagaditoCredentials) {
    this.credentials = PagaditoCredentialsVO.create(credentials);
    this.paymentLogger = new PaymentProviderLoggerService();
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
    const startTime = Date.now();
    const correlationId = this.paymentLogger.generateCorrelationId();

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
      const processingTime = Date.now() - startTime;

      // Log successful payment initiation
      this.paymentLogger.logPaymentInitiation({
        paymentId: params.paymentId ?? ern,
        tenantId: params.tenantId,
        orderId: params.orderId,
        providerType: 'PAGADITO',
        providerEnvironment: this.credentials.sandbox
          ? 'sandbox'
          : 'production',
        amount: params.amount,
        currency: params.currency,
        requestData: {
          externalReferenceNumber: ern,
          amount: this.calcAmount(details),
          details: details.map((d) => d.toJSON()),
          customParams: params.customParams,
          allowPendingPayments: params.allowPendingPayments,
        },
        processingTimeMs: processingTime,
        correlationId,
      });

      return {
        success: true,
        transactionId: ern,
        checkoutUrl,
        raw: response,
      };
    } catch (error: unknown) {
      const processingTime = Date.now() - startTime;
      let errorMessage = 'Unknown error';
      let errorCode = 'PAGADITO_ERROR';
      const rawError: unknown = error;

      if (error instanceof Error) {
        errorMessage = error.message;
        errorCode = 'PAGADITO_API_ERROR';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Log payment failure
      this.paymentLogger.logPaymentFailure({
        paymentId: params.paymentId ?? '(n/a)',
        tenantId: params.tenantId,
        orderId: params.orderId,
        providerType: 'PAGADITO',
        providerEnvironment: this.credentials.sandbox
          ? 'sandbox'
          : 'production',
        amount: params.amount,
        currency: params.currency,
        errorCode,
        errorMessage,
        requestData: {
          externalReferenceNumber: params.externalReferenceNumber,
          amount: params.amount,
          currency: params.currency,
        },
        responseData: {
          error: errorMessage,
          raw:
            rawError instanceof Error
              ? { message: rawError.message, stack: rawError.stack }
              : typeof rawError === 'object' && rawError !== null
                ? rawError
                : {
                    value:
                      rawError instanceof Error
                        ? rawError.message
                        : JSON.stringify(rawError),
                  },
        },
        processingTimeMs: processingTime,
        correlationId,
      });

      return {
        success: false,
        error: errorMessage,
        raw:
          rawError instanceof Error
            ? { message: rawError.message, stack: rawError.stack }
            : typeof rawError === 'object' && rawError !== null
              ? rawError
              : {
                  value:
                    rawError instanceof Error
                      ? rawError.message
                      : JSON.stringify(rawError),
                },
      };
    }
  }

  completePayment(params: CompletePaymentParams): Promise<PaymentResult> {
    // For testing purposes, simulate successful payment completion
    // In production, this would verify the actual payment status via webhooks or API calls
    return Promise.resolve({
      success: true,
      transactionId: params.paymentId,
      raw: {
        status: 'COMPLETED',
        message: 'Payment completed successfully (simulated for testing)',
        completedAt: new Date().toISOString(),
        originalTransactionId: params.paymentId,
      },
    });
  }

  refundPayment(params: RefundPaymentParams): Promise<PaymentResult> {
    try {
      // Pagadito doesn't have direct refund API, so we'll simulate it
      // In production, this would require manual processing or webhook handling

      // For testing purposes, simulate a successful refund
      return Promise.resolve({
        success: true,
        transactionId: params.paymentId,
        raw: {
          status: 'REFUNDED',
          amount: params.amount,
          originalTransactionId: params.paymentId,
          message: 'Refund processed successfully (simulated)',
          refundId: Date.now().toString(),
        },
      });
    } catch (error: unknown) {
      let errorMessage = 'Unknown error';
      const rawError: unknown = error;

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return Promise.resolve({
        success: false,
        error: errorMessage,
        raw: rawError,
      });
    }
  }
}
