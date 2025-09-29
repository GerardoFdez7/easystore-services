import { z } from 'zod';

const skuSchema = z
  .string()
  .min(1, { message: 'SKU must be a non-empty string' });

export class SKU {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): SKU {
    skuSchema.parse(value);
    return new SKU(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherSKU: SKU): boolean {
    return this.value === otherSKU.value;
  }
}
