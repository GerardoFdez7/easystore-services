import { z } from 'zod';

const eanSchema = z
  .string()
  .regex(/^(\d{8}|\d{13})$/, {
    message: 'EAN must be a valid EAN-8 (8 digits) or EAN-13 (13 digits) code.',
  })
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
