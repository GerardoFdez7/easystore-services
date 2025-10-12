import { PaymentCredentialsAttributes } from './payment-credentials.attributes';
import { PaymentProviderTypeVO } from '../../value-objects/payment-provider-type.vo';

export class PaymentCredentialsEntity {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly providerType: PaymentProviderTypeVO,
    public readonly encryptedCredentials: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    attributes: PaymentCredentialsAttributes,
  ): PaymentCredentialsEntity {
    return new PaymentCredentialsEntity(
      attributes.id,
      attributes.tenantId,
      attributes.providerType,
      attributes.encryptedCredentials,
      attributes.isActive,
      attributes.createdAt,
      attributes.updatedAt,
    );
  }

  updateCredentials(encryptedCredentials: string): PaymentCredentialsEntity {
    return new PaymentCredentialsEntity(
      this.id,
      this.tenantId,
      this.providerType,
      encryptedCredentials,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  deactivate(): PaymentCredentialsEntity {
    return new PaymentCredentialsEntity(
      this.id,
      this.tenantId,
      this.providerType,
      this.encryptedCredentials,
      false,
      this.createdAt,
      new Date(),
    );
  }

  activate(): PaymentCredentialsEntity {
    return new PaymentCredentialsEntity(
      this.id,
      this.tenantId,
      this.providerType,
      this.encryptedCredentials,
      true,
      this.createdAt,
      new Date(),
    );
  }

  toAttributes(): PaymentCredentialsAttributes {
    return {
      id: this.id,
      tenantId: this.tenantId,
      providerType: this.providerType,
      encryptedCredentials: this.encryptedCredentials,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
