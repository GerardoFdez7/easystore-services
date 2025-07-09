import { z } from 'zod';

const stockPerWarehouseIdSchema = z
  .string()
  .min(1, { message: 'Stock per warehouse ID must be a non-empty string' })
  .uuid({ message: 'Stock per warehouse ID must be a valid UUID' });

export class StockPerWarehouseId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): StockPerWarehouseId {
    const validatedValue = stockPerWarehouseIdSchema.parse(value);
    return new StockPerWarehouseId(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherId: StockPerWarehouseId): boolean {
    return this.value === otherId.value;
  }
} 