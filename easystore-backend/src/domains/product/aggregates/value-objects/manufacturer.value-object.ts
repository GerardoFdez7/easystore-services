import { z } from 'zod';

const manufacturerSchema = z
  .string()
  .min(1, { message: 'Manufacturer must be a non-empty string' })
  .max(100, { message: 'Manufacturer must not exceed 100 characters' })
  .optional();

export class Manufacturer {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): Manufacturer {
    manufacturerSchema.parse(value);
    return new Manufacturer(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherManufacturer: Manufacturer): boolean {
    return this.value === otherManufacturer.value;
  }
}
