import { z } from 'zod';

const postalCodeSchema = z
  .string()
  .length(5, { message: 'Postal code must be exactly 5 digits' })
  .regex(/^[0-9]+$/, { message: 'Postal code can only contain digits' })
  .nullable();

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
