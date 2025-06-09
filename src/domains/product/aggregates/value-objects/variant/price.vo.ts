import { z } from 'zod';

const priceSchema = z
  .number()
  .nonnegative({ message: 'Price amount must be greater than zero' });

export class Price {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  public static create(value: number): Price {
    priceSchema.parse(value);
    return new Price(value);
  }

  public getValue(): number {
    return this.value;
  }

  public equals(price: Price): boolean {
    return this.value === price.value;
  }
}
