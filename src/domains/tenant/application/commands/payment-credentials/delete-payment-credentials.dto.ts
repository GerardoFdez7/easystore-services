import { PaymentProviderTypeVO } from '../../../aggregates/value-objects/payment-provider-type.vo';

export class DeletePaymentCredentialsDto {
  constructor(
    public readonly tenantId: string,
    public readonly providerType: PaymentProviderTypeVO,
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
  }
}
