import { z } from 'zod';

const estimatedReplenishmentDateSchema = z
  .date()
  .min(new Date(), {
    message: 'Estimated replenishment date must be in the future',
  })
  .nullable();

export class EstimatedReplenishmentDate {
  private readonly value: Date | null;

  private constructor(value: Date | null) {
    this.value = value;
  }

  public static create(value: Date | null): EstimatedReplenishmentDate {
    const validatedValue = estimatedReplenishmentDateSchema.parse(value);
    return new EstimatedReplenishmentDate(validatedValue);
  }

  public static createNull(): EstimatedReplenishmentDate {
    return new EstimatedReplenishmentDate(null);
  }

  public getValue(): Date | null {
    return this.value;
  }

  public equals(otherDate: EstimatedReplenishmentDate): boolean {
    if (this.value === null && otherDate.value === null) {
      return true;
    }
    if (this.value === null || otherDate.value === null) {
      return false;
    }
    return this.value.getTime() === otherDate.value.getTime();
  }

  public isNull(): boolean {
    return this.value === null;
  }

  public hasValue(): boolean {
    return this.value !== null;
  }

  public isInPast(): boolean {
    if (!this.value) return false;
    return this.value < new Date();
  }

  public isInFuture(): boolean {
    if (!this.value) return false;
    return this.value > new Date();
  }
}
