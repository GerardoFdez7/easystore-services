import { z } from 'zod';

const brandSchema = z
  .string()
  .min(1, { message: 'Brand must be a non-empty string' })
  .max(100, { message: 'Brand must not exceed 100 characters' })
  .optional();

export class Brand {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): Brand {
    brandSchema.parse(value);
    return new Brand(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherBrand: Brand): boolean {
    return this.value === otherBrand.value;
  }
}
