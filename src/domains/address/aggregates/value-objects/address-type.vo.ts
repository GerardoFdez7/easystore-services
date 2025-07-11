import z from 'zod';
import { AddressTypes } from '.prisma/postgres';

const addressTypeSchema = z.enum([
  AddressTypes.SHIPPING,
  AddressTypes.BILLING,
  AddressTypes.WAREHOUSE,
]);

export class AddressType {
  private readonly value: AddressTypes;

  private constructor(value: AddressTypes) {
    this.value = value;
  }

  public static create(addressType: string): AddressType {
    const parsed = addressTypeSchema.parse(addressType) as AddressTypes;
    return new AddressType(parsed);
  }

  public getValue(): AddressTypes {
    return this.value;
  }

  public equals(addressType: AddressType): boolean {
    return this.value === addressType.value;
  }
}
