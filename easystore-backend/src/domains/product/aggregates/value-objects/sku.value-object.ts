import { z } from 'zod';

const skuSchema = z
  .string()
  .min(1, { message: 'SKU must be a non-empty string' })
  .optional();

export class SKU {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): SKU {
    skuSchema.parse(value);
    return new SKU(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherSKU: SKU): boolean {
    return this.value === otherSKU.value;
  }
}
