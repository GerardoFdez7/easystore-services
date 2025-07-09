import { z } from 'zod';

const warehouseIdSchema = z
  .string()
  .min(1, { message: 'Warehouse ID must be a non-empty string' })
  .uuid({ message: 'Warehouse ID must be a valid UUID' });

export class WarehouseId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): WarehouseId {
    const validatedValue = warehouseIdSchema.parse(value);
    return new WarehouseId(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherWarehouseId: WarehouseId): boolean {
    return this.value === otherWarehouseId.value;
  }
} 