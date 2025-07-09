import { z } from 'zod';

const createdAtSchema = z.date();

export class CreatedAt {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  public static create(value: Date): CreatedAt {
    const validatedValue = createdAtSchema.parse(value);
    return new CreatedAt(validatedValue);
  }

  public static createNow(): CreatedAt {
    return new CreatedAt(new Date());
  }

  public getValue(): Date {
    return this.value;
  }

  public equals(otherCreatedAt: CreatedAt): boolean {
    return this.value.getTime() === otherCreatedAt.value.getTime();
  }
} 