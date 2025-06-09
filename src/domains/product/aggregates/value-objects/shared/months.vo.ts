import { z } from 'zod';

const monthsSchema = z
  .number()
  .int()
  .min(0, { message: 'Months must be a non-negative integer' });

export class Months {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Months {
    monthsSchema.parse(value);
    return new Months(value);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(months: Months): boolean {
    return this.value === months.value;
  }
}
