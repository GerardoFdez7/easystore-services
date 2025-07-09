import { z } from 'zod';

const warehouseNameSchema = z
  .string()
  .min(1, { message: 'Warehouse name must be a non-empty string' })
  .max(100, { message: 'Warehouse name must not exceed 100 characters' })
  .trim();

export class WarehouseName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(value: string): WarehouseName {
    const validatedValue = warehouseNameSchema.parse(value);
    return new WarehouseName(validatedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(otherName: WarehouseName): boolean {
    return this.value === otherName.value;
  }
} 