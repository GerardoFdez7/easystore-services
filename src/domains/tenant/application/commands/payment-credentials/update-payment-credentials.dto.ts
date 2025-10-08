import {
  PaymentProviderType,
  PaymentProviderTypeVO,
} from '../../../aggregates/value-objects/payment-provider-type.vo';

export class UpdatePaymentCredentialsDto {
  constructor(
    public readonly tenantId: string,
    public readonly providerType: PaymentProviderTypeVO,
    public readonly credentials: Record<string, unknown>,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }

    if (!this.providerType) {
      throw new Error('Provider type is required');
    }

    if (!this.credentials || Object.keys(this.credentials).length === 0) {
      throw new Error('Credentials are required');
    }

    // Validate provider-specific credentials
    this.validateProviderCredentials();
  }

  private validateProviderCredentials(): void {
    switch (this.providerType.value) {
      case PaymentProviderType.PAGADITO:
        this.validatePagaditoCredentials();
        break;
      case PaymentProviderType.VISANET:
        this.validateVisanetCredentials();
        break;
      case PaymentProviderType.PAYPAL:
        this.validatePaypalCredentials();
        break;
      default:
        throw new Error(
          `Unsupported provider type: ${this.providerType.toString()}`,
        );
    }
  }

  private validatePagaditoCredentials(): void {
    const required = ['uid', 'wsk'];
    for (const field of required) {
      if (
        !this.credentials[field] ||
        typeof this.credentials[field] !== 'string'
      ) {
        throw new Error(`Pagadito credentials must include ${field}`);
      }
    }
  }

  private validateVisanetCredentials(): void {
    const required = [
      'merchantId',
      'merchantKeyId',
      'merchantSecretKey',
      'environment',
    ];
    for (const field of required) {
      if (
        !this.credentials[field] ||
        typeof this.credentials[field] !== 'string'
      ) {
        throw new Error(`VisaNet credentials must include ${field}`);
      }
    }

    if (
      !['sandbox', 'production'].includes(
        this.credentials.environment as string,
      )
    ) {
      throw new Error(
        'VisaNet environment must be either "sandbox" or "production"',
      );
    }
  }

  private validatePaypalCredentials(): void {
    const required = ['clientId', 'clientSecret'];
    for (const field of required) {
      if (
        !this.credentials[field] ||
        typeof this.credentials[field] !== 'string'
      ) {
        throw new Error(`PayPal credentials must include ${field}`);
      }
    }
  }
}
