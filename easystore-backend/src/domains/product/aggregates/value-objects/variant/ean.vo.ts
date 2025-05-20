import { z } from 'zod';

const eanSchema = z
  .string()
  .min(1, { message: 'EAN must be a non-empty string' })
  .nullable();

export class EAN {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): EAN {
    eanSchema.parse(value);
    return new EAN(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherEAN: EAN): boolean {
    return this.value === otherEAN.value;
  }
}
