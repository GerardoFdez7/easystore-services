import { z } from 'zod';

const productLocationSchema = z
  .string()
  .min(1, { message: 'Product location must be a non-empty string' })
  .max(200, { message: 'Product location must not exceed 200 characters' })
  .trim()
  .nullable();

export class ProductLocation {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): ProductLocation {
    const validatedValue = productLocationSchema.parse(value);
    return new ProductLocation(validatedValue);
  }

  public static createNull(): ProductLocation {
    return new ProductLocation(null);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherLocation: ProductLocation): boolean {
    return this.value === otherLocation.value;
  }

  public isNull(): boolean {
    return this.value === null;
  }

  public hasValue(): boolean {
    return this.value !== null;
  }
}
