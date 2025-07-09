import { z } from 'zod';

const variantIdSchema = z
  .string()
  .min(1, { message: 'Variant ID must be a non-empty string' })
  .uuid({ message: 'Variant ID must be a valid UUID' });

export class VariantId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): VariantId {
    const validatedValue = variantIdSchema.parse(value);
    return new VariantId(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherVariantId: VariantId): boolean {
    return this.value === otherVariantId.value;
  }
} 