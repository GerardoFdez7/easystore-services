import { z } from 'zod';

const qtyAvailableSchema = z
  .number()
  .int({ message: 'Quantity available must be an integer' })
  .min(0, { message: 'Quantity available cannot be negative' })
  .max(999999999, { message: 'Quantity available cannot exceed 999,999,999' });

export class QtyAvailable {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): QtyAvailable {
    const validatedValue = qtyAvailableSchema.parse(value);
    return new QtyAvailable(validatedValue);
  }

  public static createDefault(): QtyAvailable {
    return new QtyAvailable(0);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(otherQty: QtyAvailable): boolean {
    return this.value === otherQty.value;
  }

  public add(quantity: number): QtyAvailable {
    return QtyAvailable.create(this.value + quantity);
  }

  public subtract(quantity: number): QtyAvailable {
    return QtyAvailable.create(this.value - quantity);
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public isPositive(): boolean {
    return this.value > 0;
  }
} 