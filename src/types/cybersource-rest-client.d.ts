declare module 'cybersource-rest-client' {
  export interface Configuration {
    authenticationType: string;
    runEnvironment: string;
    merchantID: string;
    merchantKeyId: string;
    merchantsecretKey: string;
    keyAlias: string;
    keyPass: string;
    keyFileName: string;
    keysDirectory: string;
    logConfiguration: {
      enableLog: boolean;
      logFileName: string;
      logDirectory: string;
      logFileMaxSize: string;
      loggingLevel: string;
      enableMasking: boolean;
    };
  }

  export class ApiClient {
    constructor();
  }

  export class PaymentsApi {
    constructor(config: Configuration, apiClient: ApiClient);
    createPayment(
      request: CreatePaymentRequest,
      callback: (error: Error | null, data: unknown, response: unknown) => void,
    ): void;
  }

  export class CaptureApi {
    constructor(config: Configuration, apiClient: ApiClient);
    capturePayment(
      request: CapturePaymentRequest,
      id: string,
      callback: (error: Error | null, data: unknown, response: unknown) => void,
    ): void;
  }

  export class RefundApi {
    constructor(config: Configuration, apiClient: ApiClient);
    refundPayment(
      request: RefundPaymentRequest,
      id: string,
      callback: (error: Error | null, data: unknown, response: unknown) => void,
    ): void;
  }

  export class CreatePaymentRequest {
    clientReferenceInformation?: Ptsv2paymentsClientReferenceInformation;
    processingInformation?: Ptsv2paymentsProcessingInformation;
    paymentInformation?: Ptsv2paymentsPaymentInformation;
    orderInformation?: Ptsv2paymentsOrderInformation;
  }

  export class CapturePaymentRequest {
    clientReferenceInformation?: Ptsv2paymentsClientReferenceInformation;
  }

  export class RefundPaymentRequest {
    clientReferenceInformation?: Ptsv2paymentsClientReferenceInformation;
    orderInformation?: Ptsv2paymentsOrderInformation;
  }

  export class Ptsv2paymentsClientReferenceInformation {
    code?: string;
  }

  export class Ptsv2paymentsProcessingInformation {
    capture?: boolean;
  }

  export class Ptsv2paymentsPaymentInformation {
    card?: Ptsv2paymentsPaymentInformationCard;
  }

  export class Ptsv2paymentsPaymentInformationCard {
    number?: string;
    expirationMonth?: string;
    expirationYear?: string;
    securityCode?: string;
  }

  export class Ptsv2paymentsOrderInformation {
    amountDetails?: Ptsv2paymentsOrderInformationAmountDetails;
    billTo?: Ptsv2paymentsOrderInformationBillTo;
  }

  export class Ptsv2paymentsOrderInformationAmountDetails {
    totalAmount?: string;
    currency?: string;
  }

  export class Ptsv2paymentsOrderInformationBillTo {
    firstName?: string;
    lastName?: string;
    address1?: string;
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    country?: string;
    email?: string;
    phoneNumber?: string;
  }
}
