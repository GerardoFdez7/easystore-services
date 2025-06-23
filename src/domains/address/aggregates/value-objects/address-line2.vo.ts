import { z } from 'zod';

const addressLine2Schema = z
  .string()
  .min(1, { message: 'Address line 2 must be at least 1 character' })
  .max(100, { message: 'Address line 2 must be at most 100 characters' })
  .nullable();

export class AddressLine2 {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(addressLine2: string): AddressLine2 {
    addressLine2Schema.parse(addressLine2);
    return new AddressLine2(addressLine2);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(addressLine2: AddressLine2): boolean {
    return this.value === addressLine2.value;
  }
}
