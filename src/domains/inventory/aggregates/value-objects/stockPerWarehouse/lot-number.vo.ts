import { z } from 'zod';

const lotNumberSchema = z
  .string()
  .min(1, { message: 'Lot number must be a non-empty string' })
  .max(50, { message: 'Lot number must not exceed 50 characters' })
  .trim()
  .nullable();

export class LotNumber {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): LotNumber {
    const validatedValue = lotNumberSchema.parse(value);
    return new LotNumber(validatedValue);
  }

  public static createNull(): LotNumber {
    return new LotNumber(null);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(otherLotNumber: LotNumber): boolean {
    return this.value === otherLotNumber.value;
  }

  public isNull(): boolean {
    return this.value === null;
  }

  public hasValue(): boolean {
    return this.value !== null;
  }
}
