import { ValueObject } from '../../../../shared/value-object.base';

export enum PaymentProviderTypeEnum {
  PAGADITO = 'PAGADITO',
  VISANET = 'VISANET',
  PAYPAL = 'PAYPAL',
}

export class PaymentProviderTypeVO extends ValueObject<PaymentProviderTypeEnum> {
  constructor(value: PaymentProviderTypeEnum) {
    super(value);
    this.validate();
  }

  private validate(): void {
    if (!Object.values(PaymentProviderTypeEnum).includes(this.value)) {
      throw new Error(`Invalid payment provider type: ${this.value}`);
    }
  }

  static fromString(providerType: string): PaymentProviderTypeVO {
    const normalizedType =
      providerType.toUpperCase() as PaymentProviderTypeEnum;
    return new PaymentProviderTypeVO(normalizedType);
  }

  static get PAGADITO(): PaymentProviderTypeVO {
    return new PaymentProviderTypeVO(PaymentProviderTypeEnum.PAGADITO);
  }

  static get VISANET(): PaymentProviderTypeVO {
    return new PaymentProviderTypeVO(PaymentProviderTypeEnum.VISANET);
  }

  static get PAYPAL(): PaymentProviderTypeVO {
    return new PaymentProviderTypeVO(PaymentProviderTypeEnum.PAYPAL);
  }

  get isPagadito(): boolean {
    return this.value === PaymentProviderTypeEnum.PAGADITO;
  }

  get isVisanet(): boolean {
    return this.value === PaymentProviderTypeEnum.VISANET;
  }

  get isPaypal(): boolean {
    return this.value === PaymentProviderTypeEnum.PAYPAL;
  }
}
