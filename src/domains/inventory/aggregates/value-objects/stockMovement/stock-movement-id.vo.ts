import { z } from 'zod';

const stockMovementIdSchema = z
  .string()
  .min(1, { message: 'Stock movement ID must be a non-empty string' })
  .uuid({ message: 'Stock movement ID must be a valid UUID' });

export class StockMovementId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): StockMovementId {
    const validatedValue = stockMovementIdSchema.parse(value);
    return new StockMovementId(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherId: StockMovementId): boolean {
    return this.value === otherId.value;
  }
} 