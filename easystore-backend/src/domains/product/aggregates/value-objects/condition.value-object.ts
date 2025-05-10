import { z } from 'zod';

const conditionSchema = z.enum(['NEW', 'USED', 'REFURBISHED']);

export class Condition {
  private readonly value: 'NEW' | 'USED' | 'REFURBISHED';

  private constructor(value: 'NEW' | 'USED' | 'REFURBISHED') {
    this.value = value;
  }

  public static create(status: string): Condition {
    const validatedStatus = conditionSchema.parse(
      status as 'NEW' | 'USED' | 'REFURBISHED',
    );
    return new Condition(validatedStatus);
  }

  public getValue(): 'NEW' | 'USED' | 'REFURBISHED' {
    return this.value;
  }

  public equals(status: Condition): boolean {
    return this.value === status.value;
  }
}
