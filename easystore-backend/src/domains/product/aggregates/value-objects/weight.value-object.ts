import { z } from 'zod';

const weightSchema = z
  .number()
  .positive({ message: 'Weight must be a positive number' })
  .nullable();

export class Weight {
  private readonly value: number | null;

  private constructor(value: number | null) {
    this.value = value;
  }

  public static create(value: number | null): Weight {
    weightSchema.parse(value);
    return new Weight(value);
  }

  public getValue(): number | null {
    return this.value;
  }

  public equals(otherWeight: Weight): boolean {
    return this.value === otherWeight.value;
  }
}
