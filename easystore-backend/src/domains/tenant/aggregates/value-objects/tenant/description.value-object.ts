import { z } from 'zod';

const DescriptionSchema = z
  .string()
  .min(20, { message: 'Description must be at least 20 characters long.' })
  .max(1000, {
    message: 'Description must be no more than 1000 characters long.',
  })
  .nullable();

export class Description {
  private readonly value: string | null;

  private constructor(value: string | null) {
    this.value = value;
  }

  public static create(value: string | null): Description {
    DescriptionSchema.parse(value);
    return new Description(value);
  }

  public getValue(): string | null {
    return this.value;
  }

  public equals(other: Description): boolean {
    return this.value === other.getValue();
  }
}
