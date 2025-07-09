import { z } from 'zod';

const qtyReservedSchema = z
  .number()
  .int({ message: 'Quantity reserved must be an integer' })
  .min(0, { message: 'Quantity reserved cannot be negative' })
  .max(999999999, { message: 'Quantity reserved cannot exceed 999,999,999' });

export class QtyReserved {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): QtyReserved {
    const validatedValue = qtyReservedSchema.parse(value);
    return new QtyReserved(validatedValue);
  }

  public static createDefault(): QtyReserved {
    return new QtyReserved(0);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(otherQty: QtyReserved): boolean {
    return this.value === otherQty.value;
  }

  public add(quantity: number): QtyReserved {
    return QtyReserved.create(this.value + quantity);
  }

  public subtract(quantity: number): QtyReserved {
    return QtyReserved.create(this.value - quantity);
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public isPositive(): boolean {
    return this.value > 0;
  }
} 