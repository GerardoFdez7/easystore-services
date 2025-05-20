import { z } from 'zod';

const recycledPercentageSchema = z
  .number()
  .min(0, { message: 'Recycled percentage must be at least 0' })
  .max(100, { message: 'Recycled percentage cannot exceed 100' });

export class RecycledPercentage {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): RecycledPercentage {
    recycledPercentageSchema.parse(value);
    return new RecycledPercentage(value);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(recycledPercentage: RecycledPercentage): boolean {
    return this.value === recycledPercentage.value;
  }
}
