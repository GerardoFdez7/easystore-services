import { z } from 'zod';

const interestRateSchema = z
  .number()
  .min(0, { message: 'Interest rate must be a non-negative number' });

export class InterestRate {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): InterestRate {
    interestRateSchema.parse(value);
    return new InterestRate(value);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(interestRate: InterestRate): boolean {
    return this.value === interestRate.value;
  }
}
