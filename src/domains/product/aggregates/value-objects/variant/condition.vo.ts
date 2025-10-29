import { z } from 'zod';

export enum ConditionEnum {
  NEW = 'NEW',
  USED = 'USED',
  REFURBISHED = 'REFURBISHED',
}

const conditionSchema = z.enum(ConditionEnum);

export class Condition {
  private readonly value: ConditionEnum;

  private constructor(value: ConditionEnum) {
    this.value = value;
  }

  public static create(status: string): Condition {
    const validatedStatus = conditionSchema.parse(status);
    return new Condition(validatedStatus);
  }

  public getValue(): ConditionEnum {
    return this.value;
  }

  public equals(status: Condition): boolean {
    return this.value === status.value;
  }
}
