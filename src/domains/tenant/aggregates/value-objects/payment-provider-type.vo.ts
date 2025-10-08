export enum PaymentProviderType {
  PAGADITO = 'PAGADITO',
  VISANET = 'VISANET',
  PAYPAL = 'PAYPAL',
}

export class PaymentProviderTypeVO {
  constructor(public readonly value: PaymentProviderType) {}

  static create(value: string): PaymentProviderTypeVO {
    if (
      !Object.values(PaymentProviderType).includes(value as PaymentProviderType)
    ) {
      throw new Error(`Invalid payment provider type: ${value}`);
    }
    return new PaymentProviderTypeVO(value as PaymentProviderType);
  }

  static PAGADITO = new PaymentProviderTypeVO(PaymentProviderType.PAGADITO);
  static VISANET = new PaymentProviderTypeVO(PaymentProviderType.VISANET);
  static PAYPAL = new PaymentProviderTypeVO(PaymentProviderType.PAYPAL);

  toString(): string {
    return this.value;
  }

  equals(other: PaymentProviderTypeVO): boolean {
    return this.value === other.value;
  }

  // Convert to Prisma enum
  toPrismaEnum(): PaymentProviderType {
    return this.value;
  }

  // Create from Prisma enum
  static fromPrismaEnum(value: PaymentProviderType): PaymentProviderTypeVO {
    return new PaymentProviderTypeVO(value);
  }
}
