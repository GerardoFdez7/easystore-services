import { z } from 'zod';

const barcodeSchema = z
  .string()
  .min(1, { message: 'Barcode must be a non-empty string' })
  .optional();

export class Barcode {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): Barcode {
    barcodeSchema.parse(value);
    return new Barcode(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherBarcode: Barcode): boolean {
    return this.value === otherBarcode.value;
  }
}
