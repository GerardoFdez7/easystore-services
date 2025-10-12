import { PaymentProviderTypeVO } from '../../../aggregates/value-objects/payment-provider-type.vo';

export class GetPaymentCredentialsDto {
  constructor(
    public readonly tenantId: string,
    public readonly providerType?: PaymentProviderTypeVO,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.tenantId || this.tenantId.trim().length === 0) {
      throw new Error('Tenant ID is required');
    }
  }
}
