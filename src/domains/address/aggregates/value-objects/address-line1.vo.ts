import { z } from 'zod';

const addressLine1Schema = z
  .string()
  .min(1, { message: 'Address line 1 must be at least 1 character' })
  .max(100, { message: 'Address line 1 must be at most 100 characters' });

export class AddressLine1 {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(addressLine1: string): AddressLine1 {
    addressLine1Schema.parse(addressLine1);
    return new AddressLine1(addressLine1);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(addressLine1: AddressLine1): boolean {
    return this.value === addressLine1.value;
  }
}
