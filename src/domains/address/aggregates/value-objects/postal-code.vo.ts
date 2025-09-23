import { z } from 'zod';

export const postalCodeSchema = z
  .string()
  .nullable()
  .refine((val) => {
    if (val === null || val === undefined) {
      return true;
    }
    return /^[a-zA-Z0-9\s-]{2,10}$/.test(val);
  }, 'Invalid postal code format. Must be alphanumeric, spaces, or hyphens, between 2 and 10 characters.');

export class PostalCode {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(postalCode: string): PostalCode {
    postalCodeSchema.parse(postalCode);
    return new PostalCode(postalCode);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(postalCode: PostalCode): boolean {
    return this.value === postalCode.value;
  }
}
