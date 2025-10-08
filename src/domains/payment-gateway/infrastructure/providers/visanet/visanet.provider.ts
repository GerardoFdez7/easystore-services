import {
  PaymentProvider,
  InitiatePaymentParams,
  CompletePaymentParams,
  RefundPaymentParams,
  PaymentResult,
} from '../../../aggregates/entities/provider/payment-provider.interface';
import { VisanetCredentialsVO } from '../../../aggregates/value-objects/provider/visanet-credentials.vo';

// Dynamic import to avoid initialization issues
let cybersourceRestApi: typeof import('cybersource-rest-client');
import * as path from 'path';

export interface VisanetCredentials {
  merchantId: string;
  merchantKeyId: string;
  merchantSecretKey: string;
  environment: 'sandbox' | 'production';
}

export class VisanetProvider implements PaymentProvider {
  private readonly credentials: VisanetCredentialsVO;
  private apiClient?: InstanceType<typeof cybersourceRestApi.ApiClient>;
  private paymentsApi?: InstanceType<typeof cybersourceRestApi.PaymentsApi>;

  constructor(credentials: VisanetCredentials) {
    this.credentials = VisanetCredentialsVO.create(credentials);
  }

  private async loadCyberSourceApi(): Promise<void> {
    if (!cybersourceRestApi) {
      cybersourceRestApi = await import('cybersource-rest-client');
    }
  }

  private getApiClient(): InstanceType<typeof cybersourceRestApi.ApiClient> {
    if (!this.apiClient) {
      this.apiClient = new cybersourceRestApi.ApiClient();
    }
    return this.apiClient;
  }

  private getPaymentsApi(): InstanceType<
    typeof cybersourceRestApi.PaymentsApi
  > {
    if (!this.paymentsApi) {
      this.paymentsApi = new cybersourceRestApi.PaymentsApi(
        this.buildConfig(),
        this.getApiClient(),
      );
    }
    return this.paymentsApi;
  }

  private buildConfig(): import('cybersource-rest-client').Configuration {
    return {
      authenticationType: 'http_signature',
      runEnvironment: this.credentials.runEnvironment,
      merchantID: this.credentials.merchantId,
      merchantKeyId: this.credentials.merchantKeyId,
      merchantsecretKey: this.credentials.merchantSecretKey,
      keyAlias: 'unused',
      keyPass: 'unused',
      keyFileName: 'unused',
      keysDirectory: path.join(process.cwd(), 'Resource'),
      logConfiguration: {
        enableLog: true,
        logFileName: 'cybs',
        logDirectory: 'log',
        logFileMaxSize: '5242880',
        loggingLevel: 'debug',
        enableMasking: true,
      },
    };
  }

  private createPaymentAsync(
    requestObj: InstanceType<typeof cybersourceRestApi.CreatePaymentRequest>,
  ): Promise<{ data: unknown; response: unknown }> {
    return new Promise((resolve, reject) => {
      this.getPaymentsApi().createPayment(
        requestObj,
        (error: Error, data: unknown, response: unknown) => {
          if (error)
            return reject(new Error(`Payment API error: ${error.message}`));
          resolve({ data, response });
        },
      );
    });
  }

  private splitExpirationDate(expirationDate: string): {
    mm: string;
    yyyy: string;
  } {
    const [mm, yyyy] = expirationDate.split('/');
    return { mm, yyyy };
  }

  private getCorrelationId(response: unknown): string {
    const headers = (response as { headers?: Record<string, string> })?.headers;
    return (
      (headers &&
        (headers['v-c-correlation-id'] || headers['V-C-CORRELATION-ID'])) ||
      '(no-cid)'
    );
  }

