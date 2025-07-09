import { z } from 'zod';

const updatedAtSchema = z.date();

export class UpdatedAt {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  public static create(value: Date): UpdatedAt {
    const validatedValue = updatedAtSchema.parse(value);
    return new UpdatedAt(validatedValue);
  }

  public static createNow(): UpdatedAt {
    return new UpdatedAt(new Date());
  }

  public getValue(): Date {
    return this.value;
  }

  public equals(otherUpdatedAt: UpdatedAt): boolean {
    return this.value.getTime() === otherUpdatedAt.value.getTime();
  }
} 