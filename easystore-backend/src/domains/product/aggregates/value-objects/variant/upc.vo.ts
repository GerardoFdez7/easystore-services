import { z } from 'zod';

const upcSchema = z
  .string()
  .regex(/^\d{12}$/, { message: 'UPC must be 12 digits.' })
  .nullable();

export class UPC {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): UPC {
    upcSchema.parse(value);
    return new UPC(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherUPC: UPC): boolean {
    return this.value === otherUPC.value;
  }
}
