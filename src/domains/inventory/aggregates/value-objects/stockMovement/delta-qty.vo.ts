import { z } from 'zod';

const deltaQtySchema = z
  .number()
  .int({ message: 'Delta quantity must be an integer' })
  .min(-999999999, { message: 'Delta quantity cannot be less than -999,999,999' })
  .max(999999999, { message: 'Delta quantity cannot exceed 999,999,999' });

export class DeltaQty {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): DeltaQty {
    const validatedValue = deltaQtySchema.parse(value);
    return new DeltaQty(validatedValue);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(otherDeltaQty: DeltaQty): boolean {
    return this.value === otherDeltaQty.value;
  }

  public isPositive(): boolean {
    return this.value > 0;
  }

  public isNegative(): boolean {
    return this.value < 0;
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public getAbsoluteValue(): number {
    return Math.abs(this.value);
  }

  public add(otherDeltaQty: DeltaQty): DeltaQty {
    return DeltaQty.create(this.value + otherDeltaQty.value);
  }

  public subtract(otherDeltaQty: DeltaQty): DeltaQty {
    return DeltaQty.create(this.value - otherDeltaQty.value);
  }

  public multiply(factor: number): DeltaQty {
    return DeltaQty.create(this.value * factor);
  }
} 