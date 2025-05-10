import { z } from 'zod';

const longDescriptionSchema = z
  .string()
  .min(20, { message: 'Long description must be at least 20 characters' })
  .max(2000, { message: 'Long description must be at most 2000 characters' })
  .nullable();

export class LongDescription {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(description: string): LongDescription {
    longDescriptionSchema.parse(description);
    return new LongDescription(description);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(longDescription: LongDescription): boolean {
    return this.value === longDescription.value;
  }
}
