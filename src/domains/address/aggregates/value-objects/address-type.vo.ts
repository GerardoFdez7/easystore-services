import z from 'zod';

export enum AddressTypeEnum {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  WAREHOUSE = 'WAREHOUSE',
}

const addressTypeSchema = z.enum([
  AddressTypeEnum.SHIPPING,
  AddressTypeEnum.BILLING,
  AddressTypeEnum.WAREHOUSE,
]);

export class AddressType {
  private readonly value: AddressTypeEnum;

  private constructor(value: AddressTypeEnum) {
    this.value = value;
  }

  public static create(addressType: string): AddressType {
    const parsed = addressTypeSchema.parse(addressType) as AddressTypeEnum;
    return new AddressType(parsed);
  }

  public getValue(): AddressTypeEnum {
    return this.value;
  }

  public equals(addressType: AddressType): boolean {
    return this.value === addressType.value;
  }
}
