import { z } from 'zod';

const shortDescriptionSchema = z
  .string()
  .min(10, { message: 'Short description must be at least 10 characters' })
  .max(200, { message: 'Short description must be at most 200 characters' })
  .nullable();

export class ShortDescription {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(description: string): ShortDescription {
    shortDescriptionSchema.parse(description);
    return new ShortDescription(description);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(shortDescription: ShortDescription): boolean {
    return this.value === shortDescription.value;
  }
}