  async initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
    try {
      await this.loadCyberSourceApi();
      // Extract card information from customParams
      const customParams = params.customParams as {
        cardNumber?: string;
        expirationDate?: string;
        cvv?: string;
        capture?: boolean;
        firstName?: string;
        lastName?: string;
        email?: string;
        address?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        phoneNumber?: string;
      };

      if (
        !customParams?.cardNumber ||
        !customParams?.expirationDate ||
        !customParams?.cvv
      ) {
        return {
          success: false,
          error:
            'Missing required card information (cardNumber, expirationDate, cvv)',
          raw: params,
        };
      }

      const request = new cybersourceRestApi.CreatePaymentRequest();

      // Client reference information
      const clientRef =
        new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
      clientRef.code = params.externalReferenceNumber || `PAY_${Date.now()}`;
      request.clientReferenceInformation = clientRef;

      // Processing information
      const processing =
        new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
      processing.capture = customParams.capture || false;
      request.processingInformation = processing;

      // Payment information (card)
      const { mm, yyyy } = this.splitExpirationDate(
        customParams.expirationDate,
      );
      const card = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
      card.number = customParams.cardNumber;
      card.expirationMonth = mm;
      card.expirationYear = yyyy;
      card.securityCode = customParams.cvv;

      const payInfo = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
      payInfo.card = card;
      request.paymentInformation = payInfo;

      // Order information
      const amountDetails =
        new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
      amountDetails.totalAmount = params.amount.toString();
      amountDetails.currency = params.currency;

      const billTo =
        new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
      billTo.firstName = customParams.firstName || 'John';
      billTo.lastName = customParams.lastName || 'Doe';
      billTo.address1 = customParams.address || '1 Market St';
      billTo.locality = customParams.city || 'San Francisco';
      billTo.administrativeArea = customParams.state || 'CA';
      billTo.postalCode = customParams.postalCode || '94105';
      billTo.country = customParams.country || 'US';
      billTo.email = customParams.email || 'john.doe@example.com';
      billTo.phoneNumber = customParams.phoneNumber || '4158880000';

      const orderInfo = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
      orderInfo.amountDetails = amountDetails;
      orderInfo.billTo = billTo;

      request.orderInformation = orderInfo;

      // Execute payment
      const { data, response } = await this.createPaymentAsync(request);
      const correlationId = this.getCorrelationId(response);
      const paymentId =
        (data as { id?: string; transactionId?: string })?.id ||
        (data as { id?: string; transactionId?: string })?.transactionId ||
        '(n/a)';
      const status = (data as { status?: string })?.status || '(n/a)';

      return {
        success: true,
        transactionId: paymentId,
        checkoutUrl: undefined, // VisaNet doesn't provide checkout URLs for direct payments
        raw: {
          data,
          correlationId,
          status,
          environment: this.credentials.runEnvironment,
        },
      };
    } catch (error: unknown) {
      const err =
        (error as { error?: unknown; response?: unknown }).error || error;
      const resp = (error as { error?: unknown; response?: unknown }).response;
      const correlationId = this.getCorrelationId(resp);

      let errorMessage = 'Payment failed';
      let rawError: unknown = error;

      if (err && typeof err === 'object' && err !== null) {
        const errorObj = err as {
          response?: { status?: number; text?: string; body?: unknown };
          message?: string;
        };

        if (errorObj.response?.status) {
          errorMessage = `HTTP ${errorObj.response.status}`;
        }

        const body = errorObj.response?.text || errorObj.response?.body;
        if (body) {
          try {
            const parsedBody =
              typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
            rawError = parsedBody;
            if (
              parsedBody &&
              typeof parsedBody === 'object' &&
              'message' in parsedBody
            ) {
              errorMessage = (parsedBody as { message: string }).message;
            }
          } catch {
            rawError = body;
          }
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
        raw: {
          error: rawError,
          correlationId,
          environment: this.credentials.runEnvironment,
        },
      };
    }
  }

