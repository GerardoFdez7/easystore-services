import { z } from 'zod';

const qtySchema = z
  .number()
  .int({ message: 'Quantity must be an integer' })
  .positive({ message: 'Quantity must be greater than zero' });

export class Qty {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Qty {
    qtySchema.parse(value);
    return new Qty(value);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: Qty): boolean {
    return this.value === other.getValue();
  }
}