  async completePayment(params: CompletePaymentParams): Promise<PaymentResult> {
    // For VisaNet/CyberSource, completion is typically handled through capture
    // This would be used for auth-only transactions that need to be captured later
    try {
      await this.loadCyberSourceApi();
      const captureRequest = new cybersourceRestApi.CapturePaymentRequest();

      // Set up capture request with payment ID
      const clientRef =
        new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
      clientRef.code = `CAPTURE_${Date.now()}`;
      captureRequest.clientReferenceInformation = clientRef;

      // Create capture API instance
      const captureApi = new cybersourceRestApi.CaptureApi(
        this.buildConfig(),
        this.apiClient,
      );

      // Promisify capture API call
      const captureAsync = (
        requestObj: InstanceType<
          typeof cybersourceRestApi.CapturePaymentRequest
        >,
      ): Promise<{ data: unknown; response: unknown }> => {
        return new Promise((resolve, reject) => {
          captureApi.capturePayment(
            requestObj,
            params.paymentId,
            (error: Error, data: unknown, response: unknown) => {
              if (error)
                return reject(new Error(`Capture API error: ${error.message}`));
              resolve({ data, response });
            },
          );
        });
      };

      const { data, response } = await captureAsync(captureRequest);
      const correlationId = this.getCorrelationId(response);
      const paymentId =
        (data as { id?: string; transactionId?: string })?.id ||
        (data as { id?: string; transactionId?: string })?.transactionId ||
        '(n/a)';

      return {
        success: true,
        transactionId: paymentId,
        raw: {
          data,
          correlationId,
          environment: this.credentials.runEnvironment,
        },
      };
    } catch (error: unknown) {
      const err =
        (error as { error?: unknown; response?: unknown }).error || error;
      const resp = (error as { error?: unknown; response?: unknown }).response;
      const correlationId = this.getCorrelationId(resp);

      let errorMessage = 'Payment capture failed';
      let rawError: unknown = error;

      if (err && typeof err === 'object' && err !== null) {
        const errorObj = err as {
          response?: { status?: number; text?: string; body?: unknown };
          message?: string;
        };

        if (errorObj.response?.status) {
          errorMessage = `HTTP ${errorObj.response.status}`;
        }

        const body = errorObj.response?.text || errorObj.response?.body;
        if (body) {
          try {
            const parsedBody =
              typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
            rawError = parsedBody;
            if (
              parsedBody &&
              typeof parsedBody === 'object' &&
              'message' in parsedBody
            ) {
              errorMessage = (parsedBody as { message: string }).message;
            }
          } catch {
            rawError = body;
          }
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
        raw: {
          error: rawError,
          correlationId,
          environment: this.credentials.runEnvironment,
        },
      };
    }
  }

  async refundPayment(params: RefundPaymentParams): Promise<PaymentResult> {
    try {
      await this.loadCyberSourceApi();
      const refundRequest = new cybersourceRestApi.RefundPaymentRequest();

      // Set up refund request
      const clientRef =
        new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
      clientRef.code = `REFUND_${Date.now()}`;
      refundRequest.clientReferenceInformation = clientRef;

      // Amount details for refund
      const amountDetails =
        new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
      amountDetails.totalAmount = (params.amount || 0).toString();
      amountDetails.currency = 'USD'; // Default currency, should be passed in params

      const orderInfo = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
      orderInfo.amountDetails = amountDetails;
      refundRequest.orderInformation = orderInfo;

      // Create refund API instance
      const refundApi = new cybersourceRestApi.RefundApi(
        this.buildConfig(),
        this.apiClient,
      );

      // Promisify refund API call
      const refundAsync = (
        requestObj: InstanceType<
          typeof cybersourceRestApi.RefundPaymentRequest
        >,
      ): Promise<{ data: unknown; response: unknown }> => {
        return new Promise((resolve, reject) => {
          refundApi.refundPayment(
            requestObj,
            params.paymentId,
            (error: Error, data: unknown, response: unknown) => {
              if (error)
                return reject(new Error(`Refund API error: ${error.message}`));
              resolve({ data, response });
            },
          );
        });
      };

      const { data, response } = await refundAsync(refundRequest);
      const correlationId = this.getCorrelationId(response);
      const paymentId =
        (data as { id?: string; transactionId?: string })?.id ||
        (data as { id?: string; transactionId?: string })?.transactionId ||
        '(n/a)';

      return {
        success: true,
        transactionId: paymentId,
        raw: {
          data,
          correlationId,
          environment: this.credentials.runEnvironment,
        },
      };
    } catch (error: unknown) {
      const err =
        (error as { error?: unknown; response?: unknown }).error || error;
      const resp = (error as { error?: unknown; response?: unknown }).response;
      const correlationId = this.getCorrelationId(resp);

      let errorMessage = 'Payment refund failed';
      let rawError: unknown = error;

      if (err && typeof err === 'object' && err !== null) {
        const errorObj = err as {
          response?: { status?: number; text?: string; body?: unknown };
          message?: string;
        };

        if (errorObj.response?.status) {
          errorMessage = `HTTP ${errorObj.response.status}`;
        }

        const body = errorObj.response?.text || errorObj.response?.body;
        if (body) {
          try {
            const parsedBody =
              typeof body === 'string' ? (JSON.parse(body) as unknown) : body;
            rawError = parsedBody;
            if (
              parsedBody &&
              typeof parsedBody === 'object' &&
              'message' in parsedBody
            ) {
              errorMessage = (parsedBody as { message: string }).message;
            }
          } catch {
            rawError = body;
          }
        } else if (errorObj.message) {
          errorMessage = errorObj.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
        raw: {
          error: rawError,
          correlationId,
          environment: this.credentials.runEnvironment,
        },
      };
    }
  }
}
